import type { Lang, ScriptResult } from "./types";

/** Convierte un guion generado a Markdown descargable, en el idioma elegido. */
export function scriptToMarkdown(r: ScriptResult, lang: Lang): string {
  const L = (x: { es: string; pt: string } | undefined) => x?.[lang] ?? "";
  const out: string[] = [];

  out.push(`# ${L(r.title)}`);
  out.push("");
  out.push(`> ${L(r.summary)}`);
  out.push("");
  out.push(
    `**${lang === "es" ? "Modo de producción" : "Modo de produção"}:** ${
      r.productionMode === "hibrido" ? "Híbrido (Local + IA)" : "100% IA"
    }`,
  );
  out.push("");
  out.push(`**${lang === "es" ? "Estrategia del gancho" : "Estratégia do gancho"}:** ${L(r.hookStrategy)}`);
  out.push("");

  if (r.analysis?.length) {
    out.push(`## ${lang === "es" ? "Análisis del video" : "Análise do vídeo"}`);
    for (const a of r.analysis) {
      out.push(`- **${L(a.label)}** (${a.layer}): ${L(a.finding)}`);
    }
    out.push("");
  }

  // Locución. En IA es para ElevenLabs; en híbrido la graba el presentador.
  if (r.productionMode === "hibrido") {
    out.push(
      `## ${
        lang === "es"
          ? "Locución del presentador (grabación local)"
          : "Locução do apresentador (gravação local)"
      }`,
    );
    r.scenes?.forEach((s) => out.push(`- [${s.timecode}] ${L(s.audio)}`));
  } else {
    out.push(`## ${lang === "es" ? "Locución (ElevenLabs)" : "Locução (ElevenLabs)"}`);
    out.push(r.scenes?.map((s) => L(s.audio)).join("\n\n") ?? "");
  }
  out.push("");

  out.push(`## ${lang === "es" ? "Guion" : "Roteiro"}`);
  out.push("");

  r.scenes?.forEach((s, i) => {
    out.push(
      `### ${i + 1}. [${s.timecode}] ${L(s.label)}${s.roll ? ` · ${s.roll}` : ""}`,
    );
    out.push(`- **${lang === "es" ? "Locución" : "Locução"}:** ${L(s.audio)}`);
    out.push(`- **${lang === "es" ? "Cámara/Visual" : "Câmera/Visual"}:** ${L(s.visual)}`);
    if (s.acting?.[lang])
      out.push(`- **${lang === "es" ? "Actuación" : "Atuação"}:** ${L(s.acting)}`);
    if (s.sfx?.[lang]) out.push(`- **SFX:** ${L(s.sfx)}`);
    if (s.prompts?.length) {
      out.push("");
      for (const p of s.prompts) {
        out.push(`  **${L(p.title)}${p.model ? ` — ${p.model}` : ""}**`);
        if (p.purpose?.[lang])
          out.push(`  - ${lang === "es" ? "Qué genera" : "O que gera"}: ${L(p.purpose)}`);
        if (p.flowInputs?.[lang])
          out.push(
            `  - ${lang === "es" ? "Cargar en Flow" : "Carregar no Flow"}: ${L(p.flowInputs)}`,
          );
        out.push("  ```");
        out.push(
          L(p.content)
            .split("\n")
            .map((line) => `  ${line}`)
            .join("\n"),
        );
        out.push("  ```");
      }
    }
    out.push("");
  });

  out.push(`## CTA`);
  out.push(L(r.cta));
  out.push("");

  if (r.costs?.rows?.length) {
    out.push(`## ${lang === "es" ? "Créditos" : "Créditos"}`);
    out.push("");
    out.push("| Toma | Modelo | Resolución | Duración | Costo | Billetera |");
    out.push("| --- | --- | --- | --- | --- | --- |");
    for (const row of r.costs.rows) {
      out.push(
        `| ${row.shot} | ${row.model} | ${row.resolution} | ${row.duration} | ${row.cost}c | ${row.wallet} |`,
      );
    }
    out.push("");
    out.push(
      `**Highfield:** ${r.costs.highfieldTotal}/${r.costs.highfieldLimit}c · **Omni Flash:** ${r.costs.omniFlashTotal}/${r.costs.omniFlashLimit}c`,
    );
  }

  out.push("");
  out.push("—");
  out.push("_Generado con Content Studio IA · ElaBela_");

  return out.join("\n");
}
