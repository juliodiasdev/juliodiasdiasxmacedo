const dateFmt = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "long", year: "numeric", timeZone: "America/Sao_Paulo" });
const shortFmt = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", timeZone: "America/Sao_Paulo" });

export const formatDate = (iso: string) => dateFmt.format(new Date(iso));
export const formatShort = (iso: string) => shortFmt.format(new Date(iso)).replace(".", "");

/** Data simples (AAAA-MM-DD) sem deslocamento de fuso. */
export const formatPlainDate = (d: string) => dateFmt.format(new Date(`${d}T12:00:00-03:00`));

export const paragraphs = (text: string) =>
  text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

export const memoryDate = (m: { dateLabel: string | null; date: string | null }) =>
  m.dateLabel || (m.date ? formatPlainDate(m.date) : null);
