"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";
import { createSessionClient } from "@/lib/supabase/server";
import { sanitizeOrder } from "@/lib/content/settings";
import type { Interlude, SiteSettings } from "@/lib/types";

export interface ActionState {
  ok: boolean;
  message: string;
}

/* ---------- utilitários de formulário ---------- */

function text(fd: FormData, key: string, { required = false, max = 20000 } = {}): string {
  const v = String(fd.get(key) ?? "").trim();
  if (required && !v) throw new FormError(`Preencha o campo “${key}”.`);
  if (v.length > max) throw new FormError(`O campo “${key}” é longo demais.`);
  return v;
}
const opt = (fd: FormData, key: string) => text(fd, key) || null;
const bool = (fd: FormData, key: string) => fd.get(key) === "on" || fd.get(key) === "true";
const int = (fd: FormData, key: string) => Number.parseInt(String(fd.get(key) ?? "0"), 10) || 0;
const url = (fd: FormData, key: string) => {
  const v = opt(fd, key);
  if (v && !/^(https:\/\/|\/)/.test(v)) throw new FormError("Endereço de mídia inválido.");
  return v;
};
/** Os botões “Salvar rascunho” e “Publicar” enviam `intent`. */
const status = (fd: FormData) => (fd.get("intent") === "publish" ? "published" : "draft");
const mediaKind = (fd: FormData, key: string) => {
  const v = opt(fd, key);
  return v === "video" ? "video" : v ? "image" : null;
};

class FormError extends Error {}

function refresh() {
  revalidatePath("/");
  revalidatePath("/preview");
  revalidatePath("/admin", "layout");
}

async function run(fn: () => Promise<void>, success: string): Promise<ActionState> {
  try {
    await fn();
    refresh();
    return { ok: true, message: success };
  } catch (e) {
    if (e instanceof FormError) return { ok: false, message: e.message };
    if (e && typeof e === "object" && "digest" in e) throw e; // redirect()
    console.error(e);
    return { ok: false, message: "Não foi possível salvar. Tente novamente." };
  }
}

function check(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

/* ---------- autenticação ---------- */

export async function signIn(_: ActionState, fd: FormData): Promise<ActionState> {
  if (!isSupabaseConfigured) return { ok: false, message: "Supabase não configurado." };
  const email = text(fd, "email");
  const password = String(fd.get("password") ?? "");
  const supabase = await createSessionClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, message: "E-mail ou senha incorretos." };
  const next = String(fd.get("next") ?? "/admin");
  redirect(next.startsWith("/admin") || next.startsWith("/preview") ? next : "/admin");
}

export async function signOut() {
  if (isSupabaseConfigured) {
    const supabase = await createSessionClient();
    await supabase.auth.signOut();
  }
  redirect("/admin/login");
}

/* ---------- pensamentos ---------- */

export async function saveThought(_: ActionState, fd: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const id = opt(fd, "id");
  let newId: string | null = null;
  const result = await run(async () => {
    const st = status(fd);
    const createdAt = opt(fd, "created_at");
    const row = {
      title: text(fd, "title", { required: true, max: 200 }),
      body: text(fd, "body"),
      category_id: opt(fd, "category_id"),
      is_special: bool(fd, "is_special"),
      photo_url: url(fd, "photo_url"),
      photo_alt: opt(fd, "photo_alt"),
      audio_url: url(fd, "audio_url"),
      status: st,
      created_at: createdAt ? new Date(createdAt).toISOString() : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    if (id) {
      const { data: current } = await supabase.from("thoughts").select("published_at").eq("id", id).single();
      const published_at = st === "published" ? (current?.published_at ?? new Date().toISOString()) : null;
      check((await supabase.from("thoughts").update({ ...row, published_at }).eq("id", id)).error);
    } else {
      const published_at = st === "published" ? new Date().toISOString() : null;
      const { data, error } = await supabase.from("thoughts").insert({ ...row, published_at }).select("id").single();
      check(error);
      newId = data?.id ?? null;
    }
  }, fd.get("intent") === "publish" ? "Pensamento publicado." : "Rascunho salvo.");
  if (newId) redirect(`/admin/pensamentos/${newId}?salvo=1`);
  return result;
}

export async function deleteThought(fd: FormData) {
  const { supabase } = await requireAdmin();
  check((await supabase.from("thoughts").delete().eq("id", text(fd, "id", { required: true }))).error);
  refresh();
  redirect("/admin/pensamentos");
}

/* ---------- memórias ---------- */

export async function saveMemory(_: ActionState, fd: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const id = opt(fd, "id");
  let newId: string | null = null;
  const result = await run(async () => {
    const layout = text(fd, "layout");
    const row = {
      title: text(fd, "title", { required: true, max: 200 }),
      story: text(fd, "story"),
      feeling: text(fd, "feeling"),
      date: opt(fd, "date"),
      date_label: opt(fd, "date_label"),
      location: opt(fd, "location"),
      media_url: url(fd, "media_url"),
      media_kind: mediaKind(fd, "media_kind"),
      poster_url: url(fd, "poster_url"),
      media_alt: opt(fd, "media_alt"),
      audio_url: url(fd, "audio_url"),
      layout: ["wide", "tall", "square"].includes(layout) ? layout : "wide",
      position: int(fd, "position"),
      is_special: bool(fd, "is_special"),
      status: status(fd),
      updated_at: new Date().toISOString(),
    };
    if (id) check((await supabase.from("memories").update(row).eq("id", id)).error);
    else {
      const { data, error } = await supabase.from("memories").insert(row).select("id").single();
      check(error);
      newId = data?.id ?? null;
    }
  }, fd.get("intent") === "publish" ? "Memória publicada." : "Rascunho salvo.");
  if (newId) redirect(`/admin/memorias/${newId}?salvo=1`);
  return result;
}

export async function deleteMemory(fd: FormData) {
  const { supabase } = await requireAdmin();
  check((await supabase.from("memories").delete().eq("id", text(fd, "id", { required: true }))).error);
  refresh();
  redirect("/admin/memorias");
}

/* ---------- categorias, detalhes e futuro (listas simples) ---------- */

const slugify = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);

