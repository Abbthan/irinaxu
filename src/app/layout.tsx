import type { Metadata } from "next";
import { LocaleProvider, PREPAINT_LOCALE_SCRIPT } from "@/lib/i18n/locale-provider";
import { LocaleTextTranslator } from "@/components/locale-text-translator";
import "@fontsource-variable/fraunces/full.css";
import "@fontsource-variable/fraunces/full-italic.css";
import "@fontsource-variable/newsreader/wght.css";
import "@fontsource-variable/newsreader/wght-italic.css";
import "@fontsource-variable/caveat/wght.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Irina — Chasing Light",
  description: "What is light? A story in five parts.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <head>
        {/* Runs before hydration so the first paint is already in the right
            language instead of flashing English first. */}
        <script dangerouslySetInnerHTML={{ __html: PREPAINT_LOCALE_SCRIPT }} />
      </head>
      <body className="min-h-full">
        <LocaleProvider>
          <LocaleTextTranslator />
          {children}
        </LocaleProvider>
      </body>
    </html>
  );
}
