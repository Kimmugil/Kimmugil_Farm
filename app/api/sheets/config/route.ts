import { NextResponse } from "next/server";
import { fetchConfig } from "@/lib/sheets";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const config = await fetchConfig();
    // ADMIN_PASSWORD 는 클라이언트에 절대 노출하지 않음
    const { ADMIN_PASSWORD: _, ...safeConfig } = config;
    return NextResponse.json(safeConfig);
  } catch (err) {
    console.error("[config] fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch config" }, { status: 500 });
  }
}
