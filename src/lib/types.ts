// ─────────────────────────────────────────────────────────────
//  Tipos compartidos (frontend + backend)
// ─────────────────────────────────────────────────────────────

export type ProductionMode = "ia" | "hibrido";
export type Lang = "es" | "pt";

/** Texto que existe en los dos idiomas soportados. */
export interface Localized {
  es: string;
  pt: string;
}

export type PromptKind = "imagen-0c" | "animacion" | "fondo-chroma" | "lipsync";

/** Un bloque de prompt editable (imagen base, animación, lipsync, fondo). */
export interface PromptBlock {
  id: string;
  kind: PromptKind;
  title: Localized;
  /** Modelo recomendado: "Seedance 2.0", "Kling 3.0", "Omni Flash", "nanobanana pro"... */
  model?: string;
  /** El prompt en sí, ultra-detallado, en ambos idiomas. Es editable en la UI. */
  content: Localized;
}

/** Una toma / segmento del guion. */
export interface Scene {
  id: string;
  /** "Gancho", "Desarrollo", "Puente de venta", "CTA"... */
  label: Localized;
  /** Rango temporal exacto, ej: "0s – 3s". */
  timecode: string;
  /** Solo en modo híbrido: a qué rollo pertenece la toma. */
  roll?: "A-Roll" | "B-Roll";
  /** Locución limpia, lista para ElevenLabs (lo que se DICE). */
  audio: Localized;
  /** Dirección de cámara / visual (lo que se VE). */
  visual: Localized;
  /** Solo modo híbrido (A-Roll): dirección de actuación del presentador. */
  acting?: Localized;
  /** SFX, hilos sonoros o silencios estratégicos. */
  sfx?: Localized;
  /** Bloques de prompts asociados a esta toma. */
  prompts: PromptBlock[];
}

export interface AnalysisInsight {
  layer: "visual" | "auditiva" | "psicologica";
  label: Localized;
  finding: Localized;
}

export interface CostRow {
  /** A qué toma corresponde. */
  shot: string;
  model: string;
  resolution: string;
  duration: string;
  cost: number;
  wallet: "Highfield" | "Omni Flash";
}

export interface CostSummary {
  rows: CostRow[];
  highfieldTotal: number;
  omniFlashTotal: number;
  highfieldLimit: number;
  omniFlashLimit: number;
  notes?: Localized;
}

/** Resultado completo de una generación. */
export interface ScriptResult {
  productionMode: ProductionMode;
  title: Localized;
  summary: Localized;
  /** Explicación de la estrategia de gancho elegida. */
  hookStrategy: Localized;
  /** Hallazgos detectados del video de referencia (lentes de análisis). */
  analysis: AnalysisInsight[];
  /** Las tomas del guion, en orden. */
  scenes: Scene[];
  /** CTA final (siempre menciona ElaBela). */
  cta: Localized;
  /** Desglose de créditos. */
  costs: CostSummary;
}

// ── Payloads de las rutas API ────────────────────────────────

export interface GenerateRequest {
  productName: string;
  benefits: string;
  niche: string;
  productionMode: ProductionMode;
  extraPrompt?: string;
  /** Descripción textual del video de referencia (fallback si no se sube video). */
  referenceNotes?: string;
  /** Archivo subido a Gemini Files API. */
  videoFileUri?: string;
  videoMimeType?: string;
}

export interface UploadResponse {
  fileUri: string;
  mimeType: string;
  name: string;
  displayName?: string;
}

export interface RefineRequest {
  /** Prompt actual (en el idioma que el usuario está viendo). */
  currentContent: string;
  /** Tipo de prompt para dar contexto al refinamiento. */
  kind: PromptKind;
  /** Instrucción del usuario: qué quiere cambiar. */
  instruction: string;
  productionMode: ProductionMode;
}

export interface RefineResponse {
  content: Localized;
}
