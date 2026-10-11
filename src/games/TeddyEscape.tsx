import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { GameProps } from './index';
import { ESCAPE_HAVE, ESCAPE_LIKE, ESCAPE_STEPS, SENTENCES, iHave, item, type ItemId } from '../content/vocab';
import { useDirector } from '../audio/director';
import { playSfx } from '../audio/sfx';
import { cue } from '../components/cue';
import { ItemArt } from '../components/ItemArt';
import { Teddy, type TeddyMood } from '../components/Teddy';
import { Monster, type MonsterMood } from '../components/Monster';
import { BigButton, TapHint, pickOne } from '../components/common';
import { addStar, celebrate } from '../components/fx';
import { useTeacherControls } from '../components/teacher';
import { markComplete } from '../state/store';

/**
 * 9. Run, Teddy, Run! — Teddy runs away from the (friendly) monster.
 * At every fork one path has a sentence card and the other path has the monster.
 * The class says the card's sentence ("I have a doll." / "Yes, I do!"), then the teacher taps:
 *   the CARD's path → they said it right, Teddy runs that way;
 *   the MONSTER     → not yet: the cheeky monster runs down, grabs a sad Teddy and carries
 *                     him away cackling — then Teddy comes back so the class can help him again.
 * The monster is a mischievous little villain (never the "fun" choice): it schemes at its
 * path, gloats when it catches Teddy, and sulks when the class gets it right.
 * After the last fork Teddy is home.
 */

type Card = { kind: 'have' | 'like'; id: ItemId };
type Side = 0 | 1;
type Phase = 'intro' | 'entering' | 'choose' | 'running' | 'caught' | 'carried' | 'home';

const TEDDY_W = 130;
const TEDDY_H = TEDDY_W * 1.2;
const MONSTER_W = 240;
const END = [{ x: 420, y: 330 }, { x: 1180, y: 330 }]; // where each path ends (sign post / monster's feet)

// Path geometry (stage pixels).
const STEM = 'M800 900 L800 540';
const BRANCHES = ['M800 545 C800 400 420 470 420 300', 'M800 545 C800 400 1180 470 1180 300'];
const ENTER = 'M800 920 L800 660';
const RUNS = ['M800 660 L800 545 C800 400 420 470 420 330', 'M800 660 L800 545 C800 400 1180 470 1180 330'];
// the monster stops right beside Teddy (on the side it came from) for the tickle
const MONSTER_RUNS = ['M420 330 C420 470 790 420 780 545 L670 660', 'M1180 330 C1180 470 810 420 820 545 L930 660'];
const HOME_RUN = 'M800 660 L800 360';
// after the catch, the monster walks off-screen with Teddy, back the way it came
const MONSTER_EXITS = ['M670 660 C520 700 300 740 -260 760', 'M930 660 C1080 700 1300 740 1860 760'];

/** Simple straight-line tween (used to lift Teddy into the monster's arms). */
function tween(from: { x: number; y: number }, to: { x: number; y: number }, ms: number, place: (x: number, y: number) => void) {
  return new Promise<void>((resolve) => {
    const t0 = performance.now();
    const frame = (now: number) => {
      const k = Math.min(1, (now - t0) / ms);
      place(from.x + (to.x - from.x) * k, from.y + (to.y - from.y) * k - Math.sin(k * Math.PI) * 60);
      if (k < 1) requestAnimationFrame(frame);
      else resolve();
    };
    requestAnimationFrame(frame);
  });
}

function makeCard(avoid?: ItemId): Card {
  const kind = Math.random() < 0.5 ? 'have' : 'like';
  const pool = (kind === 'have' ? ESCAPE_HAVE : ESCAPE_LIKE).filter((id) => id !== avoid);
  return { kind, id: pickOne(pool) };
}

const question = (c: Card) => (c.kind === 'have' ? SENTENCES.whatDoYouHave : SENTENCES.doYouLike(item(c.id).plural));
const answer = (c: Card) => (c.kind === 'have' ? iHave(c.id) : `${SENTENCES.yesIDo} / ${SENTENCES.noIDont}`);

/** Move something's feet along an SVG path. */
function runAlong(path: SVGPathElement, ms: number, place: (x: number, y: number) => void, signal: AbortSignal) {
  return new Promise<void>((resolve) => {
    const len = path.getTotalLength();
    const t0 = performance.now();
    const frame = (now: number) => {
      if (signal.aborted) return resolve();
      const k = Math.min(1, (now - t0) / ms);
      const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      const p = path.getPointAtLength(e * len);
      place(p.x, p.y);
      if (k < 1) requestAnimationFrame(frame);
      else resolve();
    };
    requestAnimationFrame(frame);
  });
}

