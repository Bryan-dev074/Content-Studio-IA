"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  sublabel?: string;
  icon?: React.ReactNode;
}

/**
 * Control segmentado animado y reutilizable: el "pill" activo se desliza con
 * un layoutId compartido (efecto de magic motion).
 */
export function SegmentedToggle<T extends string>({
  options,
  value,
  onChange,
  layoutId,
  size = "md",
  className,
}: {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  layoutId: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const pad =
    size === "lg"
      ? "px-5 py-3"
      : size === "sm"
        ? "px-3 py-1.5 text-sm"
        : "px-4 py-2";

  return (
    <div
      className={cn(
        "glass inline-flex items-center gap-1 rounded-2xl p-1 shadow-soft",
        className,
      )}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "relative z-10 flex items-center gap-2 rounded-xl font-medium transition-colors",
              pad,
              active ? "text-primary-foreground" : "text-muted hover:text-foreground",
            )}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                className="gradient-primary absolute inset-0 -z-10 rounded-xl shadow-soft"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
            {opt.icon}
            <span className="flex flex-col items-start leading-tight">
              <span>{opt.label}</span>
              {opt.sublabel && (
                <span
                  className={cn(
                    "text-[10px] font-normal",
                    active ? "text-primary-foreground/80" : "text-muted-2",
                  )}
                >
                  {opt.sublabel}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
