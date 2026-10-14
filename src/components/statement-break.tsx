"use client";

import { useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { usePointerLight } from "@/hooks/use-pointer-light";

export function StatementBreak() {
  const stageRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  usePointerLight(stageRef, !reduceMotion, { x: 50, y: 48 });

  const reveal = {
    initial: { opacity: 0, y: reduceMotion ? 0 : 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.6 },
    transition: { duration: 1, ease: [0.16, 1, 0.3, 1] as const },
  };

  return (
    <section
      ref={stageRef}
      className="relative flex min-h-[70vh] items-center justify-center overflow-hidden bg-dusk-deep px-6 py-32 text-center sm:px-10"
      style={{ ["--beam-x" as string]: "50%", ["--beam-y" as string]: "48%" }}
    >
      <div className="light-beam pointer-events-none absolute inset-0 opacity-80" aria-hidden />
      <motion.p
        {...reveal}
        className="relative max-w-3xl font-display text-[clamp(2rem,5.4vw,3.8rem)] font-light leading-[1.15] text-dusk-ink text-wrap-balance"
      >
        True leadership isn&rsquo;t being the brightest star.
        <br />
        <span className="italic text-light">It is building a whole galaxy.</span>
      </motion.p>
    </section>
  );
}
