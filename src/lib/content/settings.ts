import site from "@content/site.json";
import { DEFAULT_CHAPTER_ORDER, type ChapterId, type SiteSettings } from "@/lib/types";

const base = site as unknown as SiteSettings;

/** Mescla configurações parciais (ex.: vindas do banco) com os textos padrão de /content/site.json. */
export function normalizeSettings(partial: Partial<SiteSettings> | null | undefined): SiteSettings {
  const p = partial ?? {};
  const merged: SiteSettings = {
    ...base,
    ...p,
    intro: { ...base.intro, ...p.intro },
    thoughtsIntro: { ...base.thoughtsIntro, ...p.thoughtsIntro },
    momentsIntro: { ...base.momentsIntro, ...p.momentsIntro },
    detailsIntro: { ...base.detailsIntro, ...p.detailsIntro },
    futureIntro: { ...base.futureIntro, ...p.futureIntro },
    letterIntro: { ...base.letterIntro, ...p.letterIntro },
    ending: { ...base.ending, ...p.ending },
    music: p.music === undefined ? base.music : p.music,
    interludes: p.interludes ?? base.interludes ?? [],
  };
  merged.chapterOrder = sanitizeOrder(p.chapterOrder ?? base.chapterOrder);
  return merged;
}

export function sanitizeOrder(order: readonly string[] | undefined): ChapterId[] {
  const valid = (order ?? []).filter((c): c is ChapterId =>
    (DEFAULT_CHAPTER_ORDER as string[]).includes(c),
  );
  const unique = [...new Set(valid)];
  for (const c of DEFAULT_CHAPTER_ORDER) if (!unique.includes(c)) unique.push(c);
  return unique;
}
