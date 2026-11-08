import { getAdminExperience } from "@/lib/content";
import { DetailEditor } from "@/components/admin/ListEditors";

export default async function Details() {
  const { details } = await getAdminExperience();
  const next = details.reduce((m, d) => Math.max(m, d.position + 1), 0);
  return (
    <div className="space-y-4">
      <h1 className="font-serif text-4xl">As pequenas coisas sobre você</h1>
      <p className="text-sm text-ink/60">Cada item vira um bilhete que ela abre, um de cada vez, na ordem da posição.</p>
      {details.map((d) => (
        <DetailEditor key={d.id} item={d} />
      ))}
      <h2 className="pt-6 font-serif text-2xl">Novo bilhete</h2>
      <DetailEditor nextPosition={next} />
    </div>
  );
}
