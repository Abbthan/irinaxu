"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { useLocale } from "@/lib/i18n/locale-provider";

// Both flags shown at once in opposite corners, rather than a dropdown —
// reads as a physical toggle. Mechanism ported from
// docs/i18n-language-system.md; only the chrome (size, ring color) is
// restyled to sit quietly in the site's warm paper-and-ember nav.
export function LanguageToggle() {
  const { locale, toggleLocale } = useLocale();
  const englishSelected = locale === "en";

  return (
    <motion.button
      type="button"
      onClick={toggleLocale}
      aria-label={englishSelected ? "Switch language to Chinese" : "Switch language to English"}
      suppressHydrationWarning
      whileTap={{ scale: 0.86 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 460, damping: 21, mass: 0.45 }}
      className="relative flex h-9 w-11 items-center justify-center"
    >
      <span
        className={cn(
          "pointer-events-none absolute left-[6px] top-[4px] text-[15px] transition-all duration-200",
          englishSelected ? "opacity-100 grayscale-0" : "opacity-35 grayscale",
        )}
      >
        🇺🇸
      </span>
      <span
        className={cn(
          "pointer-events-none absolute bottom-[4px] right-[6px] text-[15px] transition-all duration-200",
          englishSelected ? "opacity-35 grayscale" : "opacity-100 grayscale-0",
        )}
      >
        🇨🇳
      </span>
    </motion.button>
  );
}
