"use client";

import { useEffect, useRef } from "react";
import type { DmPet, DmMessage } from "@/lib/types";

interface Props {
  pets: DmPet[];
  dms: DmMessage[];
  repulsionRadius: number;
  petSizeScale: number;   // rem = pet.size * petSizeScale
  groundOffset: number;   // 바닥에서 위로 띄울 px
  bubbleFontSize: number; // px
  bubbleMaxWidth: number; // px
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

const GRAVITY = 900;

export default function PetZone({
  pets, dms, repulsionRadius,
  petSizeScale, groundOffset, bubbleFontSize, bubbleMaxWidth,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapRefs = useRef<Map<number, HTMLDivElement | null>>(new Map());
  const emojiRefs = useRef<Map<number, HTMLSpanElement | null>>(new Map());
  const petWidthsRef = useRef<Map<number, number>>(new Map()); // 실제 렌더링 너비 캐시
  const runtimeRef = useRef<PetRuntime[]>([]);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  const activePets = pets.filter((p) => p.active);

  // fixedMessage 있으면 항상 그 메시지 표시
  // 없는 펫에는 최근 방문자 DM 자동 분배
  const freePets = activePets.filter((p) => !p.fixedMessage);
  const assignedDms = activePets.map((pet, i) => {
    if (pet.fixedMessage) {
      return { nickname: "", content: pet.fixedMessage, timestamp: "" } as DmMessage;
    }
    const freeIdx = freePets.indexOf(pet);
    const idx = dms.length - freePets.length + freeIdx;
    return idx >= 0 ? dms[idx] : undefined;
  });

  // px 높이 = font-size(rem) * 16 * 보정계수(이모지 실제 높이)
  const petHeightPx = (size: number) => size * petSizeScale * 16 * 1.1;

  useEffect(() => {
    petWidthsRef.current.clear(); // 펫 구성 바뀌면 너비 캐시 리셋
    const W = containerRef.current?.clientWidth ?? 800;
    const H = containerRef.current?.clientHeight ?? 200;

    runtimeRef.current = activePets.map((pet, i) => {
      const gY = H - petHeightPx(pet.size) - groundOffset;
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
  }, [activePets.length, groundOffset, petSizeScale]);

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
        const groundY = H - petHeightPx(pet.size) - groundOffset;

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

        // 실제 이모지 너비를 첫 프레임에 측정 후 캐싱 (카오모지는 높이보다 훨씬 넓음)
        const emojiEl = emojiRefs.current.get(pet.id);
        if (emojiEl && !petWidthsRef.current.has(pet.id)) {
          petWidthsRef.current.set(pet.id, emojiEl.offsetWidth);
        }
        const petW = petWidthsRef.current.get(pet.id) ?? petHeightPx(pet.size) * 4;
        const edgeMargin = Math.round(W * 0.05); // 좌우 5% 페이드 안쪽으로 경계 제한
        const minX = edgeMargin;
        const maxX = Math.max(minX, W - petW - edgeMargin);
        if (s.x < minX) { s.x = minX; s.vx = Math.abs(s.vx); }
        if (s.x > maxX) { s.x = maxX; s.vx = -Math.abs(s.vx); }
        if (Math.abs(s.vx) > 0.5) s.facingRight = s.vx > 0;

        for (let j = i + 1; j < states.length; j++) {
          const o = states[j];
          const dx = s.x - o.x;
          const dist = Math.abs(dx);
          if (dist < repulsionRadius && dist > 0.5) {
            const f = ((repulsionRadius - dist) / repulsionRadius) * 45; // 반발력 강화 (18 → 45)
            const dir = dx > 0 ? 1 : -1;
            s.vx += dir * f * dt;
            o.vx -= dir * f * dt;
            const clampV = (v: number, max: number) =>
              Math.abs(v) > max * 1.5 ? (v > 0 ? 1 : -1) * max * 1.5 : v;
            s.vx = clampV(s.vx, s.speed);
            o.vx = clampV(o.vx, o.speed);
          }
        }

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
  }, [activePets.length, repulsionRadius, groundOffset, petSizeScale]);

  if (activePets.length === 0) return null;

  return (
    <div ref={containerRef} className="relative w-full h-full">
      {activePets.map((pet, i) => {
        const dm = assignedDms[i];
        const petPx = petHeightPx(pet.size);
        const fontSize = `${pet.size * petSizeScale}rem`;

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
                  bottom: petPx + groundOffset + 6,
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "rgba(20,20,20,0.92)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 10,
                  padding: "6px 10px",
                  width: "max-content",
                  maxWidth: bubbleMaxWidth,
                  zIndex: 20,
                  backdropFilter: "blur(6px)",
                  WebkitBackdropFilter: "blur(6px)",
                }}
              >
                {dm.nickname && (
                  <p style={{ fontSize: Math.max(bubbleFontSize - 2, 9), color: "#999999", marginBottom: 2, maxWidth: bubbleMaxWidth - 20, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 500 }}>
                    {dm.nickname}
                  </p>
                )}
                <p style={{ fontSize: bubbleFontSize, color: "#e0e0e0", fontWeight: 300, maxWidth: bubbleMaxWidth - 20, wordBreak: "break-word", lineHeight: 1.4 }}>
                  {dm.content.length > 80 ? dm.content.slice(0, 80) + "…" : dm.content}
                </p>
                <div style={{
                  position: "absolute", bottom: -5, left: "50%",
                  transform: "translateX(-50%)",
                  width: 0, height: 0,
                  borderLeft: "5px solid transparent",
                  borderRight: "5px solid transparent",
                  borderTop: "5px solid rgba(20,20,20,0.92)",
                }} />
              </div>
            )}

            {/* 이모지 */}
            <span
              ref={(el) => { emojiRefs.current.set(pet.id, el); }}
              style={{ fontSize, display: "inline-block", lineHeight: 1 }}
            >
              {pet.emoji}
            </span>
          </div>
        );
      })}
    </div>
  );
}
