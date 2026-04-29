"use client";

import { useState } from "react";

interface Props {
  onUnlock: (password: string) => Promise<boolean>;
}

export default function LockScreen({ onUnlock }: Props) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password.trim()) return;

    setLoading(true);
    setError("");

    try {
      const ok = await onUnlock(password);
      if (!ok) {
        setError("잘못된 비밀번호입니다.");
        setPassword("");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="text-5xl mb-6 select-none">🔒</div>
          <h1 className="text-2xl font-bold text-white tracking-tight">접근 제한</h1>
          <p className="mt-2 text-sm text-[#666666]">비밀번호를 입력하여 진입하세요</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호"
              autoFocus
              className="w-full bg-[#1a1a1a] border border-[#333333] rounded-xl px-4 py-3 text-white placeholder-[#555555] text-sm font-medium focus:outline-none focus:border-[#555555] transition-colors"
            />
            {error && (
              <p className="mt-2 text-xs text-red-400 font-medium">{error}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={loading || !password.trim()}
            className="w-full bg-white text-black font-semibold rounded-xl py-3 text-sm hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? "확인 중..." : "입장하기"}
          </button>
        </form>
      </div>
    </div>
  );
}
