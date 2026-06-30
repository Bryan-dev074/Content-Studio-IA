import { NextResponse } from "next/server";
import { restructureScript } from "@/lib/gemini";
import type { RestructureRequest } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RestructureRequest;

    if (!body.script || !Array.isArray(body.script.scenes)) {
      return NextResponse.json(
        { error: "Falta el guion a reestructurar." },
        { status: 400 },
      );
    }
    const target = Number(body.targetSec);
    if (!target || target < 5 || target > 180) {
      return NextResponse.json(
        { error: "Indica una duración válida (entre 5 y 180 segundos)." },
        { status: 400 },
      );
    }

    const result = await restructureScript({
      productionMode: body.productionMode === "hibrido" ? "hibrido" : "ia",
      targetSec: Math.round(target),
      script: body.script,
      niche: body.niche,
      tone: body.tone,
    });

    return NextResponse.json(result);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error reestructurando el guion.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
