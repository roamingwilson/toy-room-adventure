import { useSyncExternalStore } from 'react';

/** Tiny observable store, usable both inside React (via hook) and from plain modules. */
export function createStore<T>(initial: T, persistKey?: string) {
  let state = initial;
  if (persistKey) {
    try {
      const raw = localStorage.getItem(persistKey);
      if (raw) state = { ...initial, ...JSON.parse(raw) };
    } catch {
      /* storage unavailable — fine */
    }
  }
  const listeners = new Set<() => void>();
  return {
    get: () => state,
    set(patch: Partial<T> | ((s: T) => Partial<T>)) {
      const p = typeof patch === 'function' ? patch(state) : patch;
      state = { ...state, ...p };
      if (persistKey) {
        try {
          localStorage.setItem(persistKey, JSON.stringify(state));
        } catch {
          /* ignore */
        }
      }
      listeners.forEach((l) => l());
    },
    subscribe(l: () => void) {
      listeners.add(l);
      return () => listeners.delete(l);
    },
  };
}

export function useStore<T>(store: ReturnType<typeof createStore<T>>): T {
  return useSyncExternalStore(store.subscribe, store.get, store.get);
}

// ---------- Settings ----------
export interface Settings {
  /** How long each teacher line stays before the game moves on (1 = normal, 1.5 = slower). */
  readPace: number;
  soundOn: boolean;
  musicOn: boolean;
  volume: number;
  pauseSec: number;
}

export const settingsStore = createStore<Settings>(
  { readPace: 1, soundOn: true, musicOn: true, volume: 0.9, pauseSec: 3 },
  'tra-settings',
);

// ---------- Class progress ----------
export type GameId =
  | 'parade' | 'mystery' | 'freeze' | 'monster' | 'where'
  | 'copy' | 'count' | 'yesno' | 'escape' | 'kites';

export interface Progress {
  stars: number;
  completed: GameId[];
  sessionStart: number | null;
}

export const progressStore = createStore<Progress>(
  { stars: 0, completed: [], sessionStart: null },
  'tra-progress',
);

export function markComplete(id: GameId) {
  progressStore.set((s) => (s.completed.includes(id) ? {} : { completed: [...s.completed, id] }));
}

export function resetClass() {
  progressStore.set({ stars: 0, completed: [], sessionStart: Date.now() });
}

// ---------- Transient UI (Say it! overlay, flying stars, celebrations) ----------
export interface UiState {
  sayIt: { id: number; ms: number } | null;
  /** The line the teacher reads aloud, shown in the teacher bar. */
  cue: { id: number; text: string } | null;
  flyingStars: { id: number; x: number; y: number }[];
  overlay: 'complete' | null;
}
export const uiStore = createStore<UiState>({ sayIt: null, cue: null, flyingStars: [], overlay: null });
