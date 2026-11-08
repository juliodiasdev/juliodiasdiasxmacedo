"use client";
import { RevealLines } from "@/components/ui/RevealLines";
import { Reveal } from "@/components/ui/Reveal";
import type { SiteSettings } from "@/lib/types";

interface EndingProps {
  settings: SiteSettings;
  newCount: number;
  onReturn: () => void;
  onRestart: () => void;
}

/** Capítulo 7 — Isso não termina aqui. */
export function Ending({ settings, newCount, onReturn, onRestart }: EndingProps) {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center px-6 py-28 text-center">
      <Reveal>
        <p className="kicker">Capítulo sete</p>
      </Reveal>
      <RevealLines
        lines={settings.ending.lines}
        stagger={1.6}
        delay={0.4}
        className="mt-14 max-w-2xl space-y-8"
        lineClassName={() => "font-serif text-[1.9rem] leading-snug font-light text-ivory sm:text-4xl"}
      />
      <Reveal delay={0.6} className="mt-16 flex flex-col items-center gap-5">
        <button
          type="button"
          onClick={onReturn}
          className="rounded-full border border-gold/40 px-8 py-4 text-sm tracking-[0.18em] text-ivory uppercase transition duration-700 hover:border-rose hover:bg-rose/10 active:scale-[0.98]"
        >
          {settings.ending.button}
        </button>
        <p className="max-w-xs text-sm leading-relaxed text-ivory/50" aria-live="polite">
          {newCount > 0
            ? `${newCount} ${newCount === 1 ? "pensamento novo" : "pensamentos novos"} desde a sua última visita.`
            : "Volte de vez em quando. Novos pensamentos vão continuar chegando."}
        </p>
        <button
          type="button"
          onClick={onRestart}
          className="mt-6 min-h-11 text-xs tracking-[0.2em] text-ivory/40 uppercase transition hover:text-ivory/80"
        >
          Recomeçar do início
        </button>
      </Reveal>
    </div>
  );
}
