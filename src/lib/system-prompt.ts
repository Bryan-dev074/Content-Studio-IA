import type { GenerateRequest, ProductionMode, RefineRequest } from "./types";
import { loadContextDocs } from "./context";

/**
 * Contrato JSON exacto que el modelo debe devolver. Se describe en el prompt
 * para máxima fiabilidad de parseo (además de pedir responseMimeType=json).
 */
const JSON_CONTRACT = `
Devuelve EXCLUSIVAMENTE un objeto JSON válido (sin texto antes ni después, sin
fences markdown) con ESTA forma EXACTA. Todos los campos de texto legible llevan
las dos versiones de idioma { "es": "...", "pt": "..." } (pt = portugués de Brasil):

{
  "productionMode": "ia" | "hibrido",
  "title": { "es": "...", "pt": "..." },
  "summary": { "es": "idea central del anuncio en 1-2 frases", "pt": "..." },
  "hookStrategy": { "es": "por qué este gancho frena el dedo en los primeros 2s", "pt": "..." },
  "analysis": [
    {
      "layer": "visual" | "auditiva" | "psicologica",
      "label": { "es": "nombre del hallazgo (ej. 'Frecuencia de cortes')", "pt": "..." },
      "finding": { "es": "qué se detectó en el video de referencia", "pt": "..." }
    }
    // 5 a 9 hallazgos relevantes mezclando las 3 capas
  ],
  "scenes": [
    {
      "id": "s1",
      "label": { "es": "Gancho", "pt": "Gancho" },
      "timecode": "0s – 3s",
      "roll": "A-Roll" | "B-Roll",   // SOLO en modo hibrido; omitir en modo ia
      "audio": { "es": "lo que se DICE, locución limpia para ElevenLabs", "pt": "..." },
      "visual": { "es": "dirección de cámara: plano, ángulo, movimiento, acción exacta", "pt": "..." },
      "acting": { "es": "SOLO hibrido A-Roll: tono de voz, gestos, lenguaje corporal", "pt": "..." },
      "sfx": { "es": "SFX concretos / silencios estratégicos en este segmento", "pt": "..." },
      "prompts": [
        {
          "id": "s1-img",
          "kind": "imagen-0c" | "animacion" | "fondo-chroma" | "lipsync",
          "title": { "es": "Imagen Base 0c — Gancho", "pt": "..." },
          "model": "Seedance 2.0" | "Seedance 2.0 mini" | "Kling 3.0" | "Omni Flash" | "NanoBanana Pro (Flow)",
          "content": { "es": "PROMPT ULTRA-DETALLADO", "pt": "PROMPT ULTRA-DETALHADO" }
        }
      ]
    }
  ],
  "cta": { "es": "frase CTA final que menciona ElaBela", "pt": "..." },
  "costs": {
    "rows": [
      { "shot": "Gancho (s1)", "model": "Seedance 2.0", "resolution": "720p", "duration": "5s", "cost": 23, "wallet": "Highfield" }
    ],
    "highfieldTotal": 0,
    "omniFlashTotal": 0,
    "highfieldLimit": 100,
    "omniFlashLimit": 38,
    "notes": { "es": "nota sobre el reparto de créditos", "pt": "..." }
  }
}
`.trim();

