"use client";
import { useState } from "react";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { saveSettings } from "@/app/admin/actions";
import { CHAPTER_LABELS, type ChapterId, type Interlude, type SiteSettings } from "@/lib/types";
import { ActionForm, SubmitButton } from "./ActionForm";
import { Card, Input, Select, Textarea } from "./Fields";
import { Uploader } from "./Uploader";

type Block = "thoughtsIntro" | "momentsIntro" | "detailsIntro";

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const [order, setOrder] = useState<ChapterId[]>(settings.chapterOrder);
  const [interludes, setInterludes] = useState<Interlude[]>(settings.interludes);

  const move = (i: number, d: -1 | 1) => {
    const next = [...order];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    setOrder(next);
  };

  const block = (key: Block, title: string) => (
    <Card title={title}>
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Sobretítulo" name={`${key}.kicker`} defaultValue={settings[key].kicker} />
          <Input label="Título" name={`${key}.title`} defaultValue={settings[key].title} />
        </div>
        <Textarea label="Texto de abertura" name={`${key}.text`} defaultValue={settings[key].text} rows={3} />
      </div>
    </Card>
  );

  return (
    <ActionForm action={saveSettings} className="mt-8 space-y-6">
      <input type="hidden" name="chapterOrder" value={JSON.stringify(order)} />
      <input type="hidden" name="interludes" value={JSON.stringify(interludes)} />

      <Card title="Capa">
        <div className="space-y-4">
          <Input label="Título do site" name="title" defaultValue={settings.title} required />
          <Textarea label="Subtítulo" name="subtitle" defaultValue={settings.subtitle} rows={2} />
        </div>
      </Card>

      <Card title="Capítulo 1 — Antes de entrar">
        <div className="space-y-4">
          <Textarea
            label="Frases que surgem (uma por linha)"
            name="intro.lines"
            defaultValue={settings.intro.lines.join("\n")}
            rows={4}
            serif
            hint="A última linha aparece em destaque."
          />
          <Input label="Botão" name="intro.button" defaultValue={settings.intro.button} required />
        </div>
      </Card>

      <Card title="Ordem dos capítulos">
        <p className="mb-4 text-sm text-ink/60">“Antes de entrar” é sempre o primeiro e “Isso não termina aqui”, o último.</p>
        <ol className="space-y-2">
          {order.map((c, i) => (
            <li key={c} className="flex items-center justify-between gap-3 rounded-md border border-ink/10 bg-white px-4 py-2">
              <span className="text-sm">
                <span className="mr-3 text-ink/40 tabular-nums">{i + 2}</span>
                {CHAPTER_LABELS[c]}
              </span>
              <span className="flex">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Subir" className="flex size-10 items-center justify-center disabled:opacity-25">
                  <ChevronUp className="size-4" />
                </button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === order.length - 1} aria-label="Descer" className="flex size-10 items-center justify-center disabled:opacity-25">
                  <ChevronDown className="size-4" />
                </button>
              </span>
            </li>
          ))}
        </ol>
      </Card>

      {block("thoughtsIntro", "Diário de pensamentos")}
      {block("momentsIntro", "Momentos")}
      {block("detailsIntro", "As pequenas coisas")}

      <Card title="A vida que imagino com você">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Sobretítulo" name="futureIntro.kicker" defaultValue={settings.futureIntro.kicker} />
            <Input label="Título" name="futureIntro.title" defaultValue={settings.futureIntro.title} />
          </div>
          <Textarea label="Frases de abertura (uma por linha)" name="futureIntro.lines" defaultValue={settings.futureIntro.lines.join("\n")} rows={3} serif />
          <Textarea label="Nota de que são sonhos" name="futureIntro.disclaimer" defaultValue={settings.futureIntro.disclaimer} rows={2} />
        </div>
      </Card>

      <Card title="A carta">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Sobretítulo" name="letterIntro.kicker" defaultValue={settings.letterIntro.kicker} />
          <Input label="Título" name="letterIntro.title" defaultValue={settings.letterIntro.title} />
        </div>
      </Card>

      <Card title="Capítulo 7 — Isso não termina aqui">
        <div className="space-y-4">
          <Textarea label="Frases finais (uma por linha)" name="ending.lines" defaultValue={settings.ending.lines.join("\n")} rows={3} serif />
          <Input label="Botão" name="ending.button" defaultValue={settings.ending.button} required />
        </div>
      </Card>

      <Card title="Música instrumental">
        <p className="mb-4 text-sm text-ink/60">
          Opcional. Ela só toca se a pessoa escolher, nunca automaticamente. Use um arquivo que você tenha direito de usar.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Uploader name="music.src" label="Arquivo de áudio" accept="audio/*" folder="music" defaultUrl={settings.music?.src} />
          <Input label="Nome da música" name="music.title" defaultValue={settings.music?.title ?? ""} />
        </div>
      </Card>

      <Card
        title="Vídeos entre capítulos"
        actions={
          <button
            type="button"
            onClick={() =>
              setInterludes((l) => [...l, { afterChapter: order[0], media: { kind: "video", src: "", alt: "" }, caption: null }])
            }
            className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-ink/20 px-4 text-sm"
          >
            <Plus className="size-4" /> Adicionar
          </button>
        }
      >
        <p className="mb-4 text-sm text-ink/60">Um vídeo ou foto em tela cheia, como uma pausa, logo depois do capítulo escolhido.</p>
        <div className="space-y-4">
          {interludes.map((it, i) => (
            <InterludeRow
              key={i}
              value={it}
              onChange={(v) => setInterludes((l) => l.map((x, k) => (k === i ? v : x)))}
              onRemove={() => setInterludes((l) => l.filter((_, k) => k !== i))}
            />
          ))}
          {interludes.length === 0 && <p className="text-sm text-ink/50">Nenhum vídeo entre capítulos.</p>}
        </div>
      </Card>

      <div className="sticky bottom-0 -mx-5 border-t border-ink/10 bg-ivory/95 px-5 py-4 backdrop-blur">
        <SubmitButton>Salvar textos</SubmitButton>
      </div>
    </ActionForm>
  );
}

