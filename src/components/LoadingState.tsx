"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ClockIcon, SparklesIcon } from "./icons";
import { useI18n } from "./providers/I18nProvider";

const fmtTime = (s: number) =>
  `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

/** Líneas de "código" decorativas que se escriben solas en la consola. */
const CODE_LINES = [
  "▶ analizando_video.mp4",
  "  capa.visual    ✓ cortes · encuadres · ritmo",
  "  capa.auditiva  ✓ locución · SFX · silencios",
  "  capa.psico     ✓ gancho · villano · deseo",
  "",
  "✦ construyendo_guion {",
  '    "gancho"     : "0s – 3s",',
  '    "desarrollo" : "3s – 12s",',
  '    "cierre_cta" : "→ ElaBela",',
  "}",
  "✦ escribiendo prompts · NanoBanana Pro",
  "✦ cuadrando créditos · Highfield / Omni",
  "● guion listo ✨",
];

/** Hook de tipeo: revela las líneas carácter a carácter, en bucle. */
function useTypewriter(lines: string[], cps = 55) {
  const [done, setDone] = useState<string[]>([]);
  const [current, setCurrent] = useState("");
  const idx = useRef({ line: 0, char: 0 });

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setDone(lines);
      setCurrent("");
      return;
    }
    const id = setInterval(() => {
      const { line, char } = idx.current;
      if (line >= lines.length) {
        // Reinicia el bucle tras una pausa breve.
        idx.current = { line: 0, char: 0 };
        setDone([]);
        setCurrent("");
        return;
      }
      const text = lines[line];
      if (char < text.length) {
        idx.current = { line, char: char + 1 };
        setCurrent(text.slice(0, char + 1));
      } else {
        setDone((d) => [...d, text]);
        setCurrent("");
        idx.current = { line: line + 1, char: 0 };
      }
    }, 1000 / cps);
    return () => clearInterval(id);
  }, [lines, cps]);

  return { done, current };
}

export function LoadingState({ estimateSec = 35 }: { estimateSec?: number }) {
  const { t } = useI18n();
  const steps = [
    t.loadingAnalyzing,
    t.loadingStructuring,
    t.loadingPrompts,
    t.loadingCosts,
  ];
  const [step, setStep] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const { done, current } = useTypewriter(CODE_LINES);

  useEffect(() => {
    const id = setInterval(() => setStep((s) => (s + 1) % steps.length), 2600);
    return () => clearInterval(id);
  }, [steps.length]);

  useEffect(() => {
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const overtime = elapsed >= estimateSec;
  // Progreso visual: avanza hacia el estimado sin llegar nunca al 100%.
  const progress = Math.min(0.96, elapsed / Math.max(estimateSec, 1));

  return (
    <div className="glass relative overflow-hidden rounded-2xl p-6 shadow-soft sm:p-8">
      {/* Bloques que flotan de fondo */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-0">
        {[
          { l: "8%", t: "12%", s: 54, d: 0 },
          { l: "78%", t: "20%", s: 40, d: 0.6 },
          { l: "66%", t: "70%", s: 64, d: 1.1 },
          { l: "16%", t: "74%", s: 34, d: 1.6 },
        ].map((b, i) => (
          <motion.div
            key={i}
            className="absolute rounded-xl border border-accent/20 bg-accent/5"
            style={{ left: b.l, top: b.t, width: b.s, height: b.s }}
            animate={{ y: [0, -14, 0], rotate: [0, 8, 0], opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 4 + i, repeat: Infinity, delay: b.d, ease: "easeInOut" }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Spinner + chispa */}
        <div className="relative grid h-16 w-16 place-items-center">
          <motion.span
            className="absolute inset-0 rounded-full border-2 border-accent/30 border-t-accent"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
          />
          <motion.span
            className="absolute inset-2 rounded-full border-2 border-primary/20 border-b-primary"
            animate={{ rotate: -360 }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            className="text-accent"
          >
            <SparklesIcon className="h-6 w-6" />
          </motion.div>
        </div>

        {/* Paso actual (texto rotante) */}
        <div className="h-6 text-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={step}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="font-medium text-foreground"
            >
              {steps[step]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Temporizador aproximado del análisis */}
        <div className="flex flex-col items-center gap-1.5">
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-2/50 px-3 py-1.5 font-medium text-muted">
              <ClockIcon className="h-3.5 w-3.5 text-accent" />
              {t.loadingEstimate}:{" "}
              <span className="font-mono font-semibold text-foreground">
                ≈ {fmtTime(estimateSec)}
              </span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-2/50 px-3 py-1.5 font-medium text-muted">
              {t.loadingElapsed}:{" "}
              <span className="font-mono font-semibold text-accent">
                {fmtTime(elapsed)}
              </span>
            </span>
          </div>
          {overtime && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs font-medium text-accent"
            >
              {t.loadingAlmost}
            </motion.p>
          )}
        </div>

        {/* Consola que se escribe sola */}
        <div className="w-full overflow-hidden rounded-xl border border-border bg-background/70 shadow-inner">
          <div className="flex items-center gap-1.5 border-b border-border bg-surface-2/50 px-3 py-2">
            <span className="h-2.5 w-2.5 rounded-full bg-danger/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-accent-2/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
            <span className="ml-2 font-mono text-[11px] text-muted">
              content-studio · ia
            </span>
          </div>
          <div className="h-44 overflow-hidden px-3.5 py-3 font-mono text-[12px] leading-relaxed text-foreground/85">
            {done.slice(-9).map((line, i) => (
              <div key={i} className="whitespace-pre text-accent/90">
                {line}
              </div>
            ))}
            <div className="whitespace-pre text-foreground">
              {current}
              <span className="animate-caret ml-0.5 inline-block w-[7px] -translate-y-[1px] border-b-2 border-accent align-middle" />
            </div>
          </div>
        </div>

        {/* Escenas ensamblándose */}
        <div className="flex w-full items-center justify-center gap-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="h-9 flex-1 rounded-lg gradient-primary"
              initial={{ opacity: 0.2, scaleY: 0.4 }}
              animate={{ opacity: [0.25, 1, 0.25], scaleY: [0.4, 1, 0.4] }}
              transition={{
                duration: 1.4,
                repeat: Infinity,
                delay: i * 0.18,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* Barra de progreso: avanza hacia el tiempo estimado + brillo móvil */}
        <div className="relative h-2 w-full max-w-sm overflow-hidden rounded-full bg-surface-2">
          <motion.div
            className="gradient-primary absolute inset-y-0 left-0 rounded-full"
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
          <motion.div
            className="absolute inset-y-0 w-1/4 rounded-full bg-white/25"
            animate={{ x: ["-120%", "460%"] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </div>
    </div>
  );
}
