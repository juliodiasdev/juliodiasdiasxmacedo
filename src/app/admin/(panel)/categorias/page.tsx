import { getAdminExperience } from "@/lib/content";
import { CategoryEditor } from "@/components/admin/ListEditors";

export default async function Categories() {
  const { categories } = await getAdminExperience();
  const next = categories.reduce((m, c) => Math.max(m, c.position + 1), 0);
  return (
    <div className="space-y-4">
      <h1 className="font-serif text-4xl">Categorias</h1>
      <p className="text-sm text-ink/60">Aparecem como filtros no diário (apenas as que têm pensamentos publicados).</p>
      {categories.map((c) => (
        <CategoryEditor key={c.id} item={c} />
      ))}
      <h2 className="pt-6 font-serif text-2xl">Nova categoria</h2>
      <CategoryEditor nextPosition={next} />
    </div>
  );
}
