"use client";
import { usePrefersReducedMotion } from "@/components/ui/usePrefersReducedMotion";
import { useState } from "react";
import { motion } from "motion/react";
import { Music } from "lucide-react";
import { RevealLines } from "@/components/ui/RevealLines";
import type { SiteSettings } from "@/lib/types";

interface ThresholdProps {
  settings: SiteSettings;
  hasMusic: boolean;
  onEnter: (withMusic: boolean) => void;
}

/** Capítulo 1 — Antes de entrar. */
export function Threshold({ settings, hasMusic, onEnter }: ThresholdProps) {
  const reduce = usePrefersReducedMotion();
  const [ready, setReady] = useState(false);
  const [withMusic, setWithMusic] = useState(false);
  const lines = settings.intro.lines;
  const stagger = reduce ? 0.2 : 1.9;

  return (
    <motion.section
      aria-label="Antes de entrar"
      className="fixed inset-0 z-40 flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-night px-6"
      exit={{ opacity: 0, scale: 1.04, filter: "blur(10px)" }}
      transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Luz ambiente que respira lentamente */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 size-[140vmax] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: "radial-gradient(circle, rgb(181 141 121 / 0.10), transparent 45%)" }}
        animate={reduce ? undefined : { scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      <Dust />

      <div className="relative mx-auto max-w-xl text-center">
        <RevealLines
          onMount
          lines={lines}
          stagger={stagger}
          delay={reduce ? 0 : 0.8}
          onComplete={() => setReady(true)}
          className="space-y-6"
          lineClassName={(i, n) =>
            i === n - 1
              ? "pt-4 font-serif text-6xl leading-[1.2] italic font-light text-rose sm:text-7xl"
              : "font-serif text-[1.65rem] leading-snug font-light text-ivory/90 sm:text-3xl"
          }
        />

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={ready ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 1.2, delay: 0.3 }}
          className="mt-14 flex flex-col items-center gap-6"
        >
          <button
            type="button"
            onClick={() => onEnter(withMusic)}
            disabled={!ready}
            className="group relative overflow-hidden rounded-full border border-gold/40 px-8 py-4 text-sm tracking-[0.18em] text-ivory uppercase transition duration-700 hover:border-rose hover:bg-rose/10 active:scale-[0.98]"
          >
            <span className="relative">{settings.intro.button}</span>
          </button>

          {hasMusic && (
            <label className="flex cursor-pointer items-center gap-3 text-xs tracking-wide text-ivory/60">
              <input
                type="checkbox"
                checked={withMusic}
                onChange={(e) => setWithMusic(e.target.checked)}
                className="peer sr-only"
              />
              <span className="flex h-6 w-10 items-center rounded-full border border-ivory/25 p-0.5 transition peer-checked:border-rose peer-checked:[&>span]:translate-x-4 peer-checked:[&>span]:bg-rose peer-focus-visible:outline peer-focus-visible:outline-gold">
                <span className="size-4 rounded-full bg-ivory/50 transition" />
              </span>
              <Music aria-hidden className="size-3.5" strokeWidth={1.5} />
              Entrar com música instrumental
            </label>
          )}
        </motion.div>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 2 }}
        className="absolute bottom-[max(1.5rem,env(safe-area-inset-bottom))] px-6 text-center font-serif text-sm italic text-gold/60"
      >
        {settings.title}
      </motion.p>
    </motion.section>
  );
}

/** Partículas de poeira de luz — poucas, lentas, puramente decorativas. */
function Dust() {
  const reduce = usePrefersReducedMotion();
  if (reduce) return null;
  const specks = Array.from({ length: 18 }, (_, i) => ({
    left: (i * 37) % 100,
    top: (i * 53) % 100,
    size: 1 + (i % 3),
    dur: 14 + (i % 5) * 3,
    delay: (i % 7) * 1.3,
  }));
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {specks.map((s, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-gold"
          style={{ left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size }}
          animate={{ y: [0, -40, 0], opacity: [0, 0.5, 0] }}
          transition={{ duration: s.dur, delay: s.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}
