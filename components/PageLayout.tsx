"use client";

import { useState, useEffect, useRef } from "react";
import type { Card, UITexts, DmMessage, DmMasterConfig } from "@/lib/types";
import ProjectCard, { LockIcon } from "./ProjectCard";
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
  const [view, setView]           = useState<"marquee" | "grid">("marquee");
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [dms, setDms]             = useState<DmMessage[]>(initialDms);
  const [dmOpen, setDmOpen]       = useState(false);

  // ── PRIVATE 모달 상태 (PageLayout 레벨 — 마퀴 transform 영향 밖) ──
  const [privateCard, setPrivateCard]   = useState<Card | null>(null);
  const [password, setPassword]         = useState("");
  const [pwError, setPwError]           = useState(false);
  const [submitting, setSubmitting]     = useState(false);
  const pwInputRef = useRef<HTMLInputElement>(null);

  function openPrivateModal(card: Card) {
    setPrivateCard(card);
    setPassword("");
    setPwError(false);
  }
  function closePrivateModal() {
    setPrivateCard(null);
    setPassword("");
    setPwError(false);
  }

  async function handlePrivateSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password.trim() || submitting || !privateCard) return;
    setSubmitting(true);
    setPwError(false);
    try {
      const res = await fetch("/api/private-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, cardNo: privateCard.순서 }),
      });
      if (!res.ok) { setPwError(true); return; }
      const { url } = await res.json();
      closePrivateModal();
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      setPwError(true);
    } finally {
      setSubmitting(false);
    }
  }

  const handleDmSent = (msg: DmMessage) => setDms((prev) => [...prev, msg]);

  // ESC 키 처리
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (privateCard) { closePrivateModal(); return; }
        if (dmOpen) { setDmOpen(false); return; }
        if (view === "grid") setView("marquee");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dmOpen, view, privateCard]);

  // PRIVATE 모달 열릴 때 input 포커스
  useEffect(() => {
    if (privateCard) setTimeout(() => pwInputRef.current?.focus(), 50);
  }, [privateCard]);

  const detailsLabel = texts["CARD_DETAILS_LABEL"]  ?? "DETAILS";
  const soonLabel    = texts["CARD_SOON_LABEL"]      ?? "준비중...";
  const soonNoUrlMsg = texts["CARD_SOON_NO_URL_MSG"] ?? "아직 준비 중인 프로젝트입니다.";

  const privateTexts = {
    hoverMsg:            texts["PRIVATE_HOVER_MSG"]            ?? "관리자만 접근 가능한 툴입니다.",
    passwordTitle:       texts["PRIVATE_PASSWORD_TITLE"]       ?? "관리자 비밀번호를 입력하세요",
    passwordPlaceholder: texts["PRIVATE_PASSWORD_PLACEHOLDER"] ?? "비밀번호",
    passwordError:       texts["PRIVATE_PASSWORD_ERROR"]       ?? "비밀번호가 틀렸습니다.",
    passwordSubmit:      texts["PRIVATE_PASSWORD_SUBMIT"]      ?? "확인",
  };

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
        <section className="flex-1 min-h-0 relative overflow-hidden">

          {/* 타이틀 */}
          <div className="pl-[10%] pr-8 pt-12 pb-4">
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

            {/* DM 버튼 */}
            <button
              onClick={() => setDmOpen(true)}
              title="메시지 남기기"
              className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl text-[#888888] hover:text-white transition-all"
              style={{ background: "#1c1c1c", border: "1px solid #333333" }}
            >
              <DmIcon />
              <span className="text-xs font-medium hidden sm:inline">
                {texts["DM_SEND_LABEL"] || "메시지"}
              </span>
            </button>
          </div>

          {/* 펫 존 */}
          <div className="absolute inset-x-0 bottom-0" style={{ height: 160 }}>
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

        {/* ── 카드 영역 (마퀴 고정) ── */}
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
                        privateTexts={privateTexts}
                        onPrivateClick={() => openPrivateModal(card)}
                        disableHover
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {texts["FOOTER_TEXT"] && (
          <div className="px-8 md:px-16 py-4 border-t border-[#141414]">
            <p className="text-xs text-[#2e2e2e] text-right">{texts["FOOTER_TEXT"]}</p>
          </div>
        )}
      </main>

      {/* ── 그리드 전체화면 오버레이 (아래서 슬라이드 업) ── */}
      <div
        className="fixed inset-0 z-40 flex flex-col"
        style={{
          background: "#0a0a0a",
          transform: view === "grid" ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.38s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div className="flex-shrink-0 flex items-center gap-2 pl-[10%] pr-8 pt-5 pb-3 border-b border-[#1a1a1a]">
          <button
            onClick={() => setView("marquee")}
            title="슬라이드 보기"
            className="w-8 h-8 rounded-lg flex items-center justify-center border border-[#1e1e1e] hover:border-[#333333] transition-colors"
          >
            <MarqueeIcon active={false} />
          </button>
          <button
            onClick={() => setView("grid")}
            title="목록 보기"
            className="w-8 h-8 rounded-lg flex items-center justify-center border border-[#444444] bg-[#1e1e1e] transition-colors"
          >
            <GridIcon active={true} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div
            className="grid gap-4 pl-[10%] pr-[10%] pt-8 pb-16"
            style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}
          >
            {cards.map((card) => (
              <ProjectCard
                key={card.순서}
                card={card}
                detailsLabel={detailsLabel}
                soonLabel={soonLabel}
                soonNoUrlMsg={soonNoUrlMsg}
                privateTexts={privateTexts}
                onPrivateClick={() => openPrivateModal(card)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── PRIVATE 비밀번호 모달 (PageLayout 레벨 — transform 영향 없음) ── */}
      {privateCard && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" }}
          onClick={closePrivateModal}
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={handlePrivateSubmit}
            className="w-72 rounded-2xl p-6"
            style={{ background: "#1c1c1c", border: "1px solid #333333" }}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-[#cccccc] flex items-center gap-1.5">
                <LockIcon />
                {privateTexts.passwordTitle}
              </p>
              <button type="button" onClick={closePrivateModal} className="text-[#666666] hover:text-[#aaaaaa] transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <input
              ref={pwInputRef}
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setPwError(false); }}
              placeholder={privateTexts.passwordPlaceholder}
              className="w-full bg-transparent border-b py-1.5 text-sm text-[#e8e8e8] placeholder-[#555555] focus:outline-none mb-4"
              style={{ borderColor: pwError ? "#f87171" : "#3a3a3a" }}
              onFocus={(e) => { if (!pwError) e.target.style.borderColor = "#666666"; }}
              onBlur={(e) => { if (!pwError) e.target.style.borderColor = "#3a3a3a"; }}
            />

            <p className={`text-[11px] text-red-400 mb-3 transition-opacity ${pwError ? "opacity-100" : "opacity-0"}`}>
              {privateTexts.passwordError}
            </p>

            <button
              type="submit"
              disabled={submitting || !password.trim()}
              className="w-full py-2 rounded-lg text-sm font-medium text-[#cccccc] hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ background: "#2a2a2a", border: "1px solid #444444" }}
            >
              {submitting ? "확인 중..." : privateTexts.passwordSubmit}
            </button>
          </form>
        </div>
      )}

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
              onDmSent={(msg) => { handleDmSent(msg); setTimeout(() => setDmOpen(false), 1200); }}
              onClose={() => setDmOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