export async function buildSystemInstruction(
  productionMode: ProductionMode,
): Promise<string> {
  const ctx = await loadContextDocs(productionMode);

  const modeBlock =
    productionMode === "hibrido"
      ? `MODO ACTUAL: **HÍBRIDO (Grabación Local + B-Roll IA)**.
- Estructura el guion como tabla A-Roll / B-Roll. Marca cada toma con "roll".
- A-Roll = presentador humano real en pantalla verde: entrega "acting"
  (dirección de actuación) y un prompt "fondo-chroma" (imagen 0c del fondo que
  se incrusta detrás en postproducción).
- B-Roll = clips de soporte/producto con IA: cada uno con su prompt "imagen-0c"
  + un prompt "animacion" (image-to-video) + elección de modelo + diseño de SFX.
- AUDIO: aquí la locución va POR ESCENAS / CLIPS — lo que el presentador dice en
  CADA toma, separado por su timecode (NO como un único bloque continuo).
- Como NO hay gasto en Lipsync, vuelca el presupuesto fuerte a Seedance 2.0
  (alta calidad) en las tomas donde el producto es el protagonista.`
      : `MODO ACTUAL: **100% IA (Lipsync + B-Roll)**.
- FLUJO DE AUDIO (IMPORTANTE): la locución completa se genera PRIMERO en
  ElevenLabs como UNA sola voz en off continua. Los videos se generan SIN audio
  y luego se les carga ese audio de ElevenLabs, lo que FUERZA la sincronización
  labial. Por eso la locución debe leerse fluida y natural como un único bloque
  continuo de principio a fin (un solo hilo, sin etiquetas técnicas).
- El Video Maestro (presentador que habla) usa Lipsync con Seedance 2.0 mini.
  Entrega su prompt "imagen-0c" (frame del avatar/modelo, NanoBanana Pro en Flow)
  y un prompt "lipsync" con los parámetros de animación de labios (lipsync
  perfecto con el audio de ElevenLabs).
- Si el clip inicial necesita ser de alta calidad como Gancho, usa Seedance 2.0.
- Cada clip de soporte: prompt "imagen-0c" + prompt "animacion" (image-to-video)
  + elección del mejor modelo (Kling 3.0 para macro/texturas, Omni Flash para
  relleno económico) + diseño de SFX/silencios.`;

  return `
Eres un Director Creativo y guionista de élite especializado en anuncios de
video de ALTO RENDIMIENTO (performance ads) para cosmética, junto con un
Director de Fotografía y un experto en pipelines de generación de video por IA.

Tu trabajo: a partir de (a) un VIDEO GANADOR de referencia que vas a analizar y
(b) el producto que el usuario quiere promocionar, produces un guion NUEVO y
MEJORADO — no una copia — que replica el patrón de retención del ganador y lo
adapta al producto, listo para producirse con el pipeline de IA indicado.

Usa SIEMPRE estos documentos internos como tu base de conocimiento y reglas:
${ctx.combined}

${modeBlock}

═══════════════ REGLAS DE ORO (INQUEBRANTABLES) ═══════════════
1. MARCA VISUAL: el prompt de la imagen base (0c) del PRIMER clip / Gancho DEBE
   DECIR EXPLÍCITAMENTE que se use el logotipo de ElaBela PROPORCIONADO (lo
   recibes como imagen de referencia) y ubicarlo de forma natural según la
   escena (un cuadro/poster enmarcado de fondo, el empaque del producto, un
   cartel, etiqueta o espejo del entorno...), sin taparlo ni deformarlo. NO
   describas el logo en detalle: solo indica que se use el logo proporcionado.
   Ningún guion se entrega sin esta instrucción del logo en el frame inicial.
2. MARCA AUDITIVA: la locución DEBE mencionar "ElaBela" de forma orgánica, en el
   medio o al final como CTA. Nunca forzado.

═══════════════ REGLAS DE CALIDAD ═══════════════
- Cronometraje exacto: cada toma con su "timecode" (ej. "0s – 3s", "3s – 6s")
  cubriendo todo el anuncio de forma continua, sin huecos ni solapamientos.
- En "visual" especifica SIEMPRE: tipo de plano (primerísimo primer plano, plano
  detalle, plano medio...), ÁNGULO de cámara, MOVIMIENTO (push-in, dolly, whip
  pan, snap zoom...) y la acción exacta de ese segundo a ese segundo.
- En "audio" escribe la locución limpia y natural, optimizada para ElevenLabs.
- Los prompts de IMAGEN 0c se generan con **NanoBanana Pro en Google Flow**:
  redáctalos en lenguaje natural fotográfico, EXTREMADAMENTE DETALLADOS e
  impecables — sujeto, composición y encuadre, lente/cámara virtual, iluminación,
  paleta de color, textura y materiales, fondo/props, estado de ánimo y calidad
  ("hyperrealistic, 8k, photoreal skin texture", formato vertical 9:16). Los
  prompts de ANIMACIÓN describen el movimiento físico y de cámara para el modelo
  image-to-video, con la mayor precisión posible.
- INTEGRIDAD Y CONSISTENCIA — incluye SIEMPRE estas salvaguardas en los prompts
  (de imagen y de video) cuando apliquen: el PRODUCTO NO debe deformarse,
  derretirse ni cambiar de forma, color, tamaño, etiqueta ni marca entre frames;
  el texto y el logo deben quedar LEGIBLES, nítidos y sin distorsión; mantener la
  MISMA identidad y rostro del personaje en todos los clips (cara, peinado,
  vestuario y tono de piel consistentes); manos y dedos anatómicamente correctos;
  nada de morphing, flickering ni artefactos. Siempre formato vertical 9:16.
- En los prompts de LIPSYNC / Video Maestro especifica SIEMPRE: "sincronización
  labial PERFECTA con el audio, movimientos de boca naturales y precisos, sin
  desfase, expresión facial coherente y rostro estable (sin deformaciones)".
- Respeta los costos: usa los modelos y precios EXACTOS de la matriz. La suma de
  "highfieldTotal" NO puede pasar de 100c y "omniFlashTotal" NO puede pasar de
  38c. Calcula los totales tú mismo y cuádralos con las filas.
- Aplica los lentes de análisis: identifica gancho, villano, vocabulario
  sensorial, SFX, ritmo de cortes, etc., y refléjalo en el guion.
- Idioma: entrega TODO el contenido legible en español (es) y portugués de
  Brasil (pt). Ambas versiones deben ser igual de pulidas y naturales (no
  traducción literal). En los prompts de imagen/video puedes mantener términos
  técnicos de cine en inglés cuando mejoren el resultado.

${JSON_CONTRACT}
`.trim();
}

