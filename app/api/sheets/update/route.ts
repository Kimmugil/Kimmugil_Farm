import { NextRequest, NextResponse } from "next/server";
import { fetchConfig, updateSheetRange } from "@/lib/sheets";
import type { SheetUpdatePayload } from "@/lib/types";

export const dynamic = "force-dynamic";

const ALLOWED_SHEETS = ["UI_TEXTS", "CARDS", "CONFIG"];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { password: string; updates: SheetUpdatePayload[] };
    const { password, updates } = body;

    if (!password || typeof password !== "string") {
      return NextResponse.json({ error: "Password required" }, { status: 401 });
    }

    // 서버에서 비밀번호 검증 (클라이언트에 비밀번호를 보내지 않음)
    const config = await fetchConfig();
    if (password !== config.ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Invalid password" }, { status: 403 });
    }

    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json({ error: "No updates provided" }, { status: 400 });
    }

    for (const update of updates) {
      if (!ALLOWED_SHEETS.includes(update.sheet)) {
        return NextResponse.json(
          { error: `Sheet "${update.sheet}" is not allowed` },
          { status: 400 }
        );
      }
      await updateSheetRange(update.sheet, update.range, update.values);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[update] error:", err);
    return NextResponse.json({ error: "Failed to update sheet" }, { status: 500 });
  }
}
