"use client";

import { useState } from "react";
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
  onPrivateClick?: () => void; // PRIVATE 카드 클릭 시 PageLayout에서 모달 처리
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

export { LockIcon };

export default function ProjectCard({ card, detailsLabel, soonLabel, soonNoUrlMsg, disableHover, privateTexts, onPrivateClick }: Props) {
  const descriptions = [card.설명1, card.설명2, card.설명3, card.설명4].filter(Boolean);
  const isSoon    = card.상태 === "SOON";
  const isPrivate = card.뱃지 === "PRIVATE";
  const badgeStyle = card.뱃지 ? BADGE_STYLES[card.뱃지] : null;

  // SOON 토스트
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimer = { current: null as ReturnType<typeof setTimeout> | null };
  function showToast() {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToastVisible(true);
    toastTimer.current = setTimeout(() => setToastVisible(false), 2200);
  }

  // PRIVATE 호버 딤드
  const [hoverDim, setHoverDim] = useState(false);

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
        <h2 className="text-lg font-bold leading-tight text-white tracking-tight pr-14">{card.타이틀}</h2>
        {card.서브타이틀 && (
          <p className="mt-0.5 text-xs font-medium text-[#777777] uppercase tracking-widest">{card.서브타이틀}</p>
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
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#555555] mb-1.5">{detailsLabel}</p>
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

      {/* PRIVATE 호버 딤드 오버레이 */}
      {isPrivate && hoverDim && (
        <div className="absolute inset-0 rounded-2xl bg-black/70 backdrop-blur-[2px] flex items-center justify-center z-10 px-4">
          <p className="text-sm text-amber-400 font-medium text-center leading-relaxed">
            {privateTexts.hoverMsg}
          </p>
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
      <div
        className={`${disableHover ? "" : "card-hover "}h-full cursor-pointer`}
        onClick={() => onPrivateClick?.()}
        onMouseEnter={() => setHoverDim(true)}
        onMouseLeave={() => setHoverDim(false)}
        role="button"
        aria-label={card.타이틀}
      >
        {cardBody}
      </div>
    );
  }

  // ── SOON + URL ──
  if (isSoon && card.URL) {
    return (
      <a href={card.URL} target="_blank" rel="noopener noreferrer"
        className="block h-full focus:outline-none focus:ring-2 focus:ring-white/10 rounded-2xl cursor-pointer"
        aria-label={`${card.타이틀} 바로가기`}>
        {cardBody}
      </a>
    );
  }

  // ── SOON + URL 없음 ──
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
