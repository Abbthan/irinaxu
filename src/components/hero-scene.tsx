"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

// Fixed (not Math.random-at-render) so server and client markup match.
const STARS = [
  { top: 10, left: 15, size: 1.5, dur: 4.6, delay: -0.7, bright: false },
  { top: 6, left: 78, size: 1.5, dur: 3.9, delay: -2.4, bright: true },
  { top: 18, left: 45, size: 1, dur: 5.1, delay: -1.3, bright: false },
  { top: 26, left: 88, size: 1.5, dur: 4.2, delay: -3.1, bright: false },
  { top: 14, left: 30, size: 1, dur: 3.6, delay: -0.4, bright: false },
  { top: 30, left: 8, size: 1.5, dur: 4.8, delay: -2.8, bright: false },
  { top: 8, left: 62, size: 1, dur: 5.4, delay: -1.7, bright: true },
  { top: 22, left: 20, size: 1.5, dur: 4.4, delay: -3.5, bright: false },
  { top: 34, left: 55, size: 1, dur: 3.8, delay: -0.9, bright: false },
  { top: 12, left: 95, size: 1.5, dur: 5.0, delay: -2.2, bright: false },
] as const;

// This is now the SECOND stage the reader reaches, after the black
// wheatfield in VillageParallaxScene has fully covered the previous
// scene — the cursor-light stays purely on this later, quieter moment,
// not the parallax village scroll (per the brief: keep it here, not
// earlier).
export function HeroScene() {
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
      ref={stageRef}
      className="light-beam-stage relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-dusk px-6 text-center"
      style={{ ["--beam-x" as string]: "50%", ["--beam-y" as string]: "34%" }}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {STARS.map((s, i) => (
          <span
            key={i}
            className={reduceMotion ? undefined : `star${s.bright ? " star-bright" : ""}`}
            style={{
              position: "absolute",
              top: `${s.top}%`,
              left: `${s.left}%`,
              width: `${s.size}px`,
              height: `${s.size}px`,
              borderRadius: "50%",
              background: "var(--color-dusk-ink)",
              opacity: reduceMotion ? 0.5 : undefined,
              animationDuration: reduceMotion ? undefined : `${s.dur}s`,
              animationDelay: reduceMotion ? undefined : `${s.delay}s`,
            }}
          />
        ))}
      </div>

      <span className="ghost-watermark" aria-hidden>
        LIGHT
      </span>

      <div className="light-beam pointer-events-none absolute inset-0" aria-hidden />

      <div className="relative">
        <p className="font-display text-[clamp(2.6rem,7vw,5.2rem)] font-light italic text-dusk-ink text-wrap-balance">
          What is light?
        </p>
        <p className="relative mt-6 max-w-md font-body text-[15px] leading-relaxed text-dusk-ink/70 sm:text-base">
          I used to think it was a bulb. Then I thought it was warmth. Now I think it&rsquo;s the ability to see someone else.
        </p>
      </div>

      <div className="absolute bottom-10 flex flex-col items-center gap-2 text-dusk-ink/50">
        <span className="font-hand text-lg">Scroll to begin</span>
        <span className="h-8 w-px bg-dusk-ink/30" />
      </div>
    </section>
  );
}
