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
// A, then holds — this is what "locks in place" for phase B/C. The
// distance each layer travels is deliberately very different back-to-
// front (mountains barely move, the river travels furthest) so the
// assembly itself reads as a drop in altitude, not just layers sliding in.
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
  /** Extra oversize (as a scale factor) so pointer parallax can never
   * expose the stage background. Only meaningful for full-bleed,
   * left-0/w-full layers — a centered layer's own side margins already
   * exceed its (small) pointer amplitude, and scaling a *centered*
   * transform breaks the centering math, so those pass 1 (off). */
  scaleBuffer?: number;
  children: React.ReactNode;
}

// Two nested wrappers on purpose: the OUTER one carries the one-time,
// CSS-transitioned mount entrance (different per layer: slide, grow,
// glide from a side); the INNER one carries scroll + pointer position
// with no transition at all, so it tracks input immediately.
function Layer({ entered, z, className, entranceStyle, enteredStyle, delayMs, scrollY, pointerAmp, scaleBuffer = 1, children }: LayerProps) {
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
      <div
        className={scaleBuffer !== 1 ? "origin-bottom" : undefined}
        style={{
          transform: `translate3d(${p.x}, calc(${scrollY} + ${p.y}), 0)${scaleBuffer !== 1 ? ` scale(${scaleBuffer})` : ""}`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

// A day image and a night image, same box, cross-fading on --scene-progress
// via DAYNIGHT_T — never a hard cut, and never a size jump, because both
// share one fixed aspect-ratio box and both use object-contain.
function DayNightPair({
  day,
  night,
  dayDims,
  nightDims,
  aspect,
  priority,
  dropShadow,
}: {
  day: string;
  night: string;
  dayDims: [number, number];
  nightDims: [number, number];
  aspect: string;
  priority?: boolean;
  /** Two-layer soft shadow so a detailed, similarly-toned cutout (the
   * hillside village) still reads as sitting in FRONT of an equally
   * detailed layer behind it (the mountains), instead of fusing with it. */
  dropShadow?: boolean;
}) {
  return (
    <div
      className={`relative w-full ${aspect}`}
      style={dropShadow ? { filter: "drop-shadow(0 22px 32px rgba(20,14,4,0.4)) drop-shadow(0 6px 12px rgba(20,14,4,0.3))" } : undefined}
    >
      <Image
        src={day}
        alt=""
        width={dayDims[0]}
        height={dayDims[1]}
        className="absolute inset-0 h-full w-full object-contain object-bottom"
        style={{ opacity: `calc(1 - ${DAYNIGHT_T})` }}
        priority={priority}
      />
      <Image
        src={night}
        alt=""
        width={nightDims[0]}
        height={nightDims[1]}
        className="absolute inset-0 h-full w-full object-contain object-bottom"
        style={{ opacity: DAYNIGHT_T }}
      />
    </div>
  );
}

export function VillageParallaxScene() {
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const [entered, setEntered] = useState(false);

  // Scroll -> --scene-progress (+ eased --sun-t/--moon-t derived from it),
  // written straight to the DOM: a plain listener proved far more
  // reliable in testing than useScroll's own tracking.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let raf = 0;
    const update = () => {
      const rect = track.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const progress = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;
      const daynightT = Math.min(1, Math.max(0, (progress - PHASE_A_END) / (PHASE_B_END - PHASE_A_END)));
      // Sun dips with an ease-IN (starts slow, accelerates down and out of
      // view); moon rises with an ease-OUT (starts fast, decelerates into
      // place) — reversible for free since both are pure functions of
      // scroll position, not stateful velocity.
      const sunT = daynightT * daynightT;
      const moonT = 1 - (1 - daynightT) * (1 - daynightT);
      track.style.setProperty("--scene-progress", progress.toString());
      track.style.setProperty("--sun-t", sunT.toString());
      track.style.setProperty("--moon-t", moonT.toString());
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

  // Sun travels from a high point down to the horizon (tucking behind the
  // mountains layer, which sits at a higher z-index); the moon travels the
  // same span in reverse. Opacity fades a touch ahead of position so
  // neither one visibly clips in a gap between peaks.
  const SUN_TOP_VH = 9;
  const SUN_HORIZON_VH = 52;
  const sunTop = `calc(${SUN_TOP_VH}vh + (${SUN_HORIZON_VH - SUN_TOP_VH}vh) * var(--sun-t, 0))`;
  const moonTop = `calc(${SUN_HORIZON_VH}vh - (${SUN_HORIZON_VH - SUN_TOP_VH}vh) * var(--moon-t, 0))`;

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

        {/* sun — high and bright at rest, dips behind the mountains
            (lower in the stack) with an accelerating ease-in */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-[66%] aspect-square w-[8vw] max-w-[104px] min-w-[52px] -translate-x-1/2"
          style={{
            zIndex: 1,
            top: reduceMotion ? `${SUN_TOP_VH}vh` : sunTop,
            opacity: reduceMotion ? 1 : `calc(1 - (var(--sun-t, 0) * 1.15))`,
          }}
        >
          <Image src="/images/parallax-sun.png" alt="" fill sizes="8vw" className="object-contain" />
        </div>

        {/* moon — rises to the sun's start position with a decelerating
            ease-out, exactly reversed when scrolling back up */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-[66%] aspect-square w-[7vw] max-w-[92px] min-w-[46px] -translate-x-1/2"
          style={{
            zIndex: 1,
            top: reduceMotion ? `${SUN_HORIZON_VH}vh` : moonTop,
            opacity: reduceMotion ? 0 : "var(--moon-t, 0)",
          }}
        >
          <Image src="/images/parallax-moon.png" alt="" fill sizes="7vw" className="object-contain" />
        </div>

        {/* mountains — farthest, barely moves, first to arrive */}
        <Layer
          entered={entered}
          z={2}
          className="bottom-0 left-0 w-full"
          entranceStyle={off(36)}
          enteredStyle={on}
          delayMs={0}
          scrollY={assembleY(0, -3)}
          pointerAmp={[4, 2]}
          scaleBuffer={1.14}
        >
          <DayNightPair
            day="/images/parallax-mountains-day.png"
            night="/images/parallax-mountains-night.png"
            dayDims={[1264, 800]}
            nightDims={[1264, 694]}
            aspect="aspect-[1264/800]"
            priority
          />
        </Layer>

        {/* hills-village — a large, clearly-bounded settlement sitting on
            one hill, not the whole mountainside: wide enough to read as
            a major feature (per the brief), but kept short of full-frame
            so it doesn't visually fuse with the mountains behind it */}
        <Layer
          entered={entered}
          z={3}
          className="bottom-[8%] left-[13%] right-[13%] sm:bottom-[10%]"
          entranceStyle={{ opacity: 0, transform: "translateY(28px) scale(0.92)" }}
          enteredStyle={{ opacity: 1, transform: "translateY(0) scale(1)" }}
          delayMs={180}
          scrollY={assembleY(0, -20)}
          pointerAmp={[9, 4]}
        >
          <DayNightPair
            day="/images/parallax-hills-village-day.png"
            night="/images/parallax-hills-village-night.png"
            dayDims={[1263, 794]}
            nightDims={[1254, 776]}
            aspect="aspect-[1263/794]"
            dropShadow
          />
        </Layer>

        {/* main village + streetlights — starts below the viewport, not
            visible at all on load; arrives by moving up during phase A,
            never by fading in */}
        <div aria-hidden className="pointer-events-none absolute bottom-0 left-0 w-full" style={{ zIndex: 4 }}>
          <div
            className="origin-bottom scale-[1.14]"
            style={{ transform: `translate3d(${pointer(20, 0).x}, calc(${assembleY(85, 0)} + ${pointer(20, 0).y}), 0)` }}
          >
            <DayNightPair
              day="/images/parallax-main-village-day.png"
              night="/images/parallax-main-village-night.png"
              dayDims={[1259, 768]}
              nightDims={[1243, 755]}
              aspect="aspect-[1259/768]"
              dropShadow
            />
          </div>
        </div>

        {/* river — foreground-most, starts furthest below, travels
            fastest so it "catches up" to align with everything else. A
            slim cropped band, not the full source image, so it reads as
            a modest stream at the edge instead of dominating the frame. */}
        <div aria-hidden className="pointer-events-none absolute bottom-0 left-0 h-[13vh] w-full sm:h-[16vh]" style={{ zIndex: 5 }}>
          <div
            className="origin-bottom scale-[1.14]"
            style={{
              position: "relative",
              height: "100%",
              width: "100%",
              transform: `translate3d(${pointer(26, 0).x}, calc(${assembleY(115, 0)} + ${pointer(26, 0).y}), 0)`,
            }}
          >
            <Image
              src="/images/parallax-river-day.png"
              alt=""
              fill
              sizes="100vw"
              className="object-cover object-bottom"
              style={{ opacity: `calc(1 - ${DAYNIGHT_T})` }}
            />
            <Image
              src="/images/parallax-river-night.png"
              alt=""
              fill
              sizes="100vw"
              className="object-cover object-bottom"
              style={{ opacity: DAYNIGHT_T }}
            />
          </div>
        </div>

        {/* black wheatfield — a short curtain rising from below at rest,
            with the wheat itself sitting just above its leading edge (not
            embedded near its base), so the silhouette reads as grass at
            ground level with the night rising just behind it. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ zIndex: 6, transform: `translateY(${reduceMotion ? "0%" : coverY()})` }}
        >
          <div className="absolute bottom-[42vh] left-0 h-[20vh] w-full">
            <Image src="/images/parallax-wheatfield.png" alt="" fill sizes="100vw" className="object-cover object-bottom" />
          </div>
          <div className="absolute bottom-0 left-0 h-[42vh] w-full bg-black" />
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
