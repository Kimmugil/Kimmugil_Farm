"use client";

import { useState } from "react";
import type { UITexts, Card } from "@/lib/types";

interface Props {
  texts: UITexts;
  cards: Card[];
  adminPassword: string;
  onClose: () => void;
  onSaved: () => void;
}

type TabId = "ui_texts" | "cards";

export default function AdminPanel({ texts, cards, adminPassword, onClose, onSaved }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>("ui_texts");
  const [editedTexts, setEditedTexts] = useState<UITexts>({ ...texts });
  const [editedCards, setEditedCards] = useState<Card[]>(
    cards.map((c) => ({ ...c }))
  );
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  // ─── UI Texts 저장 ───────────────────────────────────────────
  async function saveTexts() {
    setSaving(true);
    setSaveMsg("");
    try {
      const updates = Object.entries(editedTexts).map(([key, value], i) => ({
        sheet: "UI_TEXTS" as const,
        range: `A${i + 2}:B${i + 2}`,
        values: [[key, value]],
      }));

      // 전체를 한 번에 보내기 위해 배열 범위 일괄 업데이트
      const rows = Object.entries(editedTexts).map(([k, v]) => [k, v]);
      const res = await fetch("/api/sheets/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: adminPassword,
          updates: [
            {
              sheet: "UI_TEXTS",
              range: `A2:B${rows.length + 1}`,
              values: rows,
            },
          ],
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      setSaveMsg("저장되었습니다.");
      onSaved();
    } catch (e) {
      setSaveMsg("저장 실패: " + String(e));
    } finally {
      setSaving(false);
    }
  }

  // ─── Cards 저장 ──────────────────────────────────────────────
  async function saveCards() {
    setSaving(true);
    setSaveMsg("");
    try {
      const rows = editedCards.map((c) => [
        String(c.순서),
        c.온오프 ? "True" : "False",
        c.아이콘,
        c.타이틀,
        c.서브타이틀,
        c.설명1,
        c.설명2,
        c.설명3,
        c.설명4,
        c.URL,
      ]);

      const res = await fetch("/api/sheets/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: adminPassword,
          updates: [
            {
              sheet: "CARDS",
              range: `A2:J${rows.length + 1}`,
              values: rows,
            },
          ],
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      setSaveMsg("저장되었습니다.");
      onSaved();
    } catch (e) {
      setSaveMsg("저장 실패: " + String(e));
    } finally {
      setSaving(false);
    }
  }

  function updateCard(idx: number, field: keyof Card, value: string | boolean | number) {
    setEditedCards((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  }

  return (
    <div
      className="modal-overlay fixed inset-0 z-50 flex items-start justify-center bg-black/80 overflow-y-auto py-8 px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-3xl bg-[#111111] border border-[#2a2a2a] rounded-2xl shadow-2xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e1e1e]">
          <div className="flex items-center gap-3">
            <span className="text-lg select-none">⚙️</span>
            <h2 className="text-base font-bold text-white">관리자 패널</h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#555555] hover:text-white transition-colors text-xl leading-none"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        {/* 탭 */}
        <div className="flex gap-2 px-6 pt-4">
          {(["ui_texts", "cards"] as TabId[]).map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setSaveMsg(""); }}
              className={`admin-tab ${activeTab === tab ? "active" : ""}`}
            >
              {tab === "ui_texts" ? "텍스트 관리" : "카드 관리"}
            </button>
          ))}
        </div>

        {/* 본문 */}
        <div className="px-6 py-5">
          {activeTab === "ui_texts" && (
            <div className="space-y-3">
              {Object.entries(editedTexts).map(([key, value]) => (
                <div key={key} className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-[#555555] uppercase tracking-widest">
                    {key}
                  </label>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) =>
                      setEditedTexts((prev) => ({ ...prev, [key]: e.target.value }))
                    }
                    className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white placeholder-[#444444] focus:outline-none focus:border-[#444444] transition-colors font-light"
                  />
                </div>
              ))}
            </div>
          )}

          {activeTab === "cards" && (
            <div className="space-y-6">
              {editedCards.map((card, i) => (
                <div
                  key={i}
                  className="border border-[#222222] rounded-xl p-4 space-y-3"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-white">
                      카드 #{card.순서} — {card.타이틀 || "(제목 없음)"}
                    </span>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <span className="text-xs text-[#666666]">노출</span>
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={card.온오프}
                          onChange={(e) => updateCard(i, "온오프", e.target.checked)}
                          className="sr-only"
                        />
                        <div
                          onClick={() => updateCard(i, "온오프", !card.온오프)}
                          className={`w-9 h-5 rounded-full cursor-pointer transition-colors ${
                            card.온오프 ? "bg-white" : "bg-[#333333]"
                          }`}
                        >
                          <div
                            className={`absolute top-0.5 h-4 w-4 rounded-full bg-black transition-transform ${
                              card.온오프 ? "translate-x-4" : "translate-x-0.5"
                            }`}
                          />
                        </div>
                      </div>
                    </label>
                  </div>

                  {(
                    [
                      ["아이콘", "아이콘 (이모지 또는 이미지 URL)"],
                      ["타이틀", "타이틀"],
                      ["서브타이틀", "서브타이틀"],
                      ["설명1", "설명 1"],
                      ["설명2", "설명 2"],
                      ["설명3", "설명 3"],
                      ["설명4", "설명 4"],
                      ["URL", "링크 URL"],
                    ] as [keyof Card, string][]
                  ).map(([field, label]) => (
                    <div key={field} className="flex flex-col gap-1">
                      <label className="text-[10px] font-semibold text-[#444444] uppercase tracking-widest">
                        {label}
                      </label>
                      <input
                        type="text"
                        value={String(card[field])}
                        onChange={(e) => updateCard(i, field, e.target.value)}
                        className="bg-[#1a1a1a] border border-[#222222] rounded-lg px-3 py-2 text-sm text-white placeholder-[#333333] focus:outline-none focus:border-[#3a3a3a] transition-colors font-light"
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 하단 액션 바 */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#1e1e1e]">
          <p
            className={`text-xs font-medium transition-opacity ${
              saveMsg ? "opacity-100" : "opacity-0"
            } ${saveMsg.startsWith("저장 실패") ? "text-red-400" : "text-green-400"}`}
          >
            {saveMsg || "·"}
          </p>
          <button
            onClick={activeTab === "ui_texts" ? saveTexts : saveCards}
            disabled={saving}
            className="bg-white text-black font-semibold text-sm rounded-xl px-6 py-2.5 hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? "저장 중..." : "저장하기"}
          </button>
        </div>
      </div>
    </div>
  );
}
