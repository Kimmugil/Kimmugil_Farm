"use client";

import Image from "next/image";
import type { Card } from "@/lib/types";

interface Props {
  card: Card;
  detailsLabel: string;
}

function isImageUrl(value: string): boolean {
  return /^https?:\/\/.+\.(png|jpg|jpeg|gif|webp|svg|avif)/i.test(value);
}

export default function ProjectCard({ card, detailsLabel }: Props) {
  const descriptions = [card.설명1, card.설명2, card.설명3, card.설명4].filter(Boolean);

  const inner = (
    <div
      className="card-hover relative flex flex-col h-full min-h-[280px] rounded-2xl border border-[#282828] bg-[#141414] p-5 overflow-hidden cursor-pointer"
      role="article"
    >
      <div className="z-10">
        <h2 className="text-lg font-bold leading-tight text-white tracking-tight">
          {card.타이틀}
        </h2>
        {card.서브타이틀 && (
          <p className="mt-0.5 text-xs font-medium text-[#777777] uppercase tracking-widest">
            {card.서브타이틀}
          </p>
        )}
      </div>

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
    </div>
  );

  if (card.URL) {
    return (
      <a
        href={card.URL}
        target="_blank"
        rel="noopener noreferrer"
        className="block h-full focus:outline-none focus:ring-2 focus:ring-white/20 rounded-2xl"
        aria-label={`${card.타이틀} 프로젝트 바로가기`}
      >
        {inner}
      </a>
    );
  }

  return <div className="h-full">{inner}</div>;
}
