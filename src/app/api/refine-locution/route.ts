import { NextResponse } from "next/server";
import { refineLocution } from "@/lib/gemini";
import type { LocutionRefineRequest } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as LocutionRefineRequest;

    if (!body.currentText?.trim()) {
      return NextResponse.json(
        { error: "Falta la locución actual a reescribir." },
        { status: 400 },
      );
    }

    const result = await refineLocution({
      currentText: body.currentText,
      lang: body.lang === "pt" ? "pt" : "es",
      timecode: body.timecode,
      label: body.label,
      instruction: body.instruction,
      productionMode: body.productionMode === "hibrido" ? "hibrido" : "ia",
    });

    return NextResponse.json(result);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error reescribiendo la locución.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
