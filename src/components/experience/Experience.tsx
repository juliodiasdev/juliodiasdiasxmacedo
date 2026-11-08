"use client";
import { Fragment, useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { Grain } from "@/components/ui/Grain";
import { CHAPTER_LABELS, type ChapterId, type ExperienceData } from "@/lib/types";
import { Diary, type DiaryFilter } from "./Diary";
import { Ending } from "./Ending";
import { Future } from "./Future";
import { Interlude } from "./Interlude";
import { LetterSection } from "./LetterSection";
import { LittleThings } from "./LittleThings";
import { Moments } from "./Moments";
import { MusicPlayer, type MusicHandle } from "./MusicPlayer";
import { Progress, type ChapterLink } from "./Progress";
import { Threshold } from "./Threshold";

const SECTION_ID: Record<ChapterId, string> = {
  thoughts: "pensamentos",
  moments: "momentos",
  details: "pequenas-coisas",
  future: "futuro",
  letter: "carta",
};

const LAST_VISIT_KEY = "tvqp:last-visit";

/** Data da visita anterior, lida uma única vez por carregamento (antes de ser atualizada). */
let previousVisit: number | null | undefined;
function readPreviousVisit(): number | null {
  if (previousVisit === undefined) {
    try {
      const v = window.localStorage.getItem(LAST_VISIT_KEY);
      previousVisit = v ? Number(v) : null;
    } catch {
      previousVisit = null;
    }
  }
  return previousVisit;
}
const noopSubscribe = () => () => {};

export function Experience({ data }: { data: ExperienceData }) {
  const { settings } = data;
  const [entered, setEntered] = useState(false);
  const [filter, setFilter] = useState<DiaryFilter>("all");
  const music = useRef<MusicHandle>(null);

  // Pensamentos publicados desde a última visita (guardado apenas neste aparelho).
  const lastVisit = useSyncExternalStore(noopSubscribe, readPreviousVisit, () => null);
  const newIds = useMemo(() => {
    if (!lastVisit) return new Set<string>();
    return new Set(
      data.thoughts.filter((t) => new Date(t.publishedAt ?? t.createdAt).getTime() > lastVisit).map((t) => t.id),
    );
  }, [data.thoughts, lastVisit]);

  useEffect(() => {
    readPreviousVisit();
    try {
      window.localStorage.setItem(LAST_VISIT_KEY, String(Date.now()));
    } catch {
      /* navegação privada: sem memória de visita */
    }
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = entered ? "" : "hidden";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [entered]);

  const enter = useCallback((withMusic: boolean) => {
    window.scrollTo({ top: 0 });
    setEntered(true);
    if (withMusic) music.current?.start();
  }, []);

  const chapters: ChapterLink[] = useMemo(
    () => [
      ...settings.chapterOrder.map((c) => ({ id: SECTION_ID[c], label: CHAPTER_LABELS[c] })),
      { id: "fim", label: "Isso não termina aqui" },
    ],
    [settings.chapterOrder],
  );

  const returnToDiary = () => {
    setFilter(newIds.size ? "new" : "all");
    document.getElementById(SECTION_ID.thoughts)?.scrollIntoView({ behavior: "smooth" });
  };

  const restart = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    window.setTimeout(() => setEntered(false), 900);
  };

  const renderChapter = (c: ChapterId) => {
    switch (c) {
      case "thoughts":
        return (
          <Diary
            settings={settings}
            thoughts={data.thoughts}
            categories={data.categories}
            newIds={newIds}
            filter={filter}
            onFilter={setFilter}
          />
        );
      case "moments":
        return <Moments settings={settings} memories={data.memories} />;
      case "details":
        return <LittleThings settings={settings} details={data.details} />;
      case "future":
        return <Future settings={settings} fragments={data.future} />;
      case "letter":
        return <LetterSection settings={settings} letter={data.letter} />;
    }
  };

  return (
    <MotionConfig reducedMotion="user">
      <Grain />

      <AnimatePresence>
        {!entered && <Threshold settings={settings} hasMusic={Boolean(settings.music)} onEnter={enter} />}
      </AnimatePresence>

      {settings.music && <MusicPlayer ref={music} src={settings.music.src} title={settings.music.title} visible={entered} />}

      <motion.main
        aria-hidden={!entered}
        inert={!entered}
        initial={false}
        animate={{ opacity: entered ? 1 : 0 }}
        transition={{ duration: 1.8, delay: entered ? 0.6 : 0, ease: [0.22, 1, 0.36, 1] }}
      >
        {entered && <Progress chapters={chapters} />}

        <header className="flex min-h-[90dvh] flex-col items-center justify-center px-6 text-center">
          <p className="kicker">Um diário para você</p>
          <h1 className="mt-6 max-w-3xl font-serif text-[3.1rem] leading-[1.02] font-light text-balance text-ivory sm:text-7xl">
            {settings.title}
          </h1>
          <div className="hairline mx-auto mt-10 w-28" />
          <p className="mx-auto mt-10 max-w-md font-serif text-xl leading-relaxed italic text-ivory/65">{settings.subtitle}</p>
          <motion.span
            aria-hidden
            className="mt-20 block h-14 w-px bg-gradient-to-b from-gold/70 to-transparent"
            animate={{ scaleY: [0.3, 1, 0.3], originY: 0 }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
        </header>

        {settings.chapterOrder.map((c) => (
          <Fragment key={c}>
            <section id={SECTION_ID[c]} aria-label={CHAPTER_LABELS[c]} className="scroll-mt-4">
              {renderChapter(c)}
            </section>
            {settings.interludes
              .filter((i) => i.afterChapter === c)
              .map((i, k) => (
                <Interlude key={`${c}-${k}`} interlude={i} />
              ))}
          </Fragment>
        ))}

        <section id="fim" aria-label="Isso não termina aqui">
          <Ending settings={settings} newCount={newIds.size} onReturn={returnToDiary} onRestart={restart} />
        </section>
      </motion.main>
    </MotionConfig>
  );
}
