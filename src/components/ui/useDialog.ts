"use client";
import { useEffect, useRef } from "react";

/** Comportamento acessível de diálogo: Esc fecha, foco preso e restaurado, rolagem travada. */
export function useDialog(open: boolean, onClose: () => void, keys?: { left?: () => void; right?: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const keysRef = useRef(keys);
  const closeRef = useRef(onClose);

  useEffect(() => {
    keysRef.current = keys;
    closeRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => ref.current?.focus(), 30);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeRef.current();
      else if (e.key === "ArrowLeft") keysRef.current?.left?.();
      else if (e.key === "ArrowRight") keysRef.current?.right?.();
      else if (e.key === "Tab" && ref.current) {
        const f = ref.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input, select, textarea, video[controls], [tabindex]:not([tabindex="-1"])',
        );
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      previous?.focus?.();
    };
  }, [open]);

  return ref;
}
