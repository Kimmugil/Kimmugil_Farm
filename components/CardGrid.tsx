"use client";

import type { Card, UITexts } from "@/lib/types";
import ProjectCard from "./ProjectCard";

interface Props {
  cards: Card[];
  texts: UITexts;
}

export default function CardGrid({ cards, texts }: Props) {
  const detailsLabel  = texts["CARD_DETAILS_LABEL"]   ?? "DETAILS";
  const soonLabel     = texts["CARD_SOON_LABEL"]       ?? "준비중...";
  const soonNoUrlMsg  = texts["CARD_SOON_NO_URL_MSG"]  ?? "아직 준비 중인 프로젝트입니다.";

  return (
    <main className="max-w-screen-xl mx-auto px-6 md:px-10 pb-16">

      {/* 헤더 */}
      <header className="pt-12 pb-10 border-b border-[#1a1a1a]">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white leading-none">
              {texts["HEADER_TITLE"] || "Portfolio"}
            </h1>
            {texts["HEADER_SUBTITLE"] && (
              <p className="mt-3 text-sm text-[#555555] font-medium tracking-wide">
                {texts["HEADER_SUBTITLE"]}
              </p>
            )}
          </div>
          {(texts["HEADER_DESC_LEFT"] || texts["HEADER_DESC_RIGHT"]) && (
            <div className="flex flex-col md:items-end gap-1 max-w-xs">
              {texts["HEADER_DESC_LEFT"] && (
                <p className="text-xs text-[#555555] leading-relaxed md:text-right">
                  {texts["HEADER_DESC_LEFT"]}
                </p>
              )}
              {texts["HEADER_DESC_RIGHT"] && (
                <p className="text-xs text-[#555555] leading-relaxed md:text-right">
                  {texts["HEADER_DESC_RIGHT"]}
                </p>
              )}
            </div>
          )}
        </div>
      </header>

      {/* 카드 그리드 */}
      <section className="mt-6">
        {cards.length === 0 ? (
          <p className="text-center text-[#555555] py-24 text-sm">
            {texts["EMPTY_MESSAGE"] || "등록된 프로젝트가 없습니다."}
          </p>
        ) : (
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}
          >
            {cards.map((card) => (
              <ProjectCard
                key={card.순서}
                card={card}
                detailsLabel={detailsLabel}
                soonLabel={soonLabel}
                soonNoUrlMsg={soonNoUrlMsg}
              />
            ))}
          </div>
        )}
      </section>

      {/* 푸터 */}
      {texts["FOOTER_TEXT"] && (
        <footer className="mt-14 pt-5 border-t border-[#1a1a1a]">
          <p className="text-xs text-[#3a3a3a] text-right">{texts["FOOTER_TEXT"]}</p>
        </footer>
      )}
    </main>
  );
}
