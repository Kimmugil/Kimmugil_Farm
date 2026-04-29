"use client";

import Image from "next/image";
import type { Card, UITexts } from "@/lib/types";

function isImageUrl(v: string) {
  return /^https?:\/\/.+\.(png|jpg|jpeg|gif|webp|svg|avif)/i.test(v);
}

function CapsuleCard({ card }: { card: Card }) {
  return (
    <div className="flex items-center gap-3 bg-[#161616] border border-[#2a2a2a] rounded-full px-4 py-2.5 w-64 shrink-0 select-none">
      <span className="text-xl leading-none w-7 flex items-center justify-center">
        {isImageUrl(card.아이콘) ? (
          <Image src={card.아이콘} alt={card.타이틀} width={24} height={24} className="object-contain" />
        ) : (
          card.아이콘
        )}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-white truncate leading-tight">{card.타이틀}</p>
        {card.서브타이틀 && (
          <p className="text-[11px] text-[#555555] truncate leading-tight mt-0.5">{card.서브타이틀}</p>
        )}
      </div>
    </div>
  );
}

interface Props {
  cards: Card[];
  texts: UITexts;
}

export default function HeroSection({ cards, texts }: Props) {
  if (cards.length === 0) return null;

  // 충분한 길이 확보를 위해 3배 복제
  const tripled = [...cards, ...cards, ...cards];
  const duration = Math.max(cards.length * 3, 12);

  return (
    <section className="min-h-screen flex items-center overflow-hidden border-b border-[#1a1a1a]">
      <div className="w-full max-w-screen-xl mx-auto px-8 md:px-16 flex flex-col md:flex-row items-center gap-12">

        {/* 좌측: 대왕 타이틀 */}
        <div className="flex-1 py-16">
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
          <div className="mt-14 flex items-center gap-2 text-xs text-[#333333]">
            <span>↓</span>
            <span>{texts["HERO_SCROLL_HINT"] || "스크롤하여 프로젝트 보기"}</span>
          </div>
        </div>

        {/* 우측: 세로 자동 스크롤 캡슐 카드 */}
        <div
          className="w-72 h-[520px] overflow-hidden shrink-0 relative"
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
    </section>
  );
}
