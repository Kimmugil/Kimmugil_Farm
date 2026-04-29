"use client";

import Image from "next/image";
import type { Card, UITexts } from "@/lib/types";

function isImageUrl(v: string) {
  return /^https?:\/\/.+\.(png|jpg|jpeg|gif|webp|svg|avif)/i.test(v);
}

function CapsuleCard({ card }: { card: Card }) {
  const isSoon = card.상태 === "SOON";

  const inner = (
    <div
      className={`
        relative flex items-center gap-3.5
        bg-[#161616] border border-[#2a2a2a] rounded-full
        px-5 py-3.5 w-80 shrink-0 select-none overflow-hidden
        transition-colors duration-150
        ${!isSoon && card.URL ? "hover:border-[#3a3a3a] hover:bg-[#1e1e1e]" : ""}
        ${isSoon ? "opacity-40" : ""}
      `}
    >
      <span className="text-2xl leading-none w-8 flex items-center justify-center shrink-0">
        {isImageUrl(card.아이콘) ? (
          <Image src={card.아이콘} alt={card.타이틀} width={28} height={28} className="object-contain" />
        ) : (
          card.아이콘
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-white truncate leading-tight">{card.타이틀}</p>
        {card.서브타이틀 && (
          <p className="text-xs text-[#555555] truncate leading-tight mt-0.5">{card.서브타이틀}</p>
        )}
      </div>
      {isSoon && (
        <span className="text-[10px] font-bold text-[#444444] uppercase tracking-widest shrink-0">
          SOON
        </span>
      )}
      {card.뱃지 && !isSoon && (
        <span className={`text-[10px] font-bold uppercase tracking-widest shrink-0 ${
          card.뱃지 === "NEW" ? "text-emerald-500" : "text-sky-500"
        }`}>
          {card.뱃지}
        </span>
      )}
    </div>
  );

  // SOON이든 아니든 URL 있으면 클릭 가능
  if (card.URL) {
    return (
      <a href={card.URL} target="_blank" rel="noopener noreferrer" className="block cursor-pointer">
        {inner}
      </a>
    );
  }

  return <div>{inner}</div>;
}

interface Props {
  cards: Card[];
  texts: UITexts;
}

export default function HeroSection({ cards, texts }: Props) {
  if (cards.length === 0) return null;

  const tripled = [...cards, ...cards, ...cards];
  const duration = Math.max(cards.length * 3, 12);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden border-b border-[#1a1a1a]">
      <div className="w-full max-w-screen-xl mx-auto px-8 md:px-16 flex flex-col md:flex-row items-center gap-12 py-16">

        {/* 좌측: 대왕 타이틀 */}
        <div className="flex-1">
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-white leading-none tracking-tighter whitespace-pre-line">
            {texts["HEADER_TITLE"] || "Portfolio"}
          </h1>
          {texts["HEADER_SUBTITLE"] && (
            <p className="mt-5 text-sm md:text-base text-[#666666] font-medium tracking-wide">
              {texts["HEADER_SUBTITLE"]}
            </p>
          )}
          {texts["HEADER_DESC_LEFT"] && (
            <p className="mt-6 text-sm text-[#555555] leading-relaxed max-w-sm">
              {texts["HEADER_DESC_LEFT"]}
            </p>
          )}
          {texts["HEADER_DESC_RIGHT"] && (
            <p className="mt-2 text-sm text-[#555555] leading-relaxed max-w-sm">
              {texts["HEADER_DESC_RIGHT"]}
            </p>
          )}
        </div>

        {/* 우측: 세로 자동 스크롤 캡슐 카드 */}
        <div
          className="w-80 h-[520px] overflow-hidden shrink-0"
          style={{
            maskImage: "linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%)",
          }}
        >
          <div
            className="flex flex-col gap-3"
            style={{ animation: `marquee-down ${duration}s linear infinite` }}
          >
            {tripled.map((card, i) => (
              <CapsuleCard key={i} card={card} />
            ))}
          </div>
        </div>
      </div>

      {/* 스크롤 힌트 — 화면 하단 고정 */}
      {texts["HERO_SCROLL_HINT"] !== "" && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-xs text-[#333333]">
          <span>{texts["HERO_SCROLL_HINT"] || "스크롤하여 프로젝트 보기"}</span>
          <span className="animate-bounce-arrow text-base">↓</span>
        </div>
      )}
    </section>
  );
}
