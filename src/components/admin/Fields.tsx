import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

const base =
  "mt-1.5 w-full rounded-md border border-ink/15 bg-white px-3.5 py-2.5 text-[0.95rem] text-ink shadow-sm outline-none transition placeholder:text-ink/35 focus:border-rose focus:ring-2 focus:ring-rose/20";

function Wrap({ label, hint, children }: { label: string; hint?: ReactNode; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink/80">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ink/50">{hint}</span>}
    </label>
  );
}

export function Input({ label, hint, ...p }: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: ReactNode }) {
  return (
    <Wrap label={label} hint={hint}>
      <input {...p} className={base} />
    </Wrap>
  );
}

export function Textarea({ label, hint, serif, ...p }: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; hint?: ReactNode; serif?: boolean }) {
  return (
    <Wrap label={label} hint={hint}>
      <textarea {...p} className={`${base} leading-relaxed ${serif ? "font-serif text-lg" : ""}`} />
    </Wrap>
  );
}

export function Select({ label, hint, children, ...p }: SelectHTMLAttributes<HTMLSelectElement> & { label: string; hint?: ReactNode }) {
  return (
    <Wrap label={label} hint={hint}>
      <select {...p} className={base}>
        {children}
      </select>
    </Wrap>
  );
}

export function Checkbox({ label, ...p }: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="flex min-h-11 items-center gap-3 text-sm text-ink/80">
      <input type="checkbox" {...p} className="size-4 accent-rose" />
      {label}
    </label>
  );
}

export function Card({ title, children, actions }: { title?: string; children: ReactNode; actions?: ReactNode }) {
  return (
    <section className="rounded-xl border border-ink/10 bg-white/70 p-5 shadow-sm sm:p-7">
      {(title || actions) && (
        <div className="mb-5 flex items-center justify-between gap-4">
          {title && <h2 className="font-serif text-2xl text-ink">{title}</h2>}
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}
