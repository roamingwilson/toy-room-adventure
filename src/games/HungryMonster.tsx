import { useEffect, useRef, useState } from 'react';
import type { GameProps } from './index';
import { SHAPES, SHAPE_IN_ROOM, SENTENCES, item, type ShapeId } from '../content/vocab';
import { useDirector } from '../audio/director';
import { cue } from '../components/cue';
import { playSfx } from '../audio/sfx';
import { ItemArt, SHAPE_COLORS, SHAPE_PATHS } from '../components/ItemArt';
import { Monster, type MonsterMood } from '../components/Monster';
import { ModeButton, TapHint, Word, shuffle, shuffleNoRepeat } from '../components/common';
import { addStar, celebrate } from '../components/fx';
import { useTeacherControls } from '../components/teacher';
import { markComplete } from '../state/store';

const MONSTER = { left: 90, top: 250, size: 480 };
const MOUTH = { x: MONSTER.left + (150 / 300) * MONSTER.size, y: MONSTER.top + (178 / 300) * MONSTER.size };
const SLOTS = [
  { x: 820, y: 230 }, { x: 1150, y: 260 }, { x: 860, y: 540 }, { x: 1200, y: 560 },
];
const SHAPE_SIZE = 210;

type Round = { level: 1 | 2; target: ShapeId; thing?: (typeof SHAPE_IN_ROOM)[number]['thing'] };
type Phase = 'asking' | 'choose' | 'eating' | 'done';

function makeRounds(level: 1 | 2): Round[] {
  if (level === 1) {
    const ids = SHAPES.map((s) => s.id);
    return shuffleNoRepeat([...ids, ...ids], String).map((t) => ({ level: 1, target: t }));
  }
  return shuffleNoRepeat(SHAPE_IN_ROOM, (r) => r.thing).map((r) => ({ level: 2, target: r.shape, thing: r.thing }));
}

