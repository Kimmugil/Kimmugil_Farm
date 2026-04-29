"use client";

import type { Card, UITexts } from "@/lib/types";
import ProjectCard from "./ProjectCard";

interface Props {
  cards: Card[];
  texts: UITexts;
}

export default function CardGrid({ cards, texts }: Props) {
  return (
    <main className="max-w-screen-xl mx-auto px-5 pb-16">
      {/* 헤더 섹션 */}
      <header className="pt-14 pb-10 border-b border-[#1e1e1e]">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-none">
              {texts["HEADER_TITLE"] || "Projects"}
            </h1>
            {texts["HEADER_SUBTITLE"] && (
              <p className="mt-3 text-sm font-medium text-[#777777] uppercase tracking-widest">
                {texts["HEADER_SUBTITLE"]}
              </p>
            )}
          </div>
          {(texts["HEADER_DESC_LEFT"] || texts["HEADER_DESC_RIGHT"]) && (
            <div className="flex flex-col md:flex-row gap-4 md:gap-12 max-w-xl text-right">
              {texts["HEADER_DESC_LEFT"] && (
                <p className="text-xs text-[#888888] leading-relaxed max-w-[220px]">
                  {texts["HEADER_DESC_LEFT"]}
                </p>
              )}
              {texts["HEADER_DESC_RIGHT"] && (
                <p className="text-xs text-[#888888] leading-relaxed max-w-[220px]">
                  {texts["HEADER_DESC_RIGHT"]}
                </p>
              )}
            </div>
          )}
        </div>
      </header>

      {/* 카드 그리드 — 최대 4열 */}
      <section className="mt-8" aria-label="프로젝트 목록">
        {cards.length === 0 ? (
          <p className="text-center text-[#555555] py-24 text-sm">
            {texts["EMPTY_MESSAGE"] || "등록된 프로젝트가 없습니다."}
          </p>
        ) : (
          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
            {cards.map((card) => (
              <ProjectCard key={card.순서} card={card} />
            ))}
          </div>
        )}
      </section>

      {/* 푸터 */}
      {texts["FOOTER_TEXT"] && (
        <footer className="mt-16 pt-6 border-t border-[#1e1e1e] text-center">
          <p className="text-xs text-[#444444] text-right">{texts["FOOTER_TEXT"]}</p>
        </footer>
      )}
    </main>
  );
}
