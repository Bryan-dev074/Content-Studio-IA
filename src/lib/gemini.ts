import "server-only";
import { GoogleGenAI } from "@google/genai";
import os from "node:os";
import path from "node:path";
import { promises as fs } from "node:fs";
import { randomUUID } from "node:crypto";

import {
  buildSystemInstruction,
  buildUserContent,
  buildRefineSystemInstruction,
  buildRefineUserContent,
  buildLocutionRefineSystemInstruction,
  buildLocutionRefineUserContent,
  buildSceneRegenSystemInstruction,
  buildSceneRegenUserContent,
} from "./system-prompt";
import { loadBrandLogo } from "./brand-asset";
import { extractJson, sleep } from "./utils";
import { computeCosts } from "./pricing";
import {
  buildRestructureSystemInstruction,
  buildRestructureUserContent,
} from "./system-prompt";
import type {
  GenerateRequest,
  LocutionRefineRequest,
  LocutionRefineResponse,
  RefineRequest,
  RefineResponse,
  RegenerateSceneRequest,
  RestructureRequest,
  Scene,
  ScriptResult,
  UploadResponse,
} from "./types";

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Falta GEMINI_API_KEY. Copia .env.example a .env.local y añade tu clave de https://aistudio.google.com/apikey",
    );
  }
  return new GoogleGenAI({ apiKey });
}

function getModel(): string {
  // gemini-2.5-flash: límites generosos en la capa GRATUITA y soporta video.
  return process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash";
}

/**
 * Llama a generateContent reintentando ante errores transitorios
 * (429 rate limit, 503 sobrecarga, 500). Evita que un pico momentáneo en la
 * capa gratuita rompa la generación.
 */
async function generateWithRetry(
  ai: GoogleGenAI,
  params: Parameters<typeof ai.models.generateContent>[0],
) {
  const MAX = 3;
  let lastErr: unknown;
  for (let attempt = 0; attempt < MAX; attempt++) {
    try {
      return await ai.models.generateContent(params);
    } catch (err) {
      lastErr = err;
      const status = (err as { status?: number })?.status;
      const msg = err instanceof Error ? err.message : String(err);
      const transient =
        status === 429 ||
        status === 500 ||
        status === 503 ||
        /\b(429|500|503)\b|rate|quota|overloaded|unavailable|temporar/i.test(msg);
      if (!transient || attempt === MAX - 1) break;
      await sleep(1800 * (attempt + 1));
    }
  }
  throw lastErr;
}

/**
 * Llama al modelo y PARSEA su JSON con tolerancia. Si la respuesta viene con JSON
 * inválido (p. ej. una comilla doble sin escapar dentro de un texto, que el
 * reparador no puede arreglar), REGENERA de cero hasta `max` veces — una salida
 * nueva del modelo casi siempre es válida. Se apoya en generateWithRetry para los
 * errores transitorios (429/500/503). Así un fallo puntual de formato no rompe la app.
 */
async function generateContentJson<T>(
  ai: GoogleGenAI,
  params: Parameters<typeof ai.models.generateContent>[0],
  max = 2,
): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 0; attempt < max; attempt++) {
    const response = await generateWithRetry(ai, params);
    const text = response.text;
    if (!text) {
      lastErr = new Error("El modelo no devolvió contenido.");
      continue;
    }
    try {
      return extractJson<T>(text);
    } catch (err) {
      lastErr = err; // JSON inválido → reintenta regenerando desde cero
    }
  }
  throw lastErr instanceof Error
    ? lastErr
    : new Error("No se pudo interpretar la respuesta del modelo. Inténtalo de nuevo.");
}

// ── Subida de video a la Files API ───────────────────────────