/** Edita um interlúdio (estado local, enviado como JSON no campo oculto `interludes`). */
function InterludeRow({ value, onChange, onRemove }: { value: Interlude; onChange: (v: Interlude) => void; onRemove: () => void }) {
  return (
    <div className="rounded-md border border-ink/10 bg-white p-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Uploader
          name="_interlude_media"
          label="Vídeo ou foto"
          accept="video/mp4,video/quicktime,video/webm,image/*"
          folder="interludes"
          defaultUrl={value.media.src || null}
          defaultKind={value.media.kind}
          onChange={(src, kind) => onChange({ ...value, media: { ...value.media, src, kind } })}
        />
        <div className="space-y-4">
          <Select
            label="Aparece depois de"
            value={value.afterChapter}
            onChange={(e) => onChange({ ...value, afterChapter: e.target.value as ChapterId })}
          >
            {(Object.keys(CHAPTER_LABELS) as ChapterId[]).map((c) => (
              <option key={c} value={c}>
                {CHAPTER_LABELS[c]}
              </option>
            ))}
          </Select>
          <Input
            label="Descrição (acessibilidade)"
            value={value.media.alt}
            onChange={(e) => onChange({ ...value, media: { ...value.media, alt: e.target.value } })}
          />
          <Input
            label="Legenda (opcional)"
            value={value.caption ?? ""}
            onChange={(e) => onChange({ ...value, caption: e.target.value || null })}
          />
          <button type="button" onClick={onRemove} className="inline-flex min-h-10 items-center gap-1.5 text-sm text-red-700">
            <Trash2 className="size-4" /> Remover
          </button>
        </div>
      </div>
    </div>
  );
}
