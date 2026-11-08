import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminExperience } from "@/lib/content";
import { ThoughtForm } from "@/components/admin/ThoughtForm";
import { ConfirmDelete } from "@/components/admin/ActionForm";
import { deleteThought } from "../../../actions";

export default async function EditThought({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ salvo?: string }> }) {
  const { id } = await params;
  const { salvo } = await searchParams;
  const { thoughts, categories } = await getAdminExperience();
  const thought = id === "novo" ? null : thoughts.find((t) => t.id === id);
  if (id !== "novo" && !thought) notFound();

  return (
    <div>
      <Link href="/admin/pensamentos" className="text-sm text-ink/60 hover:text-ink">
        ← Pensamentos
      </Link>
      <div className="mt-3 flex items-center justify-between gap-4">
        <h1 className="font-serif text-4xl">{thought ? "Editar pensamento" : "Novo pensamento"}</h1>
        {thought && <ConfirmDelete action={deleteThought} fields={{ id: thought.id }} />}
      </div>
      {salvo && <p className="mt-3 text-sm text-emerald-700">Salvo.</p>}
      <ThoughtForm key={thought?.id ?? "novo"} thought={thought ?? null} categories={categories} />
    </div>
  );
}
