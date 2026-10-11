import { audio, noiseBuffer } from './sfx';

/**
 * Background music, played live with the Web Audio API (no audio files, works offline).
 * The tunes are traditional, public-domain children's songs, arranged here:
 *   dance  — hoedown medley: "Skip to My Lou" + "Old MacDonald Had a Farm"
 *   march  — brass-band "Yankee Doodle"
 *   bye    — music-box "Twinkle Twinkle Little Star"
 */

// ---------------------------------------------------------------- notation
const NOTE: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const mtof = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

function midi(name: string) {
  const m = /^([A-G])([#b]?)(-?\d)$/.exec(name);
  if (!m) throw new Error(`bad note ${name}`);
  return 12 * (Number(m[3]) + 1) + NOTE[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
}

type Note = { t: number; d: number; m: number };
type Chord = { t: number; d: number; root: number; tones: number[] };

/** "C5:1 E5:.5 r:1" → notes (durations in beats; default 1). */
function melody(src: string, start = 0): Note[] {
  const out: Note[] = [];
  let t = start;
  for (const tok of src.trim().split(/\s+/)) {
    const [n, d = '1'] = tok.split(':');
    const dur = Number(d);
    if (n !== 'r') out.push({ t, d: dur, m: midi(n) });
    t += dur;
  }
  return out;
}

/** "C:2 G7:2 Am:4" → chords (root around C3). */
function chords(src: string, start = 0): Chord[] {
  const out: Chord[] = [];
  let t = start;
  for (const tok of src.trim().split(/\s+/)) {
    const [sym, d = '4'] = tok.split(':');
    const m = /^([A-G])([#b]?)(m|7)?$/.exec(sym)!;
    const root = 48 + NOTE[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
    const third = m[3] === 'm' ? 3 : 4;
    const tones = [root, root + third, root + 7, ...(m[3] === '7' ? [root + 10] : [])];
    out.push({ t, d: Number(d), root, tones });
    t += Number(d);
  }
  return out;
}

// ---------------------------------------------------------------- instruments
type Out = AudioNode;

function env(g: GainNode, t: number, peak: number, attack: number, hold: number, release: number) {
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(peak, t + attack);
  g.gain.setValueAtTime(peak, t + attack + hold);
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + hold + release);
}

function voice(type: OscillatorType, f: number, t: number, end: number, out: Out, detune = 0) {
  const { ctx } = audio();
  const o = ctx.createOscillator();
  o.type = type;
  o.frequency.value = f;
  o.detune.value = detune;
  o.connect(out);
  o.start(t);
  o.stop(end);
  return o;
}

const INST = {
  /** Music box / glockenspiel: bright partials that ring and fade. */
  bell(t: number, f: number, _d: number, v: number, out: Out) {
    const { ctx } = audio();
    const partials: [number, number, number][] = [[1, 1, 1.6], [2.0, 0.35, 0.9], [3.01, 0.12, 0.5], [5.4, 0.06, 0.25]];
    for (const [mul, amp, dec] of partials) {
      const g = ctx.createGain();
      env(g, t, v * amp * 0.22, 0.004, 0, dec);
      g.connect(out);
      voice('sine', f * mul, t, t + dec + 0.05, g);
    }
  },

  /** Banjo-ish pluck: bright attack, quick filter close. */
  pluck(t: number, f: number, d: number, v: number, out: Out) {
    const { ctx } = audio();
    const flt = ctx.createBiquadFilter();
    flt.type = 'lowpass';
    flt.Q.value = 3;
    flt.frequency.setValueAtTime(5200, t);
    flt.frequency.exponentialRampToValueAtTime(700, t + 0.22);
    const g = ctx.createGain();
    const len = Math.min(0.6, d + 0.15);
    env(g, t, v * 0.16, 0.003, 0, len);
    flt.connect(g);
    g.connect(out);
    voice('sawtooth', f, t, t + len + 0.05, flt);
    voice('square', f * 2, t, t + len + 0.05, flt, 4);
  },

  /** Brass section: two detuned saws with a "blown" filter swell. */
  brass(t: number, f: number, d: number, v: number, out: Out) {
    const { ctx } = audio();
    const flt = ctx.createBiquadFilter();
    flt.type = 'lowpass';
    flt.Q.value = 1.5;
    flt.frequency.setValueAtTime(500, t);
    flt.frequency.linearRampToValueAtTime(2600, t + 0.05);
    flt.frequency.exponentialRampToValueAtTime(1500, t + 0.25);
    const g = ctx.createGain();
    env(g, t, v * 0.11, 0.025, Math.max(0, d * 0.75 - 0.025), 0.09);
    flt.connect(g);
    g.connect(out);
    const end = t + d + 0.15;
    voice('sawtooth', f, t, end, flt, -7);
    voice('sawtooth', f, t, end, flt, 7);
  },

  /** Round, warm bass. */
  bass(t: number, f: number, d: number, v: number, out: Out) {
    const { ctx } = audio();
    const flt = ctx.createBiquadFilter();
    flt.type = 'lowpass';
    flt.frequency.value = 700;
    const g = ctx.createGain();
    env(g, t, v * 0.42, 0.006, Math.max(0, d * 0.7), 0.12);
    flt.connect(g);
    g.connect(out);
    voice('triangle', f, t, t + d + 0.2, flt);
    voice('sine', f, t, t + d + 0.2, flt);
  },

  /** Soft string pad. */
  pad(t: number, f: number, d: number, v: number, out: Out) {
    const { ctx } = audio();
    const flt = ctx.createBiquadFilter();
    flt.type = 'lowpass';
    flt.frequency.value = 1100;
    const g = ctx.createGain();
    env(g, t, v * 0.045, 0.25, Math.max(0, d - 0.25), 0.5);
    flt.connect(g);
    g.connect(out);
    const end = t + d + 0.6;
    voice('sawtooth', f, t, end, flt, -9);
    voice('sawtooth', f, t, end, flt, 9);
  },

  // ---- drums ----
  kick(t: number, v: number, out: Out) {
    const { ctx } = audio();
    const g = ctx.createGain();
    env(g, t, v * 0.9, 0.002, 0.02, 0.28);
    g.connect(out);
    const o = voice('sine', 140, t, t + 0.35, g);
    o.frequency.setValueAtTime(150, t);
    o.frequency.exponentialRampToValueAtTime(45, t + 0.18);
  },
  noise(t: number, v: number, out: Out, type: BiquadFilterType, freq: number, len: number, q = 0.8) {
    const { ctx } = audio();
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer();
    const flt = ctx.createBiquadFilter();
    flt.type = type;
    flt.frequency.value = freq;
    flt.Q.value = q;
    const g = ctx.createGain();
    env(g, t, v, 0.002, 0, len);
    src.connect(flt);
    flt.connect(g);
    g.connect(out);
    src.start(t, Math.random() * 1.5);
    src.stop(t + len + 0.05);
  },
  snare(t: number, v: number, out: Out) {
    INST.noise(t, v * 0.32, out, 'bandpass', 1900, 0.16);
    const { ctx } = audio();
    const g = ctx.createGain();
    env(g, t, v * 0.18, 0.002, 0, 0.08);
    g.connect(out);
    voice('triangle', 190, t, t + 0.1, g);
  },
  hat(t: number, v: number, out: Out) {
    INST.noise(t, v * 0.09, out, 'highpass', 7500, 0.04);
  },
  shaker(t: number, v: number, out: Out) {
    INST.noise(t, v * 0.05, out, 'bandpass', 6000, 0.06, 1.2);
  },
  clap(t: number, v: number, out: Out) {
    for (let i = 0; i < 3; i++) INST.noise(t + i * 0.011, v * 0.2, out, 'bandpass', 1300, 0.07, 1.4);
  },
  cymbal(t: number, v: number, out: Out) {
    INST.noise(t, v * 0.12, out, 'highpass', 6000, 1.2);
  },
};

// ---------------------------------------------------------------- songs
type Ev = { t: number; fn: (time: number, spb: number, out: Out) => void };
type Song = { bpm: number; beats: number; events: Ev[]; reverb: number };

const note = (inst: 'bell' | 'pluck' | 'brass' | 'bass' | 'pad', n: Note, v: number, shift = 0): Ev => ({
  t: n.t,
  fn: (time, spb, out) => INST[inst](time, mtof(n.m + shift), n.d * spb, v, out),
});
const hit = (t: number, drum: 'kick' | 'snare' | 'hat' | 'shaker' | 'clap' | 'cymbal', v = 1): Ev => ({
  t,
  fn: (time, _spb, out) => INST[drum](time, v, out),
});

// --- "Skip to My Lou" + "Old MacDonald" (C major, hoedown) ---
function danceSong(): Song {
  const skip = melody(`
    E5 E5 C5 C5   E5 E5 G5:2   D5 D5 B4 B4   D5 D5 F5:2
    E5 E5 C5 C5   E5 E5 G5 G5  D5 E5 F5 D5   C5:2 r:2`);
  const mac = melody(`
    C5 C5 C5 G4   A4 A4 G4:2   E5 E5 D5 D5   C5:3 G4
    C5 C5 C5 G4   A4 A4 G4:2   E5 E5 D5 D5   C5:4`, 32);
  const harmony = chords(`
    C:4 C:4 G7:4 G7:4 C:4 C:4 G7:4 C:4
    C:4 F:2 C:2 C:2 G:2 C:4 C:4 F:2 C:2 C:2 G:2 C:4`);
  const ev: Ev[] = [];
  for (const n of [...skip, ...mac]) {
    ev.push(note('pluck', n, 1));
    ev.push(note('bell', n, 0.45, 12));
  }
  // boom-chick: bass on 1 & 3 (root, fifth), chord strums on 2 & 4
  for (const c of harmony) {
    for (let b = 0; b < c.d; b++) {
      const t = c.t + b;
      if (b % 2 === 0) ev.push({ t, fn: (time, spb, out) => INST.bass(time, mtof(c.root - 12 + (b % 4 === 2 ? 7 : 0)), spb * 0.9, 1, out) });
      else for (const m of c.tones) ev.push({ t, fn: (time, spb, out) => INST.pluck(time, mtof(m + 12), spb * 0.4, 0.45, out) });
    }
  }
  for (let b = 0; b < 64; b++) {
    if (b % 2 === 0) ev.push(hit(b, 'kick'));
    else ev.push(hit(b, b >= 32 ? 'clap' : 'snare', 0.9));
    ev.push(hit(b, 'hat', 0.8), hit(b + 0.5, 'hat', 0.5));
    for (const s of [0.25, 0.75]) ev.push(hit(b + s, 'shaker', 0.6));
  }
  ev.push(hit(0, 'cymbal', 0.7), hit(32, 'cymbal', 0.7));
  return { bpm: 128, beats: 64, events: ev, reverb: 0.12 };
}

// --- "Yankee Doodle" (brass band march) ---
function marchSong(): Song {
  const verse = `
    C5 C5 D5 E5   C5 E5 D5 G4   C5 C5 D5 E5   C5:2 B4:2
    C5 C5 D5 E5   F5 E5 D5 C5   B4 G4 A4 B4   C5:2 C5:2`;
  const tune = [...melody(verse), ...melody(verse, 32)];
  const harmony = chords('C:4 C:2 G:2 C:4 C:2 G:2 C:4 F:4 G:4 C:4');
  const ev: Ev[] = [];
  tune.forEach((n, i) => {
    ev.push(note('brass', n, 1));
    if (i >= tune.length / 2 || n.t % 2 === 0) ev.push(note('bell', n, 0.5, 12)); // glockenspiel joins in on the repeat
  });
  for (const pass of [0, 32]) {
    for (const c of harmony) {
      for (let b = 0; b < c.d; b++) {
        const t = pass + c.t + b;
        if (b % 2 === 0) ev.push({ t, fn: (time, spb, out) => INST.brass(time, mtof(c.root - 12 + (b === 2 ? -5 : 0)), spb * 0.8, 1.1, out) }); // oom
        else for (const m of c.tones.slice(1)) ev.push({ t, fn: (time, spb, out) => INST.brass(time, mtof(m), spb * 0.35, 0.45, out) }); // pah
      }
    }
  }
  for (let b = 0; b < 64; b++) {
    if (b % 2 === 0) ev.push(hit(b, 'kick', 0.9));
    ev.push(hit(b, 'snare', b % 2 ? 0.9 : 0.5));
    if (b % 2) ev.push(hit(b + 0.5, 'snare', 0.4));
    if (b % 8 === 7) for (let r = 0.25; r < 1; r += 0.25) ev.push(hit(b + r, 'snare', 0.35 + r * 0.4)); // drum roll
  }
  ev.push(hit(0, 'cymbal'), hit(32, 'cymbal'));
  return { bpm: 112, beats: 64, events: ev, reverb: 0.15 };
}

// --- "Twinkle Twinkle Little Star" (music box lullaby) ---
function byeSong(): Song {
  const a = 'C5 C5 G5 G5 A5 A5 G5:2 F5 F5 E5 E5 D5 D5 C5:2';
  const b = 'G5 G5 F5 F5 E5 E5 D5:2 G5 G5 F5 F5 E5 E5 D5:2';
  const tune = melody(`${a} ${b} ${a}`);
  const ca = 'C:2 C:2 F:2 C:2 F:2 C:2 G:2 C:2';
  const cb = 'C:2 F:2 C:2 G:2 C:2 F:2 C:2 G:2';
  const harmony = chords(`${ca} ${cb} ${ca}`);
  const ev: Ev[] = tune.map((n) => note('bell', n, 1.2));
  for (const c of harmony) {
    for (const m of c.tones.slice(0, 3)) ev.push({ t: c.t, fn: (time, spb, out) => INST.pad(time, mtof(m + 12), c.d * spb, 1, out) });
    ev.push({ t: c.t, fn: (time, spb, out) => INST.bass(time, mtof(c.root - 12), c.d * spb * 0.9, 0.6, out) });
    // harp-like arpeggio in eighths
    const arp = [c.tones[0], c.tones[1], c.tones[2], c.tones[1] + 12];
    for (let k = 0; k < c.d * 2; k++) {
      const m = arp[k % arp.length] + 12;
      ev.push({ t: c.t + k * 0.5, fn: (time, spb, out) => INST.pluck(time, mtof(m), spb * 0.5, 0.25, out) });
    }
  }
  return { bpm: 92, beats: 48, events: ev, reverb: 0.3 };
}

const SONGS = { dance: danceSong, march: marchSong, bye: byeSong };
export type SongName = keyof typeof SONGS;
const cache: Partial<Record<SongName, Song>> = {};

// ---------------------------------------------------------------- player
let reverbIR: AudioBuffer | null = null;
function reverbBuffer(ctx: AudioContext) {
  if (reverbIR) return reverbIR;
  const len = Math.floor(ctx.sampleRate * 1.8);
  reverbIR = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = reverbIR.getChannelData(ch);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
  }
  return reverbIR;
}

let timer: number | null = null;
let busGain: GainNode | null = null;

export function playMusic(name: SongName, opts: { loop?: boolean } = {}) {
  stopMusic(true);
  const { ctx, musicBus } = audio();
  const song = (cache[name] ??= (() => {
    const s = SONGS[name]();
    s.events.sort((x, y) => x.t - y.t);
    return s;
  })());
  const loop = opts.loop ?? true;

  const bus = ctx.createGain();
  bus.gain.value = 0.8;
  bus.connect(musicBus);
  const rev = ctx.createConvolver();
  rev.buffer = reverbBuffer(ctx);
  const wet = ctx.createGain();
  wet.gain.value = song.reverb;
  bus.connect(rev);
  rev.connect(wet);
  wet.connect(musicBus);
  busGain = bus;

  const spb = 60 / song.bpm;
  const start = ctx.currentTime + 0.1;
  let i = 0;
  let pass = 0;
  const tick = () => {
    const horizon = ctx.currentTime + 0.25;
    for (;;) {
      if (i >= song.events.length) {
        if (!loop) {
          setTimeout(() => stopMusic(false), (song.beats * spb + 2) * 1000);
          if (timer !== null) clearInterval(timer);
          timer = null;
          return;
        }
        i = 0;
        pass++;
      }
      const ev = song.events[i];
      const at = start + (pass * song.beats + ev.t) * spb;
      if (at > horizon) break;
      if (at >= ctx.currentTime - 0.02) ev.fn(at, spb, bus);
      i++;
    }
  };
  tick();
  timer = window.setInterval(tick, 50);
  // let the reverb tail go when the bus is dropped
  (bus as GainNode & { _wet?: GainNode })._wet = wet;
}

/** `instant` = freeze! (cuts within ~30ms). Otherwise a short fade. */
export function stopMusic(instant = true) {
  if (timer !== null) {
    clearInterval(timer);
    timer = null;
  }
  if (busGain) {
    const { ctx } = audio();
    const g = busGain as GainNode & { _wet?: GainNode };
    for (const node of [g, g._wet].filter(Boolean) as GainNode[]) {
      node.gain.cancelScheduledValues(ctx.currentTime);
      node.gain.setTargetAtTime(0, ctx.currentTime, instant ? 0.01 : 0.35);
    }
    setTimeout(() => {
      g.disconnect();
      g._wet?.disconnect();
    }, instant ? 400 : 2500);
    busGain = null;
  }
}

export function isMusicPlaying() {
  return timer !== null;
}
