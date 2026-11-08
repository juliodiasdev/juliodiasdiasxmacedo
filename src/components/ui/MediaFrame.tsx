"use client";
import Image from "next/image";
import { ImageIcon } from "lucide-react";
import type { MediaRef } from "@/lib/types";

interface MediaFrameProps {
  media: MediaRef | null;
  sizes: string;
  className?: string;
  priority?: boolean;
  /** Para vídeos: mostra controles nativos (true) ou apenas a capa (false, ex.: em cartões). */
  controls?: boolean;
  placeholderLabel?: string;
}

/**
 * Exibe uma fotografia ou vídeo real. Sem mídia, mostra um espaço reservado honesto —
 * nunca uma imagem genérica no lugar das suas.
 */
export function MediaFrame({
  media,
  sizes,
  className = "",
  priority,
  controls = false,
  placeholderLabel = "Fotografia ainda não adicionada",
}: MediaFrameProps) {
  if (!media) {
    return (
      <div
        className={`relative flex items-center justify-center overflow-hidden border border-gold/20 bg-night-2 ${className}`}
        role="img"
        aria-label={placeholderLabel}
      >
        <div className="absolute inset-3 border border-gold/10" />
        <div className="flex flex-col items-center gap-3 px-6 text-center text-gold/60">
          <ImageIcon aria-hidden className="size-5" strokeWidth={1.2} />
          <span className="text-[0.7rem] tracking-[0.2em] uppercase">{placeholderLabel}</span>
        </div>
      </div>
    );
  }

  if (media.kind === "video") {
    return (
      <div className={`relative overflow-hidden bg-black ${className}`}>
        <video
          className="cinematic absolute inset-0 h-full w-full object-cover"
          src={media.src}
          poster={media.poster ?? undefined}
          controls={controls}
          playsInline
          preload="metadata"
          aria-label={media.alt}
        />
      </div>
    );
  }

  return (
    <div className={`vignette relative overflow-hidden bg-night-2 ${className}`}>
      <Image
        src={media.src}
        alt={media.alt}
        fill
        sizes={sizes}
        priority={priority}
        quality={85}
        className="cinematic object-cover"
      />
    </div>
  );
}
