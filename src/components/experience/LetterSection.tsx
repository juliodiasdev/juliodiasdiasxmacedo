"use client";
import { motion } from "motion/react";
import { paragraphs } from "@/components/ui/format";
import type { Letter, SiteSettings } from "@/lib/types";
import { ChapterHeader } from "./ChapterHeader";

/** Capítulo 6 — a carta. Cada parágrafo surge conforme a leitura avança. */
export function LetterSection({ settings, letter }: { settings: SiteSettings; letter: Letter }) {
  const reveal = {
    initial: { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-12%" },
    transition: { duration: 1.3, ease: [0.22, 1, 0.36, 1] as const },
  };

  return (
    <div className="paper px-5 py-28 sm:py-40">
      <ChapterHeader kicker={settings.letterIntro.kicker} title={settings.letterIntro.title} tone="paper" />

      <article className="relative mx-auto mt-16 max-w-2xl border border-ink/10 bg-[#f8f4ec] px-6 py-14 shadow-[0_30px_80px_-40px_rgb(23_28_40/0.5)] sm:px-16 sm:py-20">
        {/* Linhas de pauta muito leves */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{ backgroundImage: "repeating-linear-gradient(transparent 0 43px, rgb(42 38 32 / 0.06) 43px 44px)" }}
        />
        <div className="relative">
          {letter.title && (
            <motion.h3 {...reveal} className="font-serif text-sm tracking-[0.3em] text-rose uppercase">
              {letter.title}
            </motion.h3>
          )}
          {letter.greeting && (
            <motion.p {...reveal} className="mt-8 font-serif text-3xl italic text-ink">
              {letter.greeting}
            </motion.p>
          )}
          <div className="prose-letter mt-8 font-serif text-[1.32rem] leading-[1.75] text-ink/85">
            {paragraphs(letter.body).map((p, i) => (
              <motion.p key={i} {...reveal}>
                {p}
              </motion.p>
            ))}
          </div>
          {letter.closing && (
            <motion.p {...reveal} className="mt-14 font-serif text-[1.6rem] leading-snug italic text-ink">
              {letter.closing}
            </motion.p>
          )}
          {letter.signature && (
            <motion.p {...reveal} className="mt-10 text-right font-serif text-3xl italic text-rose">
              {letter.signature}
            </motion.p>
          )}
        </div>
      </article>
    </div>
  );
}
