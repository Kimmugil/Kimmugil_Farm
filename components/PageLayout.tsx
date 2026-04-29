"use client";

import { useState } from "react";
import type { Card, UITexts, DmMessage } from "@/lib/types";
import ProjectCard from "./ProjectCard";
import DmPanel from "./DmPanel";

interface Props {
  cards: Card[];
  texts: UITexts;
  scrollSpeed: number;
  initialDms: DmMessage[];
}

function MarqueeIcon({ active }: { active: boolean }) {
  const c = active ? "white" : "#555";
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="1"  y="3" width="5" height="14" rx="1.5" fill={c} />
      <rect x="8"  y="3" width="5" height="14" rx="1.5" fill={c} />
      <rect x="15" y="3" width="4" height="14" rx="1.5" fill={c} opacity={active ? "1" : "0.4"} />
    </svg>
  );
}

function GridIcon({ active }: { active: boolean }) {
  const c = active ? "white" : "#555";
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="1"  y="1"  width="8" height="8" rx="1.5" fill={c} />
      <rect x="11" y="1"  width="8" height="8" rx="1.5" fill={c} />
      <rect x="1"  y="11" width="8" height="8" rx="1.5" fill={c} />
      <rect x="11" y="11" width="8" height="8" rx="1.5" fill={c} />
    </svg>
  );
}

export default function PageLayout({ cards, texts, scrollSpeed, initialDms }: Props) {
  const [view, setView] = useState<"marquee" | "grid">("marquee");
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const detailsLabel = texts["CARD_DETAILS_LABEL"]   ?? "DETAILS";
  const soonLabel    = texts["CARD_SOON_LABEL"]       ?? "준비중...";
  const soonNoUrlMsg = texts["CARD_SOON_NO_URL_MSG"]  ?? "아직 준비 중인 프로젝트입니다.";

  // 화면을 채울 만큼 복제 후 2배 (무한 루프)
  const repeated = cards.length > 0
    ? Array.from({ length: Math.max(2, Math.ceil(14 / cards.length)) }, () => cards).flat()
    : [];
  const doubled = [...repeated, ...repeated];

  function cardTransformStyle(i: number): React.CSSProperties {
    if (hoveredIdx === null) return {};
    const diff = i - hoveredIdx;
    if (diff === 0)  return { transform: "scale(1.08) translateY(-16px)", zIndex: 20 };
    if (diff === -1) return { transform: "translateX(-14px)" };
    if (diff === 1)  return { transform: "translateX(14px)" };
    return {};
  }

  return (
    <main className="min-h-screen flex flex-col overflow-hidden">

      {/* 타이틀 + DM 패널 */}
      <div className="flex-1 flex overflow-hidden min-h-0">

      {/* 좌: 타이틀 */}
      <div className="flex-1 flex flex-col justify-center pl-[10%] pr-8 pt-12 pb-4 relative">

        {/* 뷰 전환 버튼 — 우측 상단 */}
        <div className="absolute top-8 right-8 flex items-center gap-2">
          <button
            onClick={() => setView("marquee")}
            title="슬라이드 보기"
            className={`w-9 h-9 rounded-lg flex items-center justify-center border transition-colors ${
              view === "marquee"
                ? "border-[#444444] bg-[#1e1e1e]"
                : "border-[#1e1e1e] bg-transparent hover:border-[#333333]"
            }`}
          >
            <MarqueeIcon active={view === "marquee"} />
          </button>
          <button
            onClick={() => setView("grid")}
            title="목록 보기"
            className={`w-9 h-9 rounded-lg flex items-center justify-center border transition-colors ${
              view === "grid"
                ? "border-[#444444] bg-[#1e1e1e]"
                : "border-[#1e1e1e] bg-transparent hover:border-[#333333]"
            }`}
          >
            <GridIcon active={view === "grid"} />
          </button>
        </div>

        <h1 className="text-6xl md:text-8xl lg:text-[9rem] font-black tracking-tighter text-white leading-none">
          {texts["HEADER_TITLE"] || "Portfolio"}
        </h1>
        {texts["HEADER_SUBTITLE"] && (
          <p className="mt-4 text-sm text-[#555555] font-medium tracking-wide">
            {texts["HEADER_SUBTITLE"]}
          </p>
        )}
        {(texts["HEADER_DESC_LEFT"] || texts["HEADER_DESC_RIGHT"]) && (
          <div className="mt-4 flex flex-col sm:flex-row gap-2 max-w-lg">
            {texts["HEADER_DESC_LEFT"] && (
              <p className="text-xs text-[#444444] leading-relaxed">{texts["HEADER_DESC_LEFT"]}</p>
            )}
            {texts["HEADER_DESC_RIGHT"] && (
              <p className="text-xs text-[#444444] leading-relaxed">{texts["HEADER_DESC_RIGHT"]}</p>
            )}
          </div>
        )}
      </div>

      {/* 우: DM — 경계선 없이 공간에 녹아듦 */}
      <div className="hidden lg:flex w-[340px] xl:w-[400px] shrink-0">
        <DmPanel initialDms={initialDms} texts={texts} />
      </div>

      </div>{/* end flex-1 row */}

      {/* 카드 영역 */}
      <div className="border-t border-[#1a1a1a] mb-20">
        {cards.length === 0 ? (
          <p className="text-center text-[#555555] py-16 text-sm px-8">
            {texts["EMPTY_MESSAGE"] || "등록된 프로젝트가 없습니다."}
          </p>
        ) : view === "marquee" ? (

          /* ── 슬라이드 뷰 ── */
          <div
            className="overflow-hidden py-7"
            style={{
              maskImage: "linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)",
              WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)",
            }}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            <div
              className="flex gap-4"
              style={{
                width: "max-content",
                animation: hoveredIdx !== null
                  ? `marquee-left ${scrollSpeed}s linear infinite paused`
                  : `marquee-left ${scrollSpeed}s linear infinite`,
              }}
            >
              {doubled.map((card, i) => (
                <div
                  key={i}
                  className="w-[300px] shrink-0"
                  style={{
                    transition: "transform 0.22s cubic-bezier(0.34,1.56,0.64,1), z-index 0s",
                    ...cardTransformStyle(i),
                  }}
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                >
                  <ProjectCard
                    card={card}
                    detailsLabel={detailsLabel}
                    soonLabel={soonLabel}
                    soonNoUrlMsg={soonNoUrlMsg}
                    disableHover
                  />
                </div>
              ))}
            </div>
          </div>

        ) : (

          /* ── 그리드 뷰 ── */
          <div className="px-8 md:px-16 pt-7 pb-10">
            <div
              className="grid gap-4"
              style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}
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
