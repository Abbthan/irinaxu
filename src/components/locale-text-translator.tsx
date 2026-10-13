"use client";

import { useLayoutEffect } from "react";
import { translateWebsiteText } from "@/lib/i18n/dictionary";
import { useLocale } from "@/lib/i18n/locale-provider";

const TRANSLATED_ATTRIBUTES = new Set([
  "placeholder",
  "aria-label",
  "title",
  "alt",
]);
const originalTextByNode = new WeakMap<Text, string>();
const originalAttributesByElement = new WeakMap<Element, Map<string, string>>();

function translateTree(root: Node, locale: "en" | "zh") {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = root instanceof Text ? [root] : [];
  while (walker.nextNode()) textNodes.push(walker.currentNode as Text);

  for (const node of textNodes) {
    const parent = node.parentElement;
    if (
      !parent ||
      parent.closest("[data-no-translate]") ||
      ["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA"].includes(parent.tagName)
    )
      continue;

    const stored = originalTextByNode.get(node);
    // React may reuse a text node when data changes. If it re-rendered a
    // fresh source string, treat that as the new original; if the node just
    // holds our own previous Chinese output, keep the remembered English
    // source instead of treating the Chinese text as "original".
    const original =
      !stored ||
      (node.data !== stored &&
        node.data !== translateWebsiteText(stored, "zh") &&
        node.data !== translateWebsiteText(stored, "en"))
        ? node.data
        : stored;
    originalTextByNode.set(node, original);

    const next = translateWebsiteText(original, locale);
    if (next !== node.data) node.data = next;
  }

  if (!(root instanceof Element)) return;
  const elements = [root, ...Array.from(root.querySelectorAll("*"))];
  for (const element of elements) {
    if (element.closest("[data-no-translate]")) continue;
    for (const attribute of TRANSLATED_ATTRIBUTES) {
      const value = element.getAttribute(attribute);
      if (!value) continue;
      let originals = originalAttributesByElement.get(element);
      if (!originals)
        originalAttributesByElement.set(element, (originals = new Map()));
      const stored = originals.get(attribute);
      const original =
        !stored ||
        (value !== stored &&
          value !== translateWebsiteText(stored, "zh") &&
          value !== translateWebsiteText(stored, "en"))
          ? value
          : stored;
      originals.set(attribute, original);
      const next = translateWebsiteText(original, locale);
      if (next !== value) element.setAttribute(attribute, next);
    }
  }
}

// Pure side-effect component: components are written in plain English with
// zero i18n-specific code, and this walks the rendered DOM after each paint
// to swap text nodes (and a few attributes) based on the current locale.
// See docs/i18n-language-system.md for the full design rationale.
export function LocaleTextTranslator() {
  const { locale } = useLocale();

  useLayoutEffect(() => {
    let translating = false;
    const apply = (root: Node) => {
      translating = true;
      translateTree(root, locale);
      translating = false;
    };
    apply(document.body);

    const observer = new MutationObserver((mutations) => {
      if (translating) return;
      for (const mutation of mutations) {
        if (mutation.type === "characterData" || mutation.type === "attributes") apply(mutation.target);
        else for (const node of mutation.addedNodes) apply(node);
      }
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: [...TRANSLATED_ATTRIBUTES],
    });
    return () => observer.disconnect();
  }, [locale]);

  return null;
}
