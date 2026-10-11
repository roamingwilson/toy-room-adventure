import { useEffect, useMemo, useState } from 'react';
import type { GameProps } from './index';
import { KITE_ITEMS, SENTENCES, STAR_GOAL, item } from '../content/vocab';
import { useDirector } from '../audio/director';
import { cue } from '../components/cue';
import { playSfx } from '../audio/sfx';
import { playMusic, stopMusic } from '../audio/music';
import { ItemArt } from '../components/ItemArt';
import { Teddy, type TeddyMood } from '../components/Teddy';
import { BigButton, TapHint, shuffle } from '../components/common';
import { JAR_POS, addStar, celebrate } from '../components/fx';
import { useTeacherControls } from '../components/teacher';
import { markComplete, progressStore } from '../state/store';

const PALETTES = [
  ['#FF595E', '#FFCA3A', '#1982C4', '#8AC926'],
  ['#8E5CF7', '#FF5DA2', '#2EC4B6', '#FFCA3A'],
  ['#FF924C', '#1982C4', '#FF5DA2', '#8AC926'],
];
const KITE = 150;
const POS = Array.from({ length: 14 }, (_, i) => (i < 7 ? { x: 50 + i * 190, y: 30 + (i % 2) * 40 } : { x: 140 + (i - 7) * 190, y: 280 + (i % 2) * 40 }));
const HAND = { x: 800, y: 650 };

function KiteShape({ colors, className = '' }: { colors: string[]; className?: string }) {
  return (
    <svg viewBox="0 0 200 260" className={`w-full ${className}`} overflow="visible">
      <path d="M100 196 Q80 220 100 236 Q120 252 90 262" stroke="#2B2D42" strokeWidth={3} fill="none" />
      <path d="M92 214 l-14 -8 l2 16 Z M92 214 l14 8 l-16 2 Z" fill={colors[0]} />
      <path d="M100 244 l-14 -6 l3 14 Z M100 244 l14 6 l-15 3 Z" fill={colors[2]} />
      <polygon points="100,6 100,80 30,80" fill={colors[0]} />
      <polygon points="100,6 170,80 100,80" fill={colors[1]} />
      <polygon points="100,80 170,80 100,196" fill={colors[2]} />
      <polygon points="30,80 100,80 100,196" fill={colors[3]} />
      <polygon points="100,6 170,80 100,196 30,80" fill="none" stroke="#fff" strokeWidth={5} strokeLinejoin="round" />
      <circle cx={100} cy={86} r={50} fill="#fff" />
    </svg>
  );
}

