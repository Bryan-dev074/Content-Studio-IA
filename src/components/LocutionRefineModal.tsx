"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CloseIcon, SparklesIcon, WandIcon } from "./icons";
import { useI18n } from "./providers/I18nProvider";
import { cn } from "@/lib/utils";
import type {
  Lang,
  Localized,
  LocutionSuggestion,
  ProductionMode,
} from "@/lib/types";

export function LocutionRefineModal({
  open,
  onClose,
  currentText,
  lang,
  timecode,
  label,
  productionMode,
  onApply,
}: {
  open: boolean;
  onClose: () => void;
  /** Locución actual en AMBOS idiomas (para dar contexto y mostrar la actual). */
  currentText: Localized;
  lang: Lang;
  timecode?: string;
  label?: string;
  productionMode: ProductionMode;
  onApply: (content: Localized) => void;
}) {
  const { t } = useI18n();
  const [instruction, setInstruction] = useState("");
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState<LocutionSuggestion[]>([]);

  // Al abrir/cambiar de toma, empieza limpio.
  useEffect(() => {
    if (open) {
      setInstruction("");
      setError("");
      setSuggestions([]);
    }
  }, [open, timecode, label]);

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
    setWorking(true);
    setError("");
    try {
      const res = await fetch("/api/refine-locution", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentText: currentText[lang],
          lang,
          timecode,
          label,
          instruction: instruction.trim(),
          productionMode,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t.errorGeneric);
      const list = (data.suggestions ?? []) as LocutionSuggestion[];
      if (list.length === 0) throw new Error(t.errorGeneric);
      setSuggestions(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errorGeneric);
    } finally {
      setWorking(false);
    }
  };

  const apply = (s: LocutionSuggestion) => {
    onApply(s.content);
    onClose();
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
            className="glass relative z-10 flex max-h-[88vh] w-full max-w-lg flex-col gap-4 overflow-y-auto rounded-2xl p-6 shadow-glow"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="gradient-primary grid h-10 w-10 place-items-center rounded-xl text-primary-foreground">
                  <WandIcon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-serif text-lg font-semibold text-foreground">
                    {t.locutionRefineTitle}
                  </h3>
                  <p className="flex items-center gap-2 text-xs text-muted">
                    {timecode && (
                      <span className="font-mono text-accent">{timecode}</span>
                    )}
                    {label && (
                      <span className="uppercase tracking-wider">{label}</span>
                    )}
                  </p>
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

            {/* Locución actual (referencia) */}
            <div className="rounded-xl border border-border bg-surface-2/40 p-3">
              <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-muted">
                {t.locutionRefineCurrent}
              </p>
              <p className="text-sm leading-relaxed text-foreground/90">
                {currentText[lang]}
              </p>
            </div>

            <p className="text-sm text-muted">{t.locutionRefineSubtitle}</p>

            <div className="flex flex-wrap gap-2">
              {t.locutionRefineChips.map((chip) => {
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
              placeholder={t.locutionRefineInstructionPh}
              className="min-h-[72px] w-full resize-y rounded-xl border border-border bg-surface/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-2 outline-none transition-all focus:border-accent focus:ring-4 focus:ring-[var(--ring)]"
            />

            {error && <p className="text-sm text-danger">{error}</p>}

            {/* Alternativas devueltas por la IA */}
            {suggestions.length > 0 && (
              <div className="space-y-2.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted">
                  {t.locutionRefineSuggestions}
                </p>
                {suggestions.map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * i }}
                    className="rounded-xl border border-border bg-surface-2/50 p-3.5"
                  >
                    <p className="text-[15px] leading-relaxed text-foreground">
                      {s.content[lang]}
                    </p>
                    {s.note?.[lang] && (
                      <p className="mt-1.5 flex items-start gap-1.5 text-xs text-muted">
                        <SparklesIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
                        {s.note[lang]}
                      </p>
                    )}
                    <div className="mt-2.5 flex justify-end">
                      <motion.button
                        type="button"
                        onClick={() => apply(s)}
                        whileTap={{ scale: 0.96 }}
                        className="gradient-primary inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold text-primary-foreground shadow-soft"
                      >
                        <CheckMark />
                        {t.locutionRefineUse}
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

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
                disabled={working}
                whileTap={{ scale: 0.97 }}
                className={cn(
                  "gradient-primary flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft transition-opacity",
                  working && "opacity-60",
                )}
              >
                {working ? (
                  <>
                    <span className="h-4 w-4 animate-spin-slow rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground" />
                    {t.locutionRefineWorking}
                  </>
                ) : (
                  <>
                    <WandIcon className="h-4 w-4" />
                    {suggestions.length > 0
                      ? t.locutionRefineMore
                      : t.locutionRefineGenerate}
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

function CheckMark() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
    >
      <path d="m20 6-11 11-5-5" />
    </svg>
  );
}
