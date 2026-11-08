"use client";
import { usePrefersReducedMotion } from "@/components/ui/usePrefersReducedMotion";
import { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { AudioLines, MapPin, Play } from "lucide-react";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { memoryDate } from "@/components/ui/format";
import type { Memory, SiteSettings } from "@/lib/types";
import { ChapterHeader } from "./ChapterHeader";
import { MemoryLightbox } from "./MemoryLightbox";

/** Composição editorial: cada formato ocupa um espaço diferente na página. */
const LAYOUT: Record<Memory["layout"], { frame: string; col: string }> = {
  wide: { frame: "aspect-[4/3] md:aspect-[16/9]", col: "md:col-span-12" },
  tall: { frame: "aspect-[4/5] md:aspect-[3/4]", col: "md:col-span-5" },
  square: { frame: "aspect-square", col: "md:col-span-6" },
};

/** Desloca colunas para quebrar a rigidez do grid, como num livro de fotografia. */
const OFFSETS = ["", "md:col-start-2", "md:col-start-7 md:mt-32", "md:col-start-1", "md:col-start-6 md:-mt-10"];

export function Moments({ settings, memories }: { settings: SiteSettings; memories: Memory[] }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="px-5 py-28 sm:px-8 sm:py-40">
      <ChapterHeader {...settings.momentsIntro} />

      {memories.length === 0 ? (
        <p className="mt-20 text-center font-serif text-xl italic text-ivory/50">As memórias estão a caminho.</p>
      ) : (
        <div className="mx-auto mt-20 grid max-w-6xl grid-cols-1 gap-x-8 gap-y-20 md:grid-cols-12 md:gap-y-28">
          {memories.map((m, i) => (
            <MemoryFigure
              key={m.id}
              memory={m}
              className={`${LAYOUT[m.layout].col} ${m.layout === "wide" ? "" : OFFSETS[i % OFFSETS.length]}`}
              frameClass={LAYOUT[m.layout].frame}
              priority={i === 0}
              onOpen={() => setOpen(i)}
            />
          ))}
        </div>
      )}

      <MemoryLightbox
        memories={memories}
        index={open}
        onClose={() => setOpen(null)}
        onIndex={setOpen}
      />
    </div>
  );
}

function MemoryFigure({
  memory,
  className,
  frameClass,
  priority,
  onOpen,
}: {
  memory: Memory;
  className: string;
  frameClass: string;
  priority: boolean;
  onOpen: () => void;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduce = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  // Profundidade discreta: a imagem se move um pouco mais devagar que a página.
  const y = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["-5%", "5%"]);
  const date = memoryDate(memory);

  return (
    <motion.figure
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      <button
        type="button"
        onClick={onOpen}
        aria-label={`Abrir memória: ${memory.title}`}
        className="group relative block w-full overflow-hidden"
      >
        <motion.div style={{ y, scale: 1.12 }} className="w-full">
          <MediaFrame
            media={memory.media}
            sizes={memory.layout === "wide" ? "(min-width: 1152px) 1152px, 100vw" : "(min-width: 768px) 50vw, 100vw"}
            className={`${frameClass} w-full transition duration-[1.6s] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.03]`}
            priority={priority}
          />
        </motion.div>
        {memory.media?.kind === "video" && (
          <span className="absolute right-4 bottom-4 flex size-12 items-center justify-center rounded-full border border-ivory/40 bg-night/40 text-ivory backdrop-blur">
            <Play className="size-4 translate-x-px" strokeWidth={1.5} aria-hidden />
          </span>
        )}
        {memory.isSpecial && (
          <span className="absolute top-4 left-4 rounded-full bg-night/50 px-3 py-1 text-[0.65rem] tracking-[0.18em] text-rose uppercase backdrop-blur">
            Especial
          </span>
        )}
      </button>
      <figcaption className="mt-6 max-w-xl">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.72rem] tracking-[0.14em] text-gold/80 uppercase">
          {date && <span>{date}</span>}
          {memory.location && (
            <span className="flex items-center gap-1.5">
              <MapPin className="size-3" strokeWidth={1.4} aria-hidden /> {memory.location}
            </span>
          )}
          {memory.audioSrc && (
            <span className="flex items-center gap-1.5">
              <AudioLines className="size-3" strokeWidth={1.4} aria-hidden /> áudio
            </span>
          )}
        </div>
        <h3 className="mt-3 font-serif text-3xl font-light text-ivory">{memory.title}</h3>
        {memory.feeling && (
          <p className="mt-3 font-serif text-xl leading-relaxed italic text-ivory/65">“{memory.feeling}”</p>
        )}
      </figcaption>
    </motion.figure>
  );
}
