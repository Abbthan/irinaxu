"use client";

import { motion, useScroll } from "framer-motion";

// A thin filament fixed to the left edge that fills with warm light as the
// reader moves through the story — a lit wick standing in for the
// day/night parallax rig on rsnc.ai, without needing painted art layers.
export function ScrollLightLine() {
  const { scrollYProgress } = useScroll();

  return (
    <div
      aria-hidden
      className="fixed left-4 top-0 bottom-0 z-40 hidden w-px bg-ink/10 sm:block"
    >
      <motion.div
        style={{ scaleY: scrollYProgress }}
        className="h-full w-full origin-top bg-gradient-to-b from-light via-ember to-light"
      />
    </div>
  );
}
