"use client";
import { usePrefersReducedMotion } from "@/components/ui/usePrefersReducedMotion";
import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { MediaFrame } from "@/components/ui/MediaFrame";
import type { Interlude as InterludeT } from "@/lib/types";

/**
 * Pausa cinematográfica entre capítulos com um vídeo (ou foto) real.
 * O vídeo começa mudo quando aparece na tela (permitido pelos navegadores móveis)
 * e a pessoa decide se quer ouvir. Com movimento reduzido, nada toca sozinho.
 */
export function Interlude({ interlude }: { interlude: InterludeT }) {
  const ref = useRef<HTMLVideoElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const inView = useInView(wrap, { amount: 0.6 });
  const reduce = usePrefersReducedMotion();
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const isVideo = interlude.media.kind === "video";

  useEffect(() => {
    const v = ref.current;
    if (!v || reduce) return;
    if (inView) v.play().catch(() => undefined);
    else v.pause();
  }, [inView, reduce]);

  return (
    <motion.div
      ref={wrap}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1.6 }}
      className="relative"
    >
      {isVideo ? (
        <div className="relative h-[85dvh] w-full overflow-hidden bg-black">
          <video
            ref={ref}
            className="cinematic absolute inset-0 h-full w-full object-cover"
            src={interlude.media.src}
            poster={interlude.media.poster ?? undefined}
            muted={muted}
            loop
            playsInline
            preload="metadata"
            aria-label={interlude.media.alt}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
          />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-night via-transparent to-night" />
          <div className="absolute right-4 bottom-[max(1.25rem,env(safe-area-inset-bottom))] flex gap-2">
            <button
              type="button"
              onClick={() => (playing ? ref.current?.pause() : ref.current?.play())}
              aria-label={playing ? "Pausar vídeo" : "Reproduzir vídeo"}
              className="flex size-12 items-center justify-center rounded-full border border-ivory/25 bg-night/50 text-ivory backdrop-blur"
            >
              {playing ? <Pause className="size-4" /> : <Play className="size-4 translate-x-px" />}
            </button>
            <button
              type="button"
              onClick={() => setMuted((m) => !m)}
              aria-label={muted ? "Ativar som do vídeo" : "Silenciar vídeo"}
              className="flex size-12 items-center justify-center rounded-full border border-ivory/25 bg-night/50 text-ivory backdrop-blur"
            >
              {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
            </button>
          </div>
        </div>
      ) : (
        <MediaFrame media={interlude.media} sizes="100vw" className="h-[85dvh] w-full" />
      )}
      {interlude.caption && (
        <p className="absolute inset-x-0 bottom-24 mx-auto max-w-lg px-6 text-center font-serif text-2xl italic text-ivory/90 [text-shadow:0_2px_20px_rgb(0_0_0/0.6)]">
          {interlude.caption}
        </p>
      )}
    </motion.div>
  );
}
