"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import type { Card } from "@/lib/types";

interface Props {
  card: Card;
  detailsLabel: string;
  soonLabel: string;
  soonNoUrlMsg: string;
}

function isImageUrl(value: string): boolean {
  return /^https?:\/\/.+\.(png|jpg|jpeg|gif|webp|svg|avif)/i.test(value);
}

const BADGE_STYLES: Record<string, string> = {
  NEW:    "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  UPDATE: "bg-sky-500/20 text-sky-400 border-sky-500/30",
};

export default function ProjectCard({ card, detailsLabel, soonLabel, soonNoUrlMsg }: Props) {
  const descriptions = [card.설명1, card.설명2, card.설명3, card.설명4].filter(Boolean);
  const isSoon = card.상태 === "SOON";
  const badgeStyle = card.뱃지 ? BADGE_STYLES[card.뱃지] : null;

  const [toastVisible, setToastVisible] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function showToast() {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToastVisible(true);
    toastTimer.current = setTimeout(() => setToastVisible(false), 2200);
  }

  const cardBody = (
    <div className="relative flex flex-col h-full min-h-[280px] rounded-2xl border border-[#282828] bg-[#141414] p-5 overflow-hidden">

      {/* 뱃지 */}
      {badgeStyle && (
        <span
          className={`absolute top-4 right-4 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${badgeStyle}`}
        >
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
          <Image
            src={card.아이콘}
            alt={card.타이틀}
            width={96}
            height={96}
            className="object-contain select-none"
          />
        ) : (
          <span className="icon-text select-none" aria-hidden="true">
            {card.아이콘}
          </span>
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
            <p key={i} className="text-[12px] font-light text-[#aaaaaa] leading-relaxed">
              {desc}
            </p>
          ))}
        </div>
      )}

      {/* SOON 오버레이 */}
      {isSoon && (
        <div className="absolute inset-0 rounded-2xl bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
          <span className="text-sm font-semibold text-[#888888] tracking-widest">
            {soonLabel}
          </span>
        </div>
      )}

      {/* 토스트 (URL 없는 SOON 카드 클릭 시) */}
      {toastVisible && (
        <div className="absolute inset-x-4 bottom-4 z-20 bg-[#222222] border border-[#333333] rounded-xl px-4 py-2.5 text-center text-xs text-[#aaaaaa] animate-fade-in">
          {soonNoUrlMsg}
        </div>
      )}
    </div>
  );

  // SOON + URL → 링크로 이동
  if (isSoon && card.URL) {
    return (
      <a
        href={card.URL}
        target="_blank"
        rel="noopener noreferrer"
        className="block h-full focus:outline-none focus:ring-2 focus:ring-white/10 rounded-2xl cursor-pointer"
        aria-label={`${card.타이틀} 바로가기`}
      >
        {cardBody}
      </a>
    );
  }

  // SOON + URL 없음 → 클릭 시 토스트
  if (isSoon) {
    return (
      <div
        className="h-full cursor-pointer"
        onClick={showToast}
        role="button"
        aria-label={card.타이틀}
      >
        {cardBody}
      </div>
    );
  }

  // 일반 카드
  if (card.URL) {
    return (
      <a
        href={card.URL}
        target="_blank"
        rel="noopener noreferrer"
        className="card-hover block h-full focus:outline-none focus:ring-2 focus:ring-white/20 rounded-2xl"
        aria-label={`${card.타이틀} 프로젝트 바로가기`}
      >
        {cardBody}
      </a>
    );
  }

  return <div className="card-hover h-full">{cardBody}</div>;
}
