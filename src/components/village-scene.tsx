"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

// Original SVG illustration — hand-built shapes (mountains, rooftops, a
// path, lamp posts), not an installed skill or a generated/fabricated
// photo. Reuses rsnc.ai's core trick (scroll state -> visual state) at a
// small scale: each lamp's glow fades in with a staggered delay once the
// scene enters view, so the street lights on one lamp at a time — the
// literal shape of the story this sits inside (Act I, streetlamps for
// kids walking to school). The walking figure is a flat paper-cut-style
// silhouette, deliberately abstract rather than a likeness of anyone real.
//
const STARS = [
  { cx: 60, cy: 60, r: 1.6 }, { cx: 140, cy: 110, r: 1.1 }, { cx: 230, cy: 50, r: 1.4 },
  { cx: 320, cy: 130, r: 1 }, { cx: 400, cy: 70, r: 1.7 }, { cx: 470, cy: 40, r: 1.1 },
  { cx: 90, cy: 180, r: 1 }, { cx: 200, cy: 200, r: 1.3 }, { cx: 610, cy: 90, r: 1.5 },
  { cx: 700, cy: 50, r: 1 }, { cx: 780, cy: 140, r: 1.2 }, { cx: 860, cy: 70, r: 1.6 },
  { cx: 940, cy: 120, r: 1 }, { cx: 1010, cy: 60, r: 1.4 }, { cx: 1080, cy: 150, r: 1.1 },
  { cx: 1140, cy: 90, r: 1.6 }, { cx: 350, cy: 200, r: 1 }, { cx: 540, cy: 170, r: 1.2 },
  { cx: 990, cy: 190, r: 1 }, { cx: 30, cy: 130, r: 1.3 },
] as const;

const HOUSES = [
  { x: 40, w: 85, h: 65, glow: false }, { x: 155, w: 65, h: 50, glow: true },
  { x: 250, w: 95, h: 78, glow: false }, { x: 385, w: 62, h: 48, glow: false },
  { x: 480, w: 80, h: 62, glow: true }, { x: 700, w: 88, h: 70, glow: false },
  { x: 820, w: 66, h: 52, glow: true }, { x: 915, w: 105, h: 82, glow: false },
  { x: 1055, w: 76, h: 58, glow: false }, { x: 1155, w: 55, h: 42, glow: true },
] as const;

const LAMPS = [
  { x: 600, y: 578 }, { x: 545, y: 495 }, { x: 630, y: 420 },
  { x: 570, y: 350 }, { x: 615, y: 288 },
] as const;

const BASE_Y = 540;

