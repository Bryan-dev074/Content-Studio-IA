"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { SceneCard } from "./SceneCard";
import { LocutionPanel } from "./LocutionPanel";
import { CostTable } from "./CostTable";
import { LoadingState } from "./LoadingState";
import { SegmentedToggle } from "./SegmentedToggle";
import { CatLogo } from "./CatLogo";
import { DownloadIcon, GlobeIcon, SparklesIcon } from "./icons";
import { useI18n } from "./providers/I18nProvider";
import { scriptToMarkdown } from "@/lib/export";
import { LANGS } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { Lang, Localized, ScriptResult } from "@/lib/types";

const LAYER_CLS: Record<string, string> = {
  visual: "bg-accent/15 text-accent",
  auditiva: "bg-primary/15 text-primary",
  psicologica: "bg-success/15 text-success",
};

export function ResultsPanel({
  result,
  loading,
  error,
  example = false,
}: {
  result: ScriptResult | null;
  loading: boolean;
  error: string;
  example?: boolean;
}) {
  const { t, lang: uiLang } = useI18n();
  const [data, setData] = useState<ScriptResult | null>(null);
  const [scriptLang, setScriptLang] = useState<Lang>(uiLang);

  useEffect(() => {
    if (result) setData(structuredClone(result));
  }, [result]);

  useEffect(() => {
    setScriptLang(uiLang);
  }, [uiLang]);

  const updatePrompt = (
    sceneId: string,
    promptId: string,
    content: Localized,
  ) => {
    setData((prev) =>
      !prev
        ? prev
        : {
            ...prev,
            scenes: prev.scenes.map((s) =>
              s.id !== sceneId
                ? s
                : {
                    ...s,
                    prompts: s.prompts.map((p) =>
                      p.id !== promptId ? p : { ...p, content },
                    ),
                  },
            ),
          },
    );
  };

  const download = () => {
    if (!data) return;
    const md = scriptToMarkdown(data, scriptLang);
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `guion-elabela-${scriptLang}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <LoadingState />;

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl border-l-4 border-l-danger p-6 shadow-soft"
      >
        <p className="font-semibold text-danger">{t.errorGeneric}</p>
        <p className="mt-1 text-sm text-muted">{error}</p>
      </motion.div>
    );
  }

  if (!data) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass flex min-h-[420px] flex-col items-center justify-center gap-5 rounded-2xl p-10 text-center shadow-soft"
      >
        <div className="grid h-24 w-24 place-items-center rounded-3xl border border-border bg-surface-2/50 shadow-soft">
          <CatLogo className="h-16 w-16" />
        </div>
        <div>
          <h3 className="font-serif text-2xl font-semibold text-foreground">
            {t.resultsEmptyTitle}
          </h3>
          <p className="mt-2 max-w-sm text-sm text-muted">
            {t.resultsEmptySubtitle}
          </p>
        </div>
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2.4, repeat: Infinity }}
          className="text-accent"
        >
          <SparklesIcon className="h-6 w-6" />
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-5"
    >
      {/* Encabezado del resultado */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-5 shadow-soft sm:p-6"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              {example && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-accent">
                  {t.exampleBadge}
                </span>
              )}
              <span className="gradient-primary inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-primary-foreground">
                <SparklesIcon className="h-3 w-3" />
                {data.productionMode === "hibrido" ? t.modeHybrid : t.modeIA}
              </span>
            </div>
            <h2 className="mt-2 font-serif text-2xl font-semibold leading-tight text-foreground sm:text-3xl">
              {data.title[scriptLang]}
            </h2>
            <p className="mt-1.5 max-w-2xl text-[15px] text-muted">
              {data.summary[scriptLang]}
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <span className="flex items-center gap-1.5 text-xs font-medium text-muted">
              <GlobeIcon className="h-3.5 w-3.5" />
              {t.scriptLanguage}
            </span>
            <SegmentedToggle<Lang>
              layoutId="script-lang-pill"
              size="sm"
              value={scriptLang}
              onChange={setScriptLang}
              options={LANGS.map((l) => ({
                value: l.code,
                label: `${l.flag} ${l.code.toUpperCase()}`,
              }))}
            />
          </div>
        </div>

        {/* Estrategia del gancho */}
        <div className="mt-4 rounded-xl border border-accent/30 bg-accent/5 p-3.5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-accent">
            {t.hookStrategy}
          </p>
          <p className="mt-1 text-sm text-foreground/90">
            {data.hookStrategy[scriptLang]}
          </p>
        </div>

        {/* Análisis */}
        {data.analysis?.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">
              {t.analysisTitle}
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {data.analysis.map((a, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i }}
                  className="rounded-lg border border-border bg-surface-2/40 p-3"
                >
                  <span
                    className={cn(
                      "rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                      LAYER_CLS[a.layer] ?? LAYER_CLS.visual,
                    )}
                  >
                    {a.label[scriptLang]}
                  </span>
                  <p className="mt-1.5 text-sm text-foreground/85">
                    {a.finding[scriptLang]}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Acciones */}
        <div className="mt-5 flex flex-wrap gap-2">
          <motion.button
            type="button"
            onClick={download}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface/60 px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-accent/50"
          >
            <DownloadIcon className="h-4 w-4" />
            {t.download}
          </motion.button>
        </div>
      </motion.div>

      {/* Locución para ElevenLabs */}
      <LocutionPanel
        scenes={data.scenes}
        mode={data.productionMode}
        lang={scriptLang}
      />

      {/* Guion: escenas */}
      <div className="space-y-4">
        <h3 className="px-1 font-serif text-xl font-semibold text-foreground">
          {t.scriptTitle}
        </h3>
        {data.scenes.map((scene, i) => (
          <SceneCard
            key={scene.id}
            scene={scene}
            index={i}
            lang={scriptLang}
            productionMode={data.productionMode}
            onUpdatePrompt={(promptId, content) =>
              updatePrompt(scene.id, promptId, content)
            }
          />
        ))}
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="gradient-primary rounded-2xl p-5 text-center shadow-soft"
      >
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-primary-foreground/80">
          CTA
        </p>
        <p className="mt-1.5 font-serif text-xl font-semibold text-primary-foreground sm:text-2xl">
          {data.cta[scriptLang]}
        </p>
      </motion.div>

      {/* Costos */}
      {data.costs && <CostTable costs={data.costs} lang={scriptLang} />}
    </motion.div>
  );
}
