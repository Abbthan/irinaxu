"use client";

import { createContext, useCallback, useContext, useLayoutEffect, useState } from "react";
import {
  LANGUAGE_STORAGE_KEY,
  isSupportedLocale,
  localeFromSystemLanguage,
  type SupportedLocale,
} from "./types";

// The pre-paint script (see layout.tsx) already stamped the real locale onto
// <html data-language>, localStorage, and <html lang> before React hydrates.
// This just reads that back so there's no flash of the wrong language.
function detectClientLocale(): SupportedLocale {
  const prepaintLocale = document.documentElement.dataset.language;
  if (isSupportedLocale(prepaintLocale)) return prepaintLocale;
  const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return isSupportedLocale(stored) ? stored : localeFromSystemLanguage(navigator.language);
}

interface LocaleContextValue {
  locale: SupportedLocale;
  setLocale: (next: SupportedLocale) => void;
  toggleLocale: () => void;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  // Matches what the server rendered (SSR has no localStorage) — corrected
  // synchronously below, before paint, so it never visibly flashes.
  const [locale, setLocaleState] = useState<SupportedLocale>("en");

  useLayoutEffect(() => {
    // Deliberate one-time correction, not a state-sync loop: SSR always
    // renders "en" (no localStorage on the server), so the real locale can
    // only be known once we're on the client. This effect runs once, reads
    // it, and stops — see docs/i18n-language-system.md.
    const detected = detectClientLocale();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (detected !== locale) setLocaleState(detected);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useLayoutEffect(() => {
    document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
    document.documentElement.dataset.language = locale;
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, locale);
  }, [locale]);

  const setLocale = useCallback((next: SupportedLocale) => setLocaleState(next), []);
  const toggleLocale = useCallback(
    () => setLocaleState((current) => (current === "zh" ? "en" : "zh")),
    [],
  );

  return (
    <LocaleContext.Provider value={{ locale, setLocale, toggleLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  const context = useContext(LocaleContext);
  if (!context) throw new Error("useLocale must be used within a LocaleProvider");
  return context;
}

// Inlined verbatim into <head> as a synchronous <script> in layout.tsx —
// runs before hydration so the very first paint is already in the right
// language instead of flashing English first.
export const PREPAINT_LOCALE_SCRIPT = `
(function(){
  try {
    var s = localStorage.getItem('${LANGUAGE_STORAGE_KEY}');
    var l = (s === 'en' || s === 'zh') ? s
          : ((navigator.language || 'en').toLowerCase().indexOf('zh') === 0 ? 'zh' : 'en');
    document.documentElement.dataset.language = l;
    document.documentElement.lang = l === 'zh' ? 'zh-CN' : 'en';
  } catch (e) {}
})();
`;
