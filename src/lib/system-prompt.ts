import type {
  GenerateRequest,
  ProductionMode,
  RefineRequest,
  RegenerateSceneRequest,
  RestructureRequest,
  ScriptResult,
} from "./types";
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
          "purpose": { "es": "QUÉ se quiere generar y TIPO de toma: 'Toma de PRODUCTO', 'Toma del AVATAR/PERSONA', 'Toma de FONDO/ESCENARIO' o 'Toma de TEXTURA/DETALLE' + una frase de objetivo", "pt": "..." },
          "flowInputs": { "es": "QUÉ cargar en Google Flow para esta toma: 'Foto del producto', 'Logo de ElaBela', 'Frame del avatar', combinación o 'Ninguno'", "pt": "..." },
          "timecode": "33s – 39s",   // rango EXACTO que cubre ESTE clip dentro de la escena (cuando hay varios clips). Imagen 0c y su animación comparten timecode.
          "content": { "es": "PROMPT ULTRA-DETALLADO Y AUTOCONTENIDO", "pt": "PROMPT ULTRA-DETALHADO E AUTOCONTIDO" }
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
- AUDIO: el presentador GRABA su locución con su PROPIA voz en el momento de
  rodar (NO se usa ElevenLabs ni voz IA en este modo). Por eso la locución va POR
  ESCENAS / CLIPS — lo que el presentador dice en CADA toma, separado por su
  timecode (NO como un único bloque continuo). No menciones ElevenLabs.
