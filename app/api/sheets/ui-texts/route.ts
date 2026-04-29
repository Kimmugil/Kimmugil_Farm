import { NextResponse } from "next/server";
import { fetchUITexts } from "@/lib/sheets";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const texts = await fetchUITexts();
    return NextResponse.json(texts);
  } catch (err) {
    console.error("[ui-texts] fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch UI texts" }, { status: 500 });
  }
}
