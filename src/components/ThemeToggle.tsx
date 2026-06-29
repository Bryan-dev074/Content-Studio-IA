"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { AnimatePresence, motion } from "framer-motion";
import { MoonIcon, SunIcon } from "./icons";
import { useI18n } from "./providers/I18nProvider";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { t } = useI18n();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = (mounted ? resolvedTheme ?? theme : "dark") === "dark";

  return (
    <motion.button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.05 }}
      aria-label={isDark ? t.light : t.dark}
      title={isDark ? t.light : t.dark}
      className="glass relative grid h-10 w-10 place-items-center overflow-hidden rounded-xl text-foreground shadow-soft"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isDark ? "moon" : "sun"}
          initial={{ y: -18, opacity: 0, rotate: -90 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: 18, opacity: 0, rotate: 90 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          className="absolute"
        >
          {isDark ? (
            <MoonIcon className="h-5 w-5 text-accent" />
          ) : (
            <SunIcon className="h-5 w-5 text-accent" />
          )}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}
