"use client";

import { useState } from "react";
import type { DmMessage, UITexts } from "@/lib/types";

interface Props {
  texts: UITexts;
  onDmSent: (msg: DmMessage) => void;
}

export default function DmForm({ texts, onDmSent }: Props) {
  const [nickname, setNickname] = useState("");
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [lastSentAt, setLastSentAt] = useState(0);

  const t = (key: string, fallback: string) => texts[key] || fallback;
  const isError = statusMsg.includes("실패") || statusMsg.includes("초 후");

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    const now = Date.now();
    if (now - lastSentAt < 10000) {
      setStatusMsg(t("DM_RATE_LIMIT", "10초 후에 다시 보낼 수 있어요"));
      return;
    }

    setSending(true);
    setStatusMsg("");
    try {
      const res = await fetch("/api/dm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname: nickname.trim(), content: content.trim() }),
      });
      if (!res.ok) throw new Error();
      const newMsg: DmMessage = await res.json();
      onDmSent(newMsg);
      setContent("");
      setNickname("");
      setLastSentAt(now);
      setStatusMsg(t("DM_SEND_SUCCESS", "전송됐어요!"));
      setTimeout(() => setStatusMsg(""), 2500);
    } catch {
      setStatusMsg(t("DM_SEND_ERROR", "전송에 실패했습니다."));
    } finally {
      setSending(false);
    }
  }

  return (
    <form
      onSubmit={handleSend}
      className="mt-6 w-64 bg-[#111111] border border-[#222222] rounded-2xl p-4"
    >
      {/* 닉네임 */}
      <div className="mb-3">
        <label className="block text-[10px] text-[#3a3a3a] uppercase tracking-widest mb-1.5">
          {t("DM_LABEL_NICK", "닉네임")}
          <span className="ml-1 normal-case tracking-normal">{t("DM_OPTIONAL", "(선택)")}</span>
        </label>
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value.slice(0, 20))}
          placeholder={t("DM_PLACEHOLDER_NICK", "비워두면 랜덤 생성")}
          className="w-full bg-transparent border-b border-[#262626] py-1.5 text-[11px] text-white placeholder-[#383838] focus:outline-none focus:border-[#444444] transition-colors"
        />
      </div>

      {/* 메시지 */}
      <div className="mb-3">
        <label className="block text-[10px] text-[#3a3a3a] uppercase tracking-widest mb-1.5">
          {t("DM_LABEL_MSG", "메시지")}
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value.slice(0, 200))}
          placeholder={t("DM_PLACEHOLDER_MSG", "남기고 싶은 말을 써주세요")}
          rows={3}
          className="w-full bg-transparent border-b border-[#262626] py-1.5 text-[11px] text-white placeholder-[#383838] focus:outline-none focus:border-[#444444] transition-colors resize-none"
        />
      </div>

      {/* 하단 */}
      <div className="flex items-center justify-between gap-2">
        <p className={`text-[10px] min-w-0 truncate transition-opacity ${statusMsg ? "opacity-100" : "opacity-0"} ${isError ? "text-red-400" : "text-emerald-400"}`}>
          {statusMsg || "·"}
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] text-[#2e2e2e]">{content.length}/200</span>
          <button
            type="submit"
            disabled={sending || !content.trim()}
            className="flex items-center gap-1.5 text-[10px] px-2.5 py-1.5 rounded-lg bg-[#1a1a1a] border border-[#282828] text-[#666666] hover:text-white hover:border-[#444444] transition-all disabled:opacity-25 disabled:cursor-not-allowed"
          >
            {sending ? (
              <svg className="animate-spin" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 12a9 9 0 1 1-6.22-8.56" />
              </svg>
            ) : (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2 11 13" /><path d="M22 2 15 22 11 13 2 9l20-7z" />
              </svg>
            )}
            {t("DM_SEND_LABEL", "보내기")}
          </button>
        </div>
      </div>
    </form>
  );
}
