import { settingsStore } from '../state/store';

/** All sound effects are synthesized here with the Web Audio API — no audio files. */

let ctx: AudioContext | null = null;
let master: GainNode;
let sfxBus: GainNode;
let musicBus: GainNode;
let noiseBuf: AudioBuffer;

export function audio() {
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new AC();
    master = ctx.createGain();
    const comp = ctx.createDynamicsCompressor();
    master.connect(comp);
    comp.connect(ctx.destination);
    sfxBus = ctx.createGain();
    musicBus = ctx.createGain();
    sfxBus.connect(master);
    musicBus.connect(master);
    musicBus.gain.value = 0.55;
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    applySettings();
    settingsStore.subscribe(applySettings);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return { ctx, sfxBus, musicBus };
}

function applySettings() {
  if (!ctx) return;
  const s = settingsStore.get();
  master.gain.setTargetAtTime(s.soundOn ? s.volume : 0, ctx.currentTime, 0.03);
  musicBus.gain.setTargetAtTime(s.musicOn ? 0.55 : 0, ctx.currentTime, 0.03);
}

export function noiseBuffer() {
  audio();
  return noiseBuf;
}

/** Call from the first user gesture so browsers allow audio. */
export function unlockAudio() {
  audio();
}

// ---------- building blocks ----------
export function tone(
  freq: number,
  start: number,
  dur: number,
  opts: { type?: OscillatorType; gain?: number; to?: number; attack?: number; dest?: AudioNode; curve?: 'exp' | 'lin' } = {},
) {
  const { ctx, sfxBus } = audio();
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = opts.type ?? 'sine';
  o.frequency.setValueAtTime(freq, start);
  if (opts.to) {
    if (opts.curve === 'lin') o.frequency.linearRampToValueAtTime(opts.to, start + dur);
    else o.frequency.exponentialRampToValueAtTime(opts.to, start + dur);
  }
  const peak = opts.gain ?? 0.3;
  const a = opts.attack ?? 0.008;
  g.gain.setValueAtTime(0.0001, start);
  g.gain.linearRampToValueAtTime(peak, start + a);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  o.connect(g);
  g.connect(opts.dest ?? sfxBus);
  o.start(start);
  o.stop(start + dur + 0.05);
  return o;
}

export function noise(
  start: number,
  dur: number,
  opts: { filter?: BiquadFilterType; freq?: number; to?: number; q?: number; gain?: number; attack?: number; dest?: AudioNode } = {},
) {
  const { ctx, sfxBus } = audio();
  const src = ctx.createBufferSource();
  src.buffer = noiseBuf;
  const f = ctx.createBiquadFilter();
  f.type = opts.filter ?? 'bandpass';
  f.frequency.setValueAtTime(opts.freq ?? 1000, start);
  if (opts.to) f.frequency.exponentialRampToValueAtTime(opts.to, start + dur);
  f.Q.value = opts.q ?? 1;
  const g = ctx.createGain();
  const peak = opts.gain ?? 0.3;
  g.gain.setValueAtTime(0.0001, start);
  g.gain.linearRampToValueAtTime(peak, start + (opts.attack ?? 0.005));
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  src.connect(f);
  f.connect(g);
  g.connect(opts.dest ?? sfxBus);
  src.start(start, Math.random());
  src.stop(start + dur + 0.05);
}

const now = () => audio().ctx.currentTime + 0.01;

