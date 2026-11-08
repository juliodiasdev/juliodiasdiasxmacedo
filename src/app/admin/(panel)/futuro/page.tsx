import { getAdminExperience } from "@/lib/content";
import { FutureEditor } from "@/components/admin/ListEditors";

export default async function FuturePage() {
  const { future } = await getAdminExperience();
  const next = future.reduce((m, f) => Math.max(m, f.position + 1), 0);
  return (
    <div className="space-y-4">
      <h1 className="font-serif text-4xl">A vida que imagino com você</h1>
      <p className="text-sm text-ink/60">
        Escreva como sonho ou plano, nunca como algo que já aconteceu. Cada fragmento aparece com a marca “um dia, talvez”.
      </p>
      {future.map((f) => (
        <FutureEditor key={f.id} item={f} />
      ))}
      <h2 className="pt-6 font-serif text-2xl">Novo fragmento</h2>
      <FutureEditor nextPosition={next} />
    </div>
  );
}
