import { useEffect, useRef } from 'react';

/**
 * Lets the active game hook into the teacher bar's Next ▶ button.
 * The latest callbacks are always used (no stale closures).
 */
type Handlers = { onNext?: () => void };

let current: { current: Handlers } | null = null;
const listeners = new Set<() => void>();

const empty = { current: {} as Handlers };
/** Stable per game (a ref) — read `.current` at click time for the latest handlers. */
export function getTeacherHandlers(): { current: Handlers } {
  return current ?? empty;
}
export function onTeacherHandlersChange(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useTeacherControls(h: Handlers) {
  const ref = useRef(h);
  ref.current = h;
  useEffect(() => {
    current = ref;
    listeners.forEach((l) => l());
    return () => {
      if (current === ref) current = null;
      listeners.forEach((l) => l());
    };
  }, []);
}
