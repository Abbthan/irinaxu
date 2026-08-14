"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
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

// This is the second stage the reader reaches. Its wheat-and-black divider
// is the page's own leading edge, so the page itself rises over the pinned
// night landscape rather than a separate full-screen black cover doing so.
export function HeroScene() {
  const heroRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) return;
    const stage = stageRef.current;
    const hero = heroRef.current;
    if (!stage || !hero) return;

    let raf = 0;
    let targetX = 50;
    let targetY = 34;
    let currentX = 50;
    let currentY = 34;
    let pointerSeen = false;
    let pointerClientX = 0;
    let pointerClientY = 0;
    let wheatTargetX = 0;
    let wheatX = 0;
    let wheatVelocityX = 0;

    const onPointerMove = (event: PointerEvent) => {
      pointerSeen = true;
      pointerClientX = event.clientX;
      pointerClientY = event.clientY;
      wheatTargetX = (event.clientX / window.innerWidth) * 2 - 1;
    };

    const tick = () => {
      // Keep translating the last viewport-space cursor position into the
      // stage's local coordinates. The stage moves while the page scrolls,
      // even when the pointer itself is stationary, so calculating this
      // only in `pointermove` leaves the beam behind during a scroll.
      if (pointerSeen) {
        const rect = stage.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          targetX = ((pointerClientX - rect.left) / rect.width) * 100;
          targetY = ((pointerClientY - rect.top) / rect.height) * 100;
        }
      }

      currentX += (targetX - currentX) * 0.045;
      currentY += (targetY - currentY) * 0.045;
      stage.style.setProperty("--beam-x", `${currentX}%`);
      stage.style.setProperty("--beam-y", `${currentY}%`);

      // The wheat is the nearest scenic layer, so it receives the largest
      // pointer amplitude. Only X is written: the black page edge beneath
      // it remains perfectly still and there is no vertical wheat drift.
      wheatVelocityX = (wheatVelocityX + (wheatTargetX - wheatX) * 0.032) * 0.86;
      wheatX += wheatVelocityX;
      hero.style.setProperty("--wheat-pointer-x", wheatX.toFixed(4));
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
      ref={heroRef}
      className="relative w-full"
      data-next-page-reveal
      style={{ ["--wheat-pointer-x" as string]: "0" }}
    >
      {/* Preserve the original wheat treatment: transparent artwork zone
          first, followed by only the original small 18vh black strip. The
          wheat window grows with width on landscape screens, preventing its
          stalks from being clipped halfway by the fixed black strip. */}
      <div
        aria-hidden
        className="pointer-events-none relative w-full overflow-hidden"
        style={{ height: "calc(max(30vh, 30vw) + 18vh)" }}
      >
        <div
          className="absolute top-0 left-[-3%] h-[max(30vh,30vw)] w-[106%] overflow-hidden"
          style={{ transform: reduceMotion ? undefined : "translate3d(calc(var(--wheat-pointer-x, 0) * -38px), 0, 0)" }}
        >
          <div className="wheat-bristle wheat-bristle-slow absolute top-[4vh] left-0 aspect-[1264/808] w-[112%]">
            <Image
              src="/images/parallax-wheatfield.png"
              alt=""
              width={1264}
              height={808}
              sizes="112vw"
              className="h-auto w-full origin-center scale-x-[-1] opacity-85"
              unoptimized
            />
          </div>
          <div className="wheat-bristle wheat-bristle-late absolute top-[6.5vh] left-[-10%] aspect-[1264/808] w-[116%]">
            <Image
              src="/images/parallax-wheatfield.png"
              alt=""
              width={1264}
              height={808}
              sizes="116vw"
              className="h-auto w-full opacity-75"
              unoptimized
            />
          </div>
          <div className="wheat-bristle absolute top-[1.5vh] left-0 aspect-[1264/808] w-[108%]">
            <Image
              src="/images/parallax-wheatfield.png"
              alt=""
              width={1264}
              height={808}
              sizes="108vw"
              className="h-auto w-full"
              unoptimized
            />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 h-[18vh] w-full bg-black" />
      </div>

      <div
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

      </div>
    </section>
  );
}
