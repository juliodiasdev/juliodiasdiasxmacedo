"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useScroll, useSpring } from "motion/react";
import { BookOpen, X } from "lucide-react";
import { useDialog } from "@/components/ui/useDialog";

export interface ChapterLink {
  id: string;
  label: string;
}

/** Indicador de progresso da narrativa + índice de capítulos (alcançável com o polegar). */
export function Progress({ chapters }: { chapters: ChapterLink[] }) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });
  const [current, setCurrent] = useState<string>(chapters[0]?.id ?? "");
  const [open, setOpen] = useState(false);
  const ref = useDialog(open, () => setOpen(false));

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => e.isIntersecting && setCurrent(e.target.id));
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    chapters.forEach((c) => {
      const el = document.getElementById(c.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [chapters]);

  const index = Math.max(0, chapters.findIndex((c) => c.id === current));

  const go = (id: string) => {
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <motion.div
        aria-hidden
        style={{ scaleX }}
        className="fixed inset-x-0 top-0 z-50 h-[2px] origin-left bg-gradient-to-r from-gold/60 via-rose to-rose"
      />

      {/* Pontos laterais no desktop */}
      <nav aria-label="Capítulos" className="fixed top-1/2 right-6 z-40 hidden -translate-y-1/2 flex-col gap-4 lg:flex">
        {chapters.map((c, i) => (
          <button
            key={c.id}
            type="button"
            onClick={() => go(c.id)}
            aria-current={c.id === current ? "true" : undefined}
            className="group flex items-center justify-end gap-3"
          >
            <span className="pointer-events-none translate-x-2 text-xs text-ivory/0 transition duration-500 group-hover:translate-x-0 group-hover:text-ivory/70 mix-blend-difference">
              {c.label}
            </span>
            <span
              className={`block h-px transition-all duration-700 ${
                c.id === current ? "w-8 bg-rose" : i < index ? "w-4 bg-gold/60" : "w-4 bg-ivory/25"
              }`}
            />
          </button>
        ))}
      </nav>

      {/* Botão de índice no celular */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Capítulos — atual: ${chapters[index]?.label ?? ""}`}
        className="fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-50 flex h-12 items-center gap-2 rounded-full border border-ivory/15 bg-night/80 px-4 text-ivory backdrop-blur-md transition active:scale-95 lg:hidden"
      >
        <BookOpen className="size-4" strokeWidth={1.5} aria-hidden />
        <span className="text-xs tabular-nums text-ivory/70">
          {index + 1}/{chapters.length}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-end bg-night/70 backdrop-blur-sm lg:hidden"
            onClick={() => setOpen(false)}
          >
            <motion.div
              ref={ref}
              role="dialog"
              aria-modal="true"
              aria-label="Capítulos"
              tabIndex={-1}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 260, damping: 32 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full rounded-t-2xl border-t border-ivory/10 bg-night-2 px-5 pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] outline-none"
            >
              <div className="flex items-center justify-between">
                <p className="kicker">Capítulos</p>
                <button type="button" onClick={() => setOpen(false)} aria-label="Fechar" className="flex size-11 items-center justify-center text-ivory/60">
                  <X className="size-5" strokeWidth={1.4} />
                </button>
              </div>
              <ol className="mt-2">
                {chapters.map((c, i) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => go(c.id)}
                      className={`flex min-h-14 w-full items-center gap-4 border-b border-ivory/5 text-left font-serif text-xl ${
                        c.id === current ? "text-rose" : "text-ivory/80"
                      }`}
                    >
                      <span className="w-6 font-sans text-xs text-gold/60 tabular-nums">{i + 1}</span>
                      {c.label}
                    </button>
                  </li>
                ))}
              </ol>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
