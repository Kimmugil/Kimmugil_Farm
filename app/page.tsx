import { fetchConfig, fetchUITexts, fetchCards } from "@/lib/sheets";
import PortfolioClient from "@/components/PortfolioClient";

export const dynamic = "force-dynamic";

export default async function Home() {
  try {
    const [config, texts, cards] = await Promise.all([
      fetchConfig(),
      fetchUITexts(),
      fetchCards(),
    ]);

    return (
      <PortfolioClient
        isOpen={config.OPEN}
        initialTexts={texts}
        initialCards={cards}
      />
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const isMissingEnv =
      message.includes("credentials are not configured") ||
      message.includes("GOOGLE_SHEET_ID");

    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-6">
        <div className="max-w-md w-full border border-[#2a2a2a] rounded-2xl p-8 bg-[#111111]">
          <p className="text-2xl mb-4 select-none">{isMissingEnv ? "⚙️" : "⚠️"}</p>
          <h1 className="text-lg font-bold text-white mb-2">
            {isMissingEnv ? "환경변수 설정 필요" : "데이터 로드 실패"}
          </h1>
          {isMissingEnv ? (
            <div className="text-sm text-[#888888] space-y-2 leading-relaxed">
              <p>Vercel 대시보드에서 아래 환경변수를 추가하세요.</p>
              <ul className="mt-3 space-y-1 font-mono text-xs bg-[#1a1a1a] rounded-lg p-4 text-[#aaaaaa]">
                <li>GOOGLE_SHEET_ID</li>
                <li>GOOGLE_SERVICE_ACCOUNT_EMAIL</li>
                <li>GOOGLE_PRIVATE_KEY</li>
              </ul>
              <p className="mt-3 text-xs text-[#555555]">
                추가 후 Vercel에서 Redeploy 하면 됩니다.
              </p>
            </div>
          ) : (
            <p className="text-sm text-[#888888] leading-relaxed">
              Google Sheets 연결 중 오류가 발생했습니다.
              <br />
              스프레드시트 공유 설정 및 환경변수를 확인해 주세요.
            </p>
          )}
        </div>
      </div>
    );
  }
}
