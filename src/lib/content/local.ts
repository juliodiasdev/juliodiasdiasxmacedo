import "server-only";
import site from "@content/site.json";
import categories from "@content/categories.json";
import thoughts from "@content/thoughts.json";
import memories from "@content/memories.json";
import details from "@content/details.json";
import future from "@content/future.json";
import letter from "@content/letter.json";
import mediaManifest from "@content/media.json";
import type {
  Category,
  Detail,
  ExperienceData,
  FutureFragment,
  Interlude,
  Letter,
  MediaRef,
  Memory,
  SiteSettings,
  Thought,
} from "@/lib/types";
import { normalizeSettings } from "./settings";

/* ------------------------------------------------------------------
 * As mídias reais ficam catalogadas em content/media.json (gerado por
 * `npm run media:inventory`). Os outros arquivos as referenciam por id:
 *   memories.json → "mediaId"     thoughts.json → "photoId"
 *   future.json   → "mediaId"     site.json     → interludes[].mediaId
 * Também é possível usar um objeto "media"/"photo" completo.
 * ------------------------------------------------------------------ */

interface ManifestItem {
  id: string;
  file: string;
  kind: "image" | "video";
  width: number | null;
  height: number | null;
  webSrc: string | null;
  poster: string | null;
  alt: string;
}

const catalog = new Map(
  ((mediaManifest as { items?: ManifestItem[] }).items ?? []).map((i) => [i.id, i]),
);

function resolveMedia(id: string | null | undefined, inline?: MediaRef | null): MediaRef | null {
  if (inline) return inline;
  if (!id) return null;
  const item = catalog.get(id);
  if (!item) {
    console.warn(`[conteúdo] mídia "${id}" não encontrada em content/media.json`);
    return null;
  }
  return {
    kind: item.kind,
    src: item.webSrc ?? `/media/${item.file}`,
    poster: item.poster,
    alt: item.alt,
    width: item.width,
    height: item.height,
  };
}

type WithRef<T, K extends string> = Omit<T, "media" | "photo"> & { [P in K]?: string | null } & {
  media?: MediaRef | null;
  photo?: MediaRef | null;
};

const raw = {
  thoughts: thoughts as unknown as WithRef<Thought, "photoId">[],
  memories: memories as unknown as WithRef<Memory, "mediaId">[],
  future: future as unknown as WithRef<FutureFragment, "mediaId">[],
};

function settingsWithMedia(): SiteSettings {
  type RawInterlude = Partial<Interlude> & { mediaId?: string };
  const s = site as unknown as Omit<Partial<SiteSettings>, "interludes"> & { interludes?: RawInterlude[] };
  const interludes: Interlude[] = (s.interludes ?? []).flatMap((i: RawInterlude) => {
    const media = resolveMedia(i.mediaId, i.media);
    return media && i.afterChapter ? [{ afterChapter: i.afterChapter, media, caption: i.caption ?? null }] : [];
  });
  return normalizeSettings({ ...s, interludes } as Partial<SiteSettings>);
}

/** Conteúdo lido dos arquivos em /content. Edite esses arquivos para personalizar. */
export function getLocalExperience(includeDrafts: boolean): ExperienceData {
  const visible = <T extends { status: string }>(items: T[]) =>
    includeDrafts ? items : items.filter((i) => i.status === "published");

  return {
    mode: "local",
    settings: settingsWithMedia(),
    categories: [...(categories as Category[])].sort((a, b) => a.position - b.position),
    thoughts: visible(raw.thoughts)
      .map(({ photoId, photo, ...t }) => ({ ...t, photo: resolveMedia(photoId, photo) }) as Thought)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    memories: visible(raw.memories)
      .map(({ mediaId, media, ...m }) => ({ ...m, media: resolveMedia(mediaId, media) }) as Memory)
      .sort((a, b) => a.position - b.position),
    details: visible(details as Detail[]).sort((a, b) => a.position - b.position),
    future: visible(raw.future)
      .map(({ mediaId, media, ...f }) => ({ ...f, media: resolveMedia(mediaId, media) }) as FutureFragment)
      .sort((a, b) => a.position - b.position),
    letter: letter as Letter,
  };
}

export const localDefaults = {
  settings: settingsWithMedia,
  letter: () => letter as Letter,
};
