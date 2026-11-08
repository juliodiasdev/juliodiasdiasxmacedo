import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminExperience } from "@/lib/content";
import { MemoryForm } from "@/components/admin/MemoryForm";
import { ConfirmDelete } from "@/components/admin/ActionForm";
import { deleteMemory } from "../../../actions";

export default async function EditMemory({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ salvo?: string }> }) {
  const { id } = await params;
  const { salvo } = await searchParams;
  const { memories } = await getAdminExperience();
  const memory = id === "novo" ? null : memories.find((m) => m.id === id);
  if (id !== "novo" && !memory) notFound();
  const nextPosition = memories.reduce((max, m) => Math.max(max, m.position + 1), 0);

  return (
    <div>
      <Link href="/admin/memorias" className="text-sm text-ink/60 hover:text-ink">
        ← Memórias
      </Link>
      <div className="mt-3 flex items-center justify-between gap-4">
        <h1 className="font-serif text-4xl">{memory ? "Editar memória" : "Nova memória"}</h1>
        {memory && <ConfirmDelete action={deleteMemory} fields={{ id: memory.id }} />}
      </div>
      {salvo && <p className="mt-3 text-sm text-emerald-700">Salvo.</p>}
      <MemoryForm key={memory?.id ?? "novo"} memory={memory ?? null} nextPosition={nextPosition} />
    </div>
  );
}
