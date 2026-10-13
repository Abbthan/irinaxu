"use client";

import { motion, useReducedMotion } from "framer-motion";

// Full-bleed black single-statement pause — rsnc.ai's "The next interface
// is empathy" moment. One idea, largest type on the page, no image, no
// decoration. The line itself is Irina's own realization from Act I,
// restated as the site's thesis rather than a new aphorism invented for
// the occasion.
export function StatementBreak() {
  const reduceMotion = useReducedMotion();
  const reveal = {
    initial: { opacity: 0, y: reduceMotion ? 0 : 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.6 },
    transition: { duration: 1, ease: [0.16, 1, 0.3, 1] as const },
  };

  return (
    <section className="flex min-h-[70vh] items-center justify-center bg-dusk-deep px-6 py-32 text-center sm:px-10">
      <motion.p
        {...reveal}
        className="max-w-3xl font-display text-[clamp(2rem,5.4vw,3.8rem)] font-light leading-[1.15] text-dusk-ink text-wrap-balance"
      >
        What they needed wasn&rsquo;t light.
        <br />
        <span className="italic text-light">It was to be seen.</span>
      </motion.p>
    </section>
  );
}