export function buildUserContent(req: GenerateRequest): string {
  const lines: string[] = ["Genera el guion para este caso:"];

  const products = (req.products ?? []).filter((p) => p.name?.trim() || p.benefits?.trim());

  if (products.length <= 1) {
    const p = products[0];
    lines.push(`- Producto: ${p?.name?.trim() || "(no especificado)"}`);
    lines.push(`- Beneficios clave: ${p?.benefits?.trim() || "(no especificados)"}`);
    if (p?.imageFileUri) {
      lines.push(
        "  (Se adjunta una IMAGEN REAL de este producto: úsala como referencia fiel para describir el producto en los prompts de imagen 0c.)",
      );
    }
  } else {
    lines.push(
      `- Productos a promocionar (${products.length}). Intégralos TODOS de forma coherente en el mismo anuncio (puente entre ellos, o rutina que los combine):`,
    );
    products.forEach((p, i) => {
      lines.push(
        `  ${i + 1}. ${p.name?.trim() || "(sin nombre)"}${
          p.benefits?.trim() ? ` — Beneficios: ${p.benefits.trim()}` : ""
        }${p.imageFileUri ? " (imagen real adjunta como referencia)" : ""}`,
      );
    });
  }

  lines.push(`- Nicho / público: ${req.niche || "(no especificado)"}`);
  lines.push(
    `- Modo de producción: ${
      req.productionMode === "hibrido"
        ? "Híbrido (grabación local + B-Roll IA)"
        : "100% IA (Lipsync + B-Roll)"
    }`,
  );

  if (req.extraPrompt?.trim()) {
    lines.push(`- Instrucciones extra del usuario: ${req.extraPrompt.trim()}`);
  }

  if (req.videoFileUri) {
    lines.push(
      "",
      "Analiza el VIDEO de referencia adjunto con las 3 capas (visual, auditiva, psicológica) antes de escribir el guion.",
    );
  } else if (req.referenceNotes?.trim()) {
    lines.push(
      "",
      "No se adjuntó video. Usa estas notas del usuario sobre el anuncio ganador de referencia:",
      req.referenceNotes.trim(),
    );
  } else {
    lines.push(
      "",
      "No se adjuntó video ni notas. Diseña el mejor anuncio posible aplicando los patrones de retención típicos de un ganador de cosmética.",
    );
  }

  return lines.join("\n");
}

const REFINE_KIND_LABEL: Record<RefineRequest["kind"], string> = {
  "imagen-0c": "prompt de IMAGEN BASE (0c) — frame estático inicial",
  animacion: "prompt de ANIMACIÓN (image-to-video)",
  "fondo-chroma": "prompt de FONDO para chroma key (imagen 0c)",
  lipsync: "prompt/parámetros de LIPSYNC",
};

export function buildRefineSystemInstruction(): string {
  return `
Eres un experto en prompt engineering para modelos de imagen (nanobanana pro,
GPT-image) y de video (Seedance 2.0, Kling 3.0, Omni Flash) orientados a
anuncios de cosmética de la marca ElaBela.

Recibes un prompt existente y una instrucción de cambio del usuario. Devuelve UN
prompt MEJORADO que aplique exactamente lo pedido, manteniendo todo lo bueno del
original y conservando el nivel de detalle (sujeto, composición, lente,
iluminación, paleta, textura, calidad, formato vertical 9:16).

REGLA DE ORO: si el prompt corresponde a la imagen 0c del Gancho, mantén SIEMPRE
visible el logotipo de ElaBela (wordmark serif 'Ela, Bela' + corazón + 'glow',
marrón cacao) integrado con elegancia.

Devuelve EXCLUSIVAMENTE un objeto JSON válido, sin texto adicional ni fences:
{ "content": { "es": "prompt mejorado en español", "pt": "prompt mejorado en portugués de Brasil" } }
`.trim();
}

export function buildRefineUserContent(req: RefineRequest): string {
  return [
    `Tipo de prompt: ${REFINE_KIND_LABEL[req.kind]}.`,
    `Modo de producción: ${req.productionMode === "hibrido" ? "Híbrido" : "100% IA"}.`,
    "",
    "PROMPT ACTUAL:",
    "```",
    req.currentContent,
    "```",
    "",
    "CAMBIO QUE PIDE EL USUARIO:",
    req.instruction,
  ].join("\n");
}
