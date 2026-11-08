"use client";
import { deleteRow, saveCategory, saveDetail, saveFuture } from "@/app/admin/actions";
import type { Category, Detail, FutureFragment } from "@/lib/types";
import { ActionForm, ConfirmDelete, SubmitButton } from "./ActionForm";
import { Checkbox, Input, Textarea } from "./Fields";
import { Uploader } from "./Uploader";

const row = "rounded-xl border border-ink/10 bg-white/70 p-5";

export function CategoryEditor({ item, nextPosition }: { item?: Category; nextPosition?: number }) {
  return (
    <div className={row}>
      <ActionForm action={saveCategory} resetOnSuccess={!item}>
        {item && <input type="hidden" name="id" value={item.id} />}
        <div className="grid gap-4 sm:grid-cols-[1fr_7rem]">
          <Input label="Nome da categoria" name="label" defaultValue={item?.label} required placeholder="Quando senti sua falta" />
          <Input label="Posição" name="position" type="number" defaultValue={item?.position ?? nextPosition ?? 0} />
        </div>
        <div className="mt-4 flex items-center justify-between">
          <SubmitButton>{item ? "Salvar" : "Adicionar"}</SubmitButton>
        </div>
      </ActionForm>
      {item && (
        <div className="mt-2 flex justify-end">
          <ConfirmDelete action={deleteRow} fields={{ table: "categories", id: item.id }} question="Excluir esta categoria? Os pensamentos ficarão sem categoria." />
        </div>
      )}
    </div>
  );
}

export function DetailEditor({ item, nextPosition }: { item?: Detail; nextPosition?: number }) {
  return (
    <div className={row}>
      <ActionForm action={saveDetail} resetOnSuccess={!item}>
        {item && <input type="hidden" name="id" value={item.id} />}
        <div className="space-y-4">
          <Textarea label="O detalhe" name="text" defaultValue={item?.text} required rows={2} serif />
          <div className="grid gap-4 sm:grid-cols-[1fr_7rem]">
            <Input label="Nota (opcional)" name="note" defaultValue={item?.note ?? ""} />
            <Input label="Posição" name="position" type="number" defaultValue={item?.position ?? nextPosition ?? 0} />
          </div>
          <Checkbox label="Publicado" name="published" defaultChecked={item ? item.status === "published" : true} />
        </div>
        <div className="mt-2">
          <SubmitButton>{item ? "Salvar" : "Adicionar bilhete"}</SubmitButton>
        </div>
      </ActionForm>
      {item && (
        <div className="mt-2 flex justify-end">
          <ConfirmDelete action={deleteRow} fields={{ table: "details", id: item.id }} />
        </div>
      )}
    </div>
  );
}

export function FutureEditor({ item, nextPosition }: { item?: FutureFragment; nextPosition?: number }) {
  return (
    <div className={row}>
      <ActionForm action={saveFuture} resetOnSuccess={!item}>
        {item && <input type="hidden" name="id" value={item.id} />}
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-[1fr_7rem]">
            <Input label="Título" name="title" defaultValue={item?.title} required placeholder="Nossa primeira casa" />
            <Input label="Posição" name="position" type="number" defaultValue={item?.position ?? nextPosition ?? 0} />
          </div>
          <Textarea label="Como você imagina" name="text" defaultValue={item?.text} rows={3} serif />
          <details className="rounded-md border border-ink/10 bg-white p-4">
            <summary className="cursor-pointer text-sm text-ink/70">Imagem ou vídeo (opcional)</summary>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Uploader name="media_url" kindName="media_kind" label="Mídia" accept="image/*,video/mp4,video/quicktime,video/webm" folder="future" defaultUrl={item?.media?.src} defaultKind={item?.media?.kind} />
              <div className="space-y-4">
                <Input label="Descrição da mídia" name="media_alt" defaultValue={item?.media?.alt ?? ""} />
                <Uploader name="poster_url" label="Capa do vídeo" accept="image/*" folder="posters" defaultUrl={item?.media?.poster} />
              </div>
            </div>
          </details>
          <Checkbox label="Publicado" name="published" defaultChecked={item ? item.status === "published" : true} />
        </div>
        <div className="mt-2">
          <SubmitButton>{item ? "Salvar" : "Adicionar sonho"}</SubmitButton>
        </div>
      </ActionForm>
      {item && (
        <div className="mt-2 flex justify-end">
          <ConfirmDelete action={deleteRow} fields={{ table: "future", id: item.id }} />
        </div>
      )}
    </div>
  );
}
