import Link from "next/link";
import { Eye, LogOut } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { signOut } from "../actions";

const NAV = [
  { href: "/admin", label: "Início" },
  { href: "/admin/pensamentos", label: "Pensamentos" },
  { href: "/admin/memorias", label: "Memórias" },
  { href: "/admin/categorias", label: "Categorias" },
  { href: "/admin/detalhes", label: "Pequenas coisas" },
  { href: "/admin/futuro", label: "Futuro" },
  { href: "/admin/carta", label: "Carta" },
  { href: "/admin/textos", label: "Textos e capítulos" },
];

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireAdmin();
  return (
    <>
      <header className="sticky top-0 z-20 border-b border-ink/10 bg-ivory/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-3">
          <Link href="/admin" className="font-serif text-xl">
            Painel
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/preview"
              className="inline-flex min-h-10 items-center gap-2 rounded-full border border-ink/15 px-4 text-sm hover:border-ink/40"
            >
              <Eye className="size-4" /> Ver como ela verá
            </Link>
            <form action={signOut}>
              <button aria-label={`Sair (${user.email})`} className="flex size-10 items-center justify-center rounded-full hover:bg-ink/5">
                <LogOut className="size-4" />
              </button>
            </form>
          </div>
        </div>
        <nav aria-label="Seções do painel" className="mx-auto max-w-5xl overflow-x-auto px-5 [scrollbar-width:none]">
          <ul className="flex gap-1 pb-2">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="block rounded-full px-3 py-2 text-sm whitespace-nowrap text-ink/70 hover:bg-ink/5 hover:text-ink">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-5 py-10">{children}</main>
    </>
  );
}