/** 10. Kite Goodbye Finale — count 14 kites, fly them away, fill the Star Jar, say goodbye. */
export function KiteFinale(_: GameProps) {
  const director = useDirector();
  const items = useMemo(() => shuffle(KITE_ITEMS), []);
  const [counted, setCounted] = useState(0);
  const [counting, setCounting] = useState(false);
  const [flying, setFlying] = useState<Record<number, { fx: number; fr: number }>>({});
  const [gone, setGone] = useState<Set<number>>(new Set());
  const [mood, setMood] = useState<TeddyMood>('wave');
  const [finale, setFinale] = useState(false);

  const count = () =>
    director.run(async (d) => {
      setCounting(true);
      setCounted(0);
      setMood('happy');
      await d.say("Let's count the kites!");
      for (let k = 1; k <= 14; k++) {
        setCounted(k);
        d.sfx('pop');
        await d.say(SENTENCES.number(k));
      }
      d.sfx('tada');
      celebrate('sparkle', 800, 300);
      setCounting(false);
      setMood('idle');
      await d.say('Fourteen kites! Tap a kite to fly it away!');
    });

  useEffect(() => {
    director.run(async (d) => {
      setMood('wave');
      await d.say('Kite Goodbye! Look at all the kites!');
      count();
    });
    return () => stopMusic(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goodbye = () =>
    director.run(async (d) => {
      setFinale(true);
      setMood('dance');
      await d.wait(600);
      await d.say('All the kites are gone! Look at our star jar!');
      const missing = Math.max(0, STAR_GOAL - progressStore.get().stars);
      addStar({ x: 800, y: 400 }, Math.min(missing, 10));
      await d.wait(1600);
      if (progressStore.get().stars < STAR_GOAL) progressStore.set({ stars: STAR_GOAL });
      // overflow!
      for (let k = 0; k < 8; k++) setTimeout(() => celebrate('sparkle', JAR_POS.x - 20 + Math.random() * 40, JAR_POS.y - 60), k * 250);
      progressStore.set((s) => ({ stars: s.stars + 5 }));
      celebrate('fireworks');
      d.sfx('cheer');
      markComplete('kites');
      await d.wait(800);
      await d.say('Great job! Goodbye!');
      playMusic('bye'); // "Twinkle Twinkle Little Star" — loops softly until you leave
      await d.say('Goodbye, goodbye, goodbye, my friends!');
      await d.say('Goodbye, goodbye, see you again!');
      celebrate('confetti');
      await d.say('Goodbye, everyone! Bye-bye!');
      setMood('wave');
    });

  const fly = (k: number) => {
    if (counting || flying[k] || finale) {
      cue(item(items[k]).word);
      return;
    }
    playSfx('whoosh');
    setFlying((f) => ({ ...f, [k]: { fx: (Math.random() - 0.5) * 600, fr: (Math.random() - 0.5) * 120 } }));
    const remaining = 14 - Object.keys(flying).length - 1;
    director.run(async (d) => {
      const w = item(items[k]).word;
      await d.say(SENTENCES.byeBye(w));
      if (remaining === 0) goodbye();
    });
    setTimeout(() => setGone((g) => new Set(g).add(k)), 2400);
  };

  const next = () => {
    if (finale) return;
    if (counting) return;
    const left = items.map((_, k) => k).filter((k) => !flying[k]);
    if (left.length) fly(left[0]);
  };
  useTeacherControls({ onNext: next });

  const replay = () => {
    director.cancel();
    stopMusic(false);
    setFlying({});
    setGone(new Set());
    setFinale(false);
    count();
  };

  const canFly = !counting && !finale;
  const hintKite = canFly ? items.findIndex((_, k) => !flying[k]) : -1;

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: finale ? 'linear-gradient(#2B2D6E, #6E4CB8 60%, #F59BB8)' : 'linear-gradient(#5EC4FF, #A8E2FF 70%, #DDF4FF)', transition: 'background 2s' }}>
      {/* clouds */}
      {!finale && [{ l: 200, t: 520 }, { l: 1100, t: 470 }].map((c, i) => (
        <div key={i} className="absolute float" style={{ left: c.l, top: c.t, animationDelay: `${i}s` }}>
          <div className="relative h-[70px] w-[220px] rounded-full bg-white/80">
            <div className="absolute -top-[40px] left-[40px] h-[90px] w-[90px] rounded-full bg-white/80" />
          </div>
        </div>
      ))}
      <div className="absolute bottom-0 left-0 right-0 h-[170px] bg-[#7BC043]" style={{ borderTopLeftRadius: '50% 80px', borderTopRightRadius: '50% 80px' }} />

      {/* strings */}
      <svg className="pointer-events-none absolute inset-0" width={1600} height={836}>
        {POS.map((p, k) =>
          flying[k] ? null : (
            <path key={k} d={`M${p.x + KITE / 2} ${p.y + KITE * 0.98} Q${(p.x + HAND.x) / 2} ${HAND.y - 40} ${HAND.x} ${HAND.y}`} stroke="rgba(43,45,66,.45)" strokeWidth={2.5} fill="none" />
          ),
        )}
      </svg>

      {/* kites */}
      {items.map((id, k) => {
        if (gone.has(k)) return null;
        const p = POS[k];
        const f = flying[k];
        const lit = counted > k;
        return (
          <button
            key={k}
            onClick={() => fly(k)}
            className="absolute"
            style={{
              left: p.x, top: p.y, width: KITE, zIndex: f ? 30 : 5,
              ['--fx' as string]: `${f?.fx ?? 0}px`, ['--fr' as string]: `${f?.fr ?? 0}deg`,
              animation: f ? 'fly-away 2.4s cubic-bezier(.4,0,.8,.5) forwards' : undefined,
            }}
          >
            <div style={{ animation: `kite-bob ${2.2 + (k % 4) * 0.3}s ease-in-out ${k * 0.17}s infinite` }} className={counting && counted === k + 1 ? 'scale-125 transition-transform' : 'transition-transform'}>
              <KiteShape colors={PALETTES[k % PALETTES.length]} className={canFly && !f ? 'tappable' : ''} />
              <div className="absolute left-[29%] top-[16%] w-[42%]">
                <ItemArt id={id} className="w-full" />
              </div>
            </div>
            {k === hintKite && <TapHint y="38%" />}
            {lit && (
              <div className="pop-in absolute -right-2 top-0 flex h-[54px] w-[54px] items-center justify-center rounded-full bg-[#FFCA3A] text-[30px] font-black text-white shadow">{k + 1}</div>
            )}
          </button>
        );
      })}

      {/* Teddy holding the strings */}
      <div className="absolute transition-all duration-1000" style={finale ? { left: 560, top: 230, width: 480 } : { left: HAND.x - 110, top: HAND.y - 120, width: 200 }}>
        <Teddy mood={finale ? mood : counting ? 'happy' : 'point'} />
      </div>

      {finale && (
        <div className="pointer-events-none absolute inset-x-0 top-[40px] flex justify-center pop-in [&>*]:pointer-events-auto">
          <button onClick={() => cue('Goodbye!')} className="tap whitespace-nowrap text-[120px] font-black text-white drop-shadow-[0_8px_0_#FF5DA2]">
            Goodbye! 👋
          </button>
        </div>
      )}

      <div className="absolute bottom-[24px] right-[40px] flex gap-4">
        {!counting && !finale && Object.keys(flying).length === 0 && (
          <BigButton onClick={count} color="#1982C4">1‑14</BigButton>
        )}
        {finale && <BigButton onClick={replay} color="#8AC926">🔄</BigButton>}
      </div>
    </div>
  );
}
