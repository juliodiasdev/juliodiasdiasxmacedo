import Link from "next/link";

/** Mostrado quando o Supabase não está configurado: nada é simulado. */
export function SetupNotice() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-16">
      <p className="text-xs tracking-[0.3em] text-rose uppercase">Painel administrativo</p>
      <h1 className="mt-4 font-serif text-4xl">O painel precisa do Supabase para salvar</h1>
      <p className="mt-4 leading-relaxed text-ink/70">
        O site está em <strong>modo local</strong>: o conteúdo vem dos arquivos da pasta <code>/content</code>. Para
        criar, editar e publicar pelo painel (e enviar fotos, vídeos e áudios), conecte o Supabase:
      </p>
      <ol className="mt-6 list-decimal space-y-3 pl-5 leading-relaxed text-ink/80">
        <li>Crie um projeto em supabase.com.</li>
        <li>
          No <em>SQL Editor</em>, execute <code>supabase/schema.sql</code> (e, se quiser, <code>supabase/seed.sql</code>).
        </li>
        <li>
          Em <em>Authentication → Users</em>, crie o seu usuário (e-mail e senha). Desative cadastros públicos em{" "}
          <em>Authentication → Providers → Email → Allow new users to sign up</em>.
        </li>
        <li>
          Autorize esse usuário: <code>insert into public.admins (user_id) values (&apos;SEU-USER-ID&apos;);</code>
        </li>
        <li>
          Defina <code>NEXT_PUBLIC_SUPABASE_URL</code>, <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> e{" "}
          <code>ADMIN_EMAIL</code> no <code>.env.local</code> (ou na Vercel) e reinicie.
        </li>
      </ol>
      <Link href="/" className="mt-10 inline-block text-sm text-rose underline underline-offset-4">
        Ver o site
      </Link>
    </main>
  );
}
