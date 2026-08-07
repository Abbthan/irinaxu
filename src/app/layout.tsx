import type { Metadata } from "next";
import { Fraunces, Newsreader, Caveat } from "next/font/google";
import { LocaleProvider, PREPAINT_LOCALE_SCRIPT } from "@/lib/i18n/locale-provider";
import { LocaleTextTranslator } from "@/components/locale-text-translator";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
  weight: "variable",
  style: ["normal", "italic"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["500", "600"],
});

export const metadata: Metadata = {
  title: "Irina — Chasing Light",
  description: "What is light? A story in five parts.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${newsreader.variable} ${caveat.variable} h-full antialiased`}
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
