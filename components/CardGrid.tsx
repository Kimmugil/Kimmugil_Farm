"use client";

import type { Card, UITexts } from "@/lib/types";
import ProjectCard from "./ProjectCard";

interface Props {
  cards: Card[];
  texts: UITexts;
}

export default function CardGrid({ cards, texts }: Props) {
  const detailsLabel   = texts["CARD_DETAILS_LABEL"]    ?? "DETAILS";
  const soonLabel      = texts["CARD_SOON_LABEL"]       ?? "준비중...";
  const soonNoUrlMsg   = texts["CARD_SOON_NO_URL_MSG"]  ?? "아직 준비 중인 프로젝트입니다.";

  return (
    <section className="max-w-screen-xl mx-auto px-5 pt-14 pb-16">

      {/* 섹션 헤더 */}
      <div className="mb-8 flex items-center gap-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#444444]">
          {texts["GRID_SECTION_LABEL"] || "ALL PROJECTS"}
        </p>
        <div className="flex-1 h-px bg-[#1e1e1e]" />
      </div>

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

      {texts["FOOTER_TEXT"] && (
        <footer className="mt-16 pt-6 border-t border-[#1e1e1e]">
          <p className="text-xs text-[#444444] text-right">{texts["FOOTER_TEXT"]}</p>
        </footer>
      )}
    </section>
  );
}
