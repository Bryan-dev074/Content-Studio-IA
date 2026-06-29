"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckIcon, CopyIcon } from "./icons";
import { useI18n } from "./providers/I18nProvider";
import { cn } from "@/lib/utils";

export function CopyButton({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  };

  return (
    <motion.button
      type="button"
      onClick={copy}
      whileTap={{ scale: 0.94 }}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-colors",
        copied
          ? "border-success/40 bg-success/10 text-success"
          : "bg-surface/60 text-muted hover:text-foreground hover:border-accent/50",
        className,
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={copied ? "ok" : "copy"}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="flex items-center gap-1.5"
        >
          {copied ? (
            <>
              <CheckIcon className="h-3.5 w-3.5" /> {t.copied}
            </>
          ) : (
            <>
              <CopyIcon className="h-3.5 w-3.5" /> {t.copy}
            </>
          )}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}
