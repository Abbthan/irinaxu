"use client";

import { useEffect, useRef } from "react";
import { LanguageToggle } from "./language-toggle";

// Deliberately minimal — just the name and a way to get in touch. Text
// links use mix-blend-mode: difference so the same white text reads dark
// on the paper acts and light on the dark prologue/epilogue, without any
// scroll-position tracking.
export function SiteNav() {
  const titleRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const title = titleRef.current;
    if (!title) return;
    const titleText = title.querySelector<HTMLElement>("[data-home-title-text]");
    let raf = 0;

    const update = () => {
      const transitionDistance = window.innerHeight * 0.16;
      const linearProgress = transitionDistance > 0
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

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-end px-6 py-5 sm:px-10">
      <a
        ref={titleRef}
        href="#top"
        data-home-title
        className="home-title-link fixed top-0 left-0 font-display text-[15px] tracking-[0.14em] text-white uppercase [mix-blend-mode:difference]"
      >
        <span data-home-title-text className="home-title-text--bobbing inline-block">
          Irina Xu
        </span>
      </a>
      <div className="flex items-center gap-6">
        <a
          href="#contact"
          className="font-display text-[13px] tracking-[0.1em] text-white uppercase [mix-blend-mode:difference]"
        >
          Contact
        </a>
        <LanguageToggle />
      </div>
    </header>
  );
}
