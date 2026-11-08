"use client";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Music, Volume2, VolumeX } from "lucide-react";

export interface MusicHandle {
  start: () => void;
}

interface MusicPlayerProps {
  src: string;
  title: string;
  visible: boolean;
}

/**
 * Trilha instrumental opcional. Só toca após um gesto do usuário (clique em "entrar"
 * com a música ativada, ou no próprio controle).
 */
export const MusicPlayer = forwardRef<MusicHandle, MusicPlayerProps>(function MusicPlayer(
  { src, title, visible },
  ref,
) {
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [open, setOpen] = useState(false);

  const fadeTo = (target: number, ms = 1600) => {
    const el = audio.current;
    if (!el) return;
    const from = el.volume;
    const t0 = performance.now();
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / ms);
      el.volume = from + (target - from) * k;
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const play = async () => {
    const el = audio.current;
    if (!el) return;
    el.volume = 0;
    try {
      await el.play();
      fadeTo(volume);
    } catch {
      setPlaying(false);
    }
  };

  useImperativeHandle(ref, () => ({ start: () => void play() }));

  useEffect(() => {
    if (audio.current && playing) audio.current.volume = volume;
  }, [volume, playing]);

  useEffect(() => {
    if (audio.current) audio.current.muted = muted;
  }, [muted]);

  return (
    <>
      <audio
        ref={audio}
        src={src}
        loop
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-4 z-50 flex items-center gap-2"
          >
            <button
              type="button"
              onClick={() => (playing ? audio.current?.pause() : play())}
              aria-label={playing ? `Pausar música: ${title}` : `Tocar música: ${title}`}
              aria-pressed={playing}
              className="flex size-12 items-center justify-center rounded-full border border-ivory/15 bg-night/80 text-ivory backdrop-blur-md transition active:scale-95"
            >
              <Music className={`size-4 ${playing ? "text-rose" : "opacity-70"}`} strokeWidth={1.5} />
            </button>
            {playing && (
              <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                aria-label="Ajustar volume"
                aria-expanded={open}
                className="flex size-12 items-center justify-center rounded-full border border-ivory/15 bg-night/80 text-ivory backdrop-blur-md"
              >
                {muted ? <VolumeX className="size-4" strokeWidth={1.5} /> : <Volume2 className="size-4" strokeWidth={1.5} />}
              </button>
            )}
            <AnimatePresence>
              {open && playing && (
                <motion.div
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  className="flex h-12 items-center gap-3 rounded-full border border-ivory/15 bg-night/85 px-4 backdrop-blur-md"
                >
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={muted ? 0 : volume}
                    onChange={(e) => {
                      setMuted(false);
                      setVolume(Number(e.target.value));
                    }}
                    aria-label="Volume"
                    className="w-28 accent-rose"
                  />
                  <button
                    type="button"
                    onClick={() => setMuted((m) => !m)}
                    className="text-xs tracking-wide text-ivory/70"
                  >
                    {muted ? "Ativar som" : "Silenciar"}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});
