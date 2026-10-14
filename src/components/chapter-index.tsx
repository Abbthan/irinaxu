"use client";

import { motion, useReducedMotion } from "framer-motion";
import { activities, actIntros } from "@/content/activities";

const chapters = [
  {
    id: "act-i",
    numeral: actIntros.I.numeral,
    label: actIntros.I.label,
    title: actIntros.I.title,
    items: activities.filter((a) => a.act === "I"),
  },
  {
    id: "act-ii",
    numeral: actIntros.II.numeral,
    label: actIntros.II.label,
    title: actIntros.II.title,
    items: activities.filter((a) => a.act === "II"),
  },
  {
    id: "act-iii",
    numeral: actIntros.III.numeral,
    label: actIntros.III.label,
    title: actIntros.III.title,
    items: activities.filter((a) => a.act === "III"),
  },
] as const;

export function ChapterIndex() {
  const reduceMotion = useReducedMotion();
  const reveal = {
    initial: { opacity: 0, y: reduceMotion ? 0 : 18 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.25 },
    transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1] as const },
  };

  return (
    <section id="chapters" className="scroll-mt-24 border-b border-ink/8 bg-paper px-6 py-24 sm:px-10 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <motion.div {...reveal} className="mb-16 max-w-2xl">
          <p className="font-hand text-xl text-ember">The story in chapters</p>
          <h2 className="mt-3 font-display text-[clamp(2rem,4vw,3rem)] font-light text-ink text-wrap-balance">
            Ten chapters. One continuous light.
          </h2>
          <p className="mt-4 font-body text-[17px] leading-relaxed text-ink/70">
            Read it as a book — each chapter a project, each project a movement from shadow to spectrum.
          </p>
        </motion.div>

        <div className="grid gap-12 lg:grid-cols-3 lg:gap-10">
          {chapters.map((chapter, index) => (
            <motion.div
              key={chapter.id}
              {...reveal}
              transition={{ ...reveal.transition, delay: reduceMotion ? 0 : 0.08 * index }}
              className="border-t border-ink/15 pt-8"
            >
              <a href={`#${chapter.id}`} className="group block">
                <p className="font-display text-[12px] tracking-[0.22em] text-ember uppercase">
                  Chapter {chapter.numeral}
                </p>
                <h3 className="mt-3 font-display text-2xl font-light text-ink transition-colors group-hover:text-ember">
                  {chapter.title}
                </h3>
                <p className="mt-2 font-hand text-lg text-ink-soft">{chapter.label}</p>
              </a>
              <ul className="mt-8 space-y-3">
                {chapter.items.map((item, itemIndex) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className="flex items-baseline justify-between gap-4 border-b border-ink/8 py-2 font-body text-[15px] text-ink/75 transition-colors hover:text-ember"
                    >
                      <span>
                        <span className="mr-2 font-display text-[11px] tracking-wider text-ink/40">
                          {String(itemIndex + 1).padStart(2, "0")}
                        </span>
                        {item.title}
                      </span>
                      <span className="shrink-0 font-display text-[11px] tracking-wider text-ink/35 uppercase">
                        {item.shortLabel}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
