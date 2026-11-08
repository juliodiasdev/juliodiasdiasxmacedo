import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ExperienceData, SiteSettings } from "@/lib/types";
import { localDefaults } from "./local";
import { normalizeSettings } from "./settings";
import {
  toFuture,
  toLetter,
  toMemory,
  toThought,
  type FutureRow,
  type LetterRow,
  type MemoryRow,
  type ThoughtRow,
} from "./mappers";

/**
 * Lê toda a experiência do Supabase. As políticas RLS garantem que um cliente
 * anônimo só receba conteúdo publicado; o cliente de um admin recebe rascunhos também.
 */
export async function getSupabaseExperience(db: SupabaseClient, includeDrafts: boolean): Promise<ExperienceData> {
  const list = (table: string, order: string, ascending = true) => {
    const q = db.from(table).select("*");
    return (includeDrafts ? q : q.eq("status", "published")).order(order, { ascending });
  };

  const [settings, letter, categories, thoughts, memories, details, future] = await Promise.all([
    db.from("site_settings").select("data").eq("id", 1).maybeSingle(),
    db.from("letter").select("*").eq("id", 1).maybeSingle(),
    db.from("categories").select("*").order("position"),
    list("thoughts", "created_at", false),
    list("memories", "position"),
    list("details", "position"),
    list("future_fragments", "position"),
  ]);

  const error = [settings, letter, categories, thoughts, memories, details, future].find((r) => r.error)?.error;
  if (error) throw new Error(`Falha ao carregar o conteúdo: ${error.message}`);

  return {
    mode: "supabase",
    settings: normalizeSettings((settings.data?.data as Partial<SiteSettings>) ?? {}),
    letter: toLetter(letter.data as LetterRow | null, localDefaults.letter()),
    categories: categories.data ?? [],
    thoughts: ((thoughts.data ?? []) as ThoughtRow[]).map(toThought),
    memories: ((memories.data ?? []) as MemoryRow[]).map(toMemory),
    details: details.data ?? [],
    future: ((future.data ?? []) as FutureRow[]).map(toFuture),
  };
}
