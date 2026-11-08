"use client";
import { useId, useState } from "react";
import { Loader2, Trash2, Upload } from "lucide-react";
import { getBrowserClient } from "@/lib/supabase/browser";
import { MEDIA_BUCKET } from "@/lib/env";

interface UploaderProps {
  /** Nome do campo que recebe a URL pública. */
  name: string;
  /** Campo opcional que recebe "image" ou "video" conforme o arquivo. */
  kindName?: string;
  label: string;
  accept: string;
  folder: string;
  defaultUrl?: string | null;
  defaultKind?: "image" | "video" | null;
  /** Avisado quando um arquivo é enviado ou removido. */
  onChange?: (url: string, kind: "image" | "video") => void;
}

/**
 * Envia o arquivo direto do navegador para o Supabase Storage.
 * As políticas do bucket só permitem o envio para administradores autenticados.
 * O arquivo original é enviado sem recompressão; a otimização das imagens acontece na entrega (next/image).
 */
export function Uploader({ name, kindName, label, accept, folder, defaultUrl, defaultKind, onChange }: UploaderProps) {
  const id = useId();
  const [url, setUrl] = useState(defaultUrl ?? "");
  const [kind, setKind] = useState<string>(defaultKind ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
      const path = `${folder}/${crypto.randomUUID()}.${ext}`;
      const supabase = getBrowserClient();
      const { error: upErr } = await supabase.storage
        .from(MEDIA_BUCKET)
        .upload(path, file, { cacheControl: "31536000", contentType: file.type, upsert: false });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
      const k = file.type.startsWith("video") ? "video" : "image";
      setUrl(data.publicUrl);
      setKind(k);
      onChange?.(data.publicUrl, k);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha no envio.");
    } finally {
      setBusy(false);
    }
  };

  const isVideo = kind === "video" || /\.(mp4|mov|webm|m4v)(\?|$)/i.test(url);
  const isAudio = accept.startsWith("audio");

  return (
    <div>
      <span className="text-sm font-medium text-ink/80">{label}</span>
      <input type="hidden" name={name} value={url} />
      {kindName && <input type="hidden" name={kindName} value={url ? (isVideo ? "video" : "image") : ""} />}

      {url ? (
        <div className="mt-2 space-y-2">
          {isAudio ? (
            <audio src={url} controls className="w-full" />
          ) : isVideo ? (
            <video src={url} controls playsInline preload="metadata" className="max-h-64 w-full rounded-md bg-black" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element -- prévia do arquivo recém-enviado
            <img src={url} alt="" className="max-h-64 rounded-md object-contain" />
          )}
          <button
            type="button"
            onClick={() => {
              setUrl("");
              setKind("");
              onChange?.("", "image");
            }}
            className="inline-flex min-h-10 items-center gap-1.5 text-sm text-red-700"
          >
            <Trash2 className="size-4" /> Remover do conteúdo
          </button>
        </div>
      ) : (
        <label
          htmlFor={id}
          className="mt-2 flex min-h-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed border-ink/25 bg-white px-4 py-6 text-sm text-ink/60 transition hover:border-rose hover:text-ink"
        >
          {busy ? <Loader2 className="size-5 animate-spin" /> : <Upload className="size-5" />}
          {busy ? "Enviando… (arquivos grandes podem demorar)" : "Escolher arquivo"}
          <input id={id} type="file" accept={accept} className="sr-only" disabled={busy} onChange={(e) => onFile(e.target.files?.[0])} />
        </label>
      )}
      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
    </div>
  );
}
