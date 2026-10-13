"use client";

import { useLayoutEffect } from "react";
import { translateEnglishToChinese } from "@/lib/i18n/dictionary";
import { useLocale } from "@/lib/i18n/locale-provider";

const TRANSLATED_ATTRIBUTES = new Set(["placeholder", "aria-label", "title", "alt"]);
const originalTextByNode = new WeakMap<Text, string>();
const originalAttributesByElement = new WeakMap<Element, Map<string, string>>();

function translateTree(root: Node, locale: "en" | "zh") {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode as Text);

  for (const node of textNodes) {
    const parent = node.parentElement;
    if (!parent || ["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA"].includes(parent.tagName)) continue;

    const stored = originalTextByNode.get(node);
    // React may reuse a text node when data changes. If it re-rendered a
    // fresh source string, treat that as the new original; if the node just
    // holds our own previous Chinese output, keep the remembered English
    // source instead of treating the Chinese text as "original".
    const original =
      !stored || (node.data !== stored && node.data !== translateEnglishToChinese(stored))
        ? node.data
        : stored;
    originalTextByNode.set(node, original);

    const next = locale === "zh" ? translateEnglishToChinese(original) : original;
    if (next !== node.data) node.data = next;
  }

  if (!(root instanceof Element)) return;
  const elements = [root, ...Array.from(root.querySelectorAll("*"))];
  for (const element of elements) {
    for (const attribute of TRANSLATED_ATTRIBUTES) {
      const value = element.getAttribute(attribute);
      if (!value) continue;
      let originals = originalAttributesByElement.get(element);
      if (!originals) originalAttributesByElement.set(element, (originals = new Map()));
      const stored = originals.get(attribute);
      const original =
        !stored || (value !== stored && value !== translateEnglishToChinese(stored)) ? value : stored;
      originals.set(attribute, original);
      const next = locale === "zh" ? translateEnglishToChinese(original) : original;
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
        if (mutation.type === "characterData") apply(mutation.target);
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
