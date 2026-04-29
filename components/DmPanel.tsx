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
      className="rounded-3xl px-4 py-3 text-sm leading-relaxed w-fit max-w-full"
      style={{
        background: "linear-gradient(135deg, rgba(147,197,253,0.07), rgba(196,181,253,0.06) 50%, rgba(167,243,208,0.06))",
        border: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05), 0 4px 20px rgba(0,0,0,0.1)",
        backdropFilter: "blur(4px)",
      }}
    >
      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-[11px] font-semibold text-[#bbbbbb]">{msg.nickname}</span>
        <span className="text-[10px] text-[#666666]">{formatTime(msg.timestamp)}</span>
      </div>
      <p className="text-[12px] text-[#e0e0e0] font-light whitespace-pre-wrap break-words">
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

      {/* 버블 목록 — 상단 페이드, 스크롤 가능 */}
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto min-h-0 px-6"
        style={{
          scrollbarWidth: "none",
          maskImage: "linear-gradient(to bottom, transparent 0%, black 28%, black 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 28%, black 100%)",
        } as React.CSSProperties}
      >
        {/* 상단 여백 — 버블을 타이틀 높이 아래로 밀어내기 */}
        <div className="h-[38%]" />
        <div className="space-y-3 pb-4">
          {dms.length === 0 ? (
            <p className="text-[11px] text-[#555555] leading-relaxed">
              {t("DM_EMPTY_MSG", "아직 아무도 글을 남기지 않았어요")}
            </p>
          ) : (
            dms.map((msg, i) => <Bubble key={i} msg={msg} />)
          )}
        </div>
      </div>

      {/* 입력 폼 — 경계선 없이 바닥에 */}
      <div className="shrink-0 px-6 pb-8 pt-1">
        <form onSubmit={handleSend} className="space-y-2">

          {/* 닉네임 */}
          <div>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value.slice(0, 20))}
              placeholder={t("DM_PLACEHOLDER_NICK", "닉네임 (선택)")}
              className="w-full bg-transparent border-b border-[#2a2a2a] py-1.5 text-xs text-white placeholder-[#555555] focus:outline-none focus:border-[#555555] transition-colors"
            />
            {!nickname && (
              <p className="text-[10px] text-[#555555] mt-0.5">
                {t("DM_ANON_HINT", "비워두면 랜덤 닉네임이 생성됩니다")}
              </p>
            )}
          </div>

          {/* 내용 + 전송 버튼 */}
          <div className="flex items-end gap-2">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, 200))}
              placeholder={t("DM_PLACEHOLDER_MSG", "남기고 싶은 말을 적어주세요")}
              rows={2}
              className="flex-1 bg-transparent border-b border-[#2a2a2a] py-1.5 text-xs text-white placeholder-[#555555] focus:outline-none focus:border-[#555555] transition-colors resize-none"
            />
            <button
              type="submit"
              disabled={sending || !content.trim()}
              className="shrink-0 mb-1 text-[#666666] hover:text-white transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
              aria-label="전송"
            >
              {sending ? (
                <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 1 1-6.22-8.56" />
                </svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 2 11 13" /><path d="M22 2 15 22 11 13 2 9l20-7z" />
                </svg>
              )}
            </button>
          </div>

          {/* 상태 + 글자수 */}
          <div className="flex justify-between items-center">
            <p className={`text-[10px] transition-opacity ${statusMsg ? "opacity-100" : "opacity-0"} ${statusMsg.includes("실패") || statusMsg.includes("초 후") ? "text-red-400" : "text-emerald-400"}`}>
              {statusMsg || "·"}
            </p>
            <p className="text-[10px] text-[#555555]">{content.length}/200</p>
          </div>

        </form>
      </div>
    </div>
  );
}
