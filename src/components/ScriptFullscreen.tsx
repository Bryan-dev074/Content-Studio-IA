"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CopyButton } from "./CopyButton";
import { SegmentedToggle } from "./SegmentedToggle";
import { AudioIcon, CameraIcon, CloseIcon, SparklesIcon } from "./icons";
import { useI18n } from "./providers/I18nProvider";
import { LANGS } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { Lang, PromptBlock, ScriptResult } from "@/lib/types";

const KIND_CLS: Record<PromptBlock["kind"], string> = {
  "imagen-0c": "bg-accent/15 text-accent",
  animacion: "bg-primary/15 text-primary",
  "fondo-chroma": "bg-success/15 text-success",
  lipsync: "bg-accent-2/20 text-accent-2",
};
const KIND_LABEL: Record<PromptBlock["kind"], string> = {
  "imagen-0c": "Imagen 0c",
  animacion: "Animación",
  "fondo-chroma": "Fondo / Chroma",
  lipsync: "Lipsync",
};

export function ScriptFullscreen({
  open,
  data,
  lang,
  onLang,
  onClose,
}: {
  open: boolean;
  data: ScriptResult | null;
  lang: Lang;
  onLang: (l: Lang) => void;
  onClose: () => void;
}) {
  const { t } = useI18n();

  return (
    <AnimatePresence>
      {open && data && (
        <motion.div
          className="fixed inset-0 z-[60] bg-background"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Fondo decorativo sutil */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{
              background:
                "radial-gradient(80% 50% at 50% 0%, var(--aurora-2), transparent 70%)",
            }}
          />

          {/* Barra superior fija */}
          <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border bg-background/80 px-3 py-2.5 backdrop-blur-md sm:px-5">
            <div className="flex min-w-0 items-center gap-2">
              <span className="gradient-primary grid h-7 w-7 shrink-0 place-items-center rounded-lg text-primary-foreground">
                <SparklesIcon className="h-4 w-4" />
              </span>
              <span className="truncate font-serif text-sm font-semibold text-foreground sm:text-base">
                {data.title[lang]}
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <SegmentedToggle<Lang>
                layoutId="fs-lang-pill"
                size="sm"
                value={lang}
                onChange={onLang}
                options={LANGS.map((l) => ({
                  value: l.code,
                  label: `${l.flag} ${l.code.toUpperCase()}`,
                }))}
              />
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface/60 px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-accent/50"
              >
                <CloseIcon className="h-4 w-4" />
                <span className="hidden sm:inline">{t.fullscreenExit}</span>
              </button>
            </div>
          </div>

          {/* Contenido desplazable */}
          <div className="nice-scroll h-[calc(100%-3.25rem)] overflow-y-auto">
            <div className="mx-auto max-w-3xl space-y-5 px-3 py-5 sm:px-6 sm:py-8">
              {/* Título + resumen */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <span className="gradient-primary inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-primary-foreground">
                  <SparklesIcon className="h-3 w-3" />
                  {data.productionMode === "hibrido" ? t.modeHybrid : t.modeIA}
                </span>
                <h1 className="mt-2 break-words font-serif text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
                  {data.title[lang]}
                </h1>
                <p className="mt-2 break-words text-pretty text-base text-muted">
                  {data.summary[lang]}
                </p>
              </motion.div>

              {/* Estrategia del gancho */}
              <div className="rounded-2xl border border-accent/30 bg-accent/5 p-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-accent">
                  {t.hookStrategy}
                </p>
                <p className="mt-1 break-words text-sm text-foreground/90">
                  {data.hookStrategy[lang]}
                </p>
              </div>

              {/* Escenas */}
              <div className="space-y-4">
                {data.scenes.map((scene, i) => (
                  <motion.article
                    key={scene.id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.4 }}
                    className="glass overflow-hidden rounded-2xl shadow-soft"
                  >
                    <div className="flex flex-wrap items-center gap-2.5 border-b border-border bg-surface-2/40 px-4 py-3">
                      <span className="gradient-primary grid h-7 w-7 shrink-0 place-items-center rounded-lg text-sm font-bold text-primary-foreground">
                        {i + 1}
                      </span>
                      <span className="shrink-0 rounded-lg bg-background/50 px-2 py-1 font-mono text-xs font-semibold text-accent">
                        {scene.timecode}
                      </span>
                      <span className="min-w-0 font-serif text-base font-semibold text-foreground">
                        {scene.label[lang]}
                      </span>
                      {scene.roll && (
                        <span
                          className={cn(
                            "ml-auto shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider",
                            scene.roll === "A-Roll"
                              ? "bg-primary/15 text-primary"
                              : "bg-accent/15 text-accent",
                          )}
                        >
                          {scene.roll}
                        </span>
                      )}
                    </div>

                    <div className="space-y-3 p-4">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-xl border border-border bg-surface-2/30 p-3.5">
                          <p className="mb-1.5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-muted">
                            <AudioIcon className="h-3.5 w-3.5 text-accent" />
                            {t.colAudio}
                          </p>
                          <p className="break-words text-sm leading-relaxed text-foreground">
                            {scene.audio[lang]}
                          </p>
                        </div>
                        <div className="rounded-xl border border-border bg-surface-2/30 p-3.5">
                          <p className="mb-1.5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-muted">
                            <CameraIcon className="h-3.5 w-3.5 text-accent" />
                            {t.colVisual}
                          </p>
                          <p className="break-words text-sm leading-relaxed text-foreground">
                            {scene.visual[lang]}
                          </p>
                        </div>
                      </div>

                      {scene.prompts?.length > 0 && (
                        <div className="space-y-2.5">
                          {scene.prompts.map((p) => (
                            <div
                              key={p.id}
                              className="rounded-xl border border-border bg-surface-2/50 p-3"
                            >
                              <div className="mb-2 flex flex-wrap items-center gap-2">
                                <span
                                  className={cn(
                                    "rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                                    KIND_CLS[p.kind],
                                  )}
                                >
                                  {KIND_LABEL[p.kind]}
                                </span>
                                {p.timecode && (
                                  <span className="rounded-md bg-background/60 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-accent">
                                    {p.timecode}
                                  </span>
                                )}
                                <span className="min-w-0 break-words text-xs font-medium text-foreground">
                                  {p.title[lang]}
                                </span>
                                {p.model && (
                                  <span className="ml-auto shrink-0 rounded-md bg-foreground/10 px-2 py-0.5 text-[11px] font-semibold text-foreground/80">
                                    {p.model}
                                  </span>
                                )}
                              </div>
                              {p.purpose?.[lang] && (
                                <p className="mb-1 break-words text-xs text-foreground/80">
                                  <span className="font-bold uppercase tracking-wide text-accent">
                                    {t.promptPurpose}:
                                  </span>{" "}
                                  {p.purpose[lang]}
                                </p>
                              )}
                              {p.flowInputs?.[lang] && (
                                <p className="mb-1.5 break-words text-xs text-foreground/80">
                                  <span className="font-bold uppercase tracking-wide text-accent-2">
                                    {t.promptFlowInputs}:
                                  </span>{" "}
                                  {p.flowInputs[lang]}
                                </p>
                              )}
                              <div className="relative rounded-lg border border-border bg-background/50 p-2.5">
                                <p className="break-words pr-8 font-mono text-[12px] leading-relaxed text-foreground/90">
                                  {p.content[lang]}
                                </p>
                                <div className="absolute right-1.5 top-1.5">
                                  <CopyButton text={p.content[lang]} />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.article>
                ))}
              </div>

              {/* CTA */}
              <div className="gradient-primary rounded-2xl p-5 text-center shadow-soft">
                <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-primary-foreground/80">
                  CTA
                </p>
                <p className="mt-1.5 break-words font-serif text-xl font-semibold text-primary-foreground">
                  {data.cta[lang]}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
