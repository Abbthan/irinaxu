export type SupportedLocale = "en" | "zh";

export const LANGUAGE_STORAGE_KEY = "language-preference";

export function isSupportedLocale(value: unknown): value is SupportedLocale {
  return value === "en" || value === "zh";
}

export function localeFromSystemLanguage(language: string | undefined): SupportedLocale {
  return (language ?? "en").toLowerCase().indexOf("zh") === 0 ? "zh" : "en";
}
