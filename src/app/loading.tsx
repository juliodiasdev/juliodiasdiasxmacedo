export default function Loading() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-night" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-6">
        <span className="block h-12 w-px animate-pulse bg-gradient-to-b from-gold/80 to-transparent" />
        <p className="font-serif text-lg italic text-ivory/60">Abrindo meus pensamentos…</p>
      </div>
    </div>
  );
}
