import Link from "next/link";
import { getAdminExperience } from "@/lib/content";
import { Card } from "@/components/admin/Fields";

export default async function Dashboard() {
  const d = await getAdminExperience();
  const drafts = d.thoughts.filter((t) => t.status === "draft").length + d.memories.filter((m) => m.status === "draft").length;
  const stats = [
    { label: "Pensamentos", value: d.thoughts.length, href: "/admin/pensamentos" },
    { label: "Memórias", value: d.memories.length, href: "/admin/memorias" },
    { label: "Pequenas coisas", value: d.details.length, href: "/admin/detalhes" },
    { label: "Sonhos de futuro", value: d.future.length, href: "/admin/futuro" },
  ];
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-4xl">Olá.</h1>
        <p className="mt-2 text-ink/60">
          {drafts ? `${drafts} rascunho(s) aguardando publicação.` : "Tudo o que você escreveu está publicado."}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.href} href={s.href} className="rounded-xl border border-ink/10 bg-white/70 p-5 transition hover:border-rose">
            <p className="font-serif text-4xl">{s.value}</p>
            <p className="mt-1 text-sm text-ink/60">{s.label}</p>
          </Link>
        ))}
      </div>
      <Card title="Escrever agora">
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/pensamentos/novo" className="inline-flex min-h-11 items-center rounded-full bg-night px-5 text-sm text-ivory">
            Novo pensamento
          </Link>
          <Link href="/admin/memorias/novo" className="inline-flex min-h-11 items-center rounded-full border border-ink/20 px-5 text-sm">
            Nova memória
          </Link>
          <Link href="/admin/carta" className="inline-flex min-h-11 items-center rounded-full border border-ink/20 px-5 text-sm">
            Editar a carta
          </Link>
        </div>
      </Card>
    </div>
  );
}
