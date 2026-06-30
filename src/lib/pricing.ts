import type {
  CostRow,
  CostSummary,
  PromptBlock,
  Scene,
} from "./types";

// ─────────────────────────────────────────────────────────────
//  Cálculo DETERMINISTA de créditos a partir de los prompts reales
//  del guion (no se confía en lo que improvise el modelo). Basado en
//  content/context/costos-ia.md.
// ─────────────────────────────────────────────────────────────

export const HIGHFIELD_LIMIT = 100;
export const OMNI_LIMIT = 38;

/** Solo estos tipos de prompt consumen créditos de video. */
const BILLABLE = new Set<PromptBlock["kind"]>(["animacion", "lipsync"]);

/** Lee la duración (s) de un clip desde su timecode, su contenido o por defecto. */
function clipDuration(p: PromptBlock): number {
  // 1) timecode propio del clip "33s – 39s"
  if (p.timecode) {
    const m = p.timecode.match(/(\d+(?:\.\d+)?)\s*s[^0-9]*(\d+(?:\.\d+)?)\s*s/i);
    if (m) {
      const d = Math.round(parseFloat(m[2]) - parseFloat(m[1]));
      if (d > 0) return Math.min(d, 15);
    }
  }
  // 2) "Duration: 6 seconds" / "6s" dentro del prompt
  const text = `${p.content?.es ?? ""} ${p.content?.pt ?? ""}`;
  const md =
    text.match(/dura(?:tion|ção|ción)?[^0-9]*(\d+(?:\.\d+)?)/i) ||
    text.match(/(\d+(?:\.\d+)?)\s*(?:s\b|seg|second|segundo)/i);
  if (md) {
    const d = Math.round(parseFloat(md[1]));
    if (d > 0) return Math.min(d, 15);
  }
  // 3) por defecto
  return 5;
}

interface Priced {
  model: string;
  resolution: string;
  duration: string;
  cost: number;
  wallet: CostRow["wallet"];
}

/** Mapea modelo + duración a costo/billetera según la matriz de costos. */
function priceFor(p: PromptBlock): Priced {
  const model = (p.model ?? "").toLowerCase();
  const content = `${p.content?.es ?? ""} ${p.content?.pt ?? ""}`;
  const dur = clipDuration(p);
  const durLabel = `${dur}s`;

  // Video Maestro con Lipsync (Seedance 2.0 mini lipsync) → 38c, hasta 15s.
  if (p.kind === "lipsync" || model.includes("lipsync")) {
    return {
      model: p.model || "Seedance 2.0 mini (Lipsync)",
      resolution: "720p",
      duration: `${Math.min(dur, 15)}s`,
      cost: 38,
      wallet: "Highfield",
    };
  }

  // Omni Flash (relleno económico) → billetera Omni.
  if (model.includes("omni")) {
    const cost = dur <= 4 ? 7 : dur <= 6 ? 1 : 12;
    return {
      model: p.model || "Omni Flash",
      resolution: "Estándar",
      duration: durLabel,
      cost,
      wallet: "Omni Flash",
    };
  }

  // Kling 3.0 (texturas / macro).
  if (model.includes("kling")) {
    const is4k = /\b4k\b/i.test(content);
    const cost = is4k ? 30 : dur <= 5 ? 7.5 : 12;
    return {
      model: p.model || "Kling 3.0",
      resolution: is4k ? "4K" : "720p",
      duration: is4k ? "5s" : durLabel,
      cost,
      wallet: "Highfield",
    };
  }

  // Seedance 2.0 / mini (B-Roll o alta calidad).
  if (model.includes("seedance")) {
    const mini = model.includes("mini");
    const cost = mini ? (dur <= 5 ? 13 : 20) : dur <= 5 ? 23 : 36;
    return {
      model: p.model || (mini ? "Seedance 2.0 mini" : "Seedance 2.0"),
      resolution: "720p",
      duration: durLabel,
      cost,
      wallet: "Highfield",
    };
  }

  // Modelo de video desconocido → estimación conservadora (Seedance mini B-Roll).
  const cost = dur <= 5 ? 13 : 20;
  return {
    model: p.model || "Seedance 2.0 mini",
    resolution: "720p",
    duration: durLabel,
    cost,
    wallet: "Highfield",
  };
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Construye el desglose de créditos REAL a partir de las escenas del guion. */
export function computeCosts(scenes: Scene[]): CostSummary {
  const rows: CostRow[] = [];

  for (const scene of scenes ?? []) {
    const label = scene.label?.es || scene.id;
    for (const p of scene.prompts ?? []) {
      if (!BILLABLE.has(p.kind)) continue;
      const priced = priceFor(p);
      const tc = p.timecode || scene.timecode || "";
      rows.push({
        shot: tc ? `${label} · ${tc}` : label,
        model: priced.model,
        resolution: priced.resolution,
        duration: priced.duration,
        cost: priced.cost,
        wallet: priced.wallet,
      });
    }
  }

  const highfieldTotal = round2(
    rows
      .filter((r) => r.wallet === "Highfield")
      .reduce((s, r) => s + (Number(r.cost) || 0), 0),
  );
  const omniFlashTotal = round2(
    rows
      .filter((r) => r.wallet === "Omni Flash")
      .reduce((s, r) => s + (Number(r.cost) || 0), 0),
  );

  return {
    rows,
    highfieldTotal,
    omniFlashTotal,
    highfieldLimit: HIGHFIELD_LIMIT,
    omniFlashLimit: OMNI_LIMIT,
  };
}
