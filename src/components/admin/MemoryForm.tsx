"use client";
import { saveMemory } from "@/app/admin/actions";
import type { Memory } from "@/lib/types";
import { ActionForm, SubmitButton } from "./ActionForm";
import { Card, Checkbox, Input, Select, Textarea } from "./Fields";
import { Uploader } from "./Uploader";

export function MemoryForm({ memory, nextPosition }: { memory: Memory | null; nextPosition: number }) {
  return (
    <ActionForm action={saveMemory} className="mt-8 space-y-6">
      {memory && <input type="hidden" name="id" value={memory.id} />}
      <Card title="Fotografia ou vídeo">
        <div className="grid gap-6 sm:grid-cols-2">
          <Uploader
            name="media_url"
            kindName="media_kind"
            label="Mídia principal"
            accept="image/*,video/mp4,video/quicktime,video/webm"
            folder="memories"
            defaultUrl={memory?.media?.src}
            defaultKind={memory?.media?.kind}
          />
          <div className="space-y-4">
            <Input label="Descrição da mídia (acessibilidade)" name="media_alt" defaultValue={memory?.media?.alt} />
            <Uploader name="poster_url" label="Capa do vídeo (opcional)" accept="image/*" folder="posters" defaultUrl={memory?.media?.poster} />
          </div>
        </div>
      </Card>

      <Card title="A história">
        <div className="space-y-5">
          <Input label="Título" name="title" defaultValue={memory?.title} required maxLength={200} />
          <Textarea label="O que aconteceu" name="story" defaultValue={memory?.story} rows={6} />
          <Textarea label="O que eu senti naquele momento" name="feeling" defaultValue={memory?.feeling} rows={3} serif />
          <div className="grid gap-5 sm:grid-cols-3">
            <Input label="Data (opcional)" name="date" type="date" defaultValue={memory?.date ?? ""} />
            <Input label="Ou uma data em palavras" name="date_label" defaultValue={memory?.dateLabel ?? ""} placeholder="Num domingo de março" />
            <Input label="Local (opcional)" name="location" defaultValue={memory?.location ?? ""} />
          </div>
          <Uploader name="audio_url" label="Áudio pessoal (opcional)" accept="audio/*" folder="audio" defaultUrl={memory?.audioSrc} />
        </div>
      </Card>

      <Card title="Composição">
        <div className="grid gap-5 sm:grid-cols-3">
          <Select label="Formato na galeria" name="layout" defaultValue={memory?.layout ?? "wide"}>
            <option value="wide">Panorâmica (largura total)</option>
            <option value="tall">Retrato (vertical)</option>
            <option value="square">Quadrada</option>
          </Select>
          <Input label="Posição" name="position" type="number" min={0} defaultValue={memory?.position ?? nextPosition} />
          <div className="sm:pt-6">
            <Checkbox label="Marcar como especial" name="is_special" defaultChecked={memory?.isSpecial} />
          </div>
        </div>
      </Card>

      <div className="sticky bottom-0 -mx-5 flex flex-wrap gap-3 border-t border-ink/10 bg-ivory/95 px-5 py-4 backdrop-blur">
        <SubmitButton intent="draft" variant="secondary">
          Salvar rascunho
        </SubmitButton>
        <SubmitButton intent="publish">{memory?.status === "published" ? "Salvar publicada" : "Publicar"}</SubmitButton>
      </div>
    </ActionForm>
  );
}
