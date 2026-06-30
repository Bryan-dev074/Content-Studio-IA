"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PromptCard } from "./PromptCard";
import {
  RegenerateSceneModal,
  type RegenContext,
} from "./RegenerateSceneModal";
import { AudioIcon, CameraIcon, ChevronDownIcon, RefreshIcon } from "./icons";
import { useI18n } from "./providers/I18nProvider";
import { cn } from "@/lib/utils";
import type { Lang, Localized, ProductionMode, Scene } from "@/lib/types";

export function SceneCard({
  scene,
  index,
  lang,
  productionMode,
  onUpdatePrompt,
  regenContext,
  onRegenerated,
}: {
  scene: Scene;
  index: number;
  lang: Lang;
  productionMode: ProductionMode;
  onUpdatePrompt: (promptId: string, content: Localized) => void;
  regenContext: RegenContext;
  onRegenerated: (scene: Scene) => void;
}) {
  const { t } = useI18n();
  const [regenOpen, setRegenOpen] = useState(false);
  const [open, setOpen] = useState(index === 0); // la primera abierta; el resto colapsa
  const clipCount = scene.prompts?.length ?? 0;

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="glass overflow-hidden rounded-2xl shadow-soft"
    >
      {/* Cabecera de la toma (clic para desplegar) */}
      <div
        className={cn(
          "flex flex-wrap items-center gap-2.5 border-b bg-surface-2/40 px-4 py-3 sm:gap-3 sm:px-5",
          open ? "border-border" : "border-transparent",
        )}
      >
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
        >
          <span className="gradient-primary grid h-8 w-8 shrink-0 place-items-center rounded-lg text-sm font-bold text-primary-foreground">
            {index + 1}
          </span>
          <span className="shrink-0 rounded-lg bg-background/50 px-2 py-1 font-mono text-xs font-semibold text-accent sm:text-sm">
            {scene.timecode}
          </span>
          <span className="min-w-0 truncate font-serif text-base font-semibold text-foreground sm:text-lg">
            {scene.label[lang]}
          </span>
          {!open && clipCount > 0 && (
            <span className="hidden shrink-0 rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-semibold text-accent sm:inline">
              {clipCount} {t.promptsTitle.toLowerCase()}
            </span>
          )}
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.25 }}
            className="ml-1 shrink-0 text-muted"
          >
            <ChevronDownIcon className="h-4 w-4" />
          </motion.span>
        </button>
        <div className="flex shrink-0 items-center gap-2">
          {scene.roll && (
            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider",
                scene.roll === "A-Roll"
                  ? "bg-primary/15 text-primary"
                  : "bg-accent/15 text-accent",
              )}
            >
              {scene.roll}
            </span>
          )}
          <button
            type="button"
            onClick={() => setRegenOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-accent/40 bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent transition-colors hover:bg-accent/20"
          >
            <RefreshIcon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t.regenScene}</span>
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="scene-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="space-y-4 p-4 sm:p-5">
        {/* Dos columnas: Locución / Cámara */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-border bg-surface-2/30 p-4">
            <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted">
              <AudioIcon className="h-4 w-4 text-accent" />
              {t.colAudio}
            </p>
            <p className="break-words text-[15px] leading-relaxed text-foreground">
              {scene.audio[lang]}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-surface-2/30 p-4">
            <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted">
              <CameraIcon className="h-4 w-4 text-accent" />
              {t.colVisual}
            </p>
            <p className="break-words text-[15px] leading-relaxed text-foreground">
              {scene.visual[lang]}
            </p>
          </div>
        </div>

        {/* Actuación / SFX */}
        {(scene.acting?.[lang] || scene.sfx?.[lang]) && (
          <div className="grid gap-3 sm:grid-cols-2">
            {scene.acting?.[lang] && (
              <div className="rounded-lg bg-primary/5 px-3.5 py-2.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-primary">
                  {t.acting}
                </p>
                <p className="mt-1 text-sm text-foreground/85">
                  {scene.acting[lang]}
                </p>
              </div>
            )}
            {scene.sfx?.[lang] && (
              <div className="rounded-lg bg-accent/5 px-3.5 py-2.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-accent">
                  {t.sfx}
                </p>
                <p className="mt-1 text-sm text-foreground/85">
                  {scene.sfx[lang]}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Prompts de producción */}
        {scene.prompts?.length > 0 && (
          <div className="space-y-3 pt-1">
            <p className="text-xs font-bold uppercase tracking-wider text-muted">
              {t.promptsTitle}
            </p>
            {scene.prompts.map((p) => (
              <PromptCard
                key={p.id}
                prompt={p}
                lang={lang}
                productionMode={productionMode}
                onUpdate={(content) => onUpdatePrompt(p.id, content)}
              />
            ))}
          </div>
        )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <RegenerateSceneModal
        open={regenOpen}
        onClose={() => setRegenOpen(false)}
        scene={scene}
        lang={lang}
        productionMode={productionMode}
        context={regenContext}
        onRegenerated={onRegenerated}
      />
    </motion.article>
  );
}
