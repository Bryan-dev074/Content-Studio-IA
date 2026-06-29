import { NextResponse } from "next/server";
import { refinePrompt } from "@/lib/gemini";
import type { RefineRequest } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RefineRequest;

    if (!body.currentContent?.trim() || !body.instruction?.trim()) {
      return NextResponse.json(
        { error: "Falta el prompt actual o la instrucción de cambio." },
        { status: 400 },
      );
    }

    const result = await refinePrompt({
      currentContent: body.currentContent,
      kind: body.kind,
      instruction: body.instruction,
      productionMode: body.productionMode === "hibrido" ? "hibrido" : "ia",
    });

    return NextResponse.json(result);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error refinando el prompt.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
