"use client";

import { useEffect, useRef, useState } from "react";
import { TITLE_TRANSITION_VH } from "@/lib/scroll-timing";
import { cn } from "@/lib/cn";

function surfaceIsPaper(x: number, y: number, header: HTMLElement | null): boolean {
  if (header) header.style.pointerEvents = "none";
  const under = document.elementFromPoint(x, y);
  if (header) header.style.pointerEvents = "";

  let node: Element | null = under;
  while (node && node !== document.documentElement) {
    if (node instanceof HTMLElement) {
      const marked = node.dataset.navSurface;
      if (marked === "paper") return true;
      if (marked === "dusk") return false;

      const cls = typeof node.className === "string" ? node.className : "";
      if (
        cls.includes("bg-paper") ||
        cls.includes("bg-[linear-gradient") ||
        cls.includes("from-paper")
      ) {
        return true;
      }
      if (
        cls.includes("bg-ink") ||
        cls.includes("bg-dusk") ||
        cls.includes("from-dusk") ||
        cls.includes("bg-black")
      ) {
        return false;
      }
    }
    node = node.parentElement;
  }
  return false;
}

export function SiteNav() {
  const headerRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLAnchorElement>(null);
  const scrollPromptRef = useRef<HTMLDivElement>(null);
  const [docked, setDocked] = useState(false);
  const [onPaper, setOnPaper] = useState(false);

  useEffect(() => {
    const title = titleRef.current;
    if (!title) return;
    const titleText = title.querySelector<HTMLElement>("[data-home-title-text]");
    let raf = 0;

    const update = () => {
      const transitionDistance = window.innerHeight * (TITLE_TRANSITION_VH / 100);
      const linearProgress =
        transitionDistance > 0
          ? Math.min(1, Math.max(0, window.scrollY / transitionDistance))
          : 1;
      const progress = 1 - Math.pow(1 - linearProgress, 3);
      const width = title.offsetWidth;
      const height = title.offsetHeight;
      const startX = (window.innerWidth - width) / 2;
      const startY = (window.innerHeight - height) / 2;
      const endX = window.innerWidth >= 640 ? 40 : 24;
      const endY = 20;
      const largeScale = Math.min(6.4, Math.max(4.5, window.innerWidth / 240));
      const x = startX + (endX - startX) * progress;
      const y = startY + (endY - startY) * progress;
      const scale = largeScale + (1 - largeScale) * progress;

      title.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`;
      titleText?.classList.toggle("home-title-text--bobbing", linearProgress <= 0.001);
      if (scrollPromptRef.current) {
        scrollPromptRef.current.style.opacity = (1 - linearProgress).toFixed(3);
      }

      const isDocked = linearProgress > 0.85;
      setDocked(isDocked);
      if (isDocked) {
        const probeX = window.innerWidth >= 640 ? 56 : 40;
        setOnPaper(surfaceIsPaper(probeX, 28, headerRef.current));
      } else {
        setOnPaper(false);
      }
      raf = 0;
    };

    const scheduleUpdate = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const inkOnPaper = docked && onPaper;
  const inkOnDusk = docked && !onPaper;

  const linkClass = cn(
    "font-display text-[13px] tracking-[0.1em] uppercase transition-colors duration-300",
    inkOnPaper && "text-ink [text-shadow:0_1px_0_rgba(246,239,223,0.9)]",
    inkOnDusk &&
      "text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.95),0_0_12px_rgba(0,0,0,0.65),0_0_2px_rgba(0,0,0,1)]",
    !docked && "text-white [mix-blend-mode:difference]",
  );

  return (
    <header
      ref={headerRef}
      className="fixed inset-x-0 top-0 z-50 flex items-center justify-end px-6 py-5 sm:px-10"
    >
      <a
        ref={titleRef}
        href="#top"
        data-home-title
        className={cn(
          "home-title-link fixed top-0 left-0 font-display text-[15px] tracking-[0.14em] uppercase transition-[color,text-shadow] duration-300",
          inkOnPaper &&
            "text-ink [text-shadow:0_1px_0_rgba(246,239,223,0.95)]",
          inkOnDusk &&
            "font-medium text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.95),0_0_16px_rgba(0,0,0,0.7),0_0_3px_rgba(0,0,0,1)]",
          !docked && "text-white [mix-blend-mode:difference]",
        )}
      >
        <span data-home-title-text className="home-title-text--bobbing inline-block">
          Irina Xu
        </span>
      </a>
      <div className="flex items-center gap-6">
        <a href="#chapters" className={linkClass}>
          Chapters
        </a>
        <a href="#contact" className={linkClass}>
          Contact
        </a>
      </div>
      <div
        ref={scrollPromptRef}
        aria-hidden
        data-opening-scroll-prompt
        className="pointer-events-none fixed inset-x-0 bottom-10 flex justify-center text-white [filter:drop-shadow(0_1px_5px_rgba(0,0,0,0.65))_drop-shadow(0_0_10px_rgba(255,255,255,0.35))]"
      >
        <div className="scroll-invitation flex flex-col items-center gap-2">
          <span className="font-hand text-lg">Scroll to begin</span>
          <span className="h-8 w-px bg-white [box-shadow:0_0_8px_rgba(255,255,255,0.8)]" />
        </div>
      </div>
    </header>
  );
}
