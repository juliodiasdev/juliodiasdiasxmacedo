"use client";
import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { Check, Loader2 } from "lucide-react";
import type { ActionState } from "@/app/admin/actions";

type Action = (state: ActionState, fd: FormData) => Promise<ActionState>;

interface ActionFormProps {
  action: Action;
  children: React.ReactNode;
  className?: string;
  resetOnSuccess?: boolean;
}

/** Formulário com feedback de salvamento (sucesso/erro) vindo do servidor. */
export function ActionForm({ action, children, className, resetOnSuccess }: ActionFormProps) {
  const [state, formAction] = useActionState(action, { ok: false, message: "" });
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok && resetOnSuccess) ref.current?.reset();
  }, [state, resetOnSuccess]);

  return (
    <form ref={ref} action={formAction} className={className}>
      {children}
      {state.message && (
        <p
          role="status"
          className={`mt-4 flex items-center gap-2 text-sm ${state.ok ? "text-emerald-700" : "text-red-700"}`}
        >
          {state.ok && <Check className="size-4" />} {state.message}
        </p>
      )}
    </form>
  );
}

export function SubmitButton({
  children,
  intent,
  variant = "primary",
}: {
  children: React.ReactNode;
  intent?: string;
  variant?: "primary" | "secondary";
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      name={intent ? "intent" : undefined}
      value={intent}
      disabled={pending}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-sm transition disabled:opacity-60 ${
        variant === "primary"
          ? "bg-night text-ivory hover:bg-night-3"
          : "border border-ink/20 text-ink hover:border-ink/50"
      }`}
    >
      {pending && <Loader2 className="size-4 animate-spin" />}
      {children}
    </button>
  );
}

export function ConfirmDelete({
  action,
  fields,
  label = "Excluir",
  question = "Excluir definitivamente? Esta ação não pode ser desfeita.",
}: {
  action: (fd: FormData) => Promise<void>;
  fields: Record<string, string>;
  label?: string;
  question?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(question)) e.preventDefault();
      }}
    >
      {Object.entries(fields).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <button type="submit" className="min-h-11 px-2 text-sm text-red-700 underline-offset-4 hover:underline">
        {label}
      </button>
    </form>
  );
}
