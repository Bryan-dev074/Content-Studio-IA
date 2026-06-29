import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Combina clases de Tailwind resolviendo conflictos. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Extrae el primer objeto JSON de un texto que puede venir con fences ```json. */
export function extractJson<T = unknown>(raw: string): T {
  let text = raw.trim();

  // Quitar fences de markdown si los hubiera.
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) {
    text = fenceMatch[1].trim();
  }

  // Recortar al primer { ... último } por seguridad.
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first !== -1 && last !== -1 && last > first) {
    text = text.slice(first, last + 1);
  }

  return JSON.parse(text) as T;
}

export function formatCredits(n: number) {
  return Number.isInteger(n) ? `${n}c` : `${n}c`;
}
