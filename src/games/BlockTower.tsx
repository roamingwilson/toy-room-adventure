import { useEffect, useRef, useState } from 'react';
import type { GameProps } from './index';
import { HOWMANY_ITEMS, MAX_COUNT, NUMBER_WORDS, SENTENCES, item, type ItemId } from '../content/vocab';
import { useDirector } from '../audio/director';
import { cue } from '../components/cue';
import { playSfx, sfx } from '../audio/sfx';
import { ItemArt } from '../components/ItemArt';
import { Teddy, type TeddyMood } from '../components/Teddy';
import { BigButton, ModeButton, TapHint, Word, pickOne, shuffle } from '../components/common';
import { addStar, celebrate } from '../components/fx';
import { useTeacherControls } from '../components/teacher';
import { markComplete } from '../state/store';

type Mode = 'blocks' | 'kite' | 'ball' | 'heart' | 'howmany';
const BLOCK_COLORS = ['#FF595E', '#FF924C', '#FFCA3A', '#8AC926', '#2EC4B6', '#1982C4', '#8E5CF7', '#FF5DA2'];
const NUM_COLORS = BLOCK_COLORS;
const BLOCK_H = 44;
const FLOOR_Y = 790;

/** Grid slots for counted objects (7 × 2). */
const GRID = Array.from({ length: 14 }, (_, i) => ({ x: 70 + (i % 7) * 128, y: i < 7 ? 220 : 430 }));