// ---------- the sound effects ----------
export const sfx = {
  pop() {
    const t = now();
    tone(300, t, 0.12, { to: 1000, gain: 0.35 });
    noise(t, 0.04, { freq: 3000, gain: 0.15 });
  },

  boing() {
    const t = now();
    const o = tone(200, t, 0.7, { type: 'triangle', gain: 0.35 });
    const n = 64;
    const curve = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const x = (i / n) * 0.7;
      curve[i] = 220 + 160 * Math.sin(2 * Math.PI * 9 * x) * Math.exp(-3.5 * x) + 120 * x;
    }
    o.frequency.cancelScheduledValues(t);
    o.frequency.setValueCurveAtTime(curve, t, 0.7);
  },

  drumroll(seconds = 1.6) {
    const t = now();
    const hits = Math.floor(seconds * 22);
    for (let i = 0; i < hits; i++) {
      const p = i / hits;
      noise(t + i / 22, 0.08, { freq: 1800, q: 0.7, gain: 0.08 + p * 0.22 });
      tone(180, t + i / 22, 0.06, { type: 'triangle', gain: 0.05 + p * 0.1, to: 120 });
    }
  },

  tada() {
    const t = now();
    // cymbal + bright chord
    noise(t, 1.2, { filter: 'highpass', freq: 5000, gain: 0.18 });
    [523, 659, 784, 1047].forEach((f, i) => {
      tone(f, t + i * 0.07, 0.9, { type: 'square', gain: 0.07 });
      tone(f * 1.003, t + i * 0.07, 0.9, { type: 'triangle', gain: 0.12 });
    });
  },

  giggle() {
    const t = now();
    const base = 900 + Math.random() * 150;
    for (let i = 0; i < 7; i++) {
      const s = t + i * 0.11;
      const f = base * Math.pow(0.95, i);
      tone(f, s, 0.09, { type: 'square', gain: 0.07, to: f * 1.25 });
      tone(f * 2, s, 0.07, { type: 'sine', gain: 0.06, to: f * 2.4 });
    }
  },

  /** Cheeky villain laugh: "hee-hee-hee… ha-ha!" */
  cackle() {
    const t = now();
    const notes = [520, 560, 600, 640, 380, 340];
    notes.forEach((f, i) => {
      const s = t + i * 0.13 + (i >= 4 ? 0.12 : 0);
      tone(f, s, 0.11, { type: 'sawtooth', gain: 0.06, to: f * 0.8 });
      tone(f * 2, s, 0.09, { type: 'square', gain: 0.03, to: f * 1.5 });
      noise(s, 0.05, { freq: 2200, q: 2, gain: 0.05 });
    });
  },

  burp() {
    const { ctx, sfxBus } = audio();
    const t = now();
    const o = ctx.createOscillator();
    o.type = 'sawtooth';
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 23;
    lfoGain.gain.value = 18;
    lfo.connect(lfoGain);
    lfoGain.connect(o.frequency);
    o.frequency.setValueAtTime(95, t);
    o.frequency.linearRampToValueAtTime(70, t + 0.7);
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.setValueAtTime(600, t);
    f.frequency.linearRampToValueAtTime(350, t + 0.7);
    f.Q.value = 6;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.5, t + 0.05);
    g.gain.setValueAtTime(0.5, t + 0.5);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.75);
    o.connect(f);
    f.connect(g);
    g.connect(sfxBus);
    o.start(t);
    lfo.start(t);
    o.stop(t + 0.8);
    lfo.stop(t + 0.8);
  },

  crash() {
    const t = now();
    noise(t, 1.0, { filter: 'lowpass', freq: 3000, to: 200, gain: 0.45 });
    for (let i = 0; i < 12; i++) {
      const s = t + Math.random() * 0.8;
      tone(250 + Math.random() * 400, s, 0.12, { type: 'triangle', gain: 0.25, to: 120 });
      noise(s, 0.05, { freq: 2000, gain: 0.12 });
    }
  },

  cheer() {
    const t = now();
    // fanfare
    [523, 659, 784, 1047, 784, 1047].forEach((f, i) => {
      const len = i === 5 ? 0.7 : 0.14;
      tone(f, t + i * 0.12, len, { type: 'square', gain: 0.06 });
      tone(f, t + i * 0.12, len, { type: 'triangle', gain: 0.14 });
    });
    // applause: lots of tiny claps
    for (let i = 0; i < 70; i++) {
      const s = t + 0.1 + Math.random() * 1.6;
      noise(s, 0.035, { freq: 1200 + Math.random() * 1500, q: 1.5, gain: 0.12 * (1 - (s - t) / 2.2) + 0.03 });
    }
    // party whistle
    tone(1800, t + 0.3, 0.5, { gain: 0.05, to: 2600 });
  },

  twinkle() {
    const t = now();
    const notes = [1568, 2093, 2349, 2637, 3136];
    for (let i = 0; i < 5; i++) {
      const f = notes[Math.floor(Math.random() * notes.length)];
      tone(f, t + i * 0.06, 0.35, { gain: 0.08 });
    }
  },

  star() {
    const t = now();
    tone(1319, t, 0.15, { gain: 0.12 });
    tone(1976, t + 0.07, 0.3, { gain: 0.1 });
  },

  rattle() {
    const t = now();
    for (let i = 0; i < 14; i++) {
      const s = t + i * 0.06 + Math.random() * 0.03;
      noise(s, 0.05, { freq: 2500 + Math.random() * 2000, q: 3, gain: 0.25 });
      tone(400 + Math.random() * 300, s, 0.04, { type: 'triangle', gain: 0.08 });
    }
  },

  chomp() {
    const t = now();
    for (let i = 0; i < 3; i++) {
      const s = t + i * 0.18;
      tone(140, s, 0.12, { type: 'square', gain: 0.18, to: 60 });
      noise(s, 0.1, { freq: 900, q: 0.8, gain: 0.3 });
    }
  },

  whoosh() {
    const t = now();
    noise(t, 0.7, { freq: 400, to: 3000, q: 2, gain: 0.35, attack: 0.25 });
  },

  slideUp() {
    const t = now();
    tone(300, t, 0.45, { to: 1400, gain: 0.25, curve: 'lin' });
  },

  slideDown() {
    const t = now();
    tone(1200, t, 0.5, { to: 200, gain: 0.22, curve: 'lin' });
  },

  drum() {
    const t = now();
    tone(150, t, 0.25, { to: 45, gain: 0.6 });
    noise(t, 0.08, { freq: 1500, gain: 0.15 });
  },

  block(n = 1) {
    const t = now();
    // wooden "tok" that climbs in pitch as the tower grows
    const f = 300 * Math.pow(2, (n - 1) / 12);
    tone(f, t, 0.15, { type: 'triangle', gain: 0.4, to: f * 0.8 });
    noise(t, 0.03, { freq: 2500, gain: 0.2 });
  },

  wobble() {
    const t = now();
    for (let i = 0; i < 6; i++) tone(i % 2 ? 330 : 280, t + i * 0.15, 0.14, { type: 'triangle', gain: 0.15 });
  },

  sneeze() {
    const t = now();
    noise(t, 0.4, { freq: 3000, q: 0.5, gain: 0.4, to: 1500 });
  },

  hint() {
    const t = now();
    tone(880, t, 0.25, { gain: 0.08 });
    tone(1109, t + 0.12, 0.3, { gain: 0.08 });
  },

  lightsOff() {
    const t = now();
    tone(600, t, 0.6, { to: 150, gain: 0.15, type: 'triangle' });
  },
};

export type SfxName = keyof typeof sfx;

export function playSfx(name: SfxName) {
  try {
    (sfx[name] as () => void)();
  } catch {
    /* audio not ready — ignore */
  }
}
