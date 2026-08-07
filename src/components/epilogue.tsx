"use client";

import { motion, useReducedMotion } from "framer-motion";
import { PhotoPlaceholder } from "./photo-placeholder";

// Full circle back to the hero's dark register — the same warm dark the
// story opened in, now with the story behind it.
export function Epilogue() {
  const reduceMotion = useReducedMotion();
  const reveal = {
    initial: { opacity: 0, y: reduceMotion ? 0 : 18 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.4 },
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] as const },
  };

  return (
    <section className="relative overflow-hidden bg-dusk px-6 py-28 sm:px-10 sm:py-40">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(40rem 32rem at 50% 15%, color-mix(in srgb, var(--color-light) 14%, transparent) 0%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-10 text-center">
        <motion.div {...reveal} className="flex flex-col items-center gap-4">
          <span className="font-display text-sm text-light">IV</span>
          <span className="font-hand text-xl text-dusk-ink/70">Becoming Light</span>
        </motion.div>

        <motion.div {...reveal} transition={{ ...reveal.transition, delay: 0.1 }}>
          <PhotoPlaceholder
            caption="Photo — Irina walking toward the light, or a simple line drawing"
            aspect="aspect-[3/4]"
          />
        </motion.div>

        <motion.h2
          {...reveal}
          transition={{ ...reveal.transition, delay: 0.18 }}
          className="max-w-2xl font-display text-[clamp(1.4rem,2.6vw,1.9rem)] font-light italic leading-relaxed text-dusk-ink text-wrap-balance"
        >
          From the smoke over a stove in Sichuan, to the warmth left behind in a stray cat&rsquo;s shelter, to the
          conviction in a founder&rsquo;s eyes when someone finally believes them &mdash;
        </motion.h2>

        <motion.p
          {...reveal}
          transition={{ ...reveal.transition, delay: 0.26 }}
          className="max-w-xl font-body text-lg leading-relaxed text-dusk-ink/80"
        >
          I think I&rsquo;ve spent my life chasing light, and slowly becoming it.
        </motion.p>

        <motion.blockquote
          {...reveal}
          transition={{ ...reveal.transition, delay: 0.34 }}
          className="mt-8 max-w-lg border-t border-dusk-ink/15 pt-8 font-display text-[1.15rem] italic leading-[1.9] text-dusk-ink/90"
        >
          <p>I used to think leadership meant giving orders.</p>
          <p>Now I know it means giving light.</p>
          <p>And sometimes, that light is just listening.</p>
        </motion.blockquote>

        <motion.p
          {...reveal}
          transition={{ ...reveal.transition, delay: 0.42 }}
          className="font-hand text-xl text-light/90"
        >
          Irina &mdash; Class of 2031
        </motion.p>
      </div>
    </section>
  );
}
