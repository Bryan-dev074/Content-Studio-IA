"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CopyButton } from "./CopyButton";
import { LocutionRefineModal } from "./LocutionRefineModal";
import { AudioIcon, WandIcon } from "./icons";
import { useI18n } from "./providers/I18nProvider";
import { cn } from "@/lib/utils";
import type { Lang, Localized, ProductionMode, Scene } from "@/lib/types";

const ELEVEN_LOGO = (
  <span className="rounded-md bg-foreground/90 px-1.5 py-0.5 text-[10px] font-bold tracking-tight text-background">
    11
  </span>
);

export function LocutionPanel({
  scenes,
  mode,
  lang,
  onUpdateAudio,
  onApplyAudio,
}: {
  scenes: Scene[];
  mode: ProductionMode;
  lang: Lang;
  /** El usuario escribió en la locución de una toma (idioma actual). */
  onUpdateAudio: (sceneId: string, lang: Lang, value: string) => void;
  /** La IA aplicó una alternativa completa (ambos idiomas) a una toma. */
  onApplyAudio: (sceneId: string, content: Localized) => void;
}) {
  const { t } = useI18n();

  // Fuente de verdad = las escenas del guion. Sin estado local: cada edición
  // sube al padre y se refleja en las tarjetas de escena de abajo.
  const segments = useMemo(
    () =>
      scenes.map((s) => ({
        id: s.id,
        timecode: s.timecode,
        label: s.label?.[lang] ?? "",
        audio: s.audio ?? { es: "", pt: "" },
        text: s.audio?.[lang] ?? "",
      })),
    [scenes, lang],
  );

  // "Copiar todo": en híbrido con timecodes; en IA como voz en off continua.
  const copyAllText =
    mode === "hibrido"
      ? segments.map((s) => `[${s.timecode}] ${s.text}`).join("\n\n")
      : segments
          .map((s) => s.text)
          .filter(Boolean)
          .join("\n\n");

  // Toma cuya locución se está reescribiendo con IA.
  const [refineId, setRefineId] = useState<string | null>(null);
  const active = segments.find((s) => s.id === refineId) ?? null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass rounded-2xl p-5 shadow-soft"
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="gradient-primary grid h-9 w-9 place-items-center rounded-xl text-primary-foreground">
            <AudioIcon className="h-5 w-5" />
          </span>
          <div>
            <h3 className="flex items-center gap-2 font-serif text-xl font-semibold text-foreground">
              {mode === "hibrido" ? (
                t.locutionTitleHybrid
              ) : (
                <>
                  {t.locutionTitle} {ELEVEN_LOGO}
                </>
              )}
            </h3>
            <p className="text-xs text-muted">
              {mode === "hibrido" ? t.locutionHintHybrid : t.locutionHintIA}
            </p>
          </div>
        </div>
        <CopyButton text={copyAllText} />
      </div>

      <div className="space-y-2.5">
        {segments.map((s) => (
          <div
            key={s.id}
            className="rounded-xl border border-border bg-surface-2/40 p-3"
          >
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <span className="flex min-w-0 items-center gap-2 text-xs font-semibold text-muted">
                <span className="shrink-0 font-mono text-accent">
                  {s.timecode}
                </span>
                <span className="truncate uppercase tracking-wider">
                  {s.label}
                </span>
              </span>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => setRefineId(s.id)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-accent/40 bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent transition-colors hover:bg-accent/20"
                >
                  <WandIcon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{t.locutionRefine}</span>
                </button>
                <CopyButton text={s.text} />
              </div>
            </div>
            <textarea
              value={s.text}
              onChange={(e) => onUpdateAudio(s.id, lang, e.target.value)}
              className={cn(
                "min-h-[44px] w-full resize-y rounded-lg border border-border bg-background/40 px-3 py-2 text-[15px] leading-relaxed text-foreground outline-none transition-all focus:border-accent focus:ring-2 focus:ring-[var(--ring)]",
              )}
            />
          </div>
        ))}
      </div>

      <LocutionRefineModal
        open={active !== null}
        onClose={() => setRefineId(null)}
        currentText={active?.audio ?? { es: "", pt: "" }}
        lang={lang}
        timecode={active?.timecode}
        label={active?.label}
        productionMode={mode}
        onApply={(content) => {
          if (active) onApplyAudio(active.id, content);
        }}
      />
    </motion.div>
  );
}
