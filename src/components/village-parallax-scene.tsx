"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useReducedMotion } from "framer-motion";

// Scroll shares one --scene-progress value (0-1): assembly, a LOCKED
// stretch where position stops changing and lighting changes rapidly,
// a short night hold, then the following page covers the scene. Nothing
// fades to reveal its position — layers arrive by moving into frame.
const PHASE_A_END = 0.38; // parallax assembly
// Half the former 0.30-wide interval: every consumer of DAYNIGHT_T (sky,
// stars, artwork crossfades, lamp glow, and celestial arc) now completes
// in exactly half the scroll distance.
const PHASE_B_END = 0.53; // position locked, day -> night
// The following page still begins at the established 0.68 point, retaining
// the original still-night beat before wheat enters.
const SCENE_SCROLL_VH = 320;

// Sun/moon share one quarter-circle arc: a center point below the
// mountains, swept from 180deg (level with the center, off to the side)
// to 90deg (directly above the center). At their high endpoint they sit
// above the mountain stack so the mountain artwork cannot swallow them;
// the closer village layers can still occlude them naturally.
const ARC_CENTER_X_PCT = 66;
const ARC_CENTER_Y_VH = 48;
const ARC_RADIUS_VH = 45;
const ARC_START_DEG = 180;
const ARC_END_DEG = 90;

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

// The illustrations are naturally sized by viewport width. On ultrawide
// windows that would also make them climb much too high. This correction
// preserves their horizontal full bleed while keeping each tier's vertical
// anchor equivalent to the approved ~1.36:1 reference viewport.
function responsiveDepthOffset(artHeightVw: number, referenceHeightVh: number): string {
  return `max(0px, calc(${artHeightVw}vw - ${referenceHeightVh}vh))`;
}

// Wide, shallow windows need a small additional mountain drop to retain the
// approved horizon proportion. This is zero through ordinary/tall layouts and
// grows gently to at most 2vh on ultrawide displays.
function wideMountainNudge(): string {
  return "clamp(0px, calc((100vw - 170vh) * 0.08), 2vh)";
}

const DAYNIGHT_T = phaseT(PHASE_A_END, PHASE_B_END);

function cloudExitY(): string {
  const t = phaseT(0, 0.24);
  return `calc(-82vh * ${t})`;
}

// Small pointer-driven offset, additive on top of the scroll transform —
// a separate "depth responds to cursor" system, not tied to scroll at all.
function pointer(ampX: number, ampY: number): { x: string; y: string } {
  return {
    x: `calc(var(--pointer-x, 0) * ${-ampX}px)`,
    y: `calc(var(--pointer-y, 0) * ${-ampY}px)`,
  };
}

// Cursor depth hierarchy (farthest -> nearest). The three landscape layers
// are intentionally only a little faster than their previous 6 / 13 / 22px
// amplitudes, while retaining clear gaps around the unchanged cloud depth.
const POINTER_DEPTH = {
  celestial: [3, 1.5],
  mountains: [6.6, 3.3],
  clouds: [7, 3.5],
  hilltopVillage: [14.5, 6.7],
  foregroundVillage: [24.5, 4.5],
} as const;

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
// via DAYNIGHT_T. For contained layers, `box` deliberately retains the
// ORIGINAL artwork's aspect ratio while the taller images are pinned to its
// top edge at full width. Their safety margin therefore overflows downward
// without resizing or moving any of the artwork already on-screen.
function DayNightPair({
  day,
  night,
  dayDims,
  nightDims,
  box,
  objectFit = "contain",
  priority,
  dropShadow,
}: {
  day: string;
  night: string;
  dayDims: [number, number];
  nightDims: [number, number];
  box: string;
  /** 'cover' crops to fill the box (e.g. a full-width layer capped to a
   * fixed vh height, deliberately cropping its empty upper margin so a
   * tall source doesn't reach further up-screen than intended); 'contain'
   * (default) letterboxes to show the whole image. */
  objectFit?: "contain" | "cover";
  priority?: boolean;
  /** Two-layer soft shadow so a detailed, similarly-toned cutout (the
   * hillside village) still reads as sitting in FRONT of an equally
   * detailed layer behind it (the mountains), instead of fusing with it. */
  dropShadow?: boolean;
}) {
  const imageClass =
    objectFit === "cover"
      ? "absolute inset-0 h-full w-full object-cover object-bottom"
      : "absolute inset-x-0 top-0 h-auto w-full";
  return (
    <div
      className={`relative w-full ${box}`}
      style={dropShadow ? { filter: "drop-shadow(0 22px 32px rgba(20,14,4,0.4)) drop-shadow(0 6px 12px rgba(20,14,4,0.3))" } : undefined}
    >
      <Image
        src={day}
        alt=""
        width={dayDims[0]}
        height={dayDims[1]}
        className={imageClass}
        style={{ opacity: `calc(1 - ${DAYNIGHT_T})` }}
        priority={priority}
        unoptimized
      />
      <Image
        src={night}
        alt=""
        width={nightDims[0]}
        height={nightDims[1]}
        className={imageClass}
        style={{ opacity: DAYNIGHT_T }}
        unoptimized
      />
    </div>
  );
}

