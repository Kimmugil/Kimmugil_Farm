"use client";

import type { Card, UITexts } from "@/lib/types";
import ProjectCard from "./ProjectCard";

interface Props {
  cards: Card[];
  texts: UITexts;
  scrollSpeed: number;
}

export default function PageLayout({ cards, texts, scrollSpeed }: Props) {
  const detailsLabel = texts["CARD_DETAILS_LABEL"]   ?? "DETAILS";
  const soonLabel    = texts["CARD_SOON_LABEL"]       ?? "준비중...";
  const soonNoUrlMsg = texts["CARD_SOON_NO_URL_MSG"]  ?? "아직 준비 중인 프로젝트입니다.";

  // 카드가 적으면 화면을 채우기 위해 충분히 복제
  const repeated = cards.length > 0
    ? Array.from({ length: Math.max(2, Math.ceil(12 / cards.length)) }, () => cards).flat()
    : [];
  // 무한 루프를 위해 2배 복제 (translateX -50% 기법)
  const doubled = [...repeated, ...repeated];

  return (
    <main className="min-h-screen flex flex-col overflow-hidden">

      {/* 상단: 큰 타이틀 영역 */}
      <div className="flex-1 flex flex-col justify-center px-8 md:px-16 pt-14 pb-8">
        <h1 className="text-6xl md:text-8xl lg:text-[10rem] font-black tracking-tighter text-white leading-none">
          {texts["HEADER_TITLE"] || "Portfolio"}
        </h1>
        {texts["HEADER_SUBTITLE"] && (
          <p className="mt-4 text-sm text-[#555555] font-medium tracking-wide">
            {texts["HEADER_SUBTITLE"]}
          </p>
        )}
        {(texts["HEADER_DESC_LEFT"] || texts["HEADER_DESC_RIGHT"]) && (
          <div className="mt-5 flex flex-col sm:flex-row gap-3 max-w-lg">
            {texts["HEADER_DESC_LEFT"] && (
              <p className="text-xs text-[#444444] leading-relaxed">{texts["HEADER_DESC_LEFT"]}</p>
            )}
            {texts["HEADER_DESC_RIGHT"] && (
              <p className="text-xs text-[#444444] leading-relaxed">{texts["HEADER_DESC_RIGHT"]}</p>
            )}
          </div>
        )}
      </div>

      {/* 하단: 수평 무한 스크롤 카드 */}
      <div className="border-t border-[#1a1a1a]">
        {cards.length === 0 ? (
          <p className="text-center text-[#555555] py-16 text-sm">
            {texts["EMPTY_MESSAGE"] || "등록된 프로젝트가 없습니다."}
          </p>
        ) : (
          <div
            className="overflow-hidden py-6"
            style={{
              maskImage: "linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)",
              WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)",
            }}
          >
            <div
              className="flex gap-4"
              style={{
                width: "max-content",
                animation: `marquee-left ${scrollSpeed}s linear infinite`,
              }}
            >
              {doubled.map((card, i) => (
                <div key={i} className="w-[260px] shrink-0">
                  <ProjectCard
                    card={card}
                    detailsLabel={detailsLabel}
                    soonLabel={soonLabel}
                    soonNoUrlMsg={soonNoUrlMsg}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 푸터 */}
      {texts["FOOTER_TEXT"] && (
        <div className="px-8 md:px-16 py-4 border-t border-[#141414]">
          <p className="text-xs text-[#2e2e2e] text-right">{texts["FOOTER_TEXT"]}</p>
        </div>
      )}
    </main>
  );
}
