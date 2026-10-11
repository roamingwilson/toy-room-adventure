import { useEffect, useRef } from 'react';
import { GAME_H, STAGE_H, STAGE_W, onCelebrate, type CelebrationKind } from './fx';

interface P {
  x: number; y: number; vx: number; vy: number; life: number; max: number;
  color: string; size: number; rot: number; vr: number; shape: 'rect' | 'circle' | 'star'; gravity: number; drag: number;
  burst?: boolean;
}

const COLORS = ['#FF595E', '#FFCA3A', '#8AC926', '#1982C4', '#8E5CF7', '#FF5DA2', '#2EC4B6', '#FF924C'];
const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];

function starPath(ctx: CanvasRenderingContext2D, r: number) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const rr = i % 2 ? r * 0.45 : r;
    const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
    ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  ctx.closePath();
}

/** One shared canvas layer for confetti, sparkles and fireworks (60fps, auto-sleeps when idle). */
export function Celebration() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext('2d')!;
    const parts: P[] = [];
    let raf = 0;
    let running = false;
    const pendingRockets: number[] = [];

    const explode = (x: number, y: number) => {
      const color = pick(COLORS);
      const color2 = pick(COLORS);
      const n = 70;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        const sp = rnd(4, 9);
        parts.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0, max: rnd(60, 90), color: i % 2 ? color : color2, size: rnd(3, 6), rot: 0, vr: 0, shape: 'circle', gravity: 0.08, drag: 0.97 });
      }
    };

    const add = (kind: CelebrationKind, x = STAGE_W / 2, y = GAME_H / 2) => {
      if (kind === 'confetti') {
        for (let i = 0; i < 160; i++) {
          const fromLeft = i % 2 === 0;
          parts.push({
            x: fromLeft ? -10 : STAGE_W + 10, y: rnd(GAME_H * 0.3, GAME_H * 0.8),
            vx: (fromLeft ? 1 : -1) * rnd(8, 20), vy: rnd(-22, -8),
            life: 0, max: rnd(140, 220), color: pick(COLORS), size: rnd(10, 18), rot: rnd(0, 6), vr: rnd(-0.2, 0.2),
            shape: Math.random() < 0.2 ? 'star' : Math.random() < 0.5 ? 'circle' : 'rect', gravity: 0.35, drag: 0.985,
          });
        }
      } else if (kind === 'sparkle') {
        for (let i = 0; i < 36; i++) {
          const a = rnd(0, Math.PI * 2);
          const sp = rnd(3, 10);
          parts.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 3, life: 0, max: rnd(40, 70), color: pick(['#FFCA3A', '#FFF3B0', '#FF5DA2', '#2EC4B6']), size: rnd(8, 16), rot: 0, vr: rnd(-0.2, 0.2), shape: 'star', gravity: 0.15, drag: 0.95 });
        }
      } else {
        for (let i = 0; i < 9; i++) pendingRockets.push(performance.now() + i * 450);
      }
      if (!running) {
        running = true;
        raf = requestAnimationFrame(loop);
      }
    };

    const loop = () => {
      const t = performance.now();
      while (pendingRockets.length && pendingRockets[0] <= t) {
        pendingRockets.shift();
        explode(rnd(250, STAGE_W - 250), rnd(120, 420));
      }
      ctx.clearRect(0, 0, STAGE_W, STAGE_H);
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.life++;
        p.vx *= p.drag;
        p.vy = p.vy * p.drag + p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        if (p.life > p.max || p.y > STAGE_H + 40) {
          parts.splice(i, 1);
          continue;
        }
        const fade = Math.min(1, (p.max - p.life) / 30);
        ctx.globalAlpha = fade;
        ctx.fillStyle = p.color;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        if (p.shape === 'rect') ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        else if (p.shape === 'star') {
          starPath(ctx, p.size);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
      ctx.globalAlpha = 1;
      if (parts.length || pendingRockets.length) raf = requestAnimationFrame(loop);
      else running = false;
    };

    const off = onCelebrate(add);
    return () => {
      off();
      cancelAnimationFrame(raf);
    };
  }, []);

  return <canvas ref={ref} width={STAGE_W} height={STAGE_H} className="pointer-events-none absolute inset-0 z-40" />;
}
