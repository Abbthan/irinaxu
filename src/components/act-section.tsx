"use client";

import { motion, useReducedMotion } from "framer-motion";
import { PhotoPlaceholder } from "./photo-placeholder";
import { cn } from "@/lib/cn";

interface ActSectionProps {
  id?: string;
  numeral: string;
  label: string;
  title: string;
  paragraphs: string[];
  photoCaption: string;
  imageSide?: "left" | "right";
}

export function ActSection({
  id,
  numeral,
  label,
  title,
  paragraphs,
  photoCaption,
  imageSide = "right",
}: ActSectionProps) {
  const reduceMotion = useReducedMotion();
  const reveal = {
    initial: { opacity: 0, y: reduceMotion ? 0 : 22 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.35 },
    transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] as const },
  };

  return (
    <section
      id={id}
      className="mx-auto flex max-w-5xl scroll-mt-24 flex-col gap-10 px-6 py-28 sm:px-10 sm:py-36 lg:flex-row lg:items-center lg:gap-16"
    >
      <motion.div
        {...reveal}
        className={cn(
          "flex justify-center lg:w-[38%] lg:flex-none",
          imageSide === "left" ? "lg:order-1" : "lg:order-2",
        )}
      >
        <PhotoPlaceholder caption={photoCaption} />
      </motion.div>

      <motion.div
        {...reveal}
        transition={{ ...reveal.transition, delay: 0.1 }}
        className={cn("lg:w-[62%] lg:flex-none", imageSide === "left" ? "lg:order-2" : "lg:order-1")}
      >
        <div className="mb-5 flex items-baseline gap-3">
          <span className="font-display text-sm text-ember">{numeral}</span>
          <span className="font-hand text-xl text-ink-soft">{label}</span>
        </div>
        <h2 className="font-display text-[clamp(1.7rem,3.4vw,2.5rem)] font-normal text-ink text-wrap-balance">
          {title}
        </h2>
        <div className="mt-6 max-w-[62ch] space-y-5">
          {paragraphs.map((paragraph) => (
            <p key={paragraph} className="font-body text-[17px] leading-[1.75] text-ink/85 sm:text-[18px]">
              {paragraph}
            </p>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
