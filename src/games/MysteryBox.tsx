import { useEffect, useMemo, useState } from 'react';
import type { GameProps } from './index';
import { ROOM, TOYS, SENTENCES, type VocabItem } from '../content/vocab';
import { useDirector } from '../audio/director';
import { cue } from '../components/cue';
import { ItemArt } from '../components/ItemArt';
import { Teddy, type TeddyMood } from '../components/Teddy';
import { TapHint, Word, shuffleNoRepeat, pickOne } from '../components/common';
import { addStar, celebrate } from '../components/fx';
import { useTeacherControls } from '../components/teacher';
import { markComplete } from '../state/store';

type Phase = 'ready' | 'shaking' | 'open' | 'reveal';

const WRAPS = [
  { box: '#FF595E', ribbon: '#FFCA3A' },
  { box: '#1982C4', ribbon: '#FF5DA2' },
  { box: '#8AC926', ribbon: '#8E5CF7' },
  { box: '#8E5CF7', ribbon: '#FFCA3A' },
  { box: '#FF924C', ribbon: '#2EC4B6' },
];

function GiftBox({ wrap, phase }: { wrap: (typeof WRAPS)[number]; phase: Phase }) {
  const opened = phase === 'open' || phase === 'reveal';
  const lidStyle: React.CSSProperties =
    opened
        ? { transform: 'translate(260px,-420px) rotate(70deg)', transition: 'transform .9s cubic-bezier(.3,.8,.4,1)', opacity: 0.0 }
        : {};
  return (
    <svg viewBox="0 0 400 340" className="w-full" overflow="visible">
      <ellipse cx={200} cy={330} rx={170} ry={14} fill="rgba(0,0,0,.15)" />
      {/* body */}
      <rect x={40} y={110} width={320} height={215} rx={18} fill={wrap.box} />
      <rect x={40} y={110} width={320} height={215} rx={18} fill="url(#dots)" />
      <rect x={176} y={110} width={48} height={215} fill={wrap.ribbon} />
      {/* question mark */}
      {!opened && (
        <text x={110} y={260} fontSize={110} fontWeight={900} fill="#fff" opacity={0.85} textAnchor="middle">?</text>
      )}
      {!opened && (
        <text x={290} y={260} fontSize={110} fontWeight={900} fill="#fff" opacity={0.85} textAnchor="middle">?</text>
      )}
      <defs>
        <pattern id="dots" width={40} height={40} patternUnits="userSpaceOnUse">
          <circle cx={10} cy={10} r={6} fill="rgba(255,255,255,.3)" />
          <circle cx={30} cy={30} r={6} fill="rgba(255,255,255,.3)" />
        </pattern>
      </defs>
      {/* lid with bow */}
      <g style={lidStyle}>
        <rect x={20} y={70} width={360} height={56} rx={14} fill={wrap.box} stroke="rgba(0,0,0,.12)" strokeWidth={4} />
        <rect x={172} y={70} width={56} height={56} fill={wrap.ribbon} />
        <path d="M200 70 C150 10 100 30 130 66 Z" fill={wrap.ribbon} stroke="rgba(0,0,0,.15)" strokeWidth={3} />
        <path d="M200 70 C250 10 300 30 270 66 Z" fill={wrap.ribbon} stroke="rgba(0,0,0,.15)" strokeWidth={3} />
        <circle cx={200} cy={68} r={16} fill={wrap.ribbon} stroke="rgba(0,0,0,.15)" strokeWidth={3} />
      </g>
    </svg>
  );
}

