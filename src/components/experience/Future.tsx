"use client";
import { motion } from "motion/react";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { RevealLines } from "@/components/ui/RevealLines";
import { Reveal } from "@/components/ui/Reveal";
import type { FutureFragment, SiteSettings } from "@/lib/types";

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

/** Capítulo 5 — sonhos e planos, nunca apresentados como fatos. */
export function Future({ settings, fragments }: { settings: SiteSettings; fragments: FutureFragment[] }) {
  const intro = settings.futureIntro;
  return (
    <div className="relative overflow-hidden">
      {/* Abertura */}
      <div className="flex min-h-[100dvh] flex-col items-center justify-center px-6 py-28 text-center">
        <Reveal>
          <p className="kicker">{intro.kicker}</p>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="mt-5 font-serif text-xl italic text-gold/80">{intro.title}</h2>
        </Reveal>
        <RevealLines
          lines={intro.lines}
          stagger={1.8}
          delay={0.5}
          className="mt-16 max-w-2xl space-y-10"
          lineClassName={(i, n) =>
            i === n - 1
              ? "font-serif text-6xl leading-[1.2] italic font-light text-rose sm:text-7xl"
              : "font-serif text-[1.8rem] leading-snug font-light text-ivory/90 sm:text-4xl"
          }
        />
        <Reveal delay={0.6}>
          <p className="mx-auto mt-16 max-w-md text-[0.95rem] leading-relaxed text-ivory/50">{intro.disclaimer}</p>
        </Reveal>
      </div>

      {/* Fragmentos de um futuro desejado */}
      <ol className="mx-auto max-w-3xl px-6 pb-36">
        {fragments.map((f, i) => (
          <motion.li
            key={f.id}
            initial={{ opacity: 0, filter: "blur(12px)", y: 30 }}
            whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            viewport={{ once: true, margin: "-15%" }}
            transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
            className={`relative py-16 sm:py-20 ${i % 2 ? "sm:pl-24" : "sm:pr-24"}`}
          >
            <div className="flex items-baseline gap-5">
              <span aria-hidden className="font-serif text-lg italic text-gold/60">
                {ROMAN[i] ?? i + 1}
              </span>
              <span className="text-[0.68rem] tracking-[0.28em] text-ivory/35 uppercase">um dia, talvez</span>
            </div>
            <h3 className="mt-4 font-serif text-4xl leading-tight font-light text-ivory sm:text-5xl">{f.title}</h3>
            <p className="mt-5 max-w-xl text-[1.08rem] leading-[1.8] text-ivory/65">{f.text}</p>
            {f.media && (
              <MediaFrame
                media={f.media}
                sizes="(min-width: 768px) 720px, 100vw"
                className="mt-10 aspect-[3/2] w-full opacity-90"
                controls
              />
            )}
            {i < fragments.length - 1 && (
              <span aria-hidden className="absolute bottom-0 left-0 h-px w-12 bg-gold/25" />
            )}
          </motion.li>
        ))}
      </ol>
    </div>
  );
}
