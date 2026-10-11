import { useEffect, useMemo, useState } from 'react';
import type { GameProps } from './index';
import { COPY_PROMPTS, SENTENCES, type Prep } from '../content/vocab';
import { useDirector } from '../audio/director';
import { cue } from '../components/cue';
import { Teddy, type TeddyMood } from '../components/Teddy';
import { BigButton, TapHint, Word, shuffle } from '../components/common';
import { addStar, celebrate } from '../components/fx';
import { useTeacherControls } from '../components/teacher';
import { markComplete } from '../state/store';

const TOTAL = 10;
const PAW: Record<Prep | 'rest', { x: number; y: number }> = {
  rest: { x: 30, y: 230 },
  on: { x: 200, y: 68 },
  in: { x: 200, y: 140 },
  under: { x: 200, y: 290 },
};

/** Box on legs + Teddy's paw showing ON / IN / UNDER. */
function BoxDemo({ prep }: { prep: Prep | 'rest' }) {
  const p = PAW[prep];
  // when IN, hide the part of the paw that is inside the box
  const [clipIn, setClipIn] = useState(false);
  useEffect(() => {
    setClipIn(false);
    if (prep !== 'in') return;
    const t = setTimeout(() => setClipIn(true), 550);
    return () => clearTimeout(t);
  }, [prep]);
  return (
    <svg viewBox="0 0 400 360" className="w-full" overflow="visible">
      <defs>
        <clipPath id="aboveBox">
          <path d="M-200 -200 H600 V560 H310 V128 H90 V560 H-200 Z" />
        </clipPath>
      </defs>
      <ellipse cx={200} cy={344} rx={170} ry={12} fill="rgba(0,0,0,.12)" />
      {/* legs */}
      {[96, 290].map((x) => <rect key={x} x={x} y={232} width={18} height={108} rx={7} fill="#8A4B1F" />)}
      {/* box inside (back) */}
      <polygon points="90,128 120,100 330,100 310,128" fill="#7A3A12" />
      {/* box front */}
      <rect x={90} y={128} width={220} height={110} rx={10} fill="#FF924C" stroke="#E0662A" strokeWidth={5} />
      <path d="M90 128 L120 100 L330 100 L310 128" fill="none" stroke="#E0662A" strokeWidth={5} strokeLinejoin="round" />
      <path d="M310 128 L330 100 V210 L310 238" fill="#E0662A" />
      <path d="M200 222 C176 206 170 194 178 186 C185 180 196 182 200 190 C204 182 215 180 222 186 C230 194 224 206 200 222 Z" fill="#FF5DA2" stroke="#fff" strokeWidth={3} />
      {/* paw (drawn last; clipped by the box when IN) */}
      <g clipPath={clipIn ? 'url(#aboveBox)' : undefined}>
        <g style={{ transform: `translate(${p.x}px, ${p.y}px)`, transition: 'transform .55s cubic-bezier(.3,1.3,.5,1)' }}>
          <circle r={36} fill="#B5733A" />
          <ellipse cy={8} rx={18} ry={14} fill="#EBC08F" />
          <circle cx={-18} cy={-16} r={8} fill="#EBC08F" />
          <circle cx={0} cy={-22} r={8} fill="#EBC08F" />
          <circle cx={18} cy={-16} r={8} fill="#EBC08F" />
        </g>
      </g>
    </svg>
  );
}

/** 6. Copy Teddy — on / in / under action game. */
export function CopyTeddy(_: GameProps) {
  const director = useDirector();
  const prompts = useMemo(() => shuffle(COPY_PROMPTS).slice(0, TOTAL), []);
  const [i, setI] = useState(-1);
  const [prep, setPrep] = useState<Prep | 'rest'>('rest');
  const [mood, setMood] = useState<TeddyMood>('wave');
  const [ready, setReady] = useState(false);
  const prompt = i >= 0 ? prompts[i] : null;

  const play = (idx: number) =>
    director.run(async (d) => {
      const p = prompts[idx];
      setI(idx);
      setReady(false);
      setPrep('rest');
      setMood('point');
      await d.wait(300);
      d.sfx('pop');
      setPrep(p.prep);
      await d.wait(600);
      await d.say(SENTENCES.prep(p.prep));
      await d.say(p.text);
      setMood('dance');
      await d.say('Copy Teddy!');
      await d.wait(2500);
      setMood('happy');
      d.sfx('twinkle');
      celebrate('sparkle', 800, 300);
      await d.say('Great job!');
      addStar({ x: 800, y: 300 });
      setReady(true);
      if (idx === prompts.length - 1) {
        markComplete('copy');
        celebrate('confetti');
        d.sfx('cheer');
        await d.say('Wow! You are super copycats!');
      }
    });

  useEffect(() => {
    director.run(async (d) => {
      setMood('wave');
      await d.say('Copy Teddy! Watch Teddy... and do it too!');
      play(0);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const next = () => {
    if (i < prompts.length - 1) play(i + 1);
    else play(0);
  };
  useTeacherControls({ onNext: next });

  const words = prompt ? prompt.text.split(new RegExp(`\\b(${prompt.prep})\\b`, 'i')) : [];

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: 'linear-gradient(#D4F7F2, #A6E9DF 65%, #7CD8C8)' }}>
      {/* progress paws */}
      <div className="absolute left-[30px] top-[24px] flex gap-2">
        {prompts.map((_, k) => (
          <div key={k} className={`flex h-[34px] w-[34px] items-center justify-center rounded-full text-[18px] ${k < i || (k === i && ready) ? 'bg-[#B5733A]' : 'bg-white/60'}`}>🐾</div>
        ))}
      </div>

      {/* sentence */}
      {prompt && (
        <div key={i} className="pointer-events-none absolute inset-x-0 top-[70px] flex justify-center pop-in [&>*]:pointer-events-auto">
          <button onClick={() => cue(prompt.text)} className="tap whitespace-nowrap rounded-full bg-white px-10 py-4 text-[52px] font-black text-slate-700 shadow-xl">
            {words.map((w, k) =>
              w.toLowerCase() === prompt.prep ? (
                <span key={k} className="mx-1 rounded-2xl bg-[#FF595E] px-4 text-white">{w.toUpperCase()}</span>
              ) : (
                <span key={k}>{w}</span>
              ),
            )}
          </button>
        </div>
      )}

      <div className="absolute left-[80px] top-[260px] w-[340px]">
        <Teddy mood={mood} />
      </div>

      <div className="absolute left-[470px] top-[190px] w-[560px]">
        <BoxDemo prep={prep} />
        {prep !== 'rest' && (
          <div className="mt-2 text-center">
            <Word key={`${i}${prep}`} text={prep.toUpperCase()} say={SENTENCES.prep(prep as Prep)} className="pop-in rounded-full bg-[#FFCA3A] px-12 py-2 text-[72px] text-white shadow-lg" />
          </div>
        )}
      </div>

      {prompt && (
        <button key={`e${i}`} onClick={() => cue(prompt.text)} className="tap pop-in absolute right-[120px] top-[300px] flex h-[300px] w-[300px] items-center justify-center rounded-full bg-white/80 text-[180px] shadow-xl">
          {prompt.emoji}
        </button>
      )}

      {ready && (
        <div className="absolute bottom-[30px] right-[60px]">
          <BigButton onClick={next} color="#8AC926" className="pulse">▶</BigButton>
          <TapHint />
        </div>
      )}
    </div>
  );
}