/** 7. Block Tower Count — count 1 to 14, then CRASH! Plus counting kites / balls / hearts and "How many?". */
export function BlockTower(_: GameProps) {
  const director = useDirector();
  const [mode, setMode] = useState<Mode>('blocks');
  const [count, setCount] = useState(0);
  const [phase, setPhase] = useState<'counting' | 'wobble' | 'crashed' | 'full' | 'ask' | 'reveal'>('counting');
  const [teddy, setTeddy] = useState<TeddyMood>('idle');
  const [crash, setCrash] = useState<{ x: number; y: number; r: number }[]>([]);
  const [hm, setHm] = useState<{ n: number; id: ItemId; slots: number[] }>({ n: 5, id: 'ball', slots: [] });
  const [hmLit, setHmLit] = useState(0);
  const lastTap = useRef(0);
  const finishedModes = useRef(new Set<Mode>());

  useEffect(() => {
    director.run(async (d) => {
      setTeddy('wave');
      await d.say("Block Tower Count! Let's count! Tap to add a block!");
      setTeddy('idle');
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reset = (m: Mode) => {
    director.cancel();
    setMode(m);
    setCount(0);
    setCrash([]);
    setTeddy('idle');
    setPhase('counting');
    if (m === 'howmany') newHowMany();
    else
      director.run(async (d) => {
        d.sfx('pop');
        await d.say(SENTENCES.letsCount(m === 'blocks' ? 'blocks' : item(m).plural));
      });
  };

  const add = () => {
    if (mode === 'howmany' || phase !== 'counting' || count >= MAX_COUNT) return;
    const t = Date.now();
    if (t - lastTap.current < 280) return;
    lastTap.current = t;
    const n = count + 1;
    setCount(n);
    if (mode === 'blocks') sfx.block(n);
    else playSfx('pop');
    setTeddy(n % 2 ? 'happy' : 'idle');
    if (n < MAX_COUNT) cue(SENTENCES.number(n));
    else {
      director.run(async (d) => {
        await d.say(SENTENCES.number(n));
        await d.wait(500);
        if (mode === 'blocks') {
          setPhase('wobble');
          setTeddy('surprised');
          d.sfx('wobble');
          await d.say('Uh oh... wobble, wobble...');
          await d.wait(500);
          setCrash(Array.from({ length: MAX_COUNT }, (_, i) => ({ x: (Math.random() - 0.5) * 900, y: FLOOR_Y - 60 - (FLOOR_Y - (i + 1) * BLOCK_H) + Math.random() * 30, r: (Math.random() - 0.5) * 540 })));
          setPhase('crashed');
          d.sfx('crash');
          await d.wait(700);
          setTeddy('laugh');
          d.sfx('giggle');
          await d.say('Crash! Ha ha ha!');
          celebrate('confetti');
          addStar({ x: 560, y: 600 }, 2);
        } else {
          setPhase('full');
          setTeddy('dance');
          d.sfx('cheer');
          celebrate('confetti');
          await d.say(SENTENCES.fourteenHooray(item(mode).plural));
          addStar({ x: 500, y: 400 }, 2);
        }
        finishedModes.current.add(mode);
        if (finishedModes.current.size >= 2) markComplete('count');
      });
    }
  };

  // ----- How many? -----
  const newHowMany = () => {
    const n = 1 + Math.floor(Math.random() * MAX_COUNT);
    const id = pickOne(HOWMANY_ITEMS);
    const slots = shuffle(GRID.map((_, i) => i)).slice(0, n).sort((a, b) => a - b);
    setHm({ n, id, slots });
    setHmLit(0);
    setPhase('ask');
    director.run(async (d) => {
      setTeddy('think');
      d.sfx('pop');
      await d.say(SENTENCES.howMany(item(id).plural));
      await d.say("Let's count!");
      await d.sayIt(n * 600);
      setPhase('reveal');
      for (let k = 1; k <= n; k++) {
        setHmLit(k);
        d.sfx('pop');
        await d.say(SENTENCES.number(k), { rate: 1.1 });
      }
      setTeddy('happy');
      d.sfx('tada');
      celebrate('confetti');
      await d.say(SENTENCES.countResult(n, n === 1 ? item(id).word : item(id).plural));
      addStar({ x: 500, y: 400 });
      finishedModes.current.add('howmany');
    });
  };

  const next = () => {
    if (mode === 'howmany') newHowMany();
    else if (phase === 'counting') add();
    else reset(mode);
  };
  useTeacherControls({ onNext: next });

  const numColor = NUM_COLORS[(mode === 'howmany' ? hmLit : count) % NUM_COLORS.length];
  const shownNum = mode === 'howmany' ? (phase === 'reveal' ? hmLit : 0) : count;

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: 'linear-gradient(#E4FFD1, #C9F2A8 70%, #A8E07A)' }}>
      <div className="absolute left-0 right-0 bg-[#7BC043]" style={{ top: FLOOR_Y, bottom: 0 }} />

      {/* mode buttons */}
      <div className="absolute left-[20px] top-[20px] z-20 flex gap-3">
        {(['blocks', 'kite', 'ball', 'heart'] as const).map((m) => (
          <ModeButton key={m} active={mode === m} onClick={() => reset(m)} color="#fff">
            <ItemArt id={m} className="w-full" />
          </ModeButton>
        ))}
        <ModeButton active={mode === 'howmany'} onClick={() => reset('howmany')} color="#fff">
          <div className="text-[64px] font-black leading-none text-[#8E5CF7]">?</div>
        </ModeButton>
      </div>

      {/* tap area */}
      <button className="absolute left-0 top-[150px] h-[690px] w-[1040px] cursor-pointer" onClick={add} aria-label="Add one" />

      {/* block tower */}
      {mode === 'blocks' && (
        <div
          className="pointer-events-none absolute left-[460px]"
          style={{ top: 0, width: 200, height: FLOOR_Y, transformOrigin: `100px ${FLOOR_Y}px`, animation: phase === 'wobble' ? 'tower-wobble .35s ease-in-out infinite' : undefined }}
        >
          {Array.from({ length: count }, (_, i) => {
            const c = crash[i];
            return (
              <div
                key={i}
                className="absolute flex items-center justify-center rounded-[14px] border-[5px] border-white/60 text-[36px] font-black text-white"
                style={{
                  left: 20 + ((i * 7) % 3) * 4 - 4,
                  top: FLOOR_Y - (i + 1) * BLOCK_H,
                  width: 160,
                  height: BLOCK_H - 2,
                  background: BLOCK_COLORS[i % BLOCK_COLORS.length],
                  boxShadow: 'inset 0 -6px 0 rgba(0,0,0,.15)',
                  transform: c ? `translate(${c.x}px, ${c.y}px) rotate(${c.r}deg)` : undefined,
                  transition: c ? `transform ${0.6 + (i % 4) * 0.12}s cubic-bezier(.5,0,.8,.6)` : undefined,
                  animation: !c && i === count - 1 ? 'pop-in .35s ease-out' : undefined,
                }}
              >
                {i + 1}
              </div>
            );
          })}
        </div>
      )}

      {/* counted items */}
      {(mode === 'kite' || mode === 'ball' || mode === 'heart') &&
        GRID.slice(0, count).map((g, i) => (
          <div key={i} className="pointer-events-none absolute w-[118px]" style={{ left: g.x, top: g.y + 60 }}>
            <div className={phase === 'full' ? 'jump' : 'pop-in'} style={phase === 'full' ? { animation: `jump .7s ease-out ${i * 0.06}s infinite` } : undefined}>
              <ItemArt id={mode} className="w-full" />
            </div>
            <div className="mx-auto -mt-2 flex h-[44px] w-[44px] items-center justify-center rounded-full bg-white text-[26px] font-black text-slate-700">{i + 1}</div>
          </div>
        ))}

      {mode === 'howmany' &&
        hm.slots.map((s, k) => {
          const g = GRID[s];
          const lit = phase === 'reveal' && k < hmLit;
          return (
            <div key={`${hm.id}-${s}`} className="pointer-events-none absolute w-[118px]" style={{ left: g.x, top: g.y + 60 }}>
              <div className={`pop-in ${lit ? 'scale-110' : ''} transition-transform`} style={{ animationDelay: `${k * 0.08}s` }}>
                <ItemArt id={hm.id} className="w-full" />
              </div>
              {lit && <div className="pop-in mx-auto -mt-2 flex h-[48px] w-[48px] items-center justify-center rounded-full bg-[#FFCA3A] text-[28px] font-black text-white">{k + 1}</div>}
            </div>
          );
        })}

      {/* big numeral */}
      {/* "tap here": a dashed ghost where the next one will appear, and the pointing hand */}
      {phase === 'counting' && mode !== 'howmany' && count < MAX_COUNT && (() => {
        const p = mode === 'blocks'
          ? { x: 560, y: FLOOR_Y - (count + 1) * BLOCK_H + BLOCK_H / 2, w: 160, h: BLOCK_H - 2, r: 14 }
          : { x: GRID[count].x + 59, y: GRID[count].y + 60 + 59, w: 112, h: 112, r: 56 };
        return (
          <div className="pointer-events-none absolute" style={{ left: p.x, top: p.y }}>
            <div className="pulse absolute border-[5px] border-dashed border-white/90 bg-white/30" style={{ left: -p.w / 2, top: -p.h / 2, width: p.w, height: p.h, borderRadius: p.r }} />
            <TapHint size={90} />
          </div>
        );
      })()}

      <div className="absolute left-[1060px] top-[170px] flex w-[420px] flex-col items-center">
        {shownNum > 0 && (
          <>
            <button
              key={shownNum}
              onClick={() => cue(SENTENCES.number(shownNum))}
              className="pop-in text-[300px] font-black leading-none"
              style={{ color: numColor, textShadow: '0 12px 0 rgba(0,0,0,.12)' }}
            >
              {shownNum}
            </button>
            <Word text={NUMBER_WORDS[shownNum]} say={SENTENCES.number(shownNum)} className="rounded-full bg-white px-8 py-2 text-[52px] text-slate-700 shadow" />
          </>
        )}
        {mode === 'howmany' && phase === 'ask' && <div className="pulse text-[260px] font-black leading-none text-[#8E5CF7]">?</div>}
      </div>

      <div className="absolute bottom-[30px] left-[1100px] w-[220px]">
        <Teddy mood={teddy} />
      </div>

      {(phase === 'crashed' || phase === 'full' || (mode === 'howmany' && phase === 'reveal')) && (
        <div className="absolute bottom-[40px] right-[60px] z-20">
          <BigButton onClick={() => (mode === 'howmany' ? newHowMany() : reset(mode))} color="#8AC926" className="pulse">🔄</BigButton>
          <TapHint />
        </div>
      )}
    </div>
  );
}
