"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

const OUTLINE = "#232c44";
const BODY = "#ffffff";
const SHADE = "#cfe0f7";
const PAW = "#f6a5c0";
const BLUSH = "#f7b8cf";

/**
 * Logo del proyecto: un "bongo cat" pixel-suave que golpetea en loop infinito.
 * Recreado en SVG (nítido a cualquier tamaño, siempre en bucle, sin archivos).
 */
export function CatLogo({
  className,
  animated = true,
}: {
  className?: string;
  animated?: boolean;
}) {
  const reduce = useReducedMotion();
  const play = animated && !reduce;

  const tap = (delay: number) =>
    play
      ? {
          animate: { y: [0, -6, 0] },
          transition: {
            duration: 0.46,
            repeat: Infinity,
            ease: "easeInOut" as const,
            delay,
          },
        }
      : {};

  return (
    <motion.svg
      viewBox="0 0 128 104"
      className={cn("h-10 w-10", className)}
      role="img"
      aria-label="Logo gato"
      {...(play
        ? {
            animate: { y: [0, -1.5, 0] },
            transition: { duration: 2.6, repeat: Infinity, ease: "easeInOut" },
          }
        : {})}
    >
      {/* Orejas (detrás del cuerpo) */}
      <path
        d="M31 40 L26 18 L48 33 Z"
        fill={BODY}
        stroke={OUTLINE}
        strokeWidth={3.4}
        strokeLinejoin="round"
      />
      <path
        d="M97 40 L102 18 L80 33 Z"
        fill={BODY}
        stroke={OUTLINE}
        strokeWidth={3.4}
        strokeLinejoin="round"
      />

      {/* Cuerpo (loaf) */}
      <path
        d="M18 74 C18 46 40 32 64 32 C88 32 110 46 110 74 L110 78 C110 86 104 90 96 90 L32 90 C24 90 18 86 18 78 Z"
        fill={BODY}
      />
      {/* Sombra azulada inferior */}
      <path
        d="M20 74 C34 86 94 86 108 74 L110 78 C110 86 104 90 96 90 L32 90 C24 90 18 86 18 78 Z"
        fill={SHADE}
      />
      {/* Contorno del cuerpo */}
      <path
        d="M18 74 C18 46 40 32 64 32 C88 32 110 46 110 74 L110 78 C110 86 104 90 96 90 L32 90 C24 90 18 86 18 78 Z"
        fill="none"
        stroke={OUTLINE}
        strokeWidth={3.6}
        strokeLinejoin="round"
      />

      {/* Mejillas */}
      <ellipse cx="43" cy="70" rx="6" ry="3.6" fill={BLUSH} opacity={0.85} />
      <ellipse cx="85" cy="70" rx="6" ry="3.6" fill={BLUSH} opacity={0.85} />

      {/* Ojos */}
      <circle cx="50" cy="60" r="3.4" fill={OUTLINE} />
      <circle cx="78" cy="60" r="3.4" fill={OUTLINE} />

      {/* Boca ᴗᴗ */}
      <path
        d="M58 66 q3.2 4 6.4 0 q3.2 4 6.4 0"
        fill="none"
        stroke={OUTLINE}
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Patita izquierda (golpetea) */}
      <motion.g {...tap(0)}>
        <rect
          x="34"
          y="80"
          width="24"
          height="18"
          rx="9"
          fill={PAW}
          stroke={OUTLINE}
          strokeWidth={3.2}
        />
        <path
          d="M46 84 v9 M40 86 v6 M52 86 v6"
          stroke={OUTLINE}
          strokeWidth={1.8}
          strokeLinecap="round"
          opacity={0.5}
        />
      </motion.g>

      {/* Patita derecha (golpetea, desfasada) */}
      <motion.g {...tap(0.23)}>
        <rect
          x="70"
          y="80"
          width="24"
          height="18"
          rx="9"
          fill={PAW}
          stroke={OUTLINE}
          strokeWidth={3.2}
        />
        <path
          d="M82 84 v9 M76 86 v6 M88 86 v6"
          stroke={OUTLINE}
          strokeWidth={1.8}
          strokeLinecap="round"
          opacity={0.5}
        />
      </motion.g>
    </motion.svg>
  );
}
