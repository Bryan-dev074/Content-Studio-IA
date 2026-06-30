"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PromptCard } from "./PromptCard";
import {
  RegenerateSceneModal,
  type RegenContext,
} from "./RegenerateSceneModal";
import { AudioIcon, CameraIcon, RefreshIcon } from "./icons";
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

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="glass overflow-hidden rounded-2xl shadow-soft"
    >
      {/* Cabecera de la toma */}
      <div className="flex flex-wrap items-center gap-3 border-b border-border bg-surface-2/40 px-5 py-3">
        <span className="gradient-primary grid h-8 w-8 shrink-0 place-items-center rounded-lg text-sm font-bold text-primary-foreground">
          {index + 1}
        </span>
        <span className="rounded-lg bg-background/50 px-2.5 py-1 font-mono text-sm font-semibold text-accent">
          {scene.timecode}
        </span>
        <span className="font-serif text-lg font-semibold text-foreground">
          {scene.label[lang]}
        </span>
        <div className="ml-auto flex items-center gap-2">
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
            {t.regenScene}
          </button>
        </div>
      </div>

      <div className="space-y-4 p-5">
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
