"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CloseIcon, WandIcon } from "./icons";
import { useI18n } from "./providers/I18nProvider";
import { cn } from "@/lib/utils";
import type { Lang, Localized, PromptBlock, ProductionMode } from "@/lib/types";

export function RefineModal({
  open,
  onClose,
  prompt,
  lang,
  productionMode,
  onApply,
}: {
  open: boolean;
  onClose: () => void;
  prompt: PromptBlock;
  lang: Lang;
  productionMode: ProductionMode;
  onApply: (content: Localized) => void;
}) {
  const { t } = useI18n();
  const [instruction, setInstruction] = useState("");
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");

  const toggleChip = (chip: string) => {
    setInstruction((prev) => {
      const parts = prev
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (parts.includes(chip)) {
        return parts.filter((p) => p !== chip).join(", ");
      }
      return [...parts, chip].join(", ");
    });
  };

  const run = async () => {
    if (!instruction.trim()) return;
    setWorking(true);
    setError("");
    try {
      const res = await fetch("/api/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentContent: prompt.content[lang],
          kind: prompt.kind,
          instruction: instruction.trim(),
          productionMode,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t.errorGeneric);
      onApply(data.content as Localized);
      setInstruction("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errorGeneric);
    } finally {
      setWorking(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-black/55 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="glass relative z-10 flex w-full max-w-lg flex-col gap-4 rounded-2xl p-6 shadow-glow"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="gradient-primary grid h-10 w-10 place-items-center rounded-xl text-primary-foreground">
                  <WandIcon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-serif text-lg font-semibold text-foreground">
                    {t.refineTitle}
                  </h3>
                  <p className="text-xs text-muted">{prompt.title[lang]}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            <p className="text-sm text-muted">{t.refineSubtitle}</p>

            <div className="flex flex-wrap gap-2">
              {t.refineChips.map((chip) => {
                const active = instruction.includes(chip);
                return (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => toggleChip(chip)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                      active
                        ? "gradient-primary border-transparent text-primary-foreground"
                        : "border-border bg-surface/60 text-muted hover:border-accent/50 hover:text-foreground",
                    )}
                  >
                    {chip}
                  </button>
                );
              })}
            </div>

            <textarea
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder={t.refineInstructionPh}
              className="min-h-[96px] w-full resize-y rounded-xl border border-border bg-surface/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-2 outline-none transition-all focus:border-accent focus:ring-4 focus:ring-[var(--ring)]"
            />

            {error && <p className="text-sm text-danger">{error}</p>}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-muted transition-colors hover:text-foreground"
              >
                {t.refineCancel}
              </button>
              <motion.button
                type="button"
                onClick={run}
                disabled={working || !instruction.trim()}
                whileTap={{ scale: 0.97 }}
                className={cn(
                  "gradient-primary flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft transition-opacity",
                  (working || !instruction.trim()) && "opacity-60",
                )}
              >
                {working ? (
                  <>
                    <span className="h-4 w-4 animate-spin-slow rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground" />
                    {t.refineWorking}
                  </>
                ) : (
                  <>
                    <WandIcon className="h-4 w-4" />
                    {t.refineApply}
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
