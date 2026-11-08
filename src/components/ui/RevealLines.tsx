"use client";
import { motion } from "motion/react";

interface RevealLinesProps {
  lines: string[];
  className?: string;
  lineClassName?: (index: number, total: number) => string;
  /** Intervalo entre as frases, em segundos. */
  stagger?: number;
  delay?: number;
  /** Anima ao montar (true) ou quando entra na tela (false). */
  onMount?: boolean;
  onComplete?: () => void;
}

/** Frases que surgem uma a uma, como pensamentos chegando. */
export function RevealLines({
  lines,
  className,
  lineClassName,
  stagger = 1.6,
  delay = 0.4,
  onMount = false,
  onComplete,
}: RevealLinesProps) {
  const trigger = onMount ? { animate: "show" } : { whileInView: "show", viewport: { once: true, margin: "-10%" } };
  return (
    <motion.div className={className} initial="hidden" {...trigger}>
      {lines.map((line, i) => (
        <motion.p
          key={`${i}-${line}`}
          className={lineClassName?.(i, lines.length)}
          variants={{
            hidden: { opacity: 0, y: 14, filter: "blur(6px)" },
            show: {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              transition: { duration: 1.4, delay: delay + i * stagger, ease: [0.22, 1, 0.36, 1] },
            },
          }}
          onAnimationComplete={i === lines.length - 1 ? onComplete : undefined}
        >
          {line}
        </motion.p>
      ))}
    </motion.div>
  );
}
