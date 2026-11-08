import type { Category, Detail, FutureFragment, Letter, MediaKind, MediaRef, Memory, Thought } from "@/lib/types";

/* Linhas do banco (snake_case) → tipos da interface. */

export interface ThoughtRow {
  id: string;
  title: string;
  body: string;
  category_id: string | null;
  status: "draft" | "published";
  is_special: boolean;
  photo_url: string | null;
  photo_alt: string | null;
  audio_url: string | null;
  created_at: string;
  published_at: string | null;
}

export interface MemoryRow {
  id: string;
  title: string;
  story: string;
  feeling: string;
  date: string | null;
  date_label: string | null;
  location: string | null;
  media_kind: MediaKind | null;
  media_url: string | null;
  poster_url: string | null;
  media_alt: string | null;
  audio_url: string | null;
  layout: "wide" | "tall" | "square";
  position: number;
  status: "draft" | "published";
  is_special: boolean;
}

export interface FutureRow {
  id: string;
  title: string;
  text: string;
  media_kind: MediaKind | null;
  media_url: string | null;
  poster_url: string | null;
  media_alt: string | null;
  position: number;
  status: "draft" | "published";
}

export interface LetterRow {
  title: string;
  greeting: string;
  body: string;
  closing: string;
  signature: string;
  updated_at: string | null;
}

function media(kind: MediaKind | null, url: string | null, alt: string | null, poster?: string | null): MediaRef | null {
  if (!url) return null;
  return { kind: kind ?? "image", src: url, alt: alt ?? "", poster: poster ?? null };
}

export const toThought = (r: ThoughtRow): Thought => ({
  id: r.id,
  title: r.title,
  body: r.body,
  categoryId: r.category_id,
  status: r.status,
  isSpecial: r.is_special,
  photo: media("image", r.photo_url, r.photo_alt),
  audioSrc: r.audio_url,
  createdAt: r.created_at,
  publishedAt: r.published_at,
});

export const toMemory = (r: MemoryRow): Memory => ({
  id: r.id,
  title: r.title,
  story: r.story,
  feeling: r.feeling,
  date: r.date,
  dateLabel: r.date_label,
  location: r.location,
  media: media(r.media_kind, r.media_url, r.media_alt, r.poster_url),
  audioSrc: r.audio_url,
  layout: r.layout,
  position: r.position,
  status: r.status,
  isSpecial: r.is_special,
});

export const toFuture = (r: FutureRow): FutureFragment => ({
  id: r.id,
  title: r.title,
  text: r.text,
  media: media(r.media_kind, r.media_url, r.media_alt, r.poster_url),
  position: r.position,
  status: r.status,
});

export const toDetail = (r: Detail): Detail => r;
export const toCategory = (r: Category): Category => r;

export const toLetter = (r: LetterRow | null, fallback: Letter): Letter =>
  r && (r.body || r.title)
    ? { title: r.title, greeting: r.greeting, body: r.body, closing: r.closing, signature: r.signature, updatedAt: r.updated_at }
    : fallback;