- Como NO hay gasto en Lipsync ni en voz IA, vuelca el presupuesto fuerte a
  Seedance 2.0 (alta calidad) en las tomas donde el producto es el protagonista.`
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
- NÚMERO DE TOMAS: estructura el anuncio en 4–6 tomas (máximo 7). Prioriza la
  PROFUNDIDAD de cada prompt sobre la cantidad de tomas.
- En "visual" especifica SIEMPRE: tipo de plano (primerísimo primer plano, plano
  detalle, plano medio...), ÁNGULO de cámara, MOVIMIENTO (push-in, dolly, whip
  pan, snap zoom...) y la acción exacta de ese segundo a ese segundo.
- En "audio" escribe la locución limpia y natural, optimizada para ElevenLabs.
- RITMO DE LOCUCIÓN (CRÍTICO): la locución de CADA toma DEBE poder decirse cómoda y
  natural DENTRO de su timecode. Regla práctica: ~2–3 palabras por segundo. Un clip
  de 3–4s admite ~8–12 palabras COMO MÁXIMO; uno de 6s, ~15–18. NUNCA escribas un
  texto largo imposible de leer en el tiempo del clip: si no entra, recorta el
  mensaje, simplifícalo o repártelo en más tomas. El guion debe poder locutarse
  completo dentro de la duración total sin acelerarse de forma artificial.
- TIMECODE POR CLIP: cuando una toma tenga VARIOS clips (varias imágenes 0c +
  animaciones), asigna a CADA par imagen/animación su "timecode" EXACTO (ej.
  "33s – 39s", "39s – 45s") de modo que los clips llenen el rango de la escena en
  orden, sin huecos ni solapes; la imagen 0c y su animación comparten el mismo
  "timecode". Si la toma es un único clip, el "timecode" del prompt = el de la escena.
- ANÁLISIS DEL PRODUCTO: si se adjunta una FOTO del producto, ANALÍZALA a fondo —
  identifica qué producto es (tipo/categoría), su ENVASE (frasco, gotero, tubo,
  tarro, spray...), color, material, acabado, tapa y la etiqueta/texto visible, y
  deduce para qué sirve. COMBINA ese análisis visual con la descripción textual del
  usuario y describe el producto en los prompts de forma 100% FIEL a la foto (mismo
  envase, color, proporciones, etiqueta y logo). NUNCA inventes un envase distinto
  al de la imagen.
- CLARIDAD DE CADA PROMPT (campos "purpose" y "flowInputs"): por CADA prompt deja
  EXPLÍCITO (a) en "purpose" QUÉ se quiere generar y de qué TIPO de toma es —
  Producto / Avatar-Persona / Fondo-Escenario / Textura-Detalle — y (b) en
  "flowInputs" QUÉ insumos hay que cargar en Google Flow: la foto del producto, el
  logo de ElaBela, el frame del avatar, una combinación, o "Ninguno".
- UN SOLO SUJETO POR IMAGEN: cada imagen 0c muestra UN único foco. NUNCA pongas
  varios productos distintos juntos en la misma toma ni satures la escena con
  objetos. Si el guion tiene varios productos, cada uno va en su propia toma.
- PROMPTS DE IMAGEN 0c (NanoBanana Pro en Google Flow) — redáctalos en lenguaje
  natural fotográfico, EXTREMADAMENTE DETALLADOS, impecables y AUTOCONTENIDOS (un
  párrafo denso, ~80–140 palabras). Para CONTROL TOTAL del resultado, cada prompt de
  imagen DEBE cubrir SIEMPRE, en este orden:
  1) SUJETO principal exacto y qué tipo de toma es (producto / persona-avatar /
     fondo / textura) — un solo foco.
  2) Si es PERSONA: edad aprox., fenotipo, peinado, maquillaje, expresión, vestuario
     y manos (anatómicamente correctas). Si es PRODUCTO: envase exacto, color,
     material, tapa, etiqueta/logo legibles, fiel a la foto si se aportó.
  3) ENCUADRE y plano (primerísimo primer plano, plano detalle, medio...), ÁNGULO y
     altura de cámara, y composición (regla de tercios, espacio negativo).
  4) CÁMARA/LENTE virtual: focal aproximada (ej. 35mm, 85mm, macro), apertura/bokeh,
     profundidad de campo.
  5) ILUMINACIÓN: esquema (key/fill/rim), dirección, dureza, temperatura de color,
     hora del día y atmósfera.
  6) PALETA de color, materiales y TEXTURAS concretas; FONDO y props específicos (sin
     objetos de más).
  7) CALIDAD y formato: "hyperrealistic, 8k, photoreal skin texture, vertical 9:16".
  8) NEGATIVOS/salvaguardas: nada de texto ni marcas inventadas, sin productos
     extra, sin manos deformes, sin morphing ni artefactos; producto y logo sin
     deformar.
- PROMPTS DE ANIMACIÓN / VIDEO (image-to-video) — IGUAL de detallados y
  AUTOCONTENIDOS. Cada uno DEBE cubrir SIEMPRE:
  1) Imagen 0c de PARTIDA (frame inicial) de la que arranca el clip.
  2) MOVIMIENTO del sujeto: qué se mueve y cómo, paso a paso (gota que cae, textura
     que fluye, parpadeo, giro del frasco...).
  3) MOVIMIENTO de CÁMARA: tipo (push-in, dolly, whip pan, orbit, snap zoom...),
     dirección, velocidad y curva (ease-in/out).
  4) DURACIÓN en segundos, resolución y fps; ritmo del clip.
  5) FÍSICA y luz en movimiento: peso, inercia, reflejos, cómo cambia la luz.
  6) CONTINUIDAD/salvaguardas: misma identidad de rostro y mismo producto/etiqueta en
     todos los frames, SIN morphing, flicker, warping ni deformación.
  7) RESULTADO esperado del clip (qué se ve al final).
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
        "  (Se adjunta una FOTO REAL de este producto: ANALÍZALA — envase, color, material, tapa, etiqueta/logo y para qué sirve — y combínala con la descripción de arriba. Describe el producto de forma 100% FIEL a esa foto en los prompts de imagen 0c, sin inventar un envase distinto.)",
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

  const videoDur =
    req.videoDurationSec && req.videoDurationSec > 0
      ? Math.round(req.videoDurationSec)
      : undefined;

  if (req.durationSec && req.durationSec > 0) {
    const target = videoDur
      ? Math.max(req.durationSec, videoDur) // nunca por debajo del video
      : req.durationSec;
    lines.push(
      `- Duración objetivo del anuncio: ~${target}s. Ajusta el número de escenas y los timecodes para que sumen esa duración total de forma continua, sin huecos ni solapamientos.`,
    );
    if (videoDur) {
      lines.push(
        `  El video de referencia dura ~${videoDur}s: el anuncio NUNCA debe durar MENOS que eso.`,
      );
    }
  } else if (videoDur) {
    // Modo automático con video: igualar (casi) la duración del original.
    lines.push(
      `- Duración objetivo del anuncio (AUTO): el video de referencia dura ~${videoDur}s. El anuncio debe durar CASI lo mismo: como máximo 2–3 segundos MENOS y NUNCA más de ${videoDur}s (rango ideal ${Math.max(
        1,
        videoDur - 3,
      )}–${videoDur}s). Ajusta escenas y timecodes para sumar esa duración de forma continua, sin huecos ni solapamientos.`,
    );
  }
  if (req.tone?.trim()) {
    lines.push(`- Tono de voz de la locución: ${req.tone.trim()}.`);
  }

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

// ── Regeneración de UNA escena ───────────────────────────────

const SCENE_CONTRACT = `
Devuelve EXCLUSIVAMENTE un objeto JSON de UNA escena (sin texto extra ni fences),
con texto legible en español (es) y portugués de Brasil (pt):
{
  "id": "<mismo id de la escena>",
  "label": { "es": "...", "pt": "..." },
  "timecode": "0s – 3s",
  "roll": "A-Roll" | "B-Roll",   // SOLO modo hibrido; omitir en modo ia
  "audio": { "es": "locución limpia para ElevenLabs", "pt": "..." },
  "visual": { "es": "plano, ángulo, movimiento y acción exactos", "pt": "..." },
  "acting": { "es": "SOLO hibrido A-Roll: tono, gestos", "pt": "..." },
  "sfx": { "es": "SFX / silencios", "pt": "..." },
  "prompts": [
    {
      "id": "<id>",
      "kind": "imagen-0c" | "animacion" | "fondo-chroma" | "lipsync",
      "title": { "es": "...", "pt": "..." },
      "model": "Seedance 2.0" | "Seedance 2.0 mini" | "Kling 3.0" | "Omni Flash" | "NanoBanana Pro (Flow)",
      "purpose": { "es": "QUÉ se genera y TIPO de toma (Producto / Avatar-Persona / Fondo / Textura) + objetivo", "pt": "..." },
      "flowInputs": { "es": "QUÉ cargar en Flow (foto del producto, logo de ElaBela, frame del avatar, Ninguno)", "pt": "..." },
      "timecode": "33s – 39s",   // rango exacto del clip si la escena tiene varios; si es único = el de la escena
      "content": { "es": "PROMPT ULTRA-DETALLADO Y AUTOCONTENIDO", "pt": "..." }
    }
  ]
}
`.trim();

export async function buildSceneRegenSystemInstruction(
  productionMode: ProductionMode,
): Promise<string> {
  const ctx = await loadContextDocs(productionMode);
  const modeNote =
    productionMode === "hibrido"
      ? "Modo HÍBRIDO: respeta A-Roll/B-Roll, el campo 'roll', 'acting' en A-Roll y 'fondo-chroma' donde aplique."
      : "Modo 100% IA: video maestro con lipsync (Seedance 2.0 mini) y B-Roll con el mejor modelo.";

  return `
