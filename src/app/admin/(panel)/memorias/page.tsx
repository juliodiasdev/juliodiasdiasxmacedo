import Link from "next/link";
import { getAdminExperience } from "@/lib/content";
import { memoryDate } from "@/components/ui/format";

export default async function MemoriesList() {
  const { memories } = await getAdminExperience();
  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-serif text-4xl">Memórias</h1>
        <Link href="/admin/memorias/novo" className="inline-flex min-h-11 items-center rounded-full bg-night px-5 text-sm text-ivory">
          Nova
        </Link>
      </div>
      <p className="mt-2 text-sm text-ink/60">A ordem segue o campo “posição” (menor primeiro).</p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {memories.map((m) => (
          <li key={m.id}>
            <Link href={`/admin/memorias/${m.id}`} className="block rounded-xl border border-ink/10 bg-white/70 p-5 hover:border-rose">
              <p className="text-xs text-ink/50">
                #{m.position} · {m.media ? (m.media.kind === "video" ? "Vídeo" : "Foto") : "Sem mídia"}
                {memoryDate(m) ? ` · ${memoryDate(m)}` : ""} · {m.status === "published" ? "Publicada" : "Rascunho"}
              </p>
              <p className="mt-1 font-serif text-xl">{m.title}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
