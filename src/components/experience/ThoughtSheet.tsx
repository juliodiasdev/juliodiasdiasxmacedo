"use client";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Star, X } from "lucide-react";
import { AudioNote } from "@/components/ui/AudioNote";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { formatDate, paragraphs } from "@/components/ui/format";
import { useDialog } from "@/components/ui/useDialog";
import type { Thought } from "@/lib/types";

interface ThoughtSheetProps {
  thought: Thought | null;
  category?: string;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}

/** Um pensamento aberto como uma página de diário. */
export function ThoughtSheet({ thought, category, onClose, onPrev, onNext }: ThoughtSheetProps) {
  const ref = useDialog(Boolean(thought), onClose, { left: onPrev, right: onNext });

  return (
    <AnimatePresence>
      {thought && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-night/70 backdrop-blur-sm sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          onClick={onClose}
        >
          <motion.div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-labelledby="thought-title"
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
            initial={{ y: 60, opacity: 0, rotateX: 6 }}
            animate={{ y: 0, opacity: 1, rotateX: 0 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="paper relative flex max-h-[94dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[14px] shadow-2xl outline-none sm:rounded-[3px]"
            style={{ transformPerspective: 1200 }}
          >
            {/* Barra para o polegar no celular */}
            <div aria-hidden className="mx-auto mt-3 h-1 w-10 rounded-full bg-ink/15 sm:hidden" />

            <div className="flex items-center justify-between px-6 pt-4 sm:px-10 sm:pt-8">
              <time dateTime={thought.createdAt} className="text-[0.72rem] tracking-[0.18em] text-ink/50 uppercase">
                {formatDate(thought.createdAt)}
              </time>
              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar pensamento"
                className="-mr-2 flex size-11 items-center justify-center rounded-full text-ink/60 transition hover:bg-ink/5 hover:text-ink"
              >
                <X className="size-5" strokeWidth={1.4} />
              </button>
            </div>

            <motion.article
              key={thought.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="overflow-y-auto overscroll-contain px-6 pb-10 sm:px-14"
            >
              {category && <p className="mt-4 font-serif text-lg italic text-rose">{category}</p>}
              <h3 id="thought-title" className="mt-2 font-serif text-[2.4rem] leading-[1.08] font-normal text-ink sm:text-5xl">
                {thought.title}
              </h3>
              {thought.isSpecial && (
                <p className="mt-4 flex items-center gap-2 text-xs tracking-[0.16em] text-rose uppercase">
                  <Star className="size-3.5 fill-rose/50" strokeWidth={1.2} aria-hidden /> Um pensamento especial
                </p>
              )}
              <div className="mt-6 h-px w-16 bg-rose/50" />

              {thought.photo && (
                <MediaFrame
                  media={thought.photo}
                  sizes="(min-width: 672px) 640px, 100vw"
                  className="mt-8 aspect-[4/5] w-full sm:aspect-[3/2]"
                  controls
                />
              )}

              <div className="prose-letter mt-8 font-serif text-[1.3rem] leading-[1.7] text-ink/90">
                {paragraphs(thought.body).map((p, i) => (
                  <motion.p
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 + i * 0.25, duration: 0.9 }}
                  >
                    {p}
                  </motion.p>
                ))}
              </div>

              {thought.audioSrc && (
                <div className="mt-10">
                  <AudioNote src={thought.audioSrc} />
                </div>
              )}
            </motion.article>

            {(onPrev || onNext) && (
              <nav className="flex items-center justify-between border-t border-ink/10 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-8">
                <button
                  type="button"
                  onClick={onPrev}
                  disabled={!onPrev}
                  className="flex min-h-11 items-center gap-2 rounded-full px-3 text-sm text-ink/70 transition hover:text-ink disabled:opacity-25"
                >
                  <ArrowLeft className="size-4" strokeWidth={1.4} /> Mais recente
                </button>
                <button
                  type="button"
                  onClick={onNext}
                  disabled={!onNext}
                  className="flex min-h-11 items-center gap-2 rounded-full px-3 text-sm text-ink/70 transition hover:text-ink disabled:opacity-25"
                >
                  Anterior <ArrowRight className="size-4" strokeWidth={1.4} />
                </button>
              </nav>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
