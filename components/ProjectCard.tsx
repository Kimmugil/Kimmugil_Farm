"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import type { Card } from "@/lib/types";

interface PrivateTexts {
  hoverMsg: string;
  passwordTitle: string;
  passwordPlaceholder: string;
  passwordError: string;
  passwordSubmit: string;
}

interface Props {
  card: Card;
  detailsLabel: string;
  soonLabel: string;
  soonNoUrlMsg: string;
  disableHover?: boolean;
  privateTexts: PrivateTexts;
}

function isImageUrl(value: string): boolean {
  return /^https?:\/\/.+\.(png|jpg|jpeg|gif|webp|svg|avif)/i.test(value);
}

const BADGE_STYLES: Record<string, string> = {
  NEW:     "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  UPDATE:  "bg-sky-500/20 text-sky-400 border-sky-500/30",
  PRIVATE: "bg-amber-500/20 text-amber-400 border-amber-500/30",
};

function LockIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="inline-block mb-0.5 mr-0.5">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

export default function ProjectCard({ card, detailsLabel, soonLabel, soonNoUrlMsg, disableHover, privateTexts }: Props) {
  const descriptions = [card.설명1, card.설명2, card.설명3, card.설명4].filter(Boolean);
  const isSoon    = card.상태 === "SOON";
  const isPrivate = card.뱃지 === "PRIVATE";
  const badgeStyle = card.뱃지 ? BADGE_STYLES[card.뱃지] : null;

  // SOON 토스트
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  function showToast() {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToastVisible(true);
    toastTimer.current = setTimeout(() => setToastVisible(false), 2200);
  }

  // PRIVATE 호버 툴팁
  const [tooltipVisible, setTooltipVisible] = useState(false);

  // PRIVATE 비밀번호 모달
  const [modalOpen, setModalOpen]   = useState(false);
  const [password, setPassword]     = useState("");
  const [pwError, setPwError]       = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handlePrivateSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password.trim() || submitting) return;
    setSubmitting(true);
    setPwError(false);
    try {
      const res = await fetch("/api/private-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, cardNo: card.순서 }),
      });
      if (!res.ok) { setPwError(true); return; }
      const { url } = await res.json();
      setModalOpen(false);
      setPassword("");
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      setPwError(true);
    } finally {
      setSubmitting(false);
    }
  }

  function closeModal() {
    setModalOpen(false);
    setPassword("");
    setPwError(false);
  }

  const cardBody = (
    <div className="relative flex flex-col h-full min-h-[280px] rounded-2xl border border-[#282828] bg-[#141414] p-5 overflow-hidden">

      {/* 뱃지 */}
      {badgeStyle && (
        <span className={`absolute top-4 right-4 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${badgeStyle}`}>
          {isPrivate && <LockIcon />}
          {card.뱃지}
        </span>
      )}

      {/* 타이틀 / 서브타이틀 */}
      <div className="z-10">
        <h2 className="text-lg font-bold leading-tight text-white tracking-tight pr-14">
          {card.타이틀}
        </h2>
        {card.서브타이틀 && (
          <p className="mt-0.5 text-xs font-medium text-[#777777] uppercase tracking-widest">
            {card.서브타이틀}
          </p>
        )}
      </div>

      {/* 아이콘 */}
      <div className="flex flex-1 items-center justify-center py-6">
        {isImageUrl(card.아이콘) ? (
          <Image src={card.아이콘} alt={card.타이틀} width={96} height={96} className="object-contain select-none" />
        ) : (
          <span className="icon-text select-none" aria-hidden="true">{card.아이콘}</span>
        )}
      </div>

      {/* 설명 */}
      {descriptions.length > 0 && (
        <div className="z-10 mt-auto space-y-0.5">
          {detailsLabel && (
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#555555] mb-1.5">
              {detailsLabel}
            </p>
          )}
          {descriptions.map((desc, i) => (
            <p key={i} className="text-[12px] font-light text-[#aaaaaa] leading-relaxed">{desc}</p>
          ))}
        </div>
      )}

      {/* SOON 오버레이 */}
      {isSoon && (
        <div className="absolute inset-0 rounded-2xl bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
          <span className="text-sm font-semibold text-[#888888] tracking-widest">{soonLabel}</span>
        </div>
      )}

      {/* PRIVATE 호버 툴팁 */}
      {isPrivate && tooltipVisible && (
        <div className="absolute inset-x-4 bottom-4 z-20 bg-[#1a1a1a] border border-amber-500/30 rounded-xl px-4 py-2.5 text-center text-xs text-amber-400">
          {privateTexts.hoverMsg}
        </div>
      )}

      {/* SOON 토스트 */}
      {toastVisible && (
        <div className="absolute inset-x-4 bottom-4 z-20 bg-[#222222] border border-[#333333] rounded-xl px-4 py-2.5 text-center text-xs text-[#aaaaaa] animate-fade-in">
          {soonNoUrlMsg}
        </div>
      )}
    </div>
  );

  // ── PRIVATE 카드 ──
  if (isPrivate) {
    return (
      <>
        <div
          className={`${disableHover ? "" : "card-hover "}h-full cursor-pointer`}
          onClick={() => setModalOpen(true)}
          onMouseEnter={() => setTooltipVisible(true)}
          onMouseLeave={() => setTooltipVisible(false)}
          role="button"
          aria-label={card.타이틀}
        >
          {cardBody}
        </div>

        {/* 비밀번호 모달 */}
        {modalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" }}
            onClick={closeModal}
          >
            <form
              onClick={(e) => e.stopPropagation()}
              onSubmit={handlePrivateSubmit}
              className="w-72 rounded-2xl p-6"
              style={{ background: "#1c1c1c", border: "1px solid #333333" }}
            >
              {/* 헤더 */}
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-[#cccccc] flex items-center gap-1.5">
                  <LockIcon />
                  {privateTexts.passwordTitle}
                </p>
                <button type="button" onClick={closeModal} className="text-[#666666] hover:text-[#aaaaaa] transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* 입력 */}
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setPwError(false); }}
                placeholder={privateTexts.passwordPlaceholder}
                autoFocus
                className="w-full bg-transparent border-b py-1.5 text-sm text-[#e8e8e8] placeholder-[#555555] focus:outline-none mb-4"
                style={{ borderColor: pwError ? "#f87171" : "#3a3a3a" }}
                onFocus={(e) => { if (!pwError) e.target.style.borderColor = "#666666"; }}
                onBlur={(e) => { if (!pwError) e.target.style.borderColor = "#3a3a3a"; }}
              />

              {/* 에러 메시지 */}
              <p className={`text-[11px] text-red-400 mb-3 transition-opacity ${pwError ? "opacity-100" : "opacity-0"}`}>
                {privateTexts.passwordError}
              </p>

              {/* 제출 버튼 */}
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
      </>
    );
  }

  // ── SOON + URL → 링크 ──
  if (isSoon && card.URL) {
    return (
      <a href={card.URL} target="_blank" rel="noopener noreferrer"
        className="block h-full focus:outline-none focus:ring-2 focus:ring-white/10 rounded-2xl cursor-pointer"
        aria-label={`${card.타이틀} 바로가기`}>
        {cardBody}
      </a>
    );
  }

  // ── SOON + URL 없음 → 토스트 ──
  if (isSoon) {
    return (
      <div className="h-full cursor-pointer" onClick={showToast} role="button" aria-label={card.타이틀}>
        {cardBody}
      </div>
    );
  }

  // ── 일반 카드 ──
  if (card.URL) {
    return (
      <a href={card.URL} target="_blank" rel="noopener noreferrer"
        className={`${disableHover ? "" : "card-hover "}block h-full focus:outline-none focus:ring-2 focus:ring-white/20 rounded-2xl`}
        aria-label={`${card.타이틀} 프로젝트 바로가기`}>
        {cardBody}
      </a>
    );
  }

  return <div className={`${disableHover ? "" : "card-hover "}h-full`}>{cardBody}</div>;
}
