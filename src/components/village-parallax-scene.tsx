"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useReducedMotion } from "framer-motion";

// Scroll is split into three phases sharing one --scene-progress value
// (0-1), matching what rsnc.ai actually does: assembly, then a LOCKED
// stretch where position stops changing and lighting takes over, then a
// cover. Nothing fades to reveal itself — layers arrive by moving into
// frame (mount-time entrance, or scroll-driven position), never opacity.
const PHASE_A_END = 0.38; // parallax assembly
const PHASE_B_END = 0.68; // position locked, day -> night
// phase C (0.68 -> 1): black wheatfield rises to cover

function phaseT(start: number, end: number): string {
  return `clamp(0, calc((var(--scene-progress, 0) - ${start}) / ${end - start}), 1)`;
}

// Vertical-only scroll parallax: travels from fromVh to toVh during phase
// A, then holds — this is what "locks in place" for phase B/C.
function assembleY(fromVh: number, toVh: number): string {
  const t = phaseT(0, PHASE_A_END);
  return `calc((${fromVh} + (${toVh - fromVh}) * ${t}) * 1vh)`;
}

const DAYNIGHT_T = phaseT(PHASE_A_END, PHASE_B_END);

function coverY(): string {
  const t = phaseT(PHASE_B_END, 1);
  return `calc(100% - (100% * ${t}))`;
}

// Small pointer-driven offset, additive on top of the scroll transform —
// a separate "depth responds to cursor" system, not tied to scroll at all.
function pointer(ampX: number, ampY: number): { x: string; y: string } {
  return {
    x: `calc(var(--pointer-x, 0) * ${ampX}px)`,
    y: `calc(var(--pointer-y, 0) * ${ampY}px)`,
  };
}

interface LayerProps {
  entered: boolean;
  z: number;
  className: string;
  entranceStyle: React.CSSProperties;
  enteredStyle: React.CSSProperties;
  delayMs: number;
  scrollY: string;
  pointerAmp: [number, number];
  children: React.ReactNode;
}

