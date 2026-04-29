"use client";

import { useState, useCallback } from "react";
import type { Card, UITexts } from "@/lib/types";
import LockScreen from "./LockScreen";
import CardGrid from "./CardGrid";
import AdminButton from "./AdminButton";
import AdminPanel from "./AdminPanel";

interface Props {
  isOpen: boolean;
  initialTexts: UITexts;
  initialCards: Card[];
}

export default function PortfolioClient({ isOpen, initialTexts, initialCards }: Props) {
  const [unlocked, setUnlocked] = useState(isOpen);
  const [texts, setTexts] = useState<UITexts>(initialTexts);
  const [cards, setCards] = useState<Card[]>(initialCards);
  const [adminPassword, setAdminPassword] = useState("");
  const [showAdmin, setShowAdmin] = useState(false);

  const handleUnlock = useCallback(async (password: string): Promise<boolean> => {
    const res = await fetch("/api/sheets/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      setAdminPassword(password);
      setUnlocked(true);
      return true;
    }
    return false;
  }, []);

  const handleAdminAuth = useCallback(async (password: string): Promise<boolean> => {
    const res = await fetch("/api/sheets/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      setAdminPassword(password);
      setShowAdmin(true);
      return true;
    }
    return false;
  }, []);

  async function refreshData() {
    const [textsRes, cardsRes] = await Promise.all([
      fetch("/api/sheets/ui-texts"),
      fetch("/api/sheets/cards"),
    ]);
    if (textsRes.ok) setTexts(await textsRes.json());
    if (cardsRes.ok) setCards(await cardsRes.json());
  }

  if (!unlocked) {
    return <LockScreen onUnlock={handleUnlock} />;
  }

  return (
    <>
      <CardGrid cards={cards} texts={texts} />
      <AdminButton onAuth={handleAdminAuth} />
      {showAdmin && (
        <AdminPanel
          texts={texts}
          cards={cards}
          adminPassword={adminPassword}
          onClose={() => setShowAdmin(false)}
          onSaved={refreshData}
        />
      )}
    </>
  );
}
