"use client";
import { AnimatePresence, motion, type PanInfo } from "motion/react";
import { ArrowLeft, ArrowRight, MapPin, X } from "lucide-react";
import Image from "next/image";
import { AudioNote } from "@/components/ui/AudioNote";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { memoryDate, paragraphs } from "@/components/ui/format";
import { useDialog } from "@/components/ui/useDialog";
import type { Memory } from "@/lib/types";

interface MemoryLightboxProps {
  memories: Memory[];
  index: number | null;
  onClose: () => void;
  onIndex: (i: number) => void;
}

/** Visualização ampliada de uma memória, com história, sentimento e áudio. */
export function MemoryLightbox({ memories, index, onClose, onIndex }: MemoryLightboxProps) {
  const memory = index !== null ? memories[index] : null;
  const prev = index !== null && index > 0 ? () => onIndex(index - 1) : undefined;
  const next = index !== null && index < memories.length - 1 ? () => onIndex(index + 1) : undefined;
  const ref = useDialog(Boolean(memory), onClose, { left: prev, right: next });

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -80) next?.();
    else if (info.offset.x > 80) prev?.();
  };

  return (
    <AnimatePresence>
      {memory && (
        <motion.div
          ref={ref}
          role="dialog"
          aria-modal="true"
          aria-labelledby="memory-title"
          tabIndex={-1}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="fixed inset-0 z-[70] overflow-y-auto overscroll-contain bg-[#0e1119] outline-none"
        >
          <div className="sticky top-0 z-10 flex items-center justify-between bg-gradient-to-b from-[#0e1119] to-transparent px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
            <span className="pl-2 text-xs tracking-[0.2em] text-ivory/50 tabular-nums">
              {(index ?? 0) + 1} / {memories.length}
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar memória"
              className="flex size-12 items-center justify-center rounded-full text-ivory/70 transition hover:bg-ivory/5 hover:text-ivory"
            >
              <X className="size-5" strokeWidth={1.4} />
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={memory.id}
              initial={{ opacity: 0, scale: 0.985 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.01 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto grid max-w-6xl gap-10 px-4 pb-16 lg:grid-cols-[1.4fr_1fr] lg:items-center lg:gap-14 lg:px-8"
            >
              <motion.div drag={memories.length > 1 ? "x" : false} dragConstraints={{ left: 0, right: 0 }} dragElastic={0.25} onDragEnd={onDragEnd}>
                {memory.media?.kind === "image" ? (
                  <div
                    className="relative mx-auto w-full"
                    style={
                      memory.media.width && memory.media.height
                        ? {
                            aspectRatio: `${memory.media.width} / ${memory.media.height}`,
                            maxWidth: `calc(78dvh * ${memory.media.width / memory.media.height})`,
                          }
                        : { height: "70dvh" }
                    }
                  >
                    <Image
                      src={memory.media.src}
                      alt={memory.media.alt}
                      fill
                      sizes="(min-width: 1024px) 60vw, 100vw"
                      quality={90}
                      className="cinematic object-contain"
                      draggable={false}
                    />
                  </div>
                ) : memory.media?.kind === "video" ? (
                  <video
                    className="cinematic max-h-[78dvh] w-full bg-black object-contain"
                    src={memory.media.src}
                    poster={memory.media.poster ?? undefined}
                    controls
                    playsInline
                    preload="metadata"
                    aria-label={memory.media.alt}
                  />
                ) : (
                  <MediaFrame media={null} sizes="100vw" className="aspect-[4/3] w-full" />
                )}
              </motion.div>

              <div className="px-1">
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[0.72rem] tracking-[0.14em] text-gold/80 uppercase">
                  {memoryDate(memory) && <span>{memoryDate(memory)}</span>}
                  {memory.location && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="size-3" strokeWidth={1.4} aria-hidden /> {memory.location}
                    </span>
                  )}
                </div>
                <h3 id="memory-title" className="mt-4 font-serif text-4xl leading-tight font-light text-ivory sm:text-5xl">
                  {memory.title}
                </h3>
                <div className="hairline mt-6 w-20" />
                <div className="prose-letter mt-6 text-[1.05rem] leading-relaxed text-ivory/75">
                  {paragraphs(memory.story).map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
                {memory.feeling && (
                  <blockquote className="mt-8 border-l border-rose/60 pl-5 font-serif text-2xl leading-snug italic text-ivory/90">
                    {memory.feeling}
                  </blockquote>
                )}
                {memory.audioSrc && (
                  <div className="mt-8">
                    <AudioNote src={memory.audioSrc} tone="dark" label="O que eu quis dizer sobre este momento" />
                  </div>
                )}

                {memories.length > 1 && (
                  <div className="mt-10 flex gap-3">
                    <button
                      type="button"
                      onClick={prev}
                      disabled={!prev}
                      aria-label="Memória anterior"
                      className="flex size-12 items-center justify-center rounded-full border border-ivory/15 text-ivory/70 transition hover:border-ivory/40 disabled:opacity-25"
                    >
                      <ArrowLeft className="size-4" strokeWidth={1.4} />
                    </button>
                    <button
                      type="button"
                      onClick={next}
                      disabled={!next}
                      aria-label="Próxima memória"
                      className="flex size-12 items-center justify-center rounded-full border border-ivory/15 text-ivory/70 transition hover:border-ivory/40 disabled:opacity-25"
                    >
                      <ArrowRight className="size-4" strokeWidth={1.4} />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
