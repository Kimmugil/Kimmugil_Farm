"use client";

import { useState, useEffect } from "react";
import type { Card, UITexts, DmMessage, DmMasterConfig } from "@/lib/types";
import ProjectCard from "./ProjectCard";
import DmForm from "./DmForm";
import PetZone from "./PetZone";

interface Props {
  cards: Card[];
  texts: UITexts;
  scrollSpeed: number;
  initialDms: DmMessage[];
  dmMaster: DmMasterConfig;
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

function DmIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

const CARD_AREA_H = 336;

export default function PageLayout({ cards, texts, scrollSpeed, initialDms, dmMaster }: Props) {
  const [view, setView] = useState<"marquee" | "grid">("marquee");
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [dms, setDms] = useState<DmMessage[]>(initialDms);
  const [dmOpen, setDmOpen] = useState(false);

  const handleDmSent = (msg: DmMessage) => {
    setDms((prev) => [...prev, msg]);
  };

  // ESC로 모달 닫기
  useEffect(() => {
    if (!dmOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setDmOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dmOpen]);

  const detailsLabel = texts["CARD_DETAILS_LABEL"]  ?? "DETAILS";
  const soonLabel    = texts["CARD_SOON_LABEL"]      ?? "준비중...";
  const soonNoUrlMsg = texts["CARD_SOON_NO_URL_MSG"] ?? "아직 준비 중인 프로젝트입니다.";

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
    <>
      <main className="min-h-screen flex flex-col overflow-hidden">

        {/* ── 히어로 영역 ── */}
        <section className="flex-1 min-h-0 flex flex-col overflow-hidden">

          {/* 타이틀 + DM 버튼 */}
          <div className="flex-shrink-0 pl-[10%] pr-8 pt-12 pb-4 flex items-start justify-between">
            <div>
              <h1 className="text-6xl md:text-8xl lg:text-[9rem] font-black tracking-tighter text-white leading-none">
                {texts["HEADER_TITLE"] || "Portfolio"}
              </h1>
              {texts["HEADER_SUBTITLE"] && (
                <p className="mt-4 text-base text-[#666666] font-medium tracking-wide">
                  {texts["HEADER_SUBTITLE"]}
                </p>
              )}
              {(texts["HEADER_DESC_LEFT"] || texts["HEADER_DESC_RIGHT"]) && (
                <div className="mt-2 flex flex-col sm:flex-row gap-2 max-w-lg">
                  {texts["HEADER_DESC_LEFT"] && (
                    <p className="text-xs text-[#444444] leading-relaxed">{texts["HEADER_DESC_LEFT"]}</p>
                  )}
                  {texts["HEADER_DESC_RIGHT"] && (
                    <p className="text-xs text-[#444444] leading-relaxed">{texts["HEADER_DESC_RIGHT"]}</p>
                  )}
                </div>
              )}
            </div>

            {/* DM 아이콘 버튼 */}
            <button
              onClick={() => setDmOpen(true)}
              title="메시지 남기기"
              className="mt-1 flex items-center gap-2 px-3 py-2 rounded-xl text-[#888888] hover:text-white transition-all"
              style={{ background: "#1c1c1c", border: "1px solid #333333" }}
            >
              <DmIcon />
              <span className="text-xs font-medium hidden sm:inline">
                {texts["DM_SEND_LABEL"] || "메시지"}
              </span>
            </button>
          </div>

          {/* 펫 존 — 전체 너비 */}
          <div className="flex-1 min-h-0 relative">
            <PetZone
              pets={dmMaster.pets}
              dms={dms}
              repulsionRadius={dmMaster.repulsionRadius}
              petSizeScale={dmMaster.petSizeScale}
              groundOffset={dmMaster.groundOffset}
              bubbleFontSize={dmMaster.bubbleFontSize}
              bubbleMaxWidth={dmMaster.bubbleMaxWidth}
            />
          </div>

        </section>

        {/* ── 카드 영역 (높이 고정) ── */}
        <div className="border-t border-[#1a1a1a]">

          <div className="flex justify-start pl-[10%] pt-4 pb-0 gap-2">
            <button
              onClick={() => setView("marquee")}
              title="슬라이드 보기"
              className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-colors ${
                view === "marquee" ? "border-[#444444] bg-[#1e1e1e]" : "border-[#1e1e1e] hover:border-[#333333]"
              }`}
            >
              <MarqueeIcon active={view === "marquee"} />
            </button>
            <button
              onClick={() => setView("grid")}
              title="목록 보기"
              className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-colors ${
                view === "grid" ? "border-[#444444] bg-[#1e1e1e]" : "border-[#1e1e1e] hover:border-[#333333]"
              }`}
            >
              <GridIcon active={view === "grid"} />
            </button>
          </div>

          {cards.length === 0 ? (
            <p className="text-center text-[#555555] py-16 text-sm px-8">
              {texts["EMPTY_MESSAGE"] || "등록된 프로젝트가 없습니다."}
            </p>
          ) : (
            <div style={{ height: CARD_AREA_H }}>
              {view === "marquee" ? (
                <div
                  className="h-full overflow-hidden py-7"
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
                <div className="h-full overflow-y-auto">
                  <div
                    className="grid gap-4 pl-[10%] pr-[10%] pt-7 pb-10"
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
          )}
        </div>

        {texts["FOOTER_TEXT"] && (
          <div className="px-8 md:px-16 py-4 border-t border-[#141414]">
            <p className="text-xs text-[#2e2e2e] text-right">{texts["FOOTER_TEXT"]}</p>
          </div>
        )}
      </main>

      {/* ── DM 모달 ── */}
      {dmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" }}
          onClick={() => setDmOpen(false)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <DmForm
              texts={texts}
              onDmSent={(msg) => {
                handleDmSent(msg);
                setTimeout(() => setDmOpen(false), 1200);
              }}
              onClose={() => setDmOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