/** 4. Hungry Shape Monster — feed the monster the right shape. Level 2: shapes in the room. */
export function HungryMonster({ onFinish }: GameProps) {
  const director = useDirector();
  const [level, setLevel] = useState<1 | 2>(1);
  const [rounds, setRounds] = useState<Round[]>(() => makeRounds(1));
  const [ri, setRi] = useState(0);
  const [order, setOrder] = useState<ShapeId[]>(() => shuffle(SHAPES.map((s) => s.id)));
  const [phase, setPhase] = useState<Phase>('asking');
  const [mood, setMood] = useState<MonsterMood>('idle');
  const [flying, setFlying] = useState<ShapeId | null>(null);
  const [eaten, setEaten] = useState<ShapeId | null>(null);
  const [wrongKey, setWrongKey] = useState<Record<string, number>>({});
  const [wrongCount, setWrongCount] = useState(0);
  const [outline, setOutline] = useState(false);
  const done = useRef(0);
  const round = rounds[ri];
  const target = SHAPES.find((s) => s.id === round.target)!;

  const ask = (r: Round) =>
    director.run(async (d) => {
      setPhase('asking');
      setFlying(null);
      setEaten(null);
      setOutline(false);
      setWrongCount(0);
      setOrder(shuffle(SHAPES.map((s) => s.id)));
      if (r.level === 1) {
        setMood('open');
        d.sfx('pop');
        setPhase('choose'); // tappable as soon as the line is shown
        await d.say(SENTENCES.iWant(SHAPES.find((s) => s.id === r.target)!.word));
      } else {
        setMood('idle');
        d.sfx('pop');
        await d.say(SENTENCES.whatShapeIs(item(r.thing!).word));
        await d.sayIt();
        setOutline(true);
        d.sfx('twinkle');
        await d.say(SHAPES.find((s) => s.id === r.target)!.itIs);
        setMood('open');
        setPhase('choose');
        await d.say('Yum! Feed me!');
      }
    });

  useEffect(() => {
    director.run(async (d) => {
      setMood('happy');
      await d.say("Hungry Shape Monster! Hello! I'm a hungry monster!");
      ask(rounds[0]);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tapShape = (id: ShapeId) => {
    if (phase !== 'choose') {
      cue(SHAPES.find((s) => s.id === id)!.word);
      return;
    }
    if (id !== round.target) {
      playSfx('boing');
      setWrongKey((w) => ({ ...w, [id]: (w[id] ?? 0) + 1 }));
      setWrongCount((c) => c + 1);
      setMood('no');
      director.run(async (d) => {
        await d.say('No, thank you!');
        setMood('open');
        d.sfx('hint');
      });
      return;
    }
    director.run(async (d) => {
      setPhase('eating');
      setFlying(id);
      d.sfx('whoosh');
      await d.wait(750);
      setEaten(id);
      setMood('chomp');
      d.sfx('chomp');
      await d.wait(700);
      setMood('burp');
      d.sfx('burp');
      await d.wait(900);
      setMood('happy');
      d.sfx('giggle');
      await d.wait(500);
      await d.say('Yum!');
      if (round.level === 1) {
        await d.say(SENTENCES.whatShape);
        await d.sayIt();
      }
      celebrate('confetti');
      d.sfx('tada');
      await d.say(SENTENCES.itIsTwice(target.itIs, target.word));
      addStar(MOUTH);
      done.current++;
      setPhase('done');
      if (done.current >= 10) markComplete('monster');
      await d.wait(400);
      // auto-advance to level 2 / finish
      if (ri === rounds.length - 1) {
        if (round.level === 1) await d.say('Level two! Shapes in the room!');
        else {
          await d.wait(500);
          onFinish();
        }
      }
    });
  };

  const goLevel = (l: 1 | 2) => {
    const rs = makeRounds(l);
    setLevel(l);
    setRounds(rs);
    setRi(0);
    ask(rs[0]);
  };

  const next = () => {
    if (phase !== 'done') {
      if (phase === 'choose') tapShape(round.target); // teacher shortcut: feed the right one
      return;
    }
    if (ri < rounds.length - 1) {
      setRi(ri + 1);
      ask(rounds[ri + 1]);
    } else goLevel(2);
  };

  useTeacherControls({ onNext: next });

  const showHint = phase === 'choose' && wrongCount >= 1;
  const showHand = phase === 'choose' && wrongCount >= 2; // can't get stuck: the hand shows the way

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: 'linear-gradient(#FFF6D6, #FFE0B8 60%, #F7C08A)' }}>
      <div className="absolute bottom-0 left-0 right-0 h-[160px] bg-[#9BE15D]" style={{ borderTopLeftRadius: '50% 60px', borderTopRightRadius: '50% 60px' }} />

      {/* level buttons */}
      <div className="absolute left-[30px] top-[24px] flex gap-4">
        <ModeButton active={level === 1} onClick={() => goLevel(1)} color="#fff">
          <div className="grid grid-cols-2 gap-1">
            {SHAPES.map((s) => <ItemArt key={s.id} id={s.id} className="w-full" />)}
          </div>
        </ModeButton>
        <ModeButton active={level === 2} onClick={() => goLevel(2)} color="#fff">
          <ItemArt id="clock" className="w-full" />
        </ModeButton>
      </div>

      {/* speech bubble */}
      <div className="absolute left-[310px] top-[30px] flex min-h-[220px] w-[480px] items-center justify-center gap-4 rounded-[50px] bg-white px-6 py-4 shadow-xl">
        {round.level === 1 ? (
          <>
            <Word text="I want a" say={SENTENCES.iWantShort(target.word)} className="text-[44px] text-slate-700" />
            <button className="tap w-[150px]" onClick={() => cue(target.word)}>
              <ItemArt id={target.id} />
            </button>
          </>
        ) : (
          <div className="relative w-[250px]" onClick={() => cue(item(round.thing!).word)}>
            <ItemArt id={round.thing!} className="w-full" />
            {outline && (
              <svg viewBox="0 0 200 200" className="pointer-events-none absolute inset-0 w-full" overflow="visible">
                <path d={SHAPE_PATHS[round.target]} fill="none" stroke="#FFCA3A" strokeWidth={12} strokeLinejoin="round" pathLength={1} strokeDasharray="1"
                  style={{ animation: 'draw-path 1.2s ease-out both', filter: 'drop-shadow(0 0 8px #FFCA3A)' }} />
              </svg>
            )}
            <div className="absolute -right-12 top-0 text-[80px] font-black text-[#8E5CF7]">{outline ? '' : '?'}</div>
          </div>
        )}
        <div className="absolute -bottom-[30px] left-[60px] h-0 w-0 border-l-[30px] border-r-[30px] border-t-[40px] border-l-transparent border-r-transparent border-t-white" />
      </div>

      {/* the monster */}
      <div className="absolute" style={{ left: MONSTER.left, top: MONSTER.top + 40, width: MONSTER.size }}>
        <Monster mood={mood} className="w-full" />
      </div>

      {/* floating shapes */}
      {order.map((id, i) => {
        const slot = SLOTS[i];
        const isFlying = flying === id;
        if (eaten === id) return null;
        const dx = MOUTH.x + 40 - (slot.x + SHAPE_SIZE / 2);
        const dy = MOUTH.y + 40 - (slot.y + SHAPE_SIZE / 2);
        return (
          <button
            key={`${ri}-${id}`}
            onClick={() => tapShape(id)}
            aria-label={id}
            className="absolute"
            style={{
              left: slot.x, top: slot.y, width: SHAPE_SIZE, height: SHAPE_SIZE,
              transform: isFlying ? `translate(${dx}px, ${dy}px) scale(.25) rotate(540deg)` : undefined,
              transition: isFlying ? 'transform .75s cubic-bezier(.5,-0.3,.7,1)' : undefined,
              zIndex: isFlying ? 10 : 1,
              opacity: phase === 'eating' && !isFlying ? 0.5 : 1,
            }}
          >
            <div className={showHint && id === round.target ? 'hint-glow' : ''}>
              <div key={wrongKey[id] ?? 0} className={wrongKey[id] ? 'wobble' : ''}>
                <div className="float" style={{ animationDelay: `${i * 0.4}s` }}>
                  <svg viewBox="0 0 200 200" className={`w-full ${phase === 'choose' && !showHint ? 'tappable' : ''}`} overflow="visible">
                    <path d={SHAPE_PATHS[id]} fill={SHAPE_COLORS[id]} stroke={SHAPE_COLORS[id]} strokeWidth={id === 'triangle' ? 18 : 6} strokeLinejoin="round" />
                    <path d={SHAPE_PATHS[id]} fill="none" stroke="rgba(255,255,255,.4)" strokeWidth={5} transform="translate(100 100) scale(.85) translate(-100 -100)" />
                  </svg>
                </div>
              </div>
            </div>
            {showHand && id === round.target && <TapHint />}
          </button>
        );
      })}

      {phase === 'done' && (
        <button onClick={next} className="tap pulse absolute bottom-[40px] right-[60px] flex h-[160px] w-[160px] items-center justify-center rounded-full bg-[#8AC926] text-[80px] text-white shadow-[0_10px_0_rgba(0,0,0,.18)]">
          ▶
          <TapHint />
        </button>
      )}
    </div>
  );
}
