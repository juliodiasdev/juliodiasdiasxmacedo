"use client";
import { signIn } from "@/app/admin/actions";
import { ActionForm, SubmitButton } from "./ActionForm";
import { Input } from "./Fields";

export function LoginForm({ next }: { next: string }) {
  return (
    <ActionForm action={signIn} className="mt-8 space-y-4">
      <input type="hidden" name="next" value={next} />
      <Input label="E-mail" name="email" type="email" autoComplete="email" required />
      <Input label="Senha" name="password" type="password" autoComplete="current-password" required />
      <div className="pt-2">
        <SubmitButton>Entrar</SubmitButton>
      </div>
    </ActionForm>
  );
}
