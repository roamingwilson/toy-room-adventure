import { settingsStore, uiStore } from '../state/store';

/**
 * Teacher cues — there is no recorded or synthesized voice. Every line the game
 * wants said out loud is shown in the teacher bar for the teacher to read to
 * the class, and the game waits a natural reading time before moving on.
 */

let cueId = 0;

/** Roughly how long it takes to read `text` aloud to a class of little ones. */
export function readingTime(text: string, rate = 1) {
  const words = text.split(/\s+/).filter(Boolean).length;
  const ms = 700 + words * 420;
  return Math.min(7000, Math.max(1000, ms)) * settingsStore.get().readPace / rate;
}

/** Show a line for the teacher to say. Resolves after the reading time. */
export function cue(text: string, opts: { rate?: number } = {}): Promise<void> {
  const id = ++cueId;
  uiStore.set({ cue: { id, text } });
  return new Promise((resolve) => setTimeout(resolve, readingTime(text, opts.rate)));
}

export function clearCue() {
  uiStore.set({ cue: null });
}
