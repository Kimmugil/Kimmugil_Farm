"use client";

import { useEffect, useRef } from "react";
import type { DmPet, DmMessage } from "@/lib/types";

interface Props {
  pets: DmPet[];
  dms: DmMessage[];
  groundHeight: number;
  repulsionRadius: number;
}

interface PetRuntime {
  x: number;
  y: number;
  vx: number;
  vy: number;
  facingRight: boolean;
  animType: "walk" | "shake" | "jump";
  animTimer: number;  // ms remaining until next state change
  speed: number;
  jumpPhase: number;  // 0→1 progress through jump arc
  baseY: number;      // y snapshot when jump started
  shakePhase: number; // oscillation angle for shake
}

// 1 size unit ≈ this many px (rough emoji footprint)
const BASE_PX = 22;

export default function PetZone({ pets, dms, groundHeight, repulsionRadius }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapRefs = useRef<Map<number, HTMLDivElement | null>>(new Map());
  const emojiRefs = useRef<Map<number, HTMLSpanElement | null>>(new Map());
  const runtimeRef = useRef<PetRuntime[]>([]);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  const activePets = pets.filter((p) => p.active);

  // Latest N dms → one per active pet slot
  const assignedDms = activePets.map((_, i) => {
    const idx = dms.length - activePets.length + i;
    return idx >= 0 ? dms[idx] : undefined;
  });

  // (Re-)init runtimes when active pet set changes
  useEffect(() => {
    const W = containerRef.current?.clientWidth ?? 800;
    const H = groundHeight;
    runtimeRef.current = activePets.map((pet, i) => {
      const spread = activePets.length > 1 ? W / activePets.length : W * 0.5;
      return {
        x: spread * i + spread * 0.3 + Math.random() * spread * 0.4,
        y: H * (0.25 + Math.random() * 0.5),
        vx: (Math.random() - 0.5) * pet.speed * 1.4,
        vy: (Math.random() - 0.5) * pet.speed * 0.4,
        facingRight: Math.random() > 0.5,
        animType: "walk" as const,
        animTimer: Math.random() * 2000 + 500,
        speed: pet.speed,
        jumpPhase: 0,
        baseY: H * 0.5,
        shakePhase: 0,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePets.length, groundHeight]);

  // rAF animation loop — direct DOM manipulation, zero React re-renders
  useEffect(() => {
    if (activePets.length === 0) return;
    lastTimeRef.current = 0;

    function tick(time: number) {
      // Skip first frame to init lastTime cleanly
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = time;
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const rawMs = time - lastTimeRef.current;
      lastTimeRef.current = time;
      const dt = Math.min(rawMs / 1000, 0.05); // cap at 50ms (handles tab sleep)

      const W = containerRef.current?.clientWidth ?? 800;
      const H = groundHeight;
      const states = runtimeRef.current;

      for (let i = 0; i < states.length; i++) {
        const s = states[i];
        const pet = activePets[i];
        const petPx = pet.size * BASE_PX;

        // ── Anim state timer ──────────────────────────────
        s.animTimer -= rawMs;
        if (s.animTimer <= 0) {
          const r = Math.random();
          if (r < 0.07) {
            s.animType = "shake";
            s.shakePhase = 0;
            s.animTimer = 350 + Math.random() * 500;
          } else if (r < 0.13) {
            s.animType = "jump";
            s.jumpPhase = 0;
            s.baseY = s.y;
            s.animTimer = 700;
          } else {
            s.animType = "walk";
            s.animTimer = 1200 + Math.random() * 2800;
            // Occasionally change direction
            if (Math.random() < 0.55) {
              const angle = Math.random() * Math.PI * 2;
              s.vx = Math.cos(angle) * s.speed * (0.6 + Math.random() * 0.8);
              s.vy = Math.sin(angle) * s.speed * 0.4;
            }
          }
        }

        // ── Movement ──────────────────────────────────────
        if (s.animType === "jump") {
          s.jumpPhase += dt * (1000 / 700);
          if (s.jumpPhase >= 1) {
            s.jumpPhase = 1;
            s.animType = "walk";
            s.animTimer = 600 + Math.random() * 1000;
            s.y = s.baseY;
          } else {
            s.y = s.baseY - Math.sin(s.jumpPhase * Math.PI) * petPx * 1.8;
          }
          s.x += s.vx * dt * 0.35;
        } else {
          s.x += s.vx * dt;
          s.y += s.vy * dt;
        }

        // ── Boundary bounce ───────────────────────────────
        const maxX = W - petPx * 2;
        const maxY = H - petPx;
        if (s.x < 0)     { s.x = 0;    s.vx = Math.abs(s.vx); }
        if (s.x > maxX)  { s.x = maxX; s.vx = -Math.abs(s.vx); }
        if (s.y < 0)     { s.y = 0;    s.vy = Math.abs(s.vy); }
        if (s.y > maxY)  {
          s.y = maxY;
          s.vy = -Math.abs(s.vy) * 0.6;
          if (s.animType === "jump") { s.animType = "walk"; s.animTimer = 800; }
        }

        // ── Facing direction ──────────────────────────────
        if (Math.abs(s.vx) > 1) s.facingRight = s.vx > 0;

        // ── Soft repulsion between pets ───────────────────
        for (let j = i + 1; j < states.length; j++) {
          const o = states[j];
          const dx = s.x - o.x;
          const dy = s.y - o.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < repulsionRadius && dist > 0.5) {
            const f = ((repulsionRadius - dist) / repulsionRadius) * 22;
            const nx = dx / dist;
            const ny = dy / dist;
            s.vx += nx * f * dt;
            s.vy += ny * f * dt;
            o.vx -= nx * f * dt;
            o.vy -= ny * f * dt;
            const clamp = (vx: number, vy: number, max: number) => {
              const spd = Math.sqrt(vx * vx + vy * vy);
              if (spd > max * 1.5) return [vx * max * 1.5 / spd, vy * max * 1.5 / spd] as const;
              return [vx, vy] as const;
            };
            [s.vx, s.vy] = clamp(s.vx, s.vy, s.speed);
            [o.vx, o.vy] = clamp(o.vx, o.vy, o.speed);
          }
        }

        // ── DOM update (bypass React) ─────────────────────
        const wrap = wrapRefs.current.get(pet.id);
        const emoji = emojiRefs.current.get(pet.id);

        if (wrap) {
          wrap.style.transform = `translate(${s.x}px,${s.y}px)`;
        }
        if (emoji) {
          const flipX = s.facingRight ? 1 : -1;
          if (s.animType === "shake") {
            s.shakePhase += dt * 30;
            const shakeX = Math.sin(s.shakePhase) * 2.5;
            emoji.style.transform = `scaleX(${flipX}) translateX(${shakeX}px)`;
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
  }, [activePets.length, groundHeight, repulsionRadius]);

  if (activePets.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      style={{ height: groundHeight }}
    >
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
            {/* Speech bubble */}
            {dm && (
              <div
                className="absolute"
                style={{
                  bottom: petPx + 6,
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "rgba(16,16,16,0.9)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 10,
                  padding: "5px 9px",
                  width: "max-content",
                  maxWidth: 150,
                  zIndex: 20,
                  backdropFilter: "blur(4px)",
                  WebkitBackdropFilter: "blur(4px)",
                }}
              >
                <p
                  className="text-[9px] text-[#666666] mb-0.5 max-w-[132px] truncate"
                >
                  {dm.nickname}
                </p>
                <p
                  className="text-[10px] text-[#cccccc] break-words leading-snug"
                  style={{ fontWeight: 300, maxWidth: 132 }}
                >
                  {dm.content.length > 60 ? dm.content.slice(0, 60) + "…" : dm.content}
                </p>
                {/* Bubble tail */}
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
                    borderTop: "5px solid rgba(16,16,16,0.9)",
                  }}
                />
              </div>
            )}

            {/* Emoji character */}
            <span
              ref={(el) => { emojiRefs.current.set(pet.id, el); }}
              style={{
                fontSize: `${pet.size * 1.2}rem`,
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
