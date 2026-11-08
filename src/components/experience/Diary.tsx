"use client";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AudioLines, ImageIcon, Star } from "lucide-react";
import { formatDate } from "@/components/ui/format";
import type { Category, SiteSettings, Thought } from "@/lib/types";
import { ChapterHeader } from "./ChapterHeader";
import { ThoughtSheet } from "./ThoughtSheet";

export type DiaryFilter = "all" | "new" | "special" | `cat:${string}`;

interface DiaryProps {
  settings: SiteSettings;
  thoughts: Thought[];
  categories: Category[];
  newIds: Set<string>;
  filter: DiaryFilter;
  onFilter: (f: DiaryFilter) => void;
}

/** Capítulo 2 — o diário de pensamentos. */
export function Diary({ settings, thoughts, categories, newIds, filter, onFilter }: DiaryProps) {
  const [openId, setOpenId] = useState<string | null>(null);
  const catById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);

  const visible = useMemo(() => {
    if (filter === "all") return thoughts;
    if (filter === "new") return thoughts.filter((t) => newIds.has(t.id));
    if (filter === "special") return thoughts.filter((t) => t.isSpecial);
    const id = filter.slice(4);
    return thoughts.filter((t) => t.categoryId === id);
  }, [filter, thoughts, newIds]);

  const usedCats = categories.filter((c) => thoughts.some((t) => t.categoryId === c.id));
  const chips: { id: DiaryFilter; label: string }[] = [
    { id: "all", label: "Todos" },
    ...(newIds.size ? [{ id: "new" as const, label: `Novos · ${newIds.size}` }] : []),
    ...(thoughts.some((t) => t.isSpecial) ? [{ id: "special" as const, label: "Especiais" }] : []),
    ...usedCats.map((c) => ({ id: `cat:${c.id}` as DiaryFilter, label: c.label })),
  ];

  const openIndex = openId ? visible.findIndex((t) => t.id === openId) : -1;

  return (
    <div className="px-5 py-28 sm:py-40">
      <ChapterHeader {...settings.thoughtsIntro} />

      {thoughts.length === 0 ? (
        <p className="mt-20 text-center font-serif text-xl italic text-ivory/50">
          Os primeiros pensamentos ainda estão sendo escritos.
        </p>
      ) : (
        <>
          {/* Filtros: rolagem horizontal no celular, sem quebrar a tela */}
          <nav aria-label="Filtrar pensamentos" className="mx-auto mt-16 max-w-4xl">
            <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-2 [scrollbar-width:none] sm:flex-wrap sm:justify-center">
              {chips.map((c) => {
                const active = filter === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => onFilter(c.id)}
                    aria-pressed={active}
                    className={`shrink-0 rounded-full border px-4 py-2.5 text-[0.82rem] transition duration-500 ${
                      active
                        ? "border-rose bg-rose/15 text-ivory"
                        : "border-ivory/12 text-ivory/60 hover:border-ivory/30 hover:text-ivory"
                    }`}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>
          </nav>

          <ol className="relative mx-auto mt-14 max-w-4xl">
            <span aria-hidden className="absolute top-2 bottom-2 left-[7px] w-px bg-gradient-to-b from-gold/0 via-gold/30 to-gold/0 md:left-1/2" />
            <AnimatePresence mode="popLayout" initial={false}>
              {visible.map((t, i) => (
                <motion.li
                  key={t.id}
                  layout
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  viewport={{ once: true, margin: "-8%" }}
                  transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                  className={`relative mb-10 pl-9 md:w-1/2 md:pl-0 ${
                    i % 2 === 0 ? "md:pr-14" : "md:ml-auto md:pl-14"
                  }`}
                >
                  <span
                    aria-hidden
                    className={`absolute top-7 left-0 size-[15px] rounded-full border bg-night ${
                      t.isSpecial ? "border-rose" : "border-gold/50"
                    } ${i % 2 === 0 ? "md:right-[-7.5px] md:left-auto" : "md:left-[-7.5px]"}`}
                  >
                    <span className={`absolute inset-[4px] rounded-full ${t.isSpecial ? "bg-rose" : "bg-gold/40"}`} />
                  </span>
                  <ThoughtCard
                    thought={t}
                    category={t.categoryId ? catById.get(t.categoryId)?.label : undefined}
                    isNew={newIds.has(t.id)}
                    onOpen={() => setOpenId(t.id)}
                  />
                </motion.li>
              ))}
            </AnimatePresence>
          </ol>
          {visible.length === 0 && (
            <p className="text-center text-ivory/50">Nenhum pensamento neste filtro ainda.</p>
          )}
        </>
      )}

      <ThoughtSheet
        thought={openIndex >= 0 ? visible[openIndex] : null}
        category={openIndex >= 0 ? catById.get(visible[openIndex].categoryId ?? "")?.label : undefined}
        onClose={() => setOpenId(null)}
        onPrev={openIndex > 0 ? () => setOpenId(visible[openIndex - 1].id) : undefined}
        onNext={openIndex >= 0 && openIndex < visible.length - 1 ? () => setOpenId(visible[openIndex + 1].id) : undefined}
      />
    </div>
  );
}

function ThoughtCard({
  thought,
  category,
  isNew,
  onOpen,
}: {
  thought: Thought;
  category?: string;
  isNew: boolean;
  onOpen: () => void;
}) {
  const excerpt = thought.body.split(/\n/)[0];
  return (
    <motion.button
      type="button"
      onClick={onOpen}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.985 }}
      transition={{ type: "spring", stiffness: 300, damping: 26 }}
      className={`group block w-full rounded-[2px] border p-6 text-left transition-colors duration-700 sm:p-8 ${
        thought.isSpecial
          ? "border-rose/35 bg-gradient-to-br from-rose/[0.09] to-transparent hover:border-rose/60"
          : "border-ivory/10 bg-night-2/60 hover:border-gold/35"
      }`}
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.72rem] tracking-[0.12em] text-gold/80 uppercase">
        <time dateTime={thought.createdAt}>{formatDate(thought.createdAt)}</time>
        {isNew && <span className="rounded-full bg-rose/20 px-2 py-0.5 text-[0.65rem] text-rose">novo</span>}
        {thought.status === "draft" && (
          <span className="rounded-full border border-ivory/20 px-2 py-0.5 text-[0.65rem] text-ivory/60">rascunho</span>
        )}
      </div>
      <h3 className="mt-4 font-serif text-[1.9rem] leading-tight font-normal text-ivory transition group-hover:text-ivory">
        {thought.title}
      </h3>
      <p className="mt-3 line-clamp-3 leading-relaxed text-ivory/60">{excerpt}</p>
      <div className="mt-6 flex items-center justify-between gap-3">
        {category ? <span className="font-serif text-[0.98rem] italic text-rose/90">{category}</span> : <span />}
        <span className="flex items-center gap-3 text-ivory/40">
          {thought.isSpecial && <Star aria-label="Pensamento especial" className="size-3.5 fill-rose/60 text-rose" strokeWidth={1.2} />}
          {thought.photo && <ImageIcon aria-label="Com fotografia" className="size-3.5" strokeWidth={1.4} />}
          {thought.audioSrc && <AudioLines aria-label="Com áudio" className="size-3.5" strokeWidth={1.4} />}
        </span>
      </div>
    </motion.button>
  );
}
