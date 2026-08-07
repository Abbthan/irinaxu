import { LanguageToggle } from "./language-toggle";

// Deliberately minimal — just the name and a way to get in touch. Text
// links use mix-blend-mode: difference so the same white text reads dark
// on the paper acts and light on the dark prologue/epilogue, without any
// scroll-position tracking.
export function SiteNav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-6 py-5 sm:px-10">
      <a
        href="#top"
        className="font-display text-[15px] tracking-[0.14em] text-white uppercase [mix-blend-mode:difference]"
      >
        Irina
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
