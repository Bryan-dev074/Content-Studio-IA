import { NextResponse } from "next/server";
import { regenerateScene } from "@/lib/gemini";
import type { RegenerateSceneRequest } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RegenerateSceneRequest;

    if (!body.sceneId || !body.targetScene || !body.focus?.trim()) {
      return NextResponse.json(
        { error: "Falta la escena o el enfoque." },
        { status: 400 },
      );
    }

    const scene = await regenerateScene({
      productionMode: body.productionMode === "hibrido" ? "hibrido" : "ia",
      sceneId: body.sceneId,
      focus: body.focus,
      title: body.title ?? "",
      summary: body.summary ?? "",
      outline: Array.isArray(body.outline) ? body.outline : [],
      targetScene: body.targetScene,
      niche: body.niche,
      tone: body.tone,
      products: body.products,
    });

    return NextResponse.json(scene);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error regenerando la escena.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
