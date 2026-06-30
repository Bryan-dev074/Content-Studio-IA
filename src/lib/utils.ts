import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Combina clases de Tailwind resolviendo conflictos. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Extrae el primer objeto JSON de un texto que puede venir con fences ```json.
 *  Tolera respuestas TRUNCADAS (cuando el modelo se queda sin tokens a mitad del
 *  JSON): repara cerrando lo que quedó abierto y conserva todo lo ya completo. */
export function extractJson<T = unknown>(raw: string): T {
  let text = raw.trim();

  // Quitar fences de markdown si los hubiera.
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) {
    text = fenceMatch[1].trim();
  }

  const first = text.indexOf("{");
  if (first === -1) {
    throw new Error("La respuesta del modelo no contenía JSON.");
  }
  text = text.slice(first);

  // 1) Intento directo (recortando al último '}' de cierre).
  const last = text.lastIndexOf("}");
  if (last > 0) {
    try {
      return JSON.parse(text.slice(0, last + 1)) as T;
    } catch {
      /* sigue al reparador */
    }
  }

  // 2) Reparación de JSON truncado: conserva el mayor prefijo válido y cierra.
  const repaired = repairTruncatedJson(text);
  if (repaired) {
    return JSON.parse(repaired) as T;
  }

  // 3) Último intento (lanza el error de parseo original si todo falla).
  return JSON.parse(text) as T;
}

/**
 * Recorre un JSON posiblemente truncado y devuelve el mayor prefijo que se puede
 * cerrar de forma válida (conservando todas las propiedades/elementos completos y
 * descartando la cola incompleta). Devuelve null si no logra reparar nada.
 */
function repairTruncatedJson(s: string): string | null {
  type Type = "object" | "array";
  const stack: Type[] = [];
  // Estado del contenedor actual: objeto = key|colon|value|comma ; array = value|comma
  const state: string[] = [];
  let inString = false;
  let escaped = false;
  let bestLen = -1;
  let bestStack: Type[] = [];

  const record = (endIdx: number) => {
    bestLen = endIdx + 1;
    bestStack = stack.slice();
  };

  for (let i = 0; i < s.length; i++) {
    const c = s[i];

    if (inString) {
      if (escaped) escaped = false;
      else if (c === "\\") escaped = true;
      else if (c === '"') {
        inString = false;
        const top = state.length - 1;
        if (state[top] === "key") state[top] = "colon";
        else if (state[top] === "value") {
          state[top] = "comma";
          record(i);
        }
      }
      continue;
    }

    if (c === '"') {
      inString = true;
      continue;
    }
    if (c === "{" || c === "[") {
      stack.push(c === "{" ? "object" : "array");
      state.push(c === "{" ? "key" : "value");
      continue;
    }
    if (c === "}" || c === "]") {
      stack.pop();
      state.pop();
      const top = state.length - 1;
      if (top >= 0 && state[top] === "value") state[top] = "comma";
      record(i);
      continue;
    }
    if (c === ":") {
      const top = state.length - 1;
      if (state[top] === "colon") state[top] = "value";
      continue;
    }
    if (c === ",") {
      const top = state.length - 1;
      if (state[top] === "comma") {
        state[top] = stack[top] === "object" ? "key" : "value";
      }
      continue;
    }
    if (/\s/.test(c)) continue;

    // Primitivo (number / true / false / null): consumir hasta el delimitador.
    let j = i;
    while (j < s.length && !/[\s,}\]]/.test(s[j])) j++;
    const completed = j < s.length; // si no, quedó cortado a mitad
    const top = state.length - 1;
    if (completed && state[top] === "value") {
      state[top] = "comma";
      record(j - 1);
    }
    i = j - 1;
  }

  const closeAll = (frames: Type[]) => {
    let out = "";
    for (let k = frames.length - 1; k >= 0; k--) {
      out += frames[k] === "object" ? "}" : "]";
    }
    return out;
  };

  const candidates: string[] = [];

  // Opción A: cortó dentro de un STRING de VALOR → cerramos ese string y
  // conservamos el texto parcial (útil para el último prompt a medio escribir).
  if (inString && state[state.length - 1] === "value") {
    let tail = s;
    // Evita escapar la comilla de cierre si quedó un backslash colgante.
    let bs = 0;
    let k = tail.length - 1;
    while (k >= 0 && tail[k] === "\\") {
      bs++;
      k--;
    }
    if (bs % 2 === 1) tail = tail.slice(0, -1);
    candidates.push(tail + '"' + closeAll(stack));
  }

  // Opción B: cortar en el último VALOR COMPLETO y cerrar los contenedores.
  if (bestLen > 0) {
    candidates.push(s.slice(0, bestLen) + closeAll(bestStack));
  }

  for (const c of candidates) {
    try {
      JSON.parse(c);
      return c;
    } catch {
      /* prueba el siguiente candidato */
    }
  }
  return null;
}

export function formatCredits(n: number) {
  return Number.isInteger(n) ? `${n}c` : `${n}c`;
}
