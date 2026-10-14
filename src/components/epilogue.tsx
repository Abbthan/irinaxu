"use client";

import { useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { usePointerLight } from "@/hooks/use-pointer-light";

const STARS = [
  { top: 10, left: 15, size: 1.5, dur: 4.6, delay: -0.7 },
  { top: 6, left: 78, size: 1.5, dur: 3.9, delay: -2.4 },
  { top: 18, left: 45, size: 1, dur: 5.1, delay: -1.3 },
  { top: 26, left: 88, size: 1.5, dur: 4.2, delay: -3.1 },
  { top: 14, left: 30, size: 1, dur: 3.6, delay: -0.4 },
  { top: 30, left: 8, size: 1.5, dur: 4.8, delay: -2.8 },
  { top: 8, left: 62, size: 1, dur: 5.4, delay: -1.7 },
  { top: 22, left: 40, size: 1, dur: 4.1, delay: -1.1 },
  { top: 36, left: 70, size: 1.5, dur: 5.2, delay: -2.6 },
] as const;

export function Epilogue() {
  const stageRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  usePointerLight(stageRef, !reduceMotion, { x: 50, y: 42 });

  const reveal = {
    initial: { opacity: 0, y: reduceMotion ? 0 : 18 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.35 },
    transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] as const },
  };

  return (
    <section
      ref={stageRef}
      className="relative min-h-[100vh] overflow-hidden bg-dusk px-6 py-28 sm:px-10 sm:py-40"
      style={{ ["--beam-x" as string]: "50%", ["--beam-y" as string]: "42%" }}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {STARS.map((s, i) => (
          <span
            key={i}
            className={reduceMotion ? undefined : "star"}
            style={{
              position: "absolute",
              top: `${s.top}%`,
              left: `${s.left}%`,
              width: `${s.size}px`,
              height: `${s.size}px`,
              borderRadius: "50%",
              background: reduceMotion ? "var(--color-dusk-ink)" : undefined,
              opacity: reduceMotion ? 0.5 : undefined,
              animationDuration: reduceMotion ? undefined : `${s.dur}s`,
              animationDelay: reduceMotion ? undefined : `${s.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Restored: warm light that follows the cursor through the closing chapter */}
      <div className="light-beam pointer-events-none absolute inset-0" aria-hidden />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(28rem 22rem at 50% 18%, color-mix(in srgb, var(--color-light) 12%, transparent) 0%, transparent 70%)",
        }}
      />

      <span className="ghost-watermark opacity-[0.045]" aria-hidden>
        LIGHT
      </span>

      <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-10 text-center">
        <motion.div {...reveal} className="flex flex-col items-center gap-4">
          <span className="font-display text-sm tracking-[0.22em] text-light uppercase">Chapter IV</span>
          <span className="font-hand text-2xl text-dusk-ink/70">Becoming Light</span>
        </motion.div>

        <motion.blockquote
          {...reveal}
          transition={{ ...reveal.transition, delay: 0.1 }}
          className="max-w-xl space-y-5 font-display text-[clamp(1.2rem,2.4vw,1.55rem)] font-light italic leading-[1.85] text-dusk-ink text-wrap-balance"
        >
          <p>
            I used to think leadership meant giving orders.
            <br />
            Now I know it means giving light.
          </p>
          <p>
            Not just handing out tools, but igniting abilities.
            <br />
            Not just building a stage, but empowering others to shine on it.
          </p>
          <p>
            The deepest fulfillment is enabling others to succeed.
            <br />
            I am Irina. Still chasing light. And learning, every day, how to become it.
          </p>
        </motion.blockquote>

        <motion.p
          {...reveal}
          transition={{ ...reveal.transition, delay: 0.22 }}
          className="font-hand text-xl text-light/90"
        >
          Move the light with your cursor &mdash; Irina, Class of 2031
        </motion.p>
      </div>
    </section>
  );
}