function SignCard({ card }: { card: Card }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative flex h-[230px] w-[270px] items-center justify-center rounded-[38px] border-[8px] border-[#B86B32] bg-white shadow-[0_10px_0_rgba(0,0,0,.18)]">
        <ItemArt id={card.id} className="h-[175px] w-[175px]" />
        {card.kind === 'like' ? (
          <>
            <div className="absolute -right-6 -top-6 flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[#8E5CF7] text-[48px] font-black text-white">?</div>
            <div className="absolute -bottom-7 left-1/2 flex -translate-x-1/2 gap-1 rounded-full bg-white px-3 text-[38px] leading-[56px] shadow">👍👎</div>
          </>
        ) : (
          <div className="absolute -right-6 -top-6 flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[#FF924C] text-[42px]">🙋</div>
        )}
      </div>
      <div className="h-[46px] w-[18px] bg-[#8A4B1F]" />
    </div>
  );
}

function House() {
  return (
    <svg viewBox="0 0 300 300" className="w-full" overflow="visible">
      <rect x={225} y={40} width={30} height={70} fill="#8A4B1F" />
      <rect x={50} y={130} width={200} height={160} rx={10} fill="#FFE8A3" stroke="#E0A800" strokeWidth={6} />
      <path d="M20 145 L150 30 L280 145 Z" fill="#FF595E" stroke="#C9363B" strokeWidth={8} strokeLinejoin="round" />
      <rect x={120} y={190} width={60} height={100} rx={28} fill="#B86B32" />
      <circle cx={167} cy={243} r={5} fill="#FFCA3A" />
      <rect x={68} y={165} width={40} height={40} rx={6} fill="#8ED6FF" stroke="#fff" strokeWidth={5} />
      <rect x={192} y={165} width={40} height={40} rx={6} fill="#8ED6FF" stroke="#fff" strokeWidth={5} />
      <path d="M150 92 C137 80 127 90 136 101 L150 114 L164 101 C173 90 163 80 150 92 Z" fill="#FF5DA2" />
    </svg>
  );
}

