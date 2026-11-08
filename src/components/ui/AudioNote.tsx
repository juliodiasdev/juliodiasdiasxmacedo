"use client";
import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";

interface AudioNoteProps {
  src: string;
  label?: string;
  tone?: "light" | "dark";
}

function fmt(s: number) {
  if (!Number.isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m}:${r.toString().padStart(2, "0")}`;
}

/** Player de áudio pessoal, discreto e acessível. Nunca toca sozinho. */
export function AudioNote({ src, label = "Ouvir minha voz", tone = "light" }: AudioNoteProps) {
  const ref = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState(false);

  useEffect(() => {
    const el = ref.current;
    return () => el?.pause();
  }, []);

  const toggle = async () => {
    const el = ref.current;
    if (!el) return;
    if (el.paused) {
      try {
        await el.play();
      } catch {
        setError(true);
      }
    } else el.pause();
  };

  const colors =
    tone === "light"
      ? "border-ink/15 text-ink bg-ink/[0.03]"
      : "border-ivory/15 text-ivory bg-ivory/[0.04]";
  const bar = tone === "light" ? "bg-ink/15" : "bg-ivory/15";

  return (
    <div className={`flex items-center gap-4 rounded-full border px-4 py-3 ${colors}`}>
      <audio
        ref={ref}
        src={src}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onError={() => setError(true)}
      />
      <button
        type="button"
        onClick={toggle}
        disabled={error}
        aria-label={playing ? "Pausar áudio" : label}
        className="flex size-11 shrink-0 items-center justify-center rounded-full bg-rose text-ivory transition hover:brightness-110 active:scale-95 disabled:opacity-40"
      >
        {playing ? <Pause className="size-4" /> : <Play className="size-4 translate-x-px" />}
      </button>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm">{error ? "Não foi possível carregar o áudio" : label}</p>
        <div className="mt-2 flex items-center gap-3">
          <div className={`relative h-[3px] flex-1 overflow-hidden rounded-full ${bar}`}>
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-rose"
              style={{ width: duration ? `${(time / duration) * 100}%` : "0%" }}
            />
          </div>
          <span className="text-xs tabular-nums opacity-60">
            {fmt(time)} / {fmt(duration)}
          </span>
        </div>
      </div>
    </div>
  );
}