export async function saveCategory(_: ActionState, fd: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  return run(async () => {
    const id = opt(fd, "id");
    const label = text(fd, "label", { required: true, max: 120 });
    const row = { label, description: opt(fd, "description"), position: int(fd, "position") };
    if (id) check((await supabase.from("categories").update(row).eq("id", id)).error);
    else check((await supabase.from("categories").insert({ ...row, slug: `${slugify(label)}-${Date.now().toString(36)}` })).error);
  }, "Categoria salva.");
}

export async function saveDetail(_: ActionState, fd: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  return run(async () => {
    const id = opt(fd, "id");
    const row = {
      text: text(fd, "text", { required: true, max: 400 }),
      note: opt(fd, "note"),
      position: int(fd, "position"),
      status: bool(fd, "published") ? "published" : "draft",
    };
    if (id) check((await supabase.from("details").update(row).eq("id", id)).error);
    else check((await supabase.from("details").insert(row)).error);
  }, "Bilhete salvo.");
}

export async function saveFuture(_: ActionState, fd: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  return run(async () => {
    const id = opt(fd, "id");
    const row = {
      title: text(fd, "title", { required: true, max: 200 }),
      text: text(fd, "text"),
      media_url: url(fd, "media_url"),
      media_kind: mediaKind(fd, "media_kind"),
      poster_url: url(fd, "poster_url"),
      media_alt: opt(fd, "media_alt"),
      position: int(fd, "position"),
      status: bool(fd, "published") ? "published" : "draft",
    };
    if (id) check((await supabase.from("future_fragments").update(row).eq("id", id)).error);
    else check((await supabase.from("future_fragments").insert(row)).error);
  }, "Sonho salvo.");
}

const DELETABLE = { categories: "categories", details: "details", future: "future_fragments" } as const;

export async function deleteRow(fd: FormData) {
  const { supabase } = await requireAdmin();
  const table = DELETABLE[text(fd, "table") as keyof typeof DELETABLE];
  if (!table) throw new Error("Tabela inválida");
  check((await supabase.from(table).delete().eq("id", text(fd, "id", { required: true }))).error);
  refresh();
}

/* ---------- carta ---------- */

export async function saveLetter(_: ActionState, fd: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  return run(async () => {
    const row = {
      id: 1,
      title: text(fd, "title", { max: 200 }),
      greeting: text(fd, "greeting", { max: 200 }),
      body: text(fd, "body", { max: 100000 }),
      closing: text(fd, "closing", { max: 2000 }),
      signature: text(fd, "signature", { max: 200 }),
      updated_at: new Date().toISOString(),
    };
    check((await supabase.from("letter").upsert(row)).error);
  }, "Carta salva.");
}

/* ---------- textos, ordem dos capítulos, música e interlúdios ---------- */

const lines = (fd: FormData, key: string) =>
  text(fd, key)
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

export async function saveSettings(_: ActionState, fd: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  return run(async () => {
    const block = (k: string) => ({ kicker: text(fd, `${k}.kicker`), title: text(fd, `${k}.title`), text: text(fd, `${k}.text`) });
    let interludes: Interlude[] = [];
    try {
      const raw = JSON.parse(String(fd.get("interludes") ?? "[]")) as Interlude[];
      interludes = raw
        .filter((i) => i?.media?.src && /^(https:\/\/|\/)/.test(i.media.src))
        .map((i) => ({
          afterChapter: sanitizeOrder([i.afterChapter])[0],
          media: { kind: i.media.kind === "video" ? "video" : "image", src: i.media.src, poster: i.media.poster ?? null, alt: String(i.media.alt ?? "") },
          caption: i.caption ? String(i.caption).slice(0, 300) : null,
        }));
    } catch {
      throw new FormError("Não foi possível ler os interlúdios.");
    }
    const musicSrc = url(fd, "music.src");
    const data: SiteSettings = {
      title: text(fd, "title", { required: true, max: 200 }),
      subtitle: text(fd, "subtitle", { max: 400 }),
      intro: { lines: lines(fd, "intro.lines"), button: text(fd, "intro.button", { required: true, max: 80 }) },
      thoughtsIntro: block("thoughtsIntro"),
      momentsIntro: block("momentsIntro"),
      detailsIntro: block("detailsIntro"),
      futureIntro: {
        kicker: text(fd, "futureIntro.kicker"),
        title: text(fd, "futureIntro.title"),
        lines: lines(fd, "futureIntro.lines"),
        disclaimer: text(fd, "futureIntro.disclaimer"),
      },
      letterIntro: { kicker: text(fd, "letterIntro.kicker"), title: text(fd, "letterIntro.title") },
      ending: { lines: lines(fd, "ending.lines"), button: text(fd, "ending.button", { required: true, max: 80 }) },
      chapterOrder: sanitizeOrder(JSON.parse(String(fd.get("chapterOrder") ?? "[]"))),
      music: musicSrc ? { src: musicSrc, title: text(fd, "music.title") || "Trilha" } : null,
      interludes,
    };
    check((await supabase.from("site_settings").upsert({ id: 1, data, updated_at: new Date().toISOString() })).error);
  }, "Textos salvos.");
}
