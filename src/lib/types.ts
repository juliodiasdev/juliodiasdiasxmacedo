/**
 * Tipos de domínio da experiência.
 * O conteúdo pessoal vive em /content e é convertido para estes tipos antes de chegar à interface.
 */

export type ChapterId = "thoughts" | "moments" | "details" | "future" | "letter";

export const CHAPTER_LABELS: Record<ChapterId, string> = {
  thoughts: "Todas as vezes que pensei em você",
  moments: "Momentos que eu guardaria para sempre",
  details: "As pequenas coisas sobre você",
  future: "A vida que imagino com você",
  letter: "A carta",
};

export const DEFAULT_CHAPTER_ORDER: ChapterId[] = ["thoughts", "moments", "details", "future", "letter"];

export type PublishStatus = "draft" | "published";

export type MediaKind = "image" | "video";

export interface MediaRef {
  kind: MediaKind;
  /** Caminho em /public (ex.: /media/originals/foto.jpg). */
  src: string;
  /** Imagem de capa para vídeos. */
  poster?: string | null;
  /** Descrição acessível. Descreva o que se vê, sem interpretar. */
  alt: string;
  width?: number | null;
  height?: number | null;
}

export interface Category {
  id: string;
  slug: string;
  label: string;
  description?: string | null;
  position: number;
}

export interface Thought {
  id: string;
  title: string;
  body: string;
  categoryId: string | null;
  createdAt: string; // ISO
  publishedAt: string | null;
  status: PublishStatus;
  isSpecial: boolean;
  photo: MediaRef | null;
  audioSrc: string | null;
}

export type MemoryLayout = "wide" | "tall" | "square";

export interface Memory {
  id: string;
  title: string;
  /** O que aconteceu — escrito por você. */
  story: string;
  /** O que você sentiu naquele momento. */
  feeling: string;
  date: string | null; // AAAA-MM-DD
  dateLabel: string | null; // ex.: "Num domingo de março"
  location: string | null;
  media: MediaRef | null;
  audioSrc: string | null;
  layout: MemoryLayout;
  position: number;
  status: PublishStatus;
  isSpecial: boolean;
}

export interface Detail {
  id: string;
  text: string;
  note: string | null;
  position: number;
  status: PublishStatus;
}

export interface FutureFragment {
  id: string;
  title: string;
  text: string;
  media: MediaRef | null;
  position: number;
  status: PublishStatus;
}

export interface Letter {
  title: string;
  greeting: string;
  /** Texto livre. Parágrafos separados por uma linha em branco. */
  body: string;
  closing: string;
  signature: string;
  updatedAt: string | null;
}

export interface Interlude {
  /** O vídeo/fotografia aparece logo depois deste capítulo. */
  afterChapter: ChapterId;
  media: MediaRef;
  caption: string | null;
}

export interface SiteSettings {
  title: string;
  subtitle: string;
  intro: { lines: string[]; button: string };
  thoughtsIntro: { kicker: string; title: string; text: string };
  momentsIntro: { kicker: string; title: string; text: string };
  detailsIntro: { kicker: string; title: string; text: string };
  futureIntro: { kicker: string; title: string; lines: string[]; disclaimer: string };
  letterIntro: { kicker: string; title: string };
  ending: { lines: string[]; button: string };
  chapterOrder: ChapterId[];
  music: { src: string; title: string } | null;
  interludes: Interlude[];
}

export interface ExperienceData {
  settings: SiteSettings;
  categories: Category[];
  thoughts: Thought[];
  memories: Memory[];
  details: Detail[];
  future: FutureFragment[];
  letter: Letter;
}
