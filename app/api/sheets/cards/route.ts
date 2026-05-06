import { NextResponse } from "next/server";
import { fetchCards } from "@/lib/sheets";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cards = await fetchCards();
    // PRIVATE 카드 URL은 클라이언트에 절대 노출하지 않음
    const sanitized = cards.map((c) =>
      c.뱃지 === "PRIVATE" ? { ...c, URL: "" } : c
    );
    return NextResponse.json(sanitized);
  } catch (err) {
    console.error("[cards] fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch cards" }, { status: 500 });
  }
}
