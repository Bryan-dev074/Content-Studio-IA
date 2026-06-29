import { NextResponse } from "next/server";
import { uploadVideoToGemini } from "@/lib/gemini";

export const runtime = "nodejs";
export const maxDuration = 300;

const MAX_BYTES = 200 * 1024 * 1024; // 200 MB

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("video");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "No se recibió ningún archivo de video." },
        { status: 400 },
      );
    }

    if (!file.type.startsWith("video/") && !file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "El archivo debe ser un video o una imagen." },
        { status: 400 },
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "El video supera el límite de 200 MB." },
        { status: 413 },
      );
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const result = await uploadVideoToGemini(
      bytes,
      file.type,
      file.name || "video-referencia",
    );

    return NextResponse.json(result);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error subiendo el video.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
