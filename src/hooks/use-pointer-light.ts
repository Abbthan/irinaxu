"use client";

import { useEffect, type RefObject } from "react";

/** Smoothly tracks the pointer into CSS vars `--beam-x` / `--beam-y` on a stage. */
export function usePointerLight(
  stageRef: RefObject<HTMLElement | null>,
  enabled: boolean,
  defaults: { x: number; y: number } = { x: 50, y: 40 },
) {
  useEffect(() => {
    if (!enabled) return;
    const stage = stageRef.current;
    if (!stage) return;

    let raf = 0;
    let targetX = defaults.x;
    let targetY = defaults.y;
    let currentX = defaults.x;
    let currentY = defaults.y;
    let pointerSeen = false;
    let pointerClientX = 0;
    let pointerClientY = 0;

    const onPointerMove = (event: PointerEvent) => {
      pointerSeen = true;
      pointerClientX = event.clientX;
      pointerClientY = event.clientY;
    };

    const tick = () => {
      if (pointerSeen) {
        const rect = stage.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          targetX = ((pointerClientX - rect.left) / rect.width) * 100;
          targetY = ((pointerClientY - rect.top) / rect.height) * 100;
        }
      }
      currentX += (targetX - currentX) * 0.055;
      currentY += (targetY - currentY) * 0.055;
      stage.style.setProperty("--beam-x", `${currentX}%`);
      stage.style.setProperty("--beam-y", `${currentY}%`);
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      cancelAnimationFrame(raf);
    };
  }, [enabled, stageRef, defaults.x, defaults.y]);
}
