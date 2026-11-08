import { getAdminExperience } from "@/lib/content";
import { LetterForm } from "@/components/admin/LetterForm";

export default async function LetterPage() {
  const { letter } = await getAdminExperience();
  return (
    <div>
      <h1 className="font-serif text-4xl">A carta</h1>
      <p className="mt-2 text-sm text-ink/60">
        Escreva livremente. Cada parágrafo (separado por uma linha em branco) surge conforme ela lê.
      </p>
      <LetterForm letter={letter} />
    </div>
  );
}
