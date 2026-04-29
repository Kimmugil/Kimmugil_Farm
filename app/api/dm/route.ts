import { NextRequest, NextResponse } from "next/server";
import { fetchDMs, appendDM, fetchConfig } from "@/lib/sheets";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const dms = await fetchDMs();
    return NextResponse.json(dms);
  } catch (err) {
    console.error("[dm] fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch DMs" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { nickname, content } = await req.json() as { nickname: string; content: string };

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }
    if (content.trim().length > 200) {
      return NextResponse.json({ error: "Content too long (max 200)" }, { status: 400 });
    }
    if (nickname && nickname.length > 20) {
      return NextResponse.json({ error: "Nickname too long (max 20)" }, { status: 400 });
    }

    const config = await fetchConfig();
    const message = await appendDM(nickname, content.trim(), config.DM_ANON_NICKNAME);

    return NextResponse.json(message, { status: 201 });
  } catch (err) {
    console.error("[dm] post error:", err);
    return NextResponse.json({ error: "Failed to send DM" }, { status: 500 });
  }
}
