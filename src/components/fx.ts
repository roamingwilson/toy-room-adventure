import { playSfx } from '../audio/sfx';
import { progressStore, uiStore } from '../state/store';

/** Virtual stage size — everything is laid out in these units and scaled to fit the screen. */
export const STAGE_W = 1600;
export const STAGE_H = 900;
export const BAR_H = 88;
export const GAME_H = STAGE_H - BAR_H;
export const JAR_POS = { x: 1500, y: 110 };

let stageEl: HTMLElement | null = null;
let stageScale = 1;
export function registerStage(el: HTMLElement | null, scale: number) {
  stageEl = el;
  stageScale = scale;
}

/** Convert a pointer position to stage coordinates. */
export function stagePoint(clientX: number, clientY: number) {
  if (!stageEl) return { x: STAGE_W / 2, y: STAGE_H / 2 };
  const r = stageEl.getBoundingClientRect();
  return { x: (clientX - r.left) / stageScale, y: (clientY - r.top) / stageScale };
}

/** Stage coordinates of the centre of an element. */
export function elementCenter(el: Element | null) {
  if (!el) return { x: STAGE_W / 2, y: STAGE_H / 2 };
  const r = el.getBoundingClientRect();
  return stagePoint(r.left + r.width / 2, r.top + r.height / 2);
}

// ---------- celebrations (confetti / fireworks drawn on one canvas) ----------
export type CelebrationKind = 'confetti' | 'fireworks' | 'sparkle';
type Listener = (kind: CelebrationKind, x?: number, y?: number) => void;
const celebrationListeners = new Set<Listener>();
export function onCelebrate(l: Listener) {
  celebrationListeners.add(l);
  return () => {
    celebrationListeners.delete(l);
  };
}
export function celebrate(kind: CelebrationKind = 'confetti', x?: number, y?: number) {
  celebrationListeners.forEach((l) => l(kind, x, y));
}

// ---------- Star Jar ----------
let starId = 0;
/** Send a star flying into the class Star Jar. */
export function addStar(from?: { x: number; y: number }, count = 1) {
  for (let i = 0; i < count; i++) {
    const id = ++starId;
    const p = from ?? { x: STAGE_W / 2, y: GAME_H / 2 };
    setTimeout(() => {
      uiStore.set((s) => ({ flyingStars: [...s.flyingStars, { id, x: p.x + (i % 3) * 30 - 30, y: p.y }] }));
      setTimeout(() => {
        uiStore.set((s) => ({ flyingStars: s.flyingStars.filter((f) => f.id !== id) }));
        progressStore.set((s) => ({ stars: s.stars + 1 }));
        playSfx('star');
      }, 1000);
    }, i * 140);
  }
}
