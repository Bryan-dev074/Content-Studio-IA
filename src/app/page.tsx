"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { CatLogo } from "@/components/CatLogo";
import { GithubIcon } from "@/components/icons";
import { Background } from "@/components/Background";
import { InputPanel } from "@/components/InputPanel";
import { ResultsPanel } from "@/components/ResultsPanel";
import { useI18n } from "@/components/providers/I18nProvider";
import { demoScript, demoScriptHybrid } from "@/lib/demo";
import type {
  GenerateRequest,
  ProductInput,
  ProductionMode,
  ScriptResult,
} from "@/lib/types";

type Brief = { niche?: string; tone?: string; products?: ProductInput[] };

export default function Home() {
  const { t } = useI18n();
  const [result, setResult] = useState<ScriptResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isExample, setIsExample] = useState(false);
  const [brief, setBrief] = useState<Brief | undefined>(undefined);
  const [estimateSec, setEstimateSec] = useState(50);
  const resultsRef = useRef<HTMLDivElement>(null);

  const scrollToResults = () => {
    setTimeout(() => {
      // En todos los tamaños: lleva la vista a donde empieza a verse el contenido.
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  };

  const showExample = (mode: ProductionMode) => {
    setError("");
    setLoading(false);
    setIsExample(true);
    setBrief(undefined);
    setResult(mode === "hibrido" ? demoScriptHybrid : demoScript);
    scrollToResults();
  };

  const generate = async (req: GenerateRequest) => {
    setLoading(true);
    setError("");
    setIsExample(false);
    setBrief({ niche: req.niche, tone: req.tone, products: req.products });
    // Estimación: analizar un video tarda más (y crece con su duración).
    // (Una generación solo-texto ronda ~60s; con video sube bastante.)
    setEstimateSec(
      req.videoFileUri
        ? Math.min(150, 65 + Math.round((req.videoDurationSec ?? 20) * 0.7))
        : 50,
    );
    scrollToResults();

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t.errorGeneric);
      setResult(data as ScriptResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errorGeneric);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Background />
      <Header />

      <main className="mx-auto max-w-7xl px-3 pb-20 pt-6 sm:px-5 sm:pb-24 sm:pt-10">
        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mb-8 max-w-3xl text-center sm:mb-10"
        >
          <h1 className="font-serif text-4xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-5xl md:text-6xl">
            {t.heroTitle}{" "}
            <span className="text-gradient">{t.heroHighlight}</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-base text-muted sm:text-lg">
            {t.heroLead}
          </p>
        </motion.section>

        {/* Layout principal. min-w-0 en las columnas evita que el contenido
            fuerce un ancho mayor que la pantalla (overflow horizontal en móvil). */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,460px)_minmax(0,1fr)] lg:items-start">
          {/* Columna de entrada: en escritorio scrollea por su cuenta (overflow
              propio) para no depender del scroll global de la página. */}
          <div className="min-w-0 nice-scroll scroll-fade-y lg:sticky lg:top-24 lg:max-h-[calc(100dvh-7rem)] lg:self-start lg:overflow-y-auto lg:overscroll-contain lg:py-1.5 lg:pr-1.5">
            <InputPanel
              onGenerate={generate}
              onExample={showExample}
              loading={loading}
            />
          </div>
          <div ref={resultsRef} className="min-w-0 scroll-mt-20 sm:scroll-mt-24">
            <ResultsPanel
              result={result}
              loading={loading}
              error={error}
              example={isExample}
              brief={brief}
              estimateSec={estimateSec}
            />
          </div>
        </div>
      </main>

      <footer className="flex flex-col items-center justify-center gap-3 border-t border-border py-8 text-center text-sm text-muted">
        <div className="flex items-center gap-2">
          <CatLogo className="h-5 w-5" />
          <span>
            <span className="font-serif text-foreground">{t.appName}</span> ·{" "}
            {t.footerNote}
          </span>
        </div>
        <a
          href="https://github.com/Bryan-dev074"
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-4 py-2 font-medium text-foreground transition-all hover:border-accent/50 hover:shadow-soft"
        >
          <GithubIcon className="h-4 w-4 transition-transform group-hover:scale-110" />
          {t.createdBy}{" "}
          <span className="text-gradient font-semibold">Bryan-dev074</span>
        </a>
      </footer>
    </>
  );
}
