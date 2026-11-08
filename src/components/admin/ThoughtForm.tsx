"use client";
import { saveThought } from "@/app/admin/actions";
import type { Category, Thought } from "@/lib/types";
import { ActionForm, SubmitButton } from "./ActionForm";
import { Card, Checkbox, Input, Select, Textarea } from "./Fields";
import { Uploader } from "./Uploader";

/** Converte ISO → valor de <input type="datetime-local"> no horário local. */
function toLocalInput(iso: string) {
  const d = new Date(iso);
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 16);
}

export function ThoughtForm({ thought, categories }: { thought: Thought | null; categories: Category[] }) {
  return (
    <ActionForm action={saveThought} className="mt-8 space-y-6">
      {thought && <input type="hidden" name="id" value={thought.id} />}
      <Card>
        <div className="space-y-5">
          <Input label="Título" name="title" defaultValue={thought?.title} required maxLength={200} />
          <Textarea
            label="O que você pensou"
            name="body"
            defaultValue={thought?.body}
            rows={12}
            serif
            hint="Escreva livremente. Deixe uma linha em branco para começar um novo parágrafo."
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <Select label="Categoria" name="category_id" defaultValue={thought?.categoryId ?? ""}>
              <option value="">Sem categoria</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </Select>
            <Input
              label="Data do pensamento"
              name="created_at"
              type="datetime-local"
              defaultValue={toLocalInput(thought?.createdAt ?? new Date().toISOString())}
            />
          </div>
          <Checkbox label="Marcar como especial" name="is_special" defaultChecked={thought?.isSpecial} />
        </div>
      </Card>

      <Card title="Fotografia e áudio (opcionais)">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-4">
            <Uploader name="photo_url" label="Fotografia" accept="image/*" folder="thoughts" defaultUrl={thought?.photo?.src} />
            <Input label="Descrição da foto (acessibilidade)" name="photo_alt" defaultValue={thought?.photo?.alt} hint="Descreva o que aparece na imagem." />
          </div>
          <Uploader name="audio_url" label="Áudio pessoal" accept="audio/*" folder="audio" defaultUrl={thought?.audioSrc} />
        </div>
      </Card>

      <div className="sticky bottom-0 -mx-5 flex flex-wrap gap-3 border-t border-ink/10 bg-ivory/95 px-5 py-4 backdrop-blur">
        <SubmitButton intent="draft" variant="secondary">
          Salvar rascunho
        </SubmitButton>
        <SubmitButton intent="publish">{thought?.status === "published" ? "Salvar publicado" : "Publicar"}</SubmitButton>
      </div>
    </ActionForm>
  );
}
