"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useInView } from "framer-motion";
import { homeMetrics } from "@/content/activities";

function AnimatedMetric({ value, label, delay }: { value: string; label: string; delay: number }) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const [display, setDisplay] = useState(reduceMotion ? value : "0");

  useEffect(() => {
    if (!inView || reduceMotion) {
      setDisplay(value);
      return;
    }
    const match = value.match(/^([\d,]+)(.*)$/);
    if (!match) {
      setDisplay(value);
      return;
    }
    const target = Number(match[1].replace(/,/g, ""));
    const suffix = match[2];
    const duration = 1200;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = Math.round(target * eased);
      setDisplay(`${current.toLocaleString("en-US")}${suffix}`);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduceMotion, value]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: reduceMotion ? 0 : 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
      className="border-t border-ink/12 pt-6"
    >
      <p className="font-display text-[clamp(2.4rem,5vw,3.4rem)] font-light leading-none tracking-tight text-ember">
        {display}
      </p>
      <p className="mt-4 font-body text-[15px] leading-snug text-ink/65">{label}</p>
    </motion.div>
  );
}

export function MetricsBand() {
  const reduceMotion = useReducedMotion();
  const reveal = {
    initial: { opacity: 0, y: reduceMotion ? 0 : 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.35 },
    transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] as const },
  };

  return (
    <section
      id="impact"
      aria-label="Impact at a glance"
      className="relative overflow-hidden border-y border-ink/8 bg-paper px-6 py-24 sm:px-10 sm:py-32"
    >
      <div
        aria-hidden
        className="metrics-glow pointer-events-none absolute inset-0 opacity-70"
      />

      <div className="relative mx-auto max-w-5xl">
        <motion.div {...reveal} className="mb-14 max-w-2xl">
          <p className="font-hand text-xl text-ember">At a glance</p>
          <h2 className="mt-3 font-display text-[clamp(1.8rem,3.6vw,2.6rem)] font-light text-ink text-wrap-balance">
            Numbers that still feel like light
          </h2>
          <p className="mt-4 max-w-[48ch] font-body text-[17px] leading-relaxed text-ink/70">
            The scale is real. The point is not the scale — it is who the light reached.
          </p>
        </motion.div>

        <div className="grid gap-x-10 gap-y-14 sm:grid-cols-2 lg:grid-cols-5">
          {homeMetrics.map((metric, index) => (
            <AnimatedMetric
              key={metric.label}
              value={metric.value}
              label={metric.label}
              delay={reduceMotion ? 0 : 0.06 * index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
