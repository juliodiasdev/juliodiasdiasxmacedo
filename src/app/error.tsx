"use client";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-night px-6 text-center">
      <p className="kicker">Um tropeço</p>
      <h1 className="mt-5 font-serif text-4xl font-light text-ivory">Algo não carregou como deveria.</h1>
      <p className="mt-4 max-w-sm text-ivory/60">Os pensamentos continuam aqui. Tente novamente em instantes.</p>
      {process.env.NODE_ENV !== "production" && <pre className="mt-6 max-w-lg text-xs whitespace-pre-wrap text-rose/80">{error.message}</pre>}
      <button
        type="button"
        onClick={reset}
        className="mt-10 rounded-full border border-gold/40 px-7 py-3 text-sm tracking-[0.16em] text-ivory uppercase hover:border-rose"
      >
        Tentar de novo
      </button>
    </div>
  );
}