// Two nested wrappers on purpose: the OUTER one carries the one-time,
// CSS-transitioned mount entrance (different per layer: slide, grow,
// glide from a side); the INNER one carries scroll + pointer position
// with no transition at all, so it tracks input immediately.
function Layer({ entered, z, className, entranceStyle, enteredStyle, delayMs, scrollY, pointerAmp, children }: LayerProps) {
  const p = pointer(...pointerAmp);
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute ${className}`}
      style={{
        zIndex: z,
        ...(entered ? enteredStyle : entranceStyle),
        transition: `transform 1.05s var(--ease-snap), opacity 0.9s ease-out`,
        transitionDelay: `${delayMs}ms`,
      }}
    >
      <div style={{ transform: `translate3d(${p.x}, calc(${scrollY} + ${p.y}), 0)` }}>{children}</div>
    </div>
  );
}

export function VillageParallaxScene() {
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const [entered, setEntered] = useState(false);

  // Scroll -> --scene-progress, written straight to the DOM (see
  // hero-scene.tsx for why: useScroll's own tracking didn't update
  // reliably in testing, this plain listener does).
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let raf = 0;
    const update = () => {
      const rect = track.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const progress = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;
      track.style.setProperty("--scene-progress", progress.toString());
      raf = 0;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // Entrance choreography trigger — double rAF so the pre-entrance state
  // actually paints once before flipping, or the CSS transition has
  // nothing to animate from.
  useEffect(() => {
    if (reduceMotion) {
      // Deliberate one-time correction, not a state-sync loop: reduced-motion
      // preference is only knowable client-side, so this skips the entrance
      // choreography entirely rather than animating it.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEntered(true);
      return;
    }
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setEntered(true)));
    return () => cancelAnimationFrame(id);
  }, [reduceMotion]);

  // Pointer depth-parallax — a spring (position + velocity), not a plain
  // lerp, for the "momentum" the brief asked for: it can slightly
  // overshoot before settling instead of just decelerating into place.
  useEffect(() => {
    if (reduceMotion) return;
    const stage = stageRef.current;
    if (!stage) return;
    let raf = 0;
    let targetX = 0;
    let targetY = 0;
    let x = 0;
    let y = 0;
    let vx = 0;
    let vy = 0;

    const onPointerMove = (event: PointerEvent) => {
      const rect = stage.getBoundingClientRect();
      targetX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      targetY = ((event.clientY - rect.top) / rect.height) * 2 - 1;
    };

    const tick = () => {
      vx = (vx + (targetX - x) * 0.02) * 0.88;
      vy = (vy + (targetY - y) * 0.02) * 0.88;
      x += vx;
      y += vy;
      stage.style.setProperty("--pointer-x", x.toFixed(4));
      stage.style.setProperty("--pointer-y", y.toFixed(4));
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onPointerMove);
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      cancelAnimationFrame(raf);
    };
  }, [reduceMotion]);

  const off = (px: number): React.CSSProperties => ({ opacity: 0, transform: `translateY(${px}px)` });
  const on: React.CSSProperties = { opacity: 1, transform: "translateY(0)" };

  return (
    <div ref={trackRef} className="relative h-[420vh]" style={{ ["--scene-progress" as string]: "0" }}>
      <section
        ref={stageRef}
        className="sticky top-0 h-screen w-full overflow-hidden"
        style={{
          ["--pointer-x" as string]: "0",
          ["--pointer-y" as string]: "0",
          background: `linear-gradient(
            to bottom,
            color-mix(in srgb, #bcd6ee ${`calc(100% - 100% * ${DAYNIGHT_T})`}, var(--color-night-sky-deep) calc(100% * ${DAYNIGHT_T})) 0%,
            color-mix(in srgb, #eef3e0 calc(100% - 100% * ${DAYNIGHT_T}), var(--color-night-sky) calc(100% * ${DAYNIGHT_T})) 100%
          )`,
        }}
      >
        {/* stars — only during/after the day->night phase */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ zIndex: 1, opacity: reduceMotion ? 0 : DAYNIGHT_T }}
        >
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
                animationDuration: reduceMotion ? undefined : `${s.dur}s`,
                animationDelay: reduceMotion ? undefined : `${s.delay}s`,
              }}
            />
          ))}
        </div>

        {/* mountains — farthest, barely moves, first to arrive */}
        <Layer
          entered={entered}
          z={2}
          className="bottom-0 left-0 w-full"
          entranceStyle={off(36)}
          enteredStyle={on}
          delayMs={0}
          scrollY={assembleY(0, -6)}
          pointerAmp={[6, 3]}
        >
          <Image src="/images/parallax-mountains.png" alt="" width={1264} height={694} className="h-auto w-full" priority />
        </Layer>

        {/* clouds-back — small, numerous, passive drift always running,
            sits behind the arriving village so it's only seen through gaps */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-0 top-[8%] w-full overflow-hidden sm:top-[6%]"
          style={{
            zIndex: 3,
            ...(entered ? { opacity: 0.8 } : { opacity: 0 }),
            transition: "opacity 1s ease-out",
            transitionDelay: "300ms",
          }}
        >
          <div
            style={{
              transform: `translate3d(${pointer(9, 3).x}, calc(${assembleY(0, -10)} + ${pointer(9, 3).y}), 0)`,
            }}
          >
            <div className={reduceMotion ? "flex w-max" : "cloud-drift-track"} style={reduceMotion ? undefined : { animation: "cloud-drift 70s linear infinite" }}>
              <Image src="/images/parallax-clouds-back.png" alt="" width={1201} height={205} className="h-auto w-[130vw] max-w-none sm:w-[110vw]" />
              <Image src="/images/parallax-clouds-back.png" alt="" width={1201} height={205} className="h-auto w-[130vw] max-w-none sm:w-[110vw]" aria-hidden />
            </div>
          </div>
        </div>

        {/* hills-village — small, distant, on the hill, grows into place */}
        <Layer
          entered={entered}
          z={4}
          className="bottom-[18%] left-1/2 w-[46%] max-w-md -translate-x-1/2 sm:bottom-[22%]"
          entranceStyle={{ opacity: 0, transform: "translateX(-50%) scale(0.85)" }}
          enteredStyle={{ opacity: 1, transform: "translateX(-50%) scale(1)" }}
          delayMs={220}
          scrollY={assembleY(0, -14)}
          pointerAmp={[10, 5]}
        >
          <Image src="/images/parallax-hills-village.png" alt="" width={977} height={675} className="h-auto w-full" />
        </Layer>

        {/* clouds-front — large, passive drift, glides in from a side on
            load, then exits upward off the top of the frame during phase A */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-0 top-[2%] w-full overflow-hidden"
          style={{
            zIndex: 5,
            ...(entered ? { opacity: 1, transform: "translateX(0%)" } : { opacity: 0, transform: "translateX(-18%)" }),
            transition: "opacity 1s ease-out, transform 1.2s var(--ease-snap)",
            transitionDelay: "450ms",
          }}
        >
          <div
            style={{
              transform: `translate3d(${pointer(16, 6).x}, calc(${assembleY(0, -75)} + ${pointer(16, 6).y}), 0)`,
            }}
          >
            <div className={reduceMotion ? "flex w-max" : "cloud-drift-track"} style={reduceMotion ? undefined : { animation: "cloud-drift 46s linear infinite reverse" }}>
              <Image src="/images/parallax-clouds-front.png" alt="" width={1264} height={385} className="h-auto w-[130vw] max-w-none sm:w-[90vw]" />
              <Image src="/images/parallax-clouds-front.png" alt="" width={1264} height={385} className="h-auto w-[130vw] max-w-none sm:w-[90vw]" aria-hidden />
            </div>
          </div>
        </div>

        {/* main village + streetlights — starts below the viewport, not
            visible at all on load; arrives by moving up during phase A,
            never by fading in */}
        <div aria-hidden className="pointer-events-none absolute bottom-0 left-0 w-full" style={{ zIndex: 6 }}>
          <div
            style={{
              transform: `translate3d(${pointer(14, 0).x}, calc(${assembleY(62, 0)} + ${pointer(14, 0).y}), 0)`,
            }}
          >
            <Image src="/images/parallax-main-village.png" alt="" width={1243} height={755} className="h-auto w-full" />
          </div>
        </div>

        {/* river — foreground-most, starts furthest below, travels
            fastest so it "catches up" to align with everything else. A
            slim cropped band, not the full source image, so it reads as
            a modest stream at the edge instead of dominating the frame. */}
        <div aria-hidden className="pointer-events-none absolute bottom-0 left-0 h-[13vh] w-full sm:h-[16vh]" style={{ zIndex: 7 }}>
          <div
            className="relative h-full w-full"
            style={{
              transform: `translate3d(${pointer(18, 0).x}, calc(${assembleY(85, 0)} + ${pointer(18, 0).y}), 0)`,
            }}
          >
            <Image src="/images/parallax-river.png" alt="" fill sizes="100vw" className="object-cover object-bottom" />
          </div>
        </div>

        {/* black wheatfield — off-screen below at rest, rises during
            phase C to fully cover the scene */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-black"
          style={{ zIndex: 8, transform: `translateY(${reduceMotion ? "0%" : coverY()})` }}
        >
          <Image
            src="/images/parallax-wheatfield.png"
            alt=""
            width={1264}
            height={848}
            className="absolute bottom-0 left-0 h-[40%] w-full object-cover object-top"
          />
        </div>
      </section>
    </div>
  );
}

const STARS = [
  { top: 8, left: 12, size: 2, dur: 4.1, delay: -0.4, bright: false },
  { top: 14, left: 82, size: 2, dur: 5.3, delay: -2.1, bright: true },
  { top: 6, left: 46, size: 1.5, dur: 3.8, delay: -1.2, bright: false },
  { top: 22, left: 68, size: 1.5, dur: 4.6, delay: -3.4, bright: false },
  { top: 11, left: 28, size: 2, dur: 5.0, delay: -0.8, bright: false },
  { top: 18, left: 92, size: 1.5, dur: 3.6, delay: -2.7, bright: false },
  { top: 27, left: 8, size: 1.5, dur: 4.9, delay: -1.6, bright: true },
  { top: 32, left: 55, size: 2, dur: 4.2, delay: -3.9, bright: false },
  { top: 9, left: 60, size: 1.5, dur: 5.6, delay: -0.2, bright: false },
  { top: 24, left: 38, size: 1.5, dur: 3.9, delay: -2.3, bright: false },
  { top: 15, left: 5, size: 1.5, dur: 4.4, delay: -1.9, bright: false },
  { top: 4, left: 74, size: 1.5, dur: 5.1, delay: -3.1, bright: true },
] as const;