export async function uploadVideoToGemini(
  bytes: Buffer,
  mimeType: string,
  displayName: string,
): Promise<UploadResponse> {
  const ai = getClient();

  // El SDK sube de forma más fiable desde una ruta temporal en disco.
  const ext = mimeType.split("/")[1]?.replace(/[^a-z0-9]/gi, "") || "mp4";
  const tmpPath = path.join(os.tmpdir(), `elabela-${randomUUID()}.${ext}`);
  await fs.writeFile(tmpPath, bytes);

  try {
    let file = await ai.files.upload({
      file: tmpPath,
      config: { mimeType, displayName },
    });

    // Esperar a que el video termine de procesarse (puede tardar).
    const startedAt = Date.now();
    const TIMEOUT_MS = 4 * 60 * 1000;
    while (String(file.state) === "PROCESSING") {
      if (Date.now() - startedAt > TIMEOUT_MS) {
        throw new Error("El procesamiento del video superó el tiempo límite.");
      }
      await sleep(2500);
      file = await ai.files.get({ name: file.name as string });
    }

    if (String(file.state) === "FAILED") {
      throw new Error("Gemini no pudo procesar el video. Prueba con otro archivo.");
    }

    if (!file.uri || !file.mimeType) {
      throw new Error("La subida del video no devolvió una referencia válida.");
    }

    return {
      fileUri: file.uri,
      mimeType: file.mimeType,
      name: file.name as string,
      displayName: file.displayName ?? displayName,
    };
  } finally {
    await fs.unlink(tmpPath).catch(() => {});
  }
}

// ── Generación del guion ─────────────────────────────────────

function withFallbackIds(result: ScriptResult): ScriptResult {
  result.scenes = (result.scenes ?? []).map((scene, i) => {
    const sceneId = scene.id || `s${i + 1}`;
    return {
      ...scene,
      id: sceneId,
      prompts: (scene.prompts ?? []).map((p, j) => ({
        ...p,
        id: p.id || `${sceneId}-p${j + 1}`,
      })),
    };
  });
  return result;
}

export async function generateScript(
  req: GenerateRequest,
): Promise<ScriptResult> {
  const ai = getClient();
  const systemInstruction = await buildSystemInstruction(req.productionMode);
  const userText = buildUserContent(req);

  const parts: Array<Record<string, unknown>> = [{ text: userText }];
  if (req.videoFileUri && req.videoMimeType) {
    parts.push({
      fileData: { fileUri: req.videoFileUri, mimeType: req.videoMimeType },
    });
  }

  // Imágenes reales de los productos (si las hay) como referencia fiel.
  for (const p of req.products ?? []) {
    if (p.imageFileUri && p.imageMimeType) {
      parts.push({
        text: `Foto real del producto "${p.name?.trim() || "producto"}". ANALÍZALA: identifica qué producto es, su envase (frasco, gotero, tubo, tarro, spray...), color, material, tapa y la etiqueta/texto visible, y para qué sirve. Combínalo con la descripción del usuario y describe el producto de forma 100% FIEL a esta foto (mismo envase, color, proporciones y etiqueta) en los prompts de imagen 0c; no inventes un envase distinto:`,
      });
      parts.push({
        fileData: { fileUri: p.imageFileUri, mimeType: p.imageMimeType },
      });
    }
  }

  // Referencia visual del logo de ElaBela (si está en /logo). Recurso interno
  // para la IA: debe aparecer en la imagen 0c del Gancho. No se muestra en la UI.
  const logo = await loadBrandLogo();
  if (logo) {
    parts.push({
      text: "Logotipo de ElaBela PROPORCIONADO como referencia. El prompt de la imagen 0c del Gancho (que se generará con NanoBanana Pro en Flow) debe indicar que se USE este logo proporcionado, ubicándolo de forma natural según la escena (un cuadro/poster de fondo, el empaque del producto, un cartel...). No lo describas en detalle; solo di que se use el logo proporcionado:",
    });
    parts.push({ inlineData: { mimeType: logo.mimeType, data: logo.data } });
  }

  const parsed = await generateContentJson<ScriptResult>(ai, {
    model: getModel(),
    contents: [{ role: "user", parts }],
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      temperature: 0.85,
      topP: 0.95,
      // Amplio: los prompts ultra-detallados + el "thinking" de 2.5-flash
      // consumen tokens; con poco margen el JSON se truncaba.
      maxOutputTokens: 65536,
    },
  });

  const result = withFallbackIds(parsed);
  // Créditos DETERMINISTAS desde los prompts reales (no lo que improvise el modelo).
  result.costs = computeCosts(result.scenes);
  return result;
}

// ── Reestructuración del guion completo a otra duración ──────