Eres un Director Creativo experto en anuncios de cosmética. Vas a REGENERAR UNA
SOLA ESCENA de un guion ya existente, manteniendo total coherencia con el resto.

Base de conocimiento y reglas internas:
${ctx.combined}

${modeNote}

REGLAS DE LA REGENERACIÓN:
- Devuelve SOLO la escena pedida, con el MISMO "id" y, por defecto, el MISMO
  "timecode" (cámbialo solo si el enfoque lo exige, manteniéndolo coherente con
  las escenas vecinas).
- Mantén la CONTINUIDAD con la escena anterior y la siguiente (que el corte fluya
  natural; misma identidad de personaje, producto y estilo visual).
- Aplica con fuerza el ENFOQUE que pide el usuario para esta escena.
- Prompts de imagen 0c para NanoBanana Pro (Flow): EXTREMADAMENTE detallados y
  autocontenidos. Incluye SIEMPRE salvaguardas: el producto NO se deforma ni cambia
  de etiqueta, logo/texto legibles, rostro/identidad consistentes, lipsync perfecto
  donde aplique, formato vertical 9:16.
- Rellena SIEMPRE "purpose" (qué se genera y tipo de toma: Producto / Avatar-Persona
  / Fondo / Textura) y "flowInputs" (qué cargar en Flow: foto del producto, logo de
  ElaBela, frame del avatar o Ninguno). UN SOLO foco por imagen; nunca varios
  productos juntos. Si hay foto del producto, descríbelo FIEL a ella.
- Prompts de ANIMACIÓN: parte de la imagen 0c e indica movimiento de sujeto y cámara,
  velocidad, duración, física y salvaguardas de continuidad (sin morphing ni
  deformación).