export function VillageScene() {
  const reduceMotion = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  // Scroll + getBoundingClientRect, not IntersectionObserver: this test
  // environment throttles/suppresses IntersectionObserver callbacks in
  // ways that didn't reproduce with a plain scroll listener, so this uses
  // the more primitive check instead of chasing that further.
  const [lit, setLit] = useState(false);

  useEffect(() => {
    const node = wrapRef.current;
    if (!node) return;
    const checkVisible = () => {
      const rect = node.getBoundingClientRect();
      const visible = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
      if (visible > rect.height * 0.3) {
        setLit(true);
        window.removeEventListener("scroll", checkVisible);
      }
    };
    checkVisible();
    window.addEventListener("scroll", checkVisible, { passive: true });
    return () => window.removeEventListener("scroll", checkVisible);
  }, []);

  const fade = (opacityWhenLit: number, delaySeconds: number): React.CSSProperties => ({
    opacity: lit ? opacityWhenLit : 0,
    transition: reduceMotion ? "none" : `opacity 1s ease ${delaySeconds}s`,
  });

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-night-sky-deep via-night-sky to-dusk py-20 sm:py-28">
      <div ref={wrapRef} className="mx-auto max-w-6xl px-4">
        <svg
          viewBox="0 0 1200 600"
          className="w-full"
          role="img"
          aria-label="An illustrated rural village at night, with streetlamps lighting one by one along a path"
        >
          {/* stars */}
          {STARS.map((s, i) => (
            <motion.circle
              key={i}
              cx={s.cx}
              cy={s.cy}
              r={s.r}
              fill="var(--color-dusk-ink)"
              initial={{ opacity: 0.15 }}
              animate={reduceMotion ? { opacity: 0.65 } : { opacity: [0.2, 0.75, 0.2] }}
              transition={{ duration: 3.5 + (i % 5), repeat: Infinity, ease: "easeInOut", delay: (i % 7) * 0.4 }}
            />
          ))}

          {/* moon — kept clear of the top-right corner, where the fixed
              nav's language toggle can sit once this section fills the
              viewport */}
          <circle cx={940} cy={165} r={60} fill="var(--color-light-soft)" opacity={0.06} />
          <circle cx={940} cy={165} r={26} fill="var(--color-dusk-ink)" opacity={0.85} />

          {/* far mountains */}
          <polygon
            points="0,420 100,360 220,400 340,320 460,380 600,340 740,390 860,330 1000,385 1120,350 1200,400 1200,600 0,600"
            fill="var(--color-mountain-far)"
          />
          {/* near hills */}
          <polygon
            points="0,480 150,430 300,460 450,410 620,450 800,420 950,460 1100,430 1200,470 1200,600 0,600"
            fill="var(--color-mountain-near)"
          />

          {/* path */}
          <path
            d="M 600 600 C 560 520, 640 500, 600 460 C 560 430, 660 400, 630 360 C 600 330, 660 300, 615 270"
            fill="none"
            stroke="var(--color-path)"
            strokeWidth={16}
            strokeLinecap="round"
            opacity={0.55}
          />

          {/* village rooftops */}
          {HOUSES.map((house, i) => (
            <g key={i}>
              <rect
                x={house.x}
                y={BASE_Y - house.h}
                width={house.w}
                height={house.h}
                fill="var(--color-roof)"
              />
              <polygon
                points={`${house.x - 10},${BASE_Y - house.h} ${house.x + house.w / 2},${BASE_Y - house.h - house.h * 0.55} ${house.x + house.w + 10},${BASE_Y - house.h}`}
                fill="var(--color-roof)"
              />
              {house.glow && (
                <rect
                  x={house.x + house.w * 0.3}
                  y={BASE_Y - house.h * 0.45}
                  width={house.w * 0.22}
                  height={house.h * 0.22}
                  fill="var(--color-light)"
                  style={fade(0.8, 0.4 + i * 0.15)}
                />
              )}
            </g>
          ))}

          {/* lamp posts, lighting one by one */}
          {LAMPS.map((lamp, i) => (
            <g key={i}>
              <line
                x1={lamp.x}
                y1={lamp.y}
                x2={lamp.x}
                y2={lamp.y - 34}
                stroke="var(--color-roof)"
                strokeWidth={3}
              />
              <circle
                cx={lamp.x}
                cy={lamp.y - 60}
                r={22}
                fill="var(--color-light)"
                style={fade(0.22, 0.3 + i * 0.4)}
              />
              <line x1={lamp.x} y1={lamp.y - 34} x2={lamp.x} y2={lamp.y - 38} stroke="var(--color-roof)" strokeWidth={3} />
              <circle
                cx={lamp.x}
                cy={lamp.y - 38}
                r={5}
                fill="var(--color-light-soft)"
                style={fade(1, 0.3 + i * 0.4)}
              />
            </g>
          ))}

          {/* walking figure — flat silhouette, not a likeness of anyone real */}
          <g style={{ ...fade(0.92, 1.6), transform: lit ? "translateX(0)" : "translateX(-10px)" }}>
            <circle cx={560} cy={500} r={9} fill="var(--color-dusk-ink)" />
            <path
              d="M 560 509 C 552 525, 550 545, 556 560 L 566 560 C 568 545, 566 528, 572 512 C 574 525, 578 545, 586 558 L 596 556 C 588 538, 582 518, 574 508 C 570 505, 564 505, 560 509 Z"
              fill="var(--color-dusk-ink)"
            />
          </g>
        </svg>

        <p
          style={fade(1, 2.6)}
          className="mt-6 text-center font-hand text-xl text-dusk-ink/60"
        >
          One lamp at a time, the walk home got safer.
        </p>
      </div>
    </section>
  );
}
