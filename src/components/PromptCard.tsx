"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CopyButton } from "./CopyButton";
import { RefineModal } from "./RefineModal";
import { WandIcon, ImageIcon, FilmIcon } from "./icons";
import { useI18n } from "./providers/I18nProvider";
import { cn } from "@/lib/utils";
import type { Lang, Localized, PromptBlock, ProductionMode } from "@/lib/types";

const KIND_META: Record<
  PromptBlock["kind"],
  { label: string; cls: string }
> = {
  "imagen-0c": { label: "Imagen 0c", cls: "bg-accent/15 text-accent" },
  animacion: { label: "Animación", cls: "bg-primary/15 text-primary" },
  "fondo-chroma": { label: "Fondo / Chroma", cls: "bg-success/15 text-success" },
  lipsync: { label: "Lipsync", cls: "bg-accent-2/20 text-accent-2" },
};

export function PromptCard({
  prompt,
  lang,
  productionMode,
  onUpdate,
}: {
  prompt: PromptBlock;
  lang: Lang;
  productionMode: ProductionMode;
  onUpdate: (content: Localized) => void;
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const meta = KIND_META[prompt.kind] ?? KIND_META["imagen-0c"];

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        className="rounded-xl border border-border bg-surface-2/50 p-3.5"
      >
        <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <span
              className={cn(
                "rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
                meta.cls,
              )}
            >
              {meta.label}
            </span>
            <span className="text-sm font-medium text-foreground">
              {prompt.title[lang]}
            </span>
          </div>
          {prompt.model && (
            <span className="gradient-primary inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold text-primary-foreground shadow-soft">
              {prompt.kind === "imagen-0c" || prompt.kind === "fondo-chroma" ? (
                <ImageIcon className="h-3.5 w-3.5" />
              ) : (
                <FilmIcon className="h-3.5 w-3.5" />
              )}
              {prompt.model}
            </span>
          )}
        </div>

        <textarea
          value={prompt.content[lang]}
          onChange={(e) =>
            onUpdate({ ...prompt.content, [lang]: e.target.value })
          }
          spellCheck={false}
          className="min-h-[120px] w-full resize-y rounded-lg border border-border bg-background/40 px-3 py-2.5 font-mono text-[13px] leading-relaxed text-foreground/90 outline-none transition-all focus:border-accent focus:ring-2 focus:ring-[var(--ring)]"
        />

        <div className="mt-2.5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-accent/40 bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-accent/20"
          >
            <WandIcon className="h-3.5 w-3.5" />
            {t.edit}
          </button>
          <CopyButton text={prompt.content[lang]} />
        </div>
      </motion.div>

      <RefineModal
        open={open}
        onClose={() => setOpen(false)}
        prompt={prompt}
        lang={lang}
        productionMode={productionMode}
        onApply={(content) => onUpdate(content)}
      />
    </>
  );
}
