"use client";
import { saveLetter } from "@/app/admin/actions";
import type { Letter } from "@/lib/types";
import { ActionForm, SubmitButton } from "./ActionForm";
import { Card, Input, Textarea } from "./Fields";

export function LetterForm({ letter }: { letter: Letter }) {
  return (
    <ActionForm action={saveLetter} className="mt-8 space-y-6">
      <Card>
        <div className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Input label="Título" name="title" defaultValue={letter.title} />
            <Input label="Saudação" name="greeting" defaultValue={letter.greeting} placeholder="Meu amor," />
          </div>
          <Textarea label="Carta" name="body" defaultValue={letter.body} rows={22} serif />
          <Textarea
            label="Encerramento"
            name="closing"
            defaultValue={letter.closing}
            rows={3}
            serif
            hint="Sugestão: que o seu amor é uma decisão que você quer continuar tomando todos os dias."
          />
          <Input label="Assinatura" name="signature" defaultValue={letter.signature} />
        </div>
      </Card>
      <div className="sticky bottom-0 -mx-5 border-t border-ink/10 bg-ivory/95 px-5 py-4 backdrop-blur">
        <SubmitButton>Salvar carta</SubmitButton>
      </div>
    </ActionForm>
  );
}
