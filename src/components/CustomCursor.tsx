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

  const ringW = isHover ? 52 : isText ? 5 : 34;
  const ringH = isHover ? 52 : isText ? 26 : 34;
  // La flecha se oculta sobre campos de texto (ahí manda el I-beam del anillo).
  const showArrow = !isText;

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
      {/* Flecha (con la temática de la marca) — la punta sigue exacta al mouse */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9999]"
        style={{ x, y }}
        animate={{
          opacity: showArrow ? 1 : 0,
          scale: clicking ? 0.82 : isHover ? 1.12 : 1,
          rotate: isHover ? -12 : 0,
        }}
        transition={{ type: "spring", stiffness: 500, damping: 28 }}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 22 22"
          fill="none"
          style={{ marginLeft: -2, marginTop: -2, filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.35))" }}
        >
          <defs>
            <linearGradient id="cursorArrow" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--accent)" />
              <stop offset="100%" stopColor="var(--accent-2)" />
            </linearGradient>
          </defs>
          <path
            d="M2 1.5 L2 16.5 L6 12.7 L8.7 18.6 L11.1 17.5 L8.5 11.8 L13.6 11.8 Z"
            fill="url(#cursorArrow)"
            stroke="var(--primary-foreground)"
            strokeWidth="1.1"
            strokeLinejoin="round"
          />
        </svg>
      </motion.div>
    </>
  );
}
