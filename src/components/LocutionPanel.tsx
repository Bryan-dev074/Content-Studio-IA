"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CopyButton } from "./CopyButton";
import { AudioIcon } from "./icons";
import { useI18n } from "./providers/I18nProvider";
import { cn } from "@/lib/utils";
import type { Lang, ProductionMode, Scene } from "@/lib/types";

const ELEVEN_LOGO = (
  <span className="rounded-md bg-foreground/90 px-1.5 py-0.5 text-[10px] font-bold tracking-tight text-background">
    11
  </span>
);

export function LocutionPanel({
  scenes,
  mode,
  lang,
}: {
  scenes: Scene[];
  mode: ProductionMode;
  lang: Lang;
}) {
  const { t } = useI18n();

  // ── Modo IA: bloque único continuo ──
  const fullSource = useMemo(
    () => scenes.map((s) => s.audio?.[lang] ?? "").join("\n\n").trim(),
    [scenes, lang],
  );
  const [fullText, setFullText] = useState(fullSource);
  useEffect(() => setFullText(fullSource), [fullSource]);

  // ── Modo híbrido: por toma/clip ──
  const segSource = useMemo(
    () =>
      scenes.map((s) => ({
        id: s.id,
        timecode: s.timecode,
        label: s.label?.[lang] ?? "",
        text: s.audio?.[lang] ?? "",
      })),
    [scenes, lang],
  );
  const segSig = segSource.map((s) => s.id + s.text).join("|");
  const [segments, setSegments] = useState(segSource);
  useEffect(() => setSegments(segSource), [segSig]); // eslint-disable-line react-hooks/exhaustive-deps

  const allSegments = segments
    .map((s) => `[${s.timecode}] ${s.text}`)
    .join("\n\n");

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
              {t.locutionTitle} {ELEVEN_LOGO}
            </h3>
            <p className="text-xs text-muted">
              {mode === "hibrido" ? t.locutionHintHybrid : t.locutionHintIA}
            </p>
          </div>
        </div>
        <CopyButton text={mode === "hibrido" ? allSegments : fullText} />
      </div>

      {mode === "hibrido" ? (
        <div className="space-y-2.5">
          {segments.map((s, i) => (
            <div
              key={s.id}
              className="rounded-xl border border-border bg-surface-2/40 p-3"
            >
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 text-xs font-semibold text-muted">
                  <span className="font-mono text-accent">{s.timecode}</span>
                  <span className="uppercase tracking-wider">{s.label}</span>
                </span>
                <CopyButton text={s.text} />
              </div>
              <textarea
                value={s.text}
                onChange={(e) =>
                  setSegments((prev) =>
                    prev.map((p, j) =>
                      j === i ? { ...p, text: e.target.value } : p,
                    ),
                  )
                }
                className={cn(
                  "min-h-[44px] w-full resize-y rounded-lg border border-border bg-background/40 px-3 py-2 text-[15px] leading-relaxed text-foreground outline-none transition-all focus:border-accent focus:ring-2 focus:ring-[var(--ring)]",
                )}
              />
            </div>
          ))}
        </div>
      ) : (
        <textarea
          value={fullText}
          onChange={(e) => setFullText(e.target.value)}
          spellCheck={false}
          className="min-h-[160px] w-full resize-y rounded-xl border border-border bg-background/40 px-4 py-3 text-[15px] leading-relaxed text-foreground outline-none transition-all focus:border-accent focus:ring-2 focus:ring-[var(--ring)]"
        />
      )}
    </motion.div>
  );
}
