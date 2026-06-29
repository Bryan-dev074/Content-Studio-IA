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
import type { GenerateRequest, ProductionMode, ScriptResult } from "@/lib/types";

export default function Home() {
  const { t } = useI18n();
  const [result, setResult] = useState<ScriptResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isExample, setIsExample] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const scrollToResults = () => {
    setTimeout(() => {
      if (window.innerWidth < 1024) {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 60);
  };

  const showExample = (mode: ProductionMode) => {
    setError("");
    setLoading(false);
    setIsExample(true);
    setResult(mode === "hibrido" ? demoScriptHybrid : demoScript);
    scrollToResults();
  };

  const generate = async (req: GenerateRequest) => {
    setLoading(true);
    setError("");
    setIsExample(false);
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

      <main className="mx-auto max-w-7xl px-3 pb-24 pt-10 sm:px-5">
        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mb-10 max-w-3xl text-center"
        >
          <h1 className="font-serif text-4xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-5xl md:text-6xl">
            {t.heroTitle}{" "}
            <span className="text-gradient">{t.heroHighlight}</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-base text-muted sm:text-lg">
            {t.heroLead}
          </p>
        </motion.section>

        {/* Layout principal */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,460px)_1fr]">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <InputPanel
              onGenerate={generate}
              onExample={showExample}
              loading={loading}
            />
          </div>
          <div ref={resultsRef} className="scroll-mt-24">
            <ResultsPanel
              result={result}
              loading={loading}
              error={error}
              example={isExample}
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
