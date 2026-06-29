import type { Metadata, Viewport } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { I18nProvider } from "@/components/providers/I18nProvider";
import { CustomCursor } from "@/components/CustomCursor";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Content Studio IA — Generador de guiones con IA",
  description:
    "Estudio creativo con IA: analiza un anuncio ganador y produce un guion impecable, segundo a segundo, en español y portugués.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f7fc" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0d17" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${fraunces.variable} ${jakarta.variable}`}
    >
      <body>
        <ThemeProvider>
          <I18nProvider>
            {children}
            <CustomCursor />
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
