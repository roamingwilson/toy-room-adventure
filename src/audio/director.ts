import { useCallback, useEffect, useRef } from 'react';
import { cue } from '../components/cue';
import { playSfx, type SfxName } from './sfx';
import { settingsStore, uiStore } from '../state/store';

export class Aborted extends Error {}

export interface Director {
  /** Show a line for the teacher to read aloud, and wait while it is read. */
  say(text: string, opts?: { rate?: number }): Promise<void>;
  wait(ms: number): Promise<void>;
  sfx(name: SfxName): void;
  /** Show the pulsing "Say it!" prompt for the teacher-set pause (tap to skip). */
  sayIt(extraMs?: number): Promise<void>;
  signal: AbortSignal;
}

let sayItResolve: (() => void) | null = null;
let sayItCounter = 0;

/** Called when the teacher taps the Say-it bubble — reveal right away. */
export function skipSayIt() {
  sayItResolve?.();
}

function makeDirector(signal: AbortSignal): Director {
  const check = () => {
    if (signal.aborted) throw new Aborted();
  };
  const wait = (ms: number) =>
    new Promise<void>((resolve, reject) => {
      if (signal.aborted) return reject(new Aborted());
      const t = setTimeout(resolve, ms);
      signal.addEventListener('abort', () => {
        clearTimeout(t);
        reject(new Aborted());
      }, { once: true });
    });
  return {
    signal,
    async say(text, opts) {
      check();
      await cue(text, opts);
      check();
    },
    wait,
    sfx(name) {
      check();
      playSfx(name);
    },
    async sayIt(extraMs = 0) {
      check();
      const ms = settingsStore.get().pauseSec * 1000 + extraMs;
      const id = ++sayItCounter;
      uiStore.set({ sayIt: { id, ms } });
      try {
        await new Promise<void>((resolve, reject) => {
          const t = setTimeout(resolve, ms);
          sayItResolve = () => {
            clearTimeout(t);
            resolve();
          };
          signal.addEventListener('abort', () => {
            clearTimeout(t);
            reject(new Aborted());
          }, { once: true });
        });
      } finally {
        sayItResolve = null;
        if (uiStore.get().sayIt?.id === id) uiStore.set({ sayIt: null });
      }
    },
  };
}

/**
 * Runs one "script" (an async sequence of teacher lines / waits / sounds) at a time.
 * Starting a new script, or unmounting, cancels the current one cleanly.
 */
export function useDirector() {
  const ctrl = useRef<AbortController | null>(null);

  const cancel = useCallback(() => {
    ctrl.current?.abort();
    ctrl.current = null;
  }, []);

  useEffect(() => cancel, [cancel]);

  const run = useCallback(
    (fn: (d: Director) => Promise<void>) => {
      cancel();
      const c = new AbortController();
      ctrl.current = c;
      const p = fn(makeDirector(c.signal)).catch((e) => {
        if (!(e instanceof Aborted)) console.error(e);
      });
      return p.finally(() => {
        if (ctrl.current === c) ctrl.current = null;
      });
    },
    [cancel],
  );

  const busy = useCallback(() => ctrl.current !== null, []);

  return { run, cancel, busy };
}
