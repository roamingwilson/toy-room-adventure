import { useEffect, useMemo, useRef, useState } from 'react';
import { STAR_GOAL } from '../content/vocab';
import { progressStore, uiStore, useStore } from '../state/store';
import { cue } from './cue';
import { playSfx } from '../audio/sfx';
import { JAR_POS, celebrate } from './fx';

function Star({ x, y, size, color, rot = 0 }: { x: number; y: number; size: number; color: string; rot?: number }) {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const r = i % 2 ? size * 0.45 : size;
    const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
    return `${x + Math.cos(a) * r},${y + Math.sin(a) * r}`;
  }).join(' ');
  return <polygon points={pts} fill={color} stroke="#E0A800" strokeWidth={1.2} strokeLinejoin="round" transform={`rotate(${rot} ${x} ${y})`} />;
}

export function StarShape({ size = 40, className = '' }: { size?: number; className?: string }) {
  return (
    <svg viewBox="-22 -22 44 44" width={size} height={size} className={className} overflow="visible">
      <Star x={0} y={0} size={20} color="#FFD23F" />
    </svg>
  );
}

/** The shared class reward: fills with stars across all games. */
export function StarJar() {
  const { stars } = useStore(progressStore);
  const [bump, setBump] = useState(0);
  const prev = useRef(stars);
  const shown = Math.min(stars, STAR_GOAL);
  const full = stars >= STAR_GOAL;

  const positions = useMemo(() => {
    const out: { x: number; y: number; rot: number; color: string }[] = [];
    const colors = ['#FFD23F', '#FFE066', '#FFC300', '#FFB703'];
    const perRow = 6;
    for (let i = 0; i < STAR_GOAL; i++) {
      const row = Math.floor(i / perRow);
      const col = i % perRow;
      const off = row % 2 ? 7 : 0;
      out.push({
        x: 30 + col * 14 + off + ((i * 37) % 5) - 2,
        y: 162 - row * (112 / Math.ceil(STAR_GOAL / perRow)) - ((i * 13) % 4),
        rot: (i * 47) % 72,
        color: colors[i % colors.length],
      });
    }
    return out;
  }, []);

  useEffect(() => {
    if (stars > prev.current) setBump((b) => b + 1);
    if (prev.current < STAR_GOAL && stars >= STAR_GOAL) {
      setTimeout(() => {
        celebrate('fireworks');
        playSfx('cheer');
        cue('Wow! The star jar is full! Hooray!');
      }, 400);
    }
    prev.current = stars;
  }, [stars]);

  return (
    <button
      className="absolute z-30 tap"
      style={{ left: JAR_POS.x - 70, top: JAR_POS.y - 95, width: 140, height: 190 }}
      onClick={() => {
        playSfx('twinkle');
        cue(full ? 'Our star jar is full! Great job!' : 'Look at our stars! Great job!');
      }}
      aria-label="Star jar"
    >
      <svg key={bump} viewBox="0 0 140 190" className={bump ? 'pop-in' : ''} style={{ animationDuration: '0.35s', overflow: 'visible' }}>
        {full && <circle cx={70} cy={110} r={80} fill="#FFF3B0" opacity={0.5} className="pulse" style={{ transformOrigin: '70px 110px' }} />}
        {/* lid */}
        <rect x={34} y={14} width={72} height={20} rx={7} fill="#FF595E" stroke="#C9363B" strokeWidth={3} />
        {/* jar */}
        <path d="M40 34 H100 V44 Q122 52 122 80 V160 Q122 182 100 182 H40 Q18 182 18 160 V80 Q18 52 40 44 Z" fill="rgba(200,235,255,.45)" stroke="#fff" strokeWidth={5} />
        <clipPath id="jarClip">
          <path d="M40 34 H100 V44 Q122 52 122 80 V160 Q122 182 100 182 H40 Q18 182 18 160 V80 Q18 52 40 44 Z" />
        </clipPath>
        <g clipPath="url(#jarClip)">
          {positions.slice(0, shown).map((p, i) => (
            <Star key={i} x={p.x} y={p.y + 8} size={9} color={p.color} rot={p.rot} />
          ))}
        </g>
        <path d="M30 70 Q28 110 32 150" stroke="#fff" strokeWidth={6} opacity={0.6} fill="none" strokeLinecap="round" />
      </svg>
    </button>
  );
}

export function FlyingStars() {
  const { flyingStars } = useStore(uiStore);
  return (
    <div className="pointer-events-none absolute inset-0 z-50">
      {flyingStars.map((s) => (
        <div
          key={s.id}
          className="absolute left-0 top-0"
          style={{
            ['--sx' as string]: `${s.x - 30}px`,
            ['--sy' as string]: `${s.y - 30}px`,
            ['--ex' as string]: `${JAR_POS.x - 30}px`,
            ['--ey' as string]: `${JAR_POS.y - 10}px`,
            animation: 'fly-star 1s cubic-bezier(.4,0,.6,1) forwards',
          }}
        >
          <StarShape size={60} />
        </div>
      ))}
    </div>
  );
}
