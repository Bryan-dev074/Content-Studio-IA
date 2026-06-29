import { promises as fs } from "node:fs";
import path from "node:path";

/**
 * Carga los documentos de contexto locales (.md) que actúan como las
 * "instrucciones internas" permanentes de la IA.
 *
 * Orden importante: la marca (reglas de oro) va primero para máxima prioridad.
 */
const CONTEXT_DIR = path.join(process.cwd(), "content", "context");

const DOCS = [
  { file: "marca-elabela.md", title: "MARCA ELABELA — REGLAS DE ORO" },
  { file: "lentes-de-analisis.md", title: "LENTES DE ANÁLISIS" },
  { file: "costos-ia.md", title: "MATRIZ DE COSTOS C. IA" },
  { file: "formato-guion-ia.md", title: "FORMATO GUION 100% IA" },
  { file: "formato-guion-hibrido.md", title: "FORMATO GUION HÍBRIDO" },
] as const;

let cache: Record<string, string> | null = null;

async function loadAll(): Promise<Record<string, string>> {
  if (cache) return cache;
  const entries = await Promise.all(
    DOCS.map(async ({ file }) => {
      const content = await fs.readFile(path.join(CONTEXT_DIR, file), "utf-8");
      return [file, content] as const;
    }),
  );
  cache = Object.fromEntries(entries);
  return cache;
}

export interface ContextDocs {
  marca: string;
  lentes: string;
  costos: string;
  formato: string;
  /** Bloque listo para inyectar en el prompt del sistema. */
  combined: string;
}

/**
 * Devuelve los documentos relevantes según el modo de producción.
 * Siempre incluye marca, lentes de análisis y costos; el formato depende del modo.
 */
export async function loadContextDocs(
  productionMode: "ia" | "hibrido",
): Promise<ContextDocs> {
  const all = await loadAll();
  const formatoFile =
    productionMode === "hibrido"
      ? "formato-guion-hibrido.md"
      : "formato-guion-ia.md";

  const ordered = [
    { title: DOCS[0].title, body: all["marca-elabela.md"] },
    { title: DOCS[1].title, body: all["lentes-de-analisis.md"] },
    { title: DOCS[2].title, body: all["costos-ia.md"] },
    {
      title:
        productionMode === "hibrido"
          ? "FORMATO GUION HÍBRIDO"
          : "FORMATO GUION 100% IA",
      body: all[formatoFile],
    },
  ];

  const combined = ordered
    .map(
      (d) =>
        `\n══════════════════════════════════════════\n# ${d.title}\n══════════════════════════════════════════\n${d.body.trim()}`,
    )
    .join("\n");

  return {
    marca: all["marca-elabela.md"],
    lentes: all["lentes-de-analisis.md"],
    costos: all["costos-ia.md"],
    formato: all[formatoFile],
    combined,
  };
}