export function TeddyEscape(_: GameProps) {
  const director = useDirector();
  const [step, setStep] = useState(0);
  const [card, setCard] = useState<Card>(() => makeCard());
  const [monsterSide, setMonsterSide] = useState<Side>(1);
  const [phase, setPhase] = useState<Phase>('intro');
  const [teddyMood, setTeddyMood] = useState<TeddyMood>('surprised');
  const [monsterMood, setMonsterMood] = useState<MonsterMood>('sneaky');
  const [canRetry, setCanRetry] = useState(false);

  const teddyRef = useRef<HTMLDivElement>(null);
  const monsterRef = useRef<HTMLDivElement>(null);
  const runRefs = [useRef<SVGPathElement>(null), useRef<SVGPathElement>(null)];
  const monsterRunRefs = [useRef<SVGPathElement>(null), useRef<SVGPathElement>(null)];
  const exitRefs = [useRef<SVGPathElement>(null), useRef<SVGPathElement>(null)];
  const teddyAt = useRef({ x: 800, y: 920 });
  const enterRef = useRef<SVGPathElement>(null);
  const homeRef = useRef<SVGPathElement>(null);

  const place = (el: HTMLElement | null, w: number, h: number) => (x: number, y: number) => {
    if (!el) return;
    el.style.left = `${x - w / 2}px`;
    el.style.top = `${y - h}px`;
  };
  const placeTeddy = (x: number, y: number) => {
    teddyAt.current = { x, y };
    place(teddyRef.current, TEDDY_W, TEDDY_H)(x, y);
  };
  const placeMonster = (x: number, y: number) => place(monsterRef.current, MONSTER_W, MONSTER_W * 0.97)(x, y);
  const monsterHome = (side: Side) => placeMonster(END[side].x, END[side].y);
  const cardSide = (1 - monsterSide) as Side;

  useLayoutEffect(() => {
    placeTeddy(800, 920);
    monsterHome(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Ask the card's question, then show the answer to listen for. */
  const ask = (c: Card) =>
    director.run(async (d) => {
      await d.say(question(c));
      await d.sayIt();
      cue(`✔ ${answer(c)}`);
    });

  const startStep = (n: number, avoid?: ItemId) =>
    director.run(async (d) => {
      const c = makeCard(avoid);
      const side: Side = Math.random() < 0.5 ? 0 : 1;
      setStep(n);
      setCard(c);
      setMonsterSide(side);
      monsterHome(side);
      setMonsterMood('sneaky');
      setCanRetry(false);
      setTeddyMood('happy');
      setPhase('entering');
      d.sfx('whoosh');
      await runAlong(enterRef.current!, 1000, placeTeddy, d.signal);
      setTeddyMood('surprised');
      setPhase('choose');
      ask(c);
    });

  useEffect(() => {
    director.run(async (d) => {
      await d.say('Run, Teddy, run! The monster is coming!');
      startStep(0);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Teacher taps the card's path: they said it right. */
  const correct = () => {
    if (phase !== 'choose') return;
    director.run(async (d) => {
      setPhase('running');
      d.sfx('tada');
      celebrate('sparkle', END[cardSide].x, END[cardSide].y - 160);
      addStar({ x: END[cardSide].x, y: END[cardSide].y - 100 });
      cue('Yes! Run, Teddy, run!');
      setTeddyMood('happy');
      setMonsterMood('sad'); // the monster missed Teddy… boo-hoo
      d.sfx('slideDown');
      d.sfx('whoosh');
      await runAlong(runRefs[cardSide].current!, 1700, placeTeddy, d.signal);
      if (step + 1 >= ESCAPE_STEPS) goHome();
      else startStep(step + 1, card.id);
    });
  };

  /** Teacher taps the monster: not yet — the monster scoops Teddy up and happily carries him off. */
  const caught = () => {
    if (phase !== 'choose') return;
    const side = monsterSide;
    const dir = side === 0 ? -1 : 1; // which way the monster walks off
    director.run(async (d) => {
      setPhase('caught');
      d.sfx('boing');
      setTeddyMood('surprised');
      setMonsterMood('open');
      cue('Oh no! Here comes the monster!');
      await runAlong(monsterRunRefs[side].current!, 1300, placeMonster, d.signal);
      // got him! the monster gloats, poor Teddy is sad
      setMonsterMood('sneaky');
      setTeddyMood('sad');
      d.sfx('cackle');
      const start = { x: side === 0 ? 670 : 930, y: 660 };
      await tween(teddyAt.current, { x: start.x + dir * 70, y: start.y - 50 }, 450, placeTeddy);
      await d.say('Got you, Teddy! Hee hee hee!');
      setPhase('carried');
      d.sfx('cackle');
      await runAlong(exitRefs[side].current!, 2600, (x, y) => {
        placeMonster(x, y);
        placeTeddy(x + dir * 70, y - 50);
      }, d.signal);
      await d.say('Oh no! Poor Teddy!');
      setCanRetry(true);
      await d.say("Let's help Teddy! Try again!");
    });
  };

  const tryAgain = () => {
    if (phase !== 'carried' || !canRetry) return;
    playSfx('slideUp');
    setCanRetry(false);
    director.run(async (d) => {
      monsterHome(monsterSide);
      setMonsterMood('sneaky');
      setTeddyMood('happy');
      setPhase('entering');
      placeTeddy(800, 920);
      await runAlong(enterRef.current!, 1000, placeTeddy, d.signal);
      setTeddyMood('surprised');
      setPhase('choose');
      ask(card);
    });
  };

  const goHome = () =>
    director.run(async (d) => {
      setPhase('home');
      setStep(ESCAPE_STEPS);
      setTeddyMood('happy');
      setMonsterMood('sad'); // Teddy got away!
      placeMonster(330, 840);
      await runAlong(enterRef.current!, 900, placeTeddy, d.signal);
      await runAlong(homeRef.current!, 1500, placeTeddy, d.signal);
      setTeddyMood('dance');
      d.sfx('cheer');
      celebrate('fireworks');
      markComplete('escape');
      await d.say('Teddy is home! Teddy is safe! Hooray!');
      await d.say('Great job, everyone!');
    });

  const playAgain = () => {
    playSfx('pop');
    startStep(0);
  };

  useTeacherControls({
    onNext: () => {
      if (phase === 'choose') correct();
      else if (phase === 'carried') tryAgain();
      else if (phase === 'home') playAgain();
    },
  });

  const atFork = phase !== 'home';
  const choosing = phase === 'choose';

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: 'linear-gradient(#BDE8FF 0%, #E6F7FF 14%, #9BE15D 14%, #6CC04A 100%)' }}>
      {/* trees */}
      {[[60, 330, 1], [1490, 380, 1.1], [150, 610, 0.9], [1400, 640, 1], [620, 120, 0.7], [980, 110, 0.7]].map(([x, y, s], i) => (
        <div key={i} className="absolute" style={{ left: x - 70 * s, top: y - 150 * s, width: 140 * s }}>
          <svg viewBox="0 0 140 150" className="w-full">
            <rect x={60} y={90} width={20} height={60} rx={6} fill="#8A4B1F" />
            <circle cx={70} cy={60} r={52} fill="#3FA34D" />
            <circle cx={42} cy={78} r={32} fill="#4DB85B" />
            <circle cx={100} cy={76} r={30} fill="#4DB85B" />
          </svg>
        </div>
      ))}

      {/* the paths */}
      <svg className="pointer-events-none absolute inset-0" width={1600} height={900}>
        <g fill="none" strokeLinecap="round">
          {atFork ? (
            <>
              <path d={STEM} stroke="#D9B26F" strokeWidth={104} />
              <path d={STEM} stroke="#F2D7A0" strokeWidth={88} />
              <g key={step} className="fade-in">
                {BRANCHES.map((b, i) => (
                  <g key={i}>
                    <path d={b} stroke="#D9B26F" strokeWidth={96} />
                    <path d={b} stroke="#F2D7A0" strokeWidth={80} />
                    <path d={b} stroke="#fff" strokeWidth={6} strokeDasharray="4 28" opacity={0.8} />
                  </g>
                ))}
              </g>
            </>
          ) : (
            <>
              <path d="M800 900 L800 330" stroke="#D9B26F" strokeWidth={104} />
              <path d="M800 900 L800 330" stroke="#F2D7A0" strokeWidth={88} />
            </>
          )}
        </g>
        {/* invisible routes for running */}
        <g visibility="hidden">
          <path ref={runRefs[0]} d={RUNS[0]} />
          <path ref={runRefs[1]} d={RUNS[1]} />
          <path ref={monsterRunRefs[0]} d={MONSTER_RUNS[0]} />
          <path ref={monsterRunRefs[1]} d={MONSTER_RUNS[1]} />
          <path ref={exitRefs[0]} d={MONSTER_EXITS[0]} />
          <path ref={exitRefs[1]} d={MONSTER_EXITS[1]} />
          <path ref={enterRef} d={ENTER} />
          <path ref={homeRef} d={HOME_RUN} />
        </g>
      </svg>

      {/* progress: footprints to Teddy's house */}
      <div className="absolute left-1/2 top-[18px] flex -translate-x-1/2 items-center gap-3 rounded-full bg-white/85 px-6 py-2 shadow">
        {Array.from({ length: ESCAPE_STEPS }, (_, k) => (
          <span key={k} className={`text-[34px] transition-opacity ${k < step ? 'opacity-100' : 'opacity-25'}`}>🐾</span>
        ))}
        <span className="text-[44px]">🏠</span>
      </div>

      {/* the sentence card at the end of the safe path — tap it if the class said it right */}
      {atFork && (
        <button
          key={`card-${step}`}
          onClick={correct}
          className="tap fade-in absolute z-[8]"
          style={{ left: END[cardSide].x - 135, top: END[cardSide].y - 276 }}
          aria-label="Said it right — run this way"
        >
          <div className={choosing ? 'tappable' : ''}>
            <SignCard card={card} />
          </div>
        </button>
      )}

      {/* Teddy's house */}
      {!atFork && (
        <div className="pop-in absolute left-[640px] top-[50px] w-[320px]">
          <House />
        </div>
      )}

      {/* the monster, blocking the other path — tap it if the class did not say it yet */}
      <div ref={monsterRef} className="absolute z-[12]" style={{ width: MONSTER_W }}>
        <button
          key={`m-${step}`}
          onClick={caught}
          className={`tap block w-full ${phase === 'entering' ? 'pop-in' : ''}`}
          aria-label="Not yet — monster"
          disabled={phase !== 'choose'}
        >
          <div className={choosing ? 'sway' : ''} style={phase === 'carried' ? { animation: 'carry-walk .45s ease-in-out infinite' } : undefined}>
            <Monster mood={monsterMood} className={`w-full ${choosing ? 'tappable' : ''}`} />
          </div>
        </button>
      </div>

      {/* Teddy (positioned by runAlong) */}
      <div ref={teddyRef} className="pointer-events-none absolute z-[13]" style={{ width: TEDDY_W }}>
        <div
          style={
            phase === 'running' || phase === 'entering'
              ? { animation: 'march-step .3s ease-in-out infinite' }
              : phase === 'carried'
                ? { animation: 'carry-walk .45s ease-in-out infinite' }
                : undefined
          }
        >
          <Teddy mood={teddyMood} />
        </div>
        {(phase === 'caught' || phase === 'carried') && teddyMood === 'sad' && <div className="pop-in absolute -right-8 -top-12 text-[56px]">😢</div>}
      </div>

      {/* try again / play again */}
      {phase === 'carried' && canRetry && (
        <div className="absolute bottom-[40px] right-[60px] z-[30]">
          <BigButton onClick={tryAgain} color="#1982C4">🔄 Again</BigButton>
          <TapHint />
        </div>
      )}
      {phase === 'home' && (
        <div className="absolute bottom-[40px] right-[60px] z-[30]">
          <BigButton onClick={playAgain} color="#8AC926" className="pulse">🔄</BigButton>
          <TapHint />
        </div>
      )}
    </div>
  );
}
