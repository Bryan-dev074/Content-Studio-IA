"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SparklesIcon } from "./icons";
import { useI18n } from "./providers/I18nProvider";

export function LoadingState() {
  const { t } = useI18n();
  const steps = [
    t.loadingAnalyzing,
    t.loadingStructuring,
    t.loadingPrompts,
    t.loadingCosts,
  ];
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setStep((s) => (s + 1) % steps.length),
      2600,
    );
    return () => clearInterval(id);
  }, [steps.length]);

  return (
    <div className="glass flex flex-col items-center gap-6 rounded-2xl p-10 text-center shadow-soft">
      <div className="relative grid h-20 w-20 place-items-center">
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
          <SparklesIcon className="h-7 w-7" />
        </motion.div>
      </div>

      <div className="h-6">
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

      {/* Barra de progreso indeterminada */}
      <div className="relative h-1.5 w-56 overflow-hidden rounded-full bg-surface-2">
        <motion.div
          className="gradient-primary absolute inset-y-0 w-1/3 rounded-full"
          animate={{ x: ["-120%", "320%"] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Skeletons */}
      <div className="mt-2 w-full space-y-3">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="h-16 rounded-xl bg-surface-2/60"
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{
              duration: 1.6,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </div>
  );
}
