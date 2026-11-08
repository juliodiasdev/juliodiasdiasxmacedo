import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-night px-6 text-center">
      <p className="kicker">Página não encontrada</p>
      <h1 className="mt-5 font-serif text-4xl font-light text-ivory">Este pensamento ainda não foi escrito.</h1>
      <Link href="/" className="mt-10 rounded-full border border-gold/40 px-7 py-3 text-sm tracking-[0.16em] text-ivory uppercase hover:border-rose">
        Voltar ao começo
      </Link>
    </div>
  );
}
