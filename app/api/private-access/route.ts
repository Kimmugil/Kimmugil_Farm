import { NextResponse } from "next/server";
import { fetchConfig, fetchCards } from "@/lib/sheets";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { password, cardNo } = await req.json();

    if (!password || cardNo == null) {
      return NextResponse.json({ error: "invalid_request" }, { status: 400 });
    }

    const config = await fetchConfig();
    if (password !== config.ADMIN_PASSWORD) {
      return NextResponse.json({ error: "wrong_password" }, { status: 401 });
    }

    const cards = await fetchCards();
    const card = cards.find((c) => c.순서 === Number(cardNo) && c.뱃지 === "PRIVATE");

    if (!card || !card.URL) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    return NextResponse.json({ url: card.URL });
  } catch {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
