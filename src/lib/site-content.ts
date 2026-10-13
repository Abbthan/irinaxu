export type TextOverride = { en: string; zh: string };
export type SiteContent = { version: 1; text: Record<string, TextOverride> };

export function parseSiteContent(value: unknown): SiteContent {
  if (
    !value ||
    typeof value !== "object" ||
    !("version" in value) ||
    value.version !== 1 ||
    !("text" in value) ||
    !value.text ||
    typeof value.text !== "object" ||
    Array.isArray(value.text)
  ) {
    throw new Error(
      "Invalid content file. Expected version 1 and a text dictionary.",
    );
  }
  const text: Record<string, TextOverride> = Object.create(null);
  const entries = Object.entries(value.text);
  if (entries.length > 1000) throw new Error("Too many text entries.");
  for (const [source, translation] of entries) {
    if (
      !translation ||
      typeof translation !== "object" ||
      !("en" in translation) ||
      !("zh" in translation) ||
      typeof translation.en !== "string" ||
      typeof translation.zh !== "string" ||
      Math.max(source.length, translation.en.length, translation.zh.length) >
        20000
    ) {
      throw new Error(
        "Each text entry must contain English and Chinese strings.",
      );
    }
    text[source] = { en: translation.en, zh: translation.zh };
  }
  return { version: 1, text };
}

export function renderWebsiteText(
  value: string,
  locale: "en" | "zh",
  content: SiteContent,
  defaults: Readonly<Record<string, string>>,
) {
  const leading = value.match(/^\s*/)?.[0] ?? "";
  const trailing = value.match(/\s*$/)?.[0] ?? "";
  const core = value.trim();
  if (!core) return value;
  const override = Object.hasOwn(content.text, core)
    ? content.text[core]
    : undefined;
  const next = override
    ? override[locale]
    : locale === "zh" && Object.hasOwn(defaults, core)
      ? defaults[core]
      : core;
  return `${leading}${next}${trailing}`;
}
