import { Reveal } from "@/components/ui/Reveal";

interface ChapterHeaderProps {
  kicker: string;
  title: string;
  text?: string;
  tone?: "night" | "paper";
  align?: "center" | "left";
}

export function ChapterHeader({ kicker, title, text, tone = "night", align = "center" }: ChapterHeaderProps) {
  const center = align === "center";
  return (
    <header className={`mx-auto max-w-2xl ${center ? "text-center" : ""}`}>
      <Reveal>
        <p className="kicker">{kicker}</p>
      </Reveal>
      <Reveal delay={0.15}>
        <h2
          className={`mt-5 font-serif text-[2.6rem] leading-[1.05] font-light text-balance sm:text-6xl ${
            tone === "paper" ? "text-ink" : "text-ivory"
          }`}
        >
          {title}
        </h2>
      </Reveal>
      <Reveal delay={0.3}>
        <div className={`hairline mt-8 w-24 ${center ? "mx-auto" : ""}`} />
      </Reveal>
      {text && (
        <Reveal delay={0.45}>
          <p
            className={`mt-8 text-[1.05rem] leading-relaxed text-pretty ${
              tone === "paper" ? "text-ink/70" : "text-ivory/65"
            }`}
          >
            {text}
          </p>
        </Reveal>
      )}
    </header>
  );
}
