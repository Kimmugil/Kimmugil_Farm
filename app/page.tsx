import { fetchConfig, fetchUITexts, fetchCards } from "@/lib/sheets";
import PortfolioClient from "@/components/PortfolioClient";

export const dynamic = "force-dynamic";

export default async function Home() {
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
}
