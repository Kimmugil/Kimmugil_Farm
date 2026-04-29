"use client";

import { useState } from "react";

interface Props {
  onAuth: (password: string) => Promise<boolean>;
}

export default function AdminButton({ onAuth }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password.trim()) return;
    setLoading(true);
    setError("");
    const ok = await onAuth(password);
    setLoading(false);
    if (ok) {
      setShowModal(false);
      setPassword("");
    } else {
      setError("비밀번호가 올바르지 않습니다.");
      setPassword("");
    }
  }

  return (
    <>
      {/* 숨겨진 관리자 버튼 — 우측 하단, 투명하게 */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-4 right-4 z-40 w-8 h-8 rounded-full opacity-10 hover:opacity-40 transition-opacity bg-[#333333] flex items-center justify-center text-xs"
        aria-label="관리자"
        title="관리자 패널"
      >
        ⚙
      </button>

      {/* 비밀번호 모달 */}
      {showModal && (
        <div
          className="modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <div className="w-full max-w-sm bg-[#111111] border border-[#2a2a2a] rounded-2xl p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">관리자 인증</h3>
            <p className="text-xs text-[#555555] mb-5">관리자 비밀번호를 입력하세요</p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호"
                autoFocus
                className="w-full bg-[#1a1a1a] border border-[#333333] rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#444444] focus:outline-none focus:border-[#555555] transition-colors"
              />
              {error && <p className="text-xs text-red-400">{error}</p>}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setPassword(""); setError(""); }}
                  className="flex-1 border border-[#2a2a2a] text-[#666666] hover:text-white font-medium rounded-xl py-2.5 text-sm transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={loading || !password.trim()}
                  className="flex-1 bg-white text-black font-semibold rounded-xl py-2.5 text-sm hover:bg-gray-100 transition-colors disabled:opacity-40"
                >
                  {loading ? "확인 중..." : "입장"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