/** 2. Mystery Gift Box — shake, open, guess, reveal! Every toy & room item at least twice. */
export function MysteryBox({ onFinish }: GameProps) {
  const director = useDirector();
  const deck = useMemo<VocabItem[]>(() => {
    const all = [...TOYS, ...ROOM];
    return [...shuffleNoRepeat(all, (i) => i.id), ...shuffleNoRepeat(all, (i) => i.id)];
  }, []);
  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState<Phase>('ready');
  const [wrap, setWrap] = useState(WRAPS[0]);
  const [teddy, setTeddy] = useState<TeddyMood>('idle');
  const item = deck[round];

  useEffect(() => {
    director.run(async (d) => {
      setTeddy('wave');
      await d.say("Mystery Gift Box! Look! A present! Tap the box!");
      setTeddy('idle');
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const open = () =>
    director.run(async (d) => {
      setPhase('shaking');
      setTeddy('surprised');
      d.sfx('rattle');
      await d.wait(700);
      d.sfx('rattle');
      await d.wait(900);
      d.sfx('rattle');
      await d.wait(700);
      d.sfx('drumroll');
      await d.wait(1500);
      // pop! the lid flies off and the whole item jumps out
      setPhase('open');
      setTeddy('surprised');
      d.sfx('pop');
      d.sfx('slideUp');
      await d.wait(700);
      setTeddy('think');
      await d.say(SENTENCES.whatIsThis);
      await d.sayIt();
      setPhase('reveal');
      setTeddy('happy');
      d.sfx('tada');
      celebrate('confetti');
      await d.wait(300);
      d.sfx('cheer');
      await d.say(item.thisIs);
      await d.say(SENTENCES.name(item.word));
      addStar({ x: 800, y: 300 });
      setTeddy('idle');
      if (round === deck.length - 1) {
        markComplete('mystery');
        await d.wait(800);
        onFinish();
      }
    });

  const next = () => {
    if (phase === 'ready') return open();
    if (phase === 'reveal' && round < deck.length - 1) {
      director.cancel();
      setRound((r) => r + 1);
      setWrap((w) => pickOne(WRAPS.filter((x) => x !== w)));
      setPhase('ready');
      director.run(async (d) => {
        d.sfx('pop');
        await d.say('A new present! Tap the box!');
      });
    }
  };

  useTeacherControls({ onNext: next });

  const opened = phase === 'open' || phase === 'reveal';

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: 'radial-gradient(circle at 50% 40%, #E3F4FF, #9AD3FF 60%, #6BB6F2)' }}>
      {/* soft spotlights */}
      <div className="absolute left-[420px] top-[40px] h-[700px] w-[760px] rounded-full bg-white/40 blur-2xl" />

      {/* round counter as little gift icons (no reading needed) */}
      <div className="absolute left-[30px] top-[24px] flex max-w-[600px] flex-wrap gap-2">
        {deck.map((_, i) => (
          <div key={i} className={`h-[22px] w-[22px] rounded-md ${i < round || (i === round && phase === 'reveal') ? 'bg-[#FFCA3A]' : 'bg-white/60'}`} />
        ))}
      </div>

      {/* the item rising out of the box */}
      <div
        className="absolute left-[580px] w-[440px] transition-all"
        style={{
          top: opened ? 50 : 300,
          transform: opened ? 'scale(1.05)' : 'scale(.3)',
          opacity: opened ? 1 : 0,
          transitionDuration: '800ms',
          transitionTimingFunction: 'cubic-bezier(.3,1.4,.5,1)',
          zIndex: opened ? 5 : 1,
        }}
      >
        <button className="tap relative block w-full" onClick={() => phase === 'reveal' && cue(item.word)}>
          <ItemArt id={item.id} className="w-full drop-shadow-xl" />
        </button>
        {phase === 'reveal' && (
          <div className="pop-in -mt-2 text-center">
            <Word text={item.word} className="rounded-full bg-white px-10 py-3 text-[64px] text-[#8E5CF7] shadow-lg" />
          </div>
        )}
      </div>

      {/* the gift box */}
      <button
        className={`absolute left-[580px] top-[400px] w-[440px] ${phase === 'shaking' ? 'shake-hard' : phase === 'ready' ? 'pulse' : ''}`}
        style={{ zIndex: 2, transition: 'transform .6s', transform: opened ? 'translateY(120px) scale(.8)' : undefined }}
        onClick={() => (phase === 'ready' ? open() : undefined)}
        aria-label="Gift box"
      >
        <GiftBox key={round} wrap={wrap} phase={phase} />
        {phase === 'ready' && <TapHint y="62%" />}
      </button>

      <div className="absolute left-[150px] top-[420px] w-[260px]">
        <Teddy mood={teddy} />
      </div>

      {phase === 'reveal' && round < deck.length - 1 && (
        <button onClick={next} className="tap pulse absolute right-[120px] top-[520px] flex h-[160px] w-[160px] items-center justify-center rounded-full bg-[#8AC926] text-[80px] text-white shadow-[0_10px_0_rgba(0,0,0,.18)]">
          🎁
          <TapHint />
        </button>
      )}
    </div>
  );
}
