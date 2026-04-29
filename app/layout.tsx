import type { Metadata } from "next";
import "./globals.css";
import { fetchConfig } from "@/lib/sheets";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const config = await fetchConfig();
    return {
      title: config.META_TITLE || "Portfolio",
      description: config.META_DESC || "",
    };
  } catch {
    return { title: "Portfolio" };
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-[#0a0a0a] text-[#f0f0f0]">
        {children}
      </body>
    </html>
  );
}
