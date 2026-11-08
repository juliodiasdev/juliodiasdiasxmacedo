"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Detail, SiteSettings } from "@/lib/types";
import { ChapterHeader } from "./ChapterHeader";

const TILTS = [-2.2, 1.6, -1, 2.4, -1.8, 1.1, -2.6, 0.8];

/** Capítulo 4 — bilhetes descobertos um a um. */
export function LittleThings({ settings, details }: { settings: SiteSettings; details: Detail[] }) {
  const [opened, setOpened] = useState(0);
  const remaining = details.length - opened;
  const done = remaining === 0;

  return (
    <div className="paper px-5 py-28 sm:py-40">
      <ChapterHeader {...settings.detailsIntro} tone="paper" />

      {details.length > 0 && (
        <div className="mx-auto mt-16 max-w-3xl">
          {/* Pilha de bilhetes fechados */}
          <div className="relative mx-auto flex h-56 max-w-sm items-center justify-center">
            <AnimatePresence>
              {!done &&
                details.slice(opened, opened + 3).map((d, i) => (
                  <motion.button
                    key={d.id}
                    type="button"
                    onClick={i === 0 ? () => setOpened((o) => o + 1) : undefined}
                    tabIndex={i === 0 ? 0 : -1}
                    aria-hidden={i !== 0}
                    aria-label={i === 0 ? `Abrir bilhete ${opened + 1} de ${details.length}` : undefined}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: i * 8, rotate: TILTS[(opened + i) % TILTS.length], scale: 1 - i * 0.04 }}
                    exit={{ opacity: 0, y: 120, rotate: 0, scale: 0.9, transition: { duration: 0.6 } }}
                    whileHover={i === 0 ? { y: -6 } : undefined}
                    whileTap={i === 0 ? { scale: 0.97 } : undefined}
                    transition={{ type: "spring", stiffness: 180, damping: 22 }}
                    style={{ zIndex: 10 - i }}
                    className="absolute flex h-44 w-64 flex-col items-center justify-center border border-ink/10 bg-[#f8f3ea] shadow-[0_18px_40px_-20px_rgb(23_28_40/0.45)]"
                  >
                    {/* dobra do papel */}
                    <span aria-hidden className="absolute inset-x-0 top-1/2 h-px bg-ink/10" />
                    <span aria-hidden className="absolute top-0 right-0 size-6 bg-gradient-to-bl from-ink/10 to-transparent" />
                    {i === 0 && (
                      <>
                        <span className="font-serif text-2xl italic text-rose">para você</span>
                        <span className="mt-3 text-[0.7rem] tracking-[0.22em] text-ink/45 uppercase">toque para abrir</span>
                      </>
                    )}
                  </motion.button>
                ))}
            </AnimatePresence>
            {done && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center font-serif text-2xl italic text-ink/70"
              >
                E ainda há muitas outras que eu não caberia em bilhetes.
              </motion.p>
            )}
          </div>

          <p className="mt-6 text-center text-xs tracking-[0.2em] text-ink/45 uppercase tabular-nums" aria-live="polite">
            {opened} de {details.length} bilhetes abertos
          </p>

          {/* Bilhetes já abertos */}
          <ol className="mt-16 space-y-6">
            {details.slice(0, opened).map((d, i) => (
              <motion.li
                key={d.id}
                initial={{ opacity: 0, rotateX: -80, y: -20 }}
                animate={{ opacity: 1, rotateX: 0, y: 0 }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                style={{ transformPerspective: 900, transformOrigin: "top" }}
                className={`relative max-w-xl border-l-2 border-rose/50 bg-white/40 px-6 py-6 sm:px-8 ${
                  i % 2 ? "sm:ml-auto" : ""
                }`}
              >
                <span className="text-[0.65rem] tracking-[0.24em] text-ink/40 uppercase">nº {i + 1}</span>
                <p className="mt-2 font-serif text-[1.65rem] leading-snug text-ink">{d.text}</p>
                {d.note && <p className="mt-3 text-[0.98rem] leading-relaxed text-ink/60">{d.note}</p>}
              </motion.li>
            ))}
          </ol>

          {opened > 0 && !done && (
            <div className="mt-10 text-center">
              <button
                type="button"
                onClick={() => setOpened(details.length)}
                className="min-h-11 text-sm text-ink/50 underline decoration-ink/20 underline-offset-4 transition hover:text-ink"
              >
                Abrir todos de uma vez
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
