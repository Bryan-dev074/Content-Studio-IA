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
} from "./system-prompt";
import { extractJson, sleep } from "./utils";
import type {
  GenerateRequest,
  RefineRequest,
  RefineResponse,
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
  return process.env.GEMINI_MODEL?.trim() || "gemini-2.5-pro";
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

  const response = await ai.models.generateContent({
    model: getModel(),
    contents: [{ role: "user", parts }],
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      temperature: 0.85,
      topP: 0.95,
      maxOutputTokens: 32768,
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("El modelo no devolvió contenido. Inténtalo de nuevo.");
  }

  const parsed = extractJson<ScriptResult>(text);
  return withFallbackIds(parsed);
}

// ── Refinamiento de un prompt ────────────────────────────────

export async function refinePrompt(
  req: RefineRequest,
): Promise<RefineResponse> {
  const ai = getClient();

  const response = await ai.models.generateContent({
    model: getModel(),
    contents: [{ role: "user", parts: [{ text: buildRefineUserContent(req) }] }],
    config: {
      systemInstruction: buildRefineSystemInstruction(),
      responseMimeType: "application/json",
      temperature: 0.9,
      maxOutputTokens: 4096,
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("El modelo no devolvió un prompt refinado.");
  }

  return extractJson<RefineResponse>(text);
}
