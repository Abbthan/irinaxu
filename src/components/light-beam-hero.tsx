"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";

// A single warm light source in the dark, nudged by the pointer, with a
// slow ambient drift underneath so it's alive even with no input (touch,
// or a reader who isn't moving the mouse). This is the one-layer version
// of rsnc.ai's pointer-parallax trick: write position to CSS custom
// properties, let CSS paint it, no canvas/WebGL involved.
export function LightBeamHero() {
  const stageRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) return;
    const stage = stageRef.current;
    if (!stage) return;

    let raf = 0;
    let targetX = 50;
    let targetY = 34;
    let currentX = 50;
    let currentY = 34;

    const onPointerMove = (event: PointerEvent) => {
      const rect = stage.getBoundingClientRect();
      targetX = ((event.clientX - rect.left) / rect.width) * 100;
      targetY = ((event.clientY - rect.top) / rect.height) * 100;
    };

    const tick = () => {
      // Damped follow rather than 1:1 tracking — a lamp settling, not a cursor.
      currentX += (targetX - currentX) * 0.045;
      currentY += (targetY - currentY) * 0.045;
      stage.style.setProperty("--beam-x", `${currentX}%`);
      stage.style.setProperty("--beam-y", `${currentY}%`);
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onPointerMove);
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      cancelAnimationFrame(raf);
    };
  }, [reduceMotion]);

  return (
    <section
      id="top"
      ref={stageRef}
      className="light-beam-stage relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-dusk px-6 text-center"
      style={{ ["--beam-x" as string]: "50%", ["--beam-y" as string]: "34%" }}
    >
      <div className="light-beam pointer-events-none absolute inset-0" aria-hidden />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-dusk" aria-hidden />

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, delay: 0.2, ease: "easeOut" }}
        className="relative font-display text-[clamp(2.6rem,7vw,5.2rem)] font-light italic text-dusk-ink text-wrap-balance"
      >
        What is light?
      </motion.p>
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, delay: 0.7, ease: "easeOut" }}
        className="relative mt-6 max-w-md font-body text-[15px] leading-relaxed text-dusk-ink/70 sm:text-base"
      >
        I used to think it was a bulb. Then I thought it was warmth. Now I think it&rsquo;s the ability to see someone else.
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.6 }}
        className="absolute bottom-10 flex flex-col items-center gap-2 text-dusk-ink/50"
      >
        <span className="font-hand text-lg">Scroll to begin</span>
        <span className="h-8 w-px bg-dusk-ink/30" />
      </motion.div>
    </section>
  );
}
