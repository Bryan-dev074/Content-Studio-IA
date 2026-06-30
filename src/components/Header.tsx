"use client";

import { motion } from "framer-motion";
import { CatLogo } from "./CatLogo";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageToggle } from "./LanguageToggle";
import { SparklesIcon } from "./icons";
import { useI18n } from "./providers/I18nProvider";

export function Header() {
  const { t } = useI18n();
  return (
    <motion.header
      initial={{ y: -28, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-3 z-40 px-3 sm:px-5"
    >
      <div className="glass mx-auto flex max-w-7xl items-center justify-between gap-2 rounded-2xl px-3 py-2.5 shadow-soft sm:gap-3 sm:px-4">
        <div className="flex min-w-0 items-center gap-2 sm:gap-2.5">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-border bg-surface-2/60 shadow-soft sm:h-11 sm:w-11">
            <CatLogo className="h-7 w-7 sm:h-8 sm:w-8" />
          </div>
          <div className="min-w-0 leading-tight">
            <p className="flex items-center gap-1.5 font-serif text-base font-semibold tracking-tight text-foreground sm:text-lg">
              <span className="truncate">Content Studio</span>
              <span className="gradient-primary inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
                <SparklesIcon className="h-3 w-3" /> IA
              </span>
            </p>
            <p className="hidden truncate text-[11px] font-medium text-muted sm:block">
              {t.brandPill}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>
    </motion.header>
  );
}