- Si esta escena es el Gancho / primer clip, el prompt de imagen 0c DEBE indicar
  que se use el logotipo de ElaBela PROPORCIONADO, ubicado de forma natural en la
  escena (cuadro de fondo, empaque, cartel...), sin describirlo en detalle.
- Respeta los modelos y costos de la matriz.

${SCENE_CONTRACT}
`.trim();
}

export function buildSceneRegenUserContent(req: RegenerateSceneRequest): string {
  const lines = [
    `Guion: "${req.title}". Idea central: ${req.summary}.`,
    `Modo: ${req.productionMode === "hibrido" ? "Híbrido" : "100% IA"}.`,
    req.niche ? `Nicho / público: ${req.niche}.` : "",
    req.tone ? `Tono de voz: ${req.tone}.` : "",
    "",
    "Estructura completa del guion (para mantener coherencia):",
    ...req.outline.map(
      (s, i) =>
        `  ${i + 1}. [${s.timecode}] ${s.label}${s.roll ? ` (${s.roll})` : ""}${
          s.id === req.sceneId ? "   <-- ESTA es la escena a regenerar" : ""
        }`,
    ),
    "",
    "Escena ACTUAL a regenerar (JSON):",
    "```json",
    JSON.stringify(req.targetScene, null, 2),
    "```",
    "",
    `ENFOQUE pedido para esta escena: ${req.focus}`,
  ];
  if (req.products?.some((p) => p.imageFileUri)) {
    lines.push("", "Se adjuntan imágenes reales de productos como referencia fiel.");
  }
  return lines.filter(Boolean).join("\n");
}

// ── Reestructuración del guion completo a otra duración ──────

export async function buildRestructureSystemInstruction(
  productionMode: ProductionMode,
): Promise<string> {
  const base = await buildSystemInstruction(productionMode);
  return `${base}

═══════════════ MODO REESTRUCTURACIÓN ═══════════════
Vas a REESTRUCTURAR un guion YA EXISTENTE a una NUEVA duración total. Mantén la
MISMA gran idea, el MISMO gancho ganador y la esencia del mensaje, pero condensa o
expande el contenido para que TODO quepa con SENTIDO y ritmo natural en la nueva
duración. Reescribe desde cero los timecodes, las escenas, la locución y los prompts
según el nuevo tiempo (no copies y pegues el original).
- Si ACORTAS: prioriza Gancho + producto/beneficio clave + CTA con ElaBela; elimina
  lo accesorio y reduce el número de tomas si hace falta.
- Si ALARGAS: añade desarrollo, demostración o prueba social coherente, sin relleno.
- RESPETA SIEMPRE el ritmo de locución: nada de textos imposibles de decir en el
  tiempo del clip. El guion entero debe poder locutarse dentro de la nueva duración.
Devuelve el guion COMPLETO en el MISMO formato JSON de siempre.`;
}

/** Versión compacta (solo ES) del guion para reestructurar sin inflar el input. */
function slimScript(s: ScriptResult) {
  return {
    title: s.title?.es,
    summary: s.summary?.es,
    hookStrategy: s.hookStrategy?.es,
    analysis: (s.analysis ?? []).map((a) => ({
      layer: a.layer,
      label: a.label?.es,
      finding: a.finding?.es,
    })),
    scenes: (s.scenes ?? []).map((sc) => ({
      label: sc.label?.es,
      timecode: sc.timecode,
      roll: sc.roll,
      audio: sc.audio?.es,
      visual: sc.visual?.es,
    })),
    cta: s.cta?.es,
  };
}

export function buildRestructureUserContent(req: RestructureRequest): string {
  return [
    `Reestructura este guion GANADOR a una nueva duración TOTAL de ~${req.targetSec}s.`,
    req.niche ? `Nicho / público: ${req.niche}.` : "",
    req.tone ? `Tono de voz: ${req.tone}.` : "",
    "",
    "GUION ACTUAL (resumen en español) a reestructurar:",
    "```json",
    JSON.stringify(slimScript(req.script)),
    "```",
    "",
    `Nueva duración objetivo: ~${req.targetSec}s en total, continua, sin huecos ni` +
      ` solapes. Conserva la MISMA idea y gancho. Entrega el guion COMPLETO (es y pt)` +
      ` en el formato JSON habitual, con la locución ajustada al tiempo de cada clip.`,
  ]
    .filter(Boolean)
    .join("\n");
}