export function VillageParallaxScene() {
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const [entered, setEntered] = useState(false);

  // Scroll -> --scene-progress (+ the sun/moon arc x/y offsets and
  // opacities derived from it), written straight to the DOM: a plain
  // listener proved far more reliable in testing than useScroll's own
  // tracking.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let raf = 0;
    let celestialRaf = 0;
    let celestialTarget = 0;
    let celestialCurrent = 0;

    const paintCelestial = (daynightT: number) => {
      const sunPhase = Math.min(1, Math.max(0, daynightT / 0.5));
      const moonPhase = Math.min(1, Math.max(0, (daynightT - 0.5) / 0.5));
      const sunEase = sunPhase * sunPhase;
      const moonEase = 1 - (1 - moonPhase) * (1 - moonPhase);
      const arcOffset = (tArc: number) => {
        const angleDeg = ARC_START_DEG + (ARC_END_DEG - ARC_START_DEG) * tArc;
        const angleRad = (angleDeg * Math.PI) / 180;
        return { x: ARC_RADIUS_VH * Math.cos(angleRad), y: -ARC_RADIUS_VH * Math.sin(angleRad) };
      };
      const sunArc = arcOffset(1 - sunEase);
      const moonArc = arcOffset(moonEase);
      track.style.setProperty("--sun-x", sunArc.x.toFixed(3));
      track.style.setProperty("--sun-y", sunArc.y.toFixed(3));
      track.style.setProperty("--moon-x", moonArc.x.toFixed(3));
      track.style.setProperty("--moon-y", moonArc.y.toFixed(3));
      track.style.setProperty("--sun-opacity", Math.min(1, Math.max(0, (1 - sunPhase) * 6)).toFixed(3));
      track.style.setProperty("--moon-opacity", Math.min(1, Math.max(0, moonPhase * 6)).toFixed(3));
    };

    const animateCelestial = () => {
      celestialCurrent += (celestialTarget - celestialCurrent) * 0.22;
      if (Math.abs(celestialTarget - celestialCurrent) < 0.0001) celestialCurrent = celestialTarget;
      paintCelestial(celestialCurrent);
      if (celestialCurrent !== celestialTarget) {
        celestialRaf = requestAnimationFrame(animateCelestial);
      } else {
        celestialRaf = 0;
      }
    };

    const update = () => {
      const rect = track.getBoundingClientRect();
      // Keep the original movement speed even though the track now includes
      // an additional sticky tail for the page-over-scene reveal.
      const timeline = window.innerHeight * (SCENE_SCROLL_VH / 100);
      const progress = timeline > 0 ? Math.min(1, Math.max(0, -rect.top / timeline)) : 0;
      const daynightT = Math.min(1, Math.max(0, (progress - PHASE_A_END) / (PHASE_B_END - PHASE_A_END)));
      // Sun and moon each get their OWN half of the transition (0-0.5 and
      // 0.5-1) for their full arc traversal, not the whole 0-1 span — so
      // the sun has actually reached the horizon (dipped behind the
      // mountains) by the midpoint, and the moon starts exactly there and
      // rises through its own half. Splitting it this way is what makes
      // them visibly swap AT the horizon instead of the sun fading out
      // while still high up and the moon fading in already part-risen.
      track.style.setProperty("--scene-progress", progress.toString());
      // Quarter-circle arc: a shared center sits below the mountains: at
      // t_arc=0 the point is level with the center, off to one side
      // ("under the mountains", occluded); at t_arc=1 it's directly above
      // the center ("above the mountains"). Sweeping between those two
      // is a 90 degree arc that reads as rising up AND to the right, not
      // a straight vertical line — computed here (not in CSS) since plain
      // calc() has no trig functions to rely on.
      celestialTarget = daynightT;
      if (!celestialRaf) celestialRaf = requestAnimationFrame(animateCelestial);
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
      if (celestialRaf) cancelAnimationFrame(celestialRaf);
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
  // lerp, for momentum and a slight overshoot. `pointer()` applies the
  // inverse sign so every scenic layer travels against cursor direction.
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

  // Sun/moon position along the shared arc (see ARC_* constants + the
  // scroll effect): --sun-x/--sun-y and --moon-x/--moon-y are the JS-
  // computed vh offsets from the arc's center, refreshed every scroll
  // frame. Static rest positions (arc endpoints) cover reduced-motion.
  const arcLeft = (xVar: string) => `calc(${ARC_CENTER_X_PCT}% + var(${xVar}, 0) * 1vh)`;
  const arcTop = (yVar: string) => `calc(${ARC_CENTER_Y_VH}vh + var(${yVar}, 0) * 1vh)`;
  const sunRestLeft = `${ARC_CENTER_X_PCT}%`;
  const sunRestTop = `${ARC_CENTER_Y_VH - ARC_RADIUS_VH}vh`;
  const moonRestLeft = `calc(${ARC_CENTER_X_PCT}% - ${ARC_RADIUS_VH}vh)`;
  const moonRestTop = `${ARC_CENTER_Y_VH}vh`;

  return (
    <div ref={trackRef} className="relative h-[570vh]" style={{ ["--scene-progress" as string]: "0" }}>
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

        {/* sun — high and bright at rest, retreats around the arc with an accelerating
            ease-in; also drifts gently with the cursor, on top of its
            scroll-driven arc position. Cursor-drift depth ordering across
            the whole scene, slowest to fastest (farthest to closest):
            sun/moon < mountains < clouds < hills-village < main-village
            < wheat — the sun/moon sit "past" the mountains,
            so they move even less than the layer in front of them. */}
        <div
          aria-hidden
          className="pointer-events-none absolute aspect-square w-[10vw] max-w-[132px] min-w-[64px]"
          style={{
            zIndex: 1,
            left: reduceMotion ? sunRestLeft : arcLeft("--sun-x"),
            top: reduceMotion ? sunRestTop : arcTop("--sun-y"),
            opacity: reduceMotion ? 1 : "var(--sun-opacity, 1)",
            transform: reduceMotion
              ? "translateX(-50%)"
              : `translateX(-50%) translate3d(${pointer(...POINTER_DEPTH.celestial).x}, ${pointer(...POINTER_DEPTH.celestial).y}, 0)`,
          }}
        >
          <Image src="/images/parallax-sun.png" alt="" fill sizes="10vw" className="object-contain" />
        </div>

        {/* moon — advances around the same arc from under the mountains
            to the sun's rest position, with a decelerating ease-out,
            exactly reversed when scrolling back up; same cursor drift */}
        <div
          aria-hidden
          className="pointer-events-none absolute aspect-square w-[9vw] max-w-[118px] min-w-[58px]"
          style={{
            zIndex: 1,
            left: reduceMotion ? moonRestLeft : arcLeft("--moon-x"),
            top: reduceMotion ? moonRestTop : arcTop("--moon-y"),
            opacity: reduceMotion ? 0 : "var(--moon-opacity, 0)",
            transform: reduceMotion
              ? "translateX(-50%)"
              : `translateX(-50%) translate3d(${pointer(...POINTER_DEPTH.celestial).x}, ${pointer(...POINTER_DEPTH.celestial).y}, 0)`,
          }}
        >
          <Image src="/images/parallax-moon.png" alt="" fill sizes="9vw" className="object-contain" />
        </div>

        {/* Three painterly clouds drift right-to-left only in the opening
            tableau. This block deliberately follows the sun and moon in
            paint order, so clouds pass IN FRONT of both celestial bodies;
            the landscape layers that follow still naturally occlude the
            clouds at the horizon. Scroll carries the entire cloud field
            upward before the day/night phase starts, and reversing the
            scroll restores it. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden"
          style={{
            zIndex: 1,
            opacity: reduceMotion ? 0.74 : `calc(1 - ${phaseT(0.18, 0.3)})`,
            transform: reduceMotion
              ? "none"
              : `translate3d(${pointer(...POINTER_DEPTH.clouds).x}, calc(${cloudExitY()} + ${pointer(...POINTER_DEPTH.clouds).y}), 0)`,
          }}
        >
          {[
            { src: "/images/parallax-cloud-1.png", width: "24vw", top: "13vh", duration: "55s", delay: "-5s" },
            { src: "/images/parallax-cloud-2.png", width: "16vw", top: "29vh", duration: "66s", delay: "-29s" },
            { src: "/images/parallax-cloud-3.png", width: "21vw", top: "7vh", duration: "61s", delay: "-47s" },
          ].map((cloud, index) => (
            <div
              key={cloud.src}
              className={reduceMotion ? "absolute" : "parallax-cloud absolute"}
              style={{
                top: cloud.top,
                width: cloud.width,
                aspectRatio: index === 0 ? "537 / 282" : index === 1 ? "359 / 120" : "449 / 215",
                animationDuration: cloud.duration,
                animationDelay: cloud.delay,
              }}
            >
              <Image src={cloud.src} alt="" fill sizes={cloud.width} className="object-contain" unoptimized />
            </div>
          ))}
        </div>

        {/* mountains — farthest, barely moves, first to arrive. Measured
            directly off the source PNG: at the sun's horizontal position
            the peak's opaque content starts only ~7.7% down the image,
            and on a standard 16:9 laptop width that box renders taller
            than the viewport itself. Its original measured offsets remain
            unchanged; celestial clearance is handled by the sun/moon
            position and stacking, not by moving this layer. */}
        <Layer
          entered={entered}
          z={2}
          className="bottom-0 left-0 w-full"
          entranceStyle={off(36)}
          enteredStyle={on}
          delayMs={0}
          scrollY={`calc(${assembleY(26, 23)} + ${responsiveDepthOffset(61.8, 84)} + ${wideMountainNudge()})`}
          pointerAmp={[...POINTER_DEPTH.mountains]}
          scaleBuffer={1.04}
        >
          <DayNightPair
            day="/images/parallax-mountains-day.png"
            night="/images/parallax-mountains-night.png"
            dayDims={[1264, 1621]}
            nightDims={[1264, 1621]}
            box="aspect-[1264/781]"
            priority
          />
        </Layer>

        {/* hills-village — full-bleed like the mountains behind it (not a
            floating island), a genuinely wide, edge-to-edge ridge
            composition (not an isolated hill mound). object-contain, same
            as every other layer — never crop into the artwork itself; a
            hard object-fit crop line is exactly what read as "cutting the
            picture in half" before. The image now carries a generated
            downward safety margin, but its original aspect-ratio box remains
            unchanged so the visible ridge keeps exactly the same geometry. */}
        <Layer
          entered={entered}
          z={3}
          className="bottom-0 left-0 w-full"
          entranceStyle={off(36)}
          enteredStyle={on}
          delayMs={180}
          scrollY={`calc(${assembleY(4, -9)} + ${responsiveDepthOffset(26.1, 36)})`}
          pointerAmp={[...POINTER_DEPTH.hilltopVillage]}
          scaleBuffer={1.14}
        >
          <DayNightPair
            day="/images/parallax-hills-village-day.png"
            night="/images/parallax-hills-village-night.png"
            dayDims={[1264, 1173]}
            nightDims={[1264, 1173]}
            box="aspect-[1264/330]"
            dropShadow
          />
        </Layer>

        {/* main village + streetlights — starts below the viewport, not
            visible at all on load; arrives by moving up during phase A,
            never by fading in. Settles a few vh below its natural
            bottom-anchored spot on purpose: the streetlights/houses/
            fences stay fully visible, but it covers whatever's below
            the image's own visible content instead of leaving it
            exposed at the true viewport edge. */}
        <div aria-hidden className="pointer-events-none absolute bottom-0 left-0 w-full" style={{ zIndex: 4 }}>
          <div
            className="relative origin-bottom scale-[1.14]"
            style={{
              transform: `translate3d(${pointer(...POINTER_DEPTH.foregroundVillage).x}, calc(${assembleY(85, 3)} + ${responsiveDepthOffset(62.6, 86)} + ${pointer(...POINTER_DEPTH.foregroundVillage).y}), 0)`,
            }}
          >
            <DayNightPair
              day="/images/parallax-main-village-day.png"
              night="/images/parallax-main-village-night.png"
              dayDims={[1264, 1618]}
              nightDims={[1264, 1618]}
              box="aspect-[1264/791]"
              dropShadow
            />

            {/* These pools live in the same coordinate space as the
                foreground artwork. Their percentage anchors are measured
                from the 1264 x 791 original composition box, so scaling,
                scroll assembly, and pointer parallax keep each pool tied
                to its painted lamp head. */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{ opacity: reduceMotion ? 0 : DAYNIGHT_T }}
            >
              <div className="streetlight-aura streetlight-aura-primary" />
              <div className="streetlight-aura streetlight-aura-secondary" />
            </div>
          </div>
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
