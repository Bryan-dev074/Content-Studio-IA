import { NextResponse } from "next/server";
import { generateScript } from "@/lib/gemini";
import type { GenerateRequest } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as GenerateRequest;
    const products = Array.isArray(body.products) ? body.products : [];
    const hasProduct = products.some((p) => p.name?.trim());

    if (!hasProduct && !body.videoFileUri && !body.referenceNotes?.trim()) {
      return NextResponse.json(
        { error: "Falta información: indica al menos un producto o el video." },
        { status: 400 },
      );
    }

    const result = await generateScript({
      products,
      niche: body.niche ?? "",
      productionMode: body.productionMode === "hibrido" ? "hibrido" : "ia",
      extraPrompt: body.extraPrompt,
      referenceNotes: body.referenceNotes,
      videoFileUri: body.videoFileUri,
      videoMimeType: body.videoMimeType,
    });

    return NextResponse.json(result);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error generando el guion.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
