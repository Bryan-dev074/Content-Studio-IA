import { promises as fs } from "node:fs";
import path from "node:path";

/**
 * Carga el logotipo de ElaBela desde la carpeta `logo/` del proyecto para
 * enviarlo a Gemini como referencia visual (la IA debe incluirlo en la imagen
 * 0c del Gancho). NO se muestra nunca en la interfaz: es solo un recurso interno.
 *
 * Si no hay ningún archivo, se devuelve null y la IA se apoya en la descripción
 * textual de `content/context/marca-elabela.md`.
 */
const LOGO_DIR = path.join(process.cwd(), "logo");

// Solo formatos fijos: el logo de marca es PNG/JPG/WEBP (los GIF se ignoran,
// porque el GIF de esta carpeta es el gatito del proyecto, no la marca).
const MIME_BY_EXT: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

export interface BrandImage {
  mimeType: string;
  /** base64 */
  data: string;
}

let cache: BrandImage | null | undefined;

export async function loadBrandLogo(): Promise<BrandImage | null> {
  if (cache !== undefined) return cache;

  try {
    const files = await fs.readdir(LOGO_DIR);
    const images = files
      .filter((f) => MIME_BY_EXT[path.extname(f).toLowerCase()])
      // Evita gifs animados pesados como referencia (preferimos imagen fija).
      .sort((a, b) => {
        const score = (f: string) => (/ela|bela|glow|logo/i.test(f) ? 0 : 1);
        return score(a) - score(b);
      });

    if (images.length === 0) {
      cache = null;
      return null;
    }

    const pick = images[0];
    const buf = await fs.readFile(path.join(LOGO_DIR, pick));
    cache = {
      mimeType: MIME_BY_EXT[path.extname(pick).toLowerCase()] ?? "image/png",
      data: buf.toString("base64"),
    };
    return cache;
  } catch {
    cache = null;
    return null;
  }
}