export async function restructureScript(
  req: RestructureRequest,
): Promise<ScriptResult> {
  const ai = getClient();
  const systemInstruction = await buildRestructureSystemInstruction(
    req.productionMode,
  );

  const parts: Array<Record<string, unknown>> = [
    { text: buildRestructureUserContent(req) },
  ];

  const logo = await loadBrandLogo();
  if (logo) {
    parts.push({
      text: "Logotipo de ElaBela proporcionado: el prompt de imagen 0c del Gancho / primer clip debe indicar que se use este logo, ubicado de forma natural (sin describirlo en detalle):",
    });
    parts.push({ inlineData: { mimeType: logo.mimeType, data: logo.data } });
  }

  const parsed = await generateContentJson<ScriptResult>(ai, {
    model: getModel(),
    contents: [{ role: "user", parts }],
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      temperature: 0.8,
      topP: 0.95,
      maxOutputTokens: 65536,
    },
  });

  const result = withFallbackIds(parsed);
  result.costs = computeCosts(result.scenes);
  return result;
}

// ── Refinamiento de un prompt ────────────────────────────────

export async function refinePrompt(
  req: RefineRequest,
): Promise<RefineResponse> {
  const ai = getClient();

  return generateContentJson<RefineResponse>(
    ai,
    {
      model: getModel(),
      contents: [
        { role: "user", parts: [{ text: buildRefineUserContent(req) }] },
      ],
      config: {
        systemInstruction: buildRefineSystemInstruction(),
        responseMimeType: "application/json",
        temperature: 0.9,
        maxOutputTokens: 4096,
      },
    },
    3,
  );
}

// ── Refinamiento de la locución (alternativas) ───────────────

export async function refineLocution(
  req: LocutionRefineRequest,
): Promise<LocutionRefineResponse> {
  const ai = getClient();

  const result = await generateContentJson<LocutionRefineResponse>(
    ai,
    {
      model: getModel(),
      contents: [
        { role: "user", parts: [{ text: buildLocutionRefineUserContent(req) }] },
      ],
      config: {
        systemInstruction: buildLocutionRefineSystemInstruction(
          req.productionMode,
        ),
        responseMimeType: "application/json",
        temperature: 1,
        topP: 0.95,
        maxOutputTokens: 4096,
      },
    },
    3,
  );

  // Normaliza: solo alternativas con texto real, máximo 3.
  result.suggestions = (result.suggestions ?? [])
    .filter((s) => s?.content?.es?.trim() || s?.content?.pt?.trim())
    .slice(0, 3);
  return result;
}

// ── Regeneración de una escena ───────────────────────────────

export async function regenerateScene(
  req: RegenerateSceneRequest,
): Promise<Scene> {
  const ai = getClient();
  const systemInstruction = await buildSceneRegenSystemInstruction(
    req.productionMode,
  );
  const parts: Array<Record<string, unknown>> = [
    { text: buildSceneRegenUserContent(req) },
  ];

  for (const p of req.products ?? []) {
    if (p.imageFileUri && p.imageMimeType) {
      parts.push({
        text: `Foto real del producto "${p.name?.trim() || "producto"}". Analízala (envase, color, material, etiqueta/logo) y describe el producto FIEL a esta foto, sin inventar un envase distinto:`,
      });
      parts.push({
        fileData: { fileUri: p.imageFileUri, mimeType: p.imageMimeType },
      });
    }
  }

  const logo = await loadBrandLogo();
  if (logo) {
    parts.push({
      text: "Logotipo de ElaBela proporcionado. Úsalo SOLO si esta escena es el Gancho / primer clip con imagen 0c, ubicándolo de forma natural en la escena (no lo describas en detalle):",
    });
    parts.push({ inlineData: { mimeType: logo.mimeType, data: logo.data } });
  }

  const scene = await generateContentJson<Scene>(
    ai,
    {
      model: getModel(),
      contents: [{ role: "user", parts }],
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.9,
        topP: 0.95,
        maxOutputTokens: 24576,
      },
    },
    3,
  );
  scene.id = req.sceneId;
  scene.prompts = (scene.prompts ?? []).map((p, j) => ({
    ...p,
    id: p.id || `${req.sceneId}-p${j + 1}`,
  }));
  return scene;
}
