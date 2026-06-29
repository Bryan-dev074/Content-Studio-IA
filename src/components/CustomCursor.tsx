"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

type Variant = "default" | "hover" | "text";

/**
 * Cursor personalizado: un punto que sigue exacto al mouse + un anillo con
 * retardo (spring). Crece sobre botones/enlaces, se vuelve un "I-beam" sobre
 * campos de texto y pulsa al hacer click. Solo en dispositivos con puntero fino;
 * si el JS no corre, el cursor nativo se mantiene (fallback seguro).
 */
export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [variant, setVariant] = useState<Variant>("default");
  const [clicking, setClicking] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 380, damping: 30, mass: 0.5 });
  const ringY = useSpring(y, { stiffness: 380, damping: 30, mass: 0.5 });

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;

    setEnabled(true);
    document.documentElement.classList.add("cursor-custom");

    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const el = e.target as Element | null;
      if (el?.closest('input:not([type="file"]), textarea, [contenteditable="true"]')) {
        setVariant("text");
      } else if (
        el?.closest('button, a, label, select, [role="button"], [data-cursor="hover"]')
      ) {
        setVariant("hover");
      } else {
        setVariant("default");
      }
    };
    const down = () => setClicking(true);
    const up = () => setClicking(false);
    const leave = () => {
      x.set(-100);
      y.set(-100);
    };

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointerleave", leave);
    return () => {
      document.documentElement.classList.remove("cursor-custom");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointerleave", leave);
    };
  }, [x, y]);

  if (!enabled) return null;

  const isHover = variant === "hover";
  const isText = variant === "text";

  const ringW = isHover ? 52 : isText ? 5 : 32;
  const ringH = isHover ? 52 : isText ? 26 : 32;
  const dotSize = isHover || isText ? 0 : 6;

  return (
    <>
      {/* Anillo */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9999] border-2"
        style={{ x: ringX, y: ringY }}
        animate={{
          width: ringW,
          height: ringH,
          marginLeft: -ringW / 2,
          marginTop: -ringH / 2,
          borderRadius: isText ? 3 : 999,
          scale: clicking ? 0.82 : 1,
          borderColor: isHover ? "var(--accent)" : "var(--accent-2)",
          backgroundColor: isHover
            ? "color-mix(in srgb, var(--accent) 14%, transparent)"
            : "transparent",
        }}
        transition={{ type: "spring", stiffness: 320, damping: 24 }}
      />
      {/* Punto */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9999] rounded-full"
        style={{ x, y, backgroundColor: "var(--accent)" }}
        animate={{
          width: dotSize,
          height: dotSize,
          marginLeft: -dotSize / 2,
          marginTop: -dotSize / 2,
          scale: clicking ? 1.8 : 1,
        }}
        transition={{ type: "spring", stiffness: 500, damping: 28 }}
      />
    </>
  );
}
