import { useCallback, useState } from 'react';
import { cue } from './cue';
import { playSfx } from '../audio/sfx';

export function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Shuffle, but avoid the same item twice in a row (nicer for tiny learners). */
export function shuffleNoRepeat<T>(arr: readonly T[], key: (t: T) => string = String): T[] {
  for (let tries = 0; tries < 50; tries++) {
    const a = shuffle(arr);
    if (a.every((x, i) => i === 0 || key(x) !== key(a[i - 1]))) return a;
  }
  return shuffle(arr);
}

export const pickOne = <T,>(a: readonly T[]) => a[Math.floor(Math.random() * a.length)];

/** Re-triggerable CSS animation: `const [k, fire] = useRetrigger(); <div key={k} className={k ? 'wobble' : ''}>` */
export function useRetrigger(): [number, () => void] {
  const [k, setK] = useState(0);
  return [k, useCallback(() => setK((x) => x + 1), [])];
}

/** A word on screen — tapping it says it again. */
export function Word({ text, say, className = '', style }: { text: string; say?: string; className?: string; style?: React.CSSProperties }) {
  const [k, fire] = useRetrigger();
  return (
    <button
      key={k}
      className={`tap font-black leading-none ${k ? 'jump' : ''} ${className}`}
      style={style}
      onClick={(e) => {
        e.stopPropagation();
        fire();
        cue(say ?? text);
      }}
    >
      {text}
    </button>
  );
}

export function BigButton({
  children, onClick, color = '#8AC926', className = '', style, disabled,
}: { children: React.ReactNode; onClick: () => void; color?: string; className?: string; style?: React.CSSProperties; disabled?: boolean }) {
  return (
    <button
      disabled={disabled}
      onClick={() => {
        playSfx('pop');
        onClick();
      }}
      className={`tap min-h-[120px] min-w-[120px] rounded-[44px] px-10 text-[52px] font-black text-white shadow-[0_10px_0_rgba(0,0,0,.18)] disabled:opacity-40 ${className}`}
      style={{ background: color, ...style }}
    >
      {children}
    </button>
  );
}

/** Small round icon button for in-game teacher choices (still ≥120px). */
export function ModeButton({ active, onClick, children, color = '#fff' }: { active?: boolean; onClick: () => void; children: React.ReactNode; color?: string }) {
  return (
    <button
      onClick={onClick}
      className={`tap h-[120px] w-[120px] rounded-[32px] p-3 shadow-[0_6px_0_rgba(0,0,0,.15)] transition ${active ? 'ring-[6px] ring-[#FFCA3A] scale-105' : 'opacity-80'}`}
      style={{ background: color }}
    >
      {children}
    </button>
  );
}

/**
 * Animated pointing hand + ripple that shows little ones exactly where to tap.
 * Place it inside the (positioned) thing to tap; it is centred on it by default.
 */
export function TapHint({ size = 120, delay = 0, x = '50%', y = '50%' }: { size?: number; delay?: number; x?: string; y?: string }) {
  return (
    <span aria-hidden className="pointer-events-none absolute z-30" style={{ left: x, top: y }} data-testid="tap-hint">
      <span
        className="absolute rounded-full border-[8px] border-white"
        style={{
          width: size * 1.6, height: size * 1.6, left: -size * 0.8, top: -size * 0.8,
          boxShadow: '0 0 0 4px rgba(255,202,58,.7), 0 0 18px rgba(0,0,0,.25)',
          animation: `tap-ring 1.6s ease-out ${delay}s infinite`,
        }}
      />
      <span
        className="absolute leading-none"
        style={{
          fontSize: size, left: -size * 0.38, top: -size * 0.06, transformOrigin: '40% 10%',
          filter: 'drop-shadow(0 0 3px #fff) drop-shadow(0 6px 4px rgba(0,0,0,.35))',
          animation: `tap-hand 1.6s ease-in-out ${delay}s infinite`,
        }}
      >
        👆
      </span>
    </span>
  );
}
