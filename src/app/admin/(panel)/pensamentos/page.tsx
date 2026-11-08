import Link from "next/link";
import { Star } from "lucide-react";
import { getAdminExperience } from "@/lib/content";
import { formatDate } from "@/components/ui/format";

export default async function ThoughtsList() {
  const { thoughts, categories } = await getAdminExperience();
  const cat = new Map(categories.map((c) => [c.id, c.label]));
  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-serif text-4xl">Pensamentos</h1>
        <Link href="/admin/pensamentos/novo" className="inline-flex min-h-11 items-center rounded-full bg-night px-5 text-sm text-ivory">
          Novo
        </Link>
      </div>
      {thoughts.length === 0 ? (
        <p className="mt-10 text-ink/60">Nenhum pensamento ainda. Que tal escrever o primeiro?</p>
      ) : (
        <ul className="mt-8 divide-y divide-ink/10 rounded-xl border border-ink/10 bg-white/70">
          {thoughts.map((t) => (
            <li key={t.id}>
              <Link href={`/admin/pensamentos/${t.id}`} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-ink/[0.03]">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 truncate font-serif text-xl">
                    {t.isSpecial && <Star className="size-4 shrink-0 fill-rose/60 text-rose" aria-label="Especial" />}
                    {t.title}
                  </p>
                  <p className="mt-0.5 text-xs text-ink/50">
                    {formatDate(t.createdAt)} · {t.categoryId ? cat.get(t.categoryId) : "Sem categoria"}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs ${
                    t.status === "published" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {t.status === "published" ? "Publicado" : "Rascunho"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
