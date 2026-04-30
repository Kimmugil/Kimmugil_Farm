"use client";

import { useEffect, useRef } from "react";
import type { DmPet, DmMessage } from "@/lib/types";

interface Props {
  pets: DmPet[];
  dms: DmMessage[];
  repulsionRadius: number;
}

interface PetRuntime {
  x: number;
  y: number;
  vx: number;
  vy: number;
  facingRight: boolean;
  animType: "walk" | "shake" | "jump";
  animTimer: number;
  speed: number;
  shakePhase: number;
  isAirborne: boolean;
}

const BASE_PX = 16; // 이모지 크기 기준 (px per size unit)
const GRAVITY = 900;

export default function PetZone({ pets, dms, repulsionRadius }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapRefs = useRef<Map<number, HTMLDivElement | null>>(new Map());
  const emojiRefs = useRef<Map<number, HTMLSpanElement | null>>(new Map());
  const runtimeRef = useRef<PetRuntime[]>([]);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  const activePets = pets.filter((p) => p.active);

  const assignedDms = activePets.map((_, i) => {
    const idx = dms.length - activePets.length + i;
    return idx >= 0 ? dms[idx] : undefined;
  });

  // 초기 위치 — 바닥에 고르게 배치
  useEffect(() => {
    const W = containerRef.current?.clientWidth ?? 800;
    const H = containerRef.current?.clientHeight ?? 200;

    runtimeRef.current = activePets.map((pet, i) => {
      const petPx = pet.size * BASE_PX;
      const gY = H - petPx;
      const spread = activePets.length > 1 ? W / activePets.length : W * 0.5;
      return {
        x: spread * i + spread * 0.3 + Math.random() * spread * 0.4,
        y: gY,
        vx: (Math.random() > 0.5 ? 1 : -1) * pet.speed * (0.6 + Math.random() * 0.5),
        vy: 0,
        facingRight: Math.random() > 0.5,
        animType: "walk" as const,
        animTimer: Math.random() * 1500 + 500,
        speed: pet.speed,
        shakePhase: 0,
        isAirborne: false,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePets.length]);

  // rAF 루프
  useEffect(() => {
    if (activePets.length === 0) return;
    lastTimeRef.current = 0;

    function tick(time: number) {
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = time;
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      const rawMs = time - lastTimeRef.current;
      lastTimeRef.current = time;
      const dt = Math.min(rawMs / 1000, 0.05);

      const W = containerRef.current?.clientWidth ?? 800;
      const H = containerRef.current?.clientHeight ?? 200;
      const states = runtimeRef.current;

      for (let i = 0; i < states.length; i++) {
        const s = states[i];
        const pet = activePets[i];
        const petPx = pet.size * BASE_PX;
        const groundY = H - petPx;

        // ── 상태 타이머 ──────────────────────────────────
        s.animTimer -= rawMs;
        if (s.animTimer <= 0 && !s.isAirborne) {
          const r = Math.random();
          if (r < 0.06) {
            s.animType = "shake";
            s.shakePhase = 0;
            s.animTimer = 300 + Math.random() * 500;
          } else if (r < 0.10) {
            s.animType = "jump";
            s.vy = -(s.speed * 2.8 + 100);
            s.isAirborne = true;
            s.animTimer = 3000;
          } else {
            s.animType = "walk";
            s.animTimer = 1500 + Math.random() * 3000;
            if (Math.random() < 0.5) {
              const dir = Math.random() > 0.5 ? 1 : -1;
              s.vx = dir * s.speed * (0.5 + Math.random() * 0.8);
            }
          }
        }

        // ── 이동 ─────────────────────────────────────────
        if (s.isAirborne) {
          s.vy += GRAVITY * dt;
          s.x += s.vx * dt * 0.4;
          s.y += s.vy * dt;
          if (s.y >= groundY) {
            s.y = groundY;
            s.vy = 0;
            s.isAirborne = false;
            s.animType = "walk";
            s.animTimer = 800 + Math.random() * 1500;
          }
        } else {
          s.x += s.vx * dt;
          s.y = groundY;
        }

        // ── 좌우 경계 ─────────────────────────────────────
        const maxX = W - petPx * 2;
        if (s.x < 0)    { s.x = 0;    s.vx = Math.abs(s.vx); }
        if (s.x > maxX) { s.x = maxX; s.vx = -Math.abs(s.vx); }

        if (Math.abs(s.vx) > 0.5) s.facingRight = s.vx > 0;

        // ── 수평 반발 ─────────────────────────────────────
        for (let j = i + 1; j < states.length; j++) {
          const o = states[j];
          const dx = s.x - o.x;
          const dist = Math.abs(dx);
          if (dist < repulsionRadius && dist > 0.5) {
            const f = ((repulsionRadius - dist) / repulsionRadius) * 18;
            const dir = dx > 0 ? 1 : -1;
            s.vx += dir * f * dt;
            o.vx -= dir * f * dt;
            const clampV = (v: number, max: number) =>
              Math.abs(v) > max * 1.5 ? (v > 0 ? 1 : -1) * max * 1.5 : v;
            s.vx = clampV(s.vx, s.speed);
            o.vx = clampV(o.vx, o.speed);
          }
        }

        // ── DOM 업데이트 ──────────────────────────────────
        const wrap = wrapRefs.current.get(pet.id);
        const emoji = emojiRefs.current.get(pet.id);
        if (wrap) wrap.style.transform = `translate(${s.x}px,${s.y}px)`;
        if (emoji) {
          const flipX = s.facingRight ? 1 : -1;
          if (s.animType === "shake" && !s.isAirborne) {
            s.shakePhase += dt * 28;
            emoji.style.transform = `scaleX(${flipX}) translateX(${Math.sin(s.shakePhase) * 2.5}px)`;
          } else {
            emoji.style.transform = `scaleX(${flipX})`;
          }
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePets.length, repulsionRadius]);

  if (activePets.length === 0) return null;

  return (
    <div ref={containerRef} className="relative w-full h-full">
      {activePets.map((pet, i) => {
        const dm = assignedDms[i];
        const petPx = pet.size * BASE_PX;

        return (
          <div
            key={pet.id}
            ref={(el) => { wrapRefs.current.set(pet.id, el); }}
            className="absolute top-0 left-0 pointer-events-none select-none"
            style={{ willChange: "transform" }}
          >
            {/* 말풍선 */}
            {dm && (
              <div
                className="absolute"
                style={{
                  bottom: petPx + 8,
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "rgba(20,20,20,0.92)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 10,
                  padding: "6px 10px",
                  width: "max-content",
                  maxWidth: 160,
                  zIndex: 20,
                  backdropFilter: "blur(6px)",
                  WebkitBackdropFilter: "blur(6px)",
                }}
              >
                <p className="text-[10px] text-[#888888] mb-0.5 max-w-[140px] truncate font-medium">
                  {dm.nickname}
                </p>
                <p
                  className="text-[12px] text-[#e0e0e0] break-words leading-snug"
                  style={{ fontWeight: 300, maxWidth: 140 }}
                >
                  {dm.content.length > 80 ? dm.content.slice(0, 80) + "…" : dm.content}
                </p>
                <div
                  style={{
                    position: "absolute",
                    bottom: -5,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 0,
                    height: 0,
                    borderLeft: "5px solid transparent",
                    borderRight: "5px solid transparent",
                    borderTop: "5px solid rgba(20,20,20,0.92)",
                  }}
                />
              </div>
            )}

            {/* 이모지 */}
            <span
              ref={(el) => { emojiRefs.current.set(pet.id, el); }}
              style={{
                fontSize: `${pet.size * 0.9}rem`,
                display: "inline-block",
                lineHeight: 1,
              }}
            >
              {pet.emoji}
            </span>
          </div>
        );
      })}
    </div>
  );
}
