"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

interface ChapterOpenerProps {
  id: string;
  numeral: string;
  label: string;
  title: string;
  summary: string;
  chapters?: { href: string; name: string }[];
  imageSrc?: string;
  /** Bias crop toward faces / people (e.g. "center 28%"). */
  imageObjectPosition?: string;
}

export function ChapterOpener({
  id,
  numeral,
  label,
  title,
  summary,
  chapters = [],
  imageSrc,
  imageObjectPosition = "center center",
}: ChapterOpenerProps) {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], reduceMotion ? ["0%", "0%"] : ["-8%", "8%"]);
  const imageScale = useTransform(scrollYProgress, [0, 1], reduceMotion ? [1, 1] : [1.1, 1]);

  const reveal = {
    initial: { opacity: 0, y: reduceMotion ? 0 : 28 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.45 },
    transition: { duration: 1, ease: [0.16, 1, 0.3, 1] as const },
  };

  return (
    <section
      ref={sectionRef}
      id={id}
      data-nav-surface="dusk"
      className="relative flex min-h-[88vh] scroll-mt-20 items-end overflow-hidden bg-dusk px-6 py-20 sm:px-10 sm:py-28"
    >
      {imageSrc ? (
        <motion.div style={{ y: imageY, scale: imageScale }} className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageSrc}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-45"
            style={{ objectPosition: imageObjectPosition }}
          />
        </motion.div>
      ) : null}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(11,9,6,0.35) 0%, rgba(11,9,6,0.55) 42%, rgba(11,9,6,0.92) 100%), radial-gradient(36rem 28rem at 70% 20%, color-mix(in srgb, var(--color-light) 18%, transparent), transparent 70%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-6xl">
        <motion.p {...reveal} className="font-display text-sm tracking-[0.28em] text-light/80 uppercase">
          Chapter {numeral}
        </motion.p>
        <motion.p
          {...reveal}
          transition={{ ...reveal.transition, delay: 0.05 }}
          className="mt-4 font-hand text-2xl text-dusk-ink/70"
        >
          {label}
        </motion.p>
        <motion.h2
          {...reveal}
          transition={{ ...reveal.transition, delay: 0.1 }}
          className="mt-3 max-w-3xl font-display text-[clamp(2.6rem,7vw,5.2rem)] font-light leading-[1.05] text-dusk-ink text-wrap-balance"
        >
          {title}
        </motion.h2>
        <motion.p
          {...reveal}
          transition={{ ...reveal.transition, delay: 0.16 }}
          className="mt-8 max-w-[46ch] font-body text-[17px] leading-relaxed text-dusk-ink/72 sm:text-[18px]"
        >
          {summary}
        </motion.p>

        {chapters.length > 0 ? (
          <motion.ol
            {...reveal}
            transition={{ ...reveal.transition, delay: 0.22 }}
            className="mt-12 flex flex-wrap gap-x-8 gap-y-3 border-t border-dusk-ink/15 pt-8"
          >
            {chapters.map((chapter, index) => (
              <li key={chapter.href}>
                <a
                  href={chapter.href}
                  className="group font-display text-[13px] tracking-[0.08em] text-dusk-ink/65 uppercase transition-colors hover:text-light"
                >
                  <span className="mr-2 text-light/70">{String(index + 1).padStart(2, "0")}</span>
                  {chapter.name}
                </a>
              </li>
            ))}
          </motion.ol>
        ) : null}
      </div>
    </section>
  );
}
