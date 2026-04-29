"use client";

import { useState, useRef, useEffect } from "react";
import type { DmMessage, UITexts } from "@/lib/types";

interface Props {
  initialDms: DmMessage[];
  texts: UITexts;
}

function formatTime(ts: string): string {
  if (!ts) return "";
  try {
    const d = new Date(ts);
    if (isNaN(d.getTime())) return ts;
    return d.toLocaleDateString("ko-KR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return ts;
  }
}

function Bubble({ msg }: { msg: DmMessage }) {
  return (
    <div
      className="rounded-3xl px-4 py-3 text-sm leading-relaxed"
      style={{
        background: "linear-gradient(135deg, rgba(147,197,253,0.07) 0%, rgba(196,181,253,0.06) 50%, rgba(167,243,208,0.06) 100%)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 4px 20px rgba(0,0,0,0.12)",
      }}
    >
      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-[12px] font-semibold text-[#aaaaaa]">{msg.nickname}</span>
        <span className="text-[10px] text-[#444444]">{formatTime(msg.timestamp)}</span>
      </div>
      <p className="text-[13px] text-[#dddddd] font-light whitespace-pre-wrap break-words">
        {msg.content}
      </p>
    </div>
  );
}

export default function DmPanel({ initialDms, texts }: Props) {
  const [dms, setDms] = useState<DmMessage[]>(initialDms);
  const [nickname, setNickname] = useState("");
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [lastSentAt, setLastSentAt] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const t = (key: string, fallback: string) => texts[key] || fallback;

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [dms]);

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
      setDms((prev) => [...prev, newMsg]);
      setContent("");
      setLastSentAt(now);
      setStatusMsg(t("DM_SEND_SUCCESS", "전송되었습니다!"));
      setTimeout(() => setStatusMsg(""), 2500);
    } catch {
      setStatusMsg(t("DM_SEND_ERROR", "전송에 실패했습니다. 다시 시도해주세요."));
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* 패널 제목 */}
      <div className="px-5 pt-5 pb-3 border-b border-[#141414] shrink-0">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#444444]">
          {t("DM_TITLE", "방명록")}
        </p>
      </div>

      {/* 메시지 목록 */}
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0"
        style={{ scrollbarWidth: "none" }}
      >
        {dms.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-xs text-[#333333] text-center leading-relaxed">
              {t("DM_EMPTY_MSG", "아직 아무도 글을 남기지 않았어요")}
            </p>
          </div>
        ) : (
          dms.map((msg, i) => <Bubble key={i} msg={msg} />)
        )}
      </div>

      {/* 입력 폼 */}
      <div className="shrink-0 border-t border-[#141414] px-4 pt-3 pb-4">
        <form onSubmit={handleSend} className="space-y-2">
          <div className="relative">
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value.slice(0, 20))}
              placeholder={t("DM_PLACEHOLDER_NICK", "닉네임 (선택)")}
              className="w-full bg-[#111111] border border-[#222222] rounded-xl px-3 py-2 text-xs text-white placeholder-[#3a3a3a] focus:outline-none focus:border-[#333333] transition-colors"
            />
          </div>
          {!nickname && (
            <p className="text-[10px] text-[#333333] pl-1 -mt-1">
              {t("DM_ANON_HINT", "비워두면 랜덤 닉네임이 생성됩니다")}
            </p>
          )}
          <div className="flex gap-2">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, 200))}
              placeholder={t("DM_PLACEHOLDER_MSG", "남기고 싶은 말을 적어주세요")}
              rows={2}
              className="flex-1 bg-[#111111] border border-[#222222] rounded-xl px-3 py-2 text-xs text-white placeholder-[#3a3a3a] focus:outline-none focus:border-[#333333] transition-colors resize-none"
            />
            <button
              type="submit"
              disabled={sending || !content.trim()}
              className="shrink-0 w-12 bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl text-white text-xs font-semibold transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {sending ? (
                <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 1 1-6.22-8.56" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 2 11 13" /><path d="M22 2 15 22 11 13 2 9l20-7z" />
                </svg>
              )}
            </button>
          </div>
          <div className="flex justify-between items-center">
            <p className={`text-[10px] transition-opacity ${statusMsg ? "opacity-100" : "opacity-0"} ${statusMsg.includes("실패") || statusMsg.includes("초 후") ? "text-red-400" : "text-emerald-400"}`}>
              {statusMsg || "·"}
            </p>
            <p className="text-[10px] text-[#2a2a2a]">{content.length}/200</p>
          </div>
        </form>
      </div>
    </div>
  );
}
