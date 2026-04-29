import { NextResponse } from "next/server";
import { fetchCards } from "@/lib/sheets";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cards = await fetchCards();
    return NextResponse.json(cards);
  } catch (err) {
    console.error("[cards] fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch cards" }, { status: 500 });
  }
}
