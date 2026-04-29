"use client";

import { useState, useCallback } from "react";
import type { Card, UITexts, DmMessage } from "@/lib/types";
import LockScreen from "./LockScreen";
import PageLayout from "./PageLayout";

interface Props {
  isOpen: boolean;
  initialTexts: UITexts;
  initialCards: Card[];
  scrollSpeed: number;
  initialDms: DmMessage[];
  dmLeftOffset: string;
  dmRightPadding: string;
}

export default function PortfolioClient({ isOpen, initialTexts, initialCards, scrollSpeed, initialDms, dmLeftOffset, dmRightPadding }: Props) {
  const [unlocked, setUnlocked] = useState(isOpen);
  const [texts, setTexts] = useState<UITexts>(initialTexts);
  const [cards, setCards] = useState<Card[]>(initialCards);
  const [syncing, setSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);

  const handleUnlock = useCallback(async (password: string): Promise<boolean> => {
    const res = await fetch("/api/sheets/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      setUnlocked(true);
      return true;
    }
    return false;
  }, []);

  async function handleSync() {
    if (syncing) return;
    setSyncing(true);
    try {
      const [textsRes, cardsRes] = await Promise.all([
        fetch("/api/sheets/ui-texts"),
        fetch("/api/sheets/cards"),
      ]);
      if (textsRes.ok) setTexts(await textsRes.json());
      if (cardsRes.ok) setCards(await cardsRes.json());
      setLastSynced(new Date());
    } finally {
      setSyncing(false);
    }
  }

  if (!unlocked) {
    return <LockScreen onUnlock={handleUnlock} />;
  }

  return (
    <>
      <PageLayout cards={cards} texts={texts} scrollSpeed={scrollSpeed} initialDms={initialDms} dmLeftOffset={dmLeftOffset} dmRightPadding={dmRightPadding} />

      {/* 동기화 버튼 */}
      <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-1.5">
        {lastSynced && (
          <p className="text-[10px] text-[#444444] pr-1">
            {lastSynced.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })} 동기화됨
          </p>
        )}
        <button
          onClick={handleSync}
          disabled={syncing}
          title="구글 시트와 동기화"
          className="w-10 h-10 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-[#555555] hover:text-white hover:border-[#444444] transition-all disabled:cursor-not-allowed"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={syncing ? "animate-spin" : ""}>
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
            <path d="M8 16H3v5" />
          </svg>
        </button>
      </div>
    </>
  );
}
