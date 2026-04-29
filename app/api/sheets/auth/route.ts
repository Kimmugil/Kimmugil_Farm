import { NextRequest, NextResponse } from "next/server";
import { fetchConfig } from "@/lib/sheets";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json() as { password: string };

    if (!password || typeof password !== "string") {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    const config = await fetchConfig();
    if (password !== config.ADMIN_PASSWORD) {
      return NextResponse.json({ ok: false }, { status: 403 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[auth] error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
