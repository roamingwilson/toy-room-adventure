import { useEffect, useMemo, useState } from 'react';
import type { GameProps } from './index';
import { SENTENCES, SHAPES, SILLY, TOYS, type ItemId } from '../content/vocab';
import { useDirector } from '../audio/director';
import { cue } from '../components/cue';
import { ItemArt } from '../components/ItemArt';
import { Teddy, type TeddyMood } from '../components/Teddy';
import { TapHint, shuffle } from '../components/common';
import { addStar, celebrate } from '../components/fx';
import { useTeacherControls } from '../components/teacher';
import { markComplete } from '../state/store';

type Card = { id: ItemId; question: string; plural?: string; silly?: (typeof SILLY)[number] };

function buildDeck(): Card[] {
  const normal: Card[] = shuffle([
    ...TOYS.map((t) => ({ id: t.id, question: SENTENCES.doYouLike(t.plural), plural: t.plural })),
    ...shuffle(SHAPES).slice(0, 3).map((s) => ({ id: s.id, question: SENTENCES.doYouLike(s.plural), plural: s.plural })),
  ]);
  const silly = shuffle(SILLY).slice(0, 3).map((s) => ({ id: s.id, question: s.question, silly: s }));
  // a silly surprise roughly every 3–4 cards (never first)
  const deck: Card[] = [];
  normal.forEach((c, i) => {
    deck.push(c);
    if ((i === 2 || i === 5 || i === 8) && silly.length) deck.push(silly.shift()!);
  });
  return deck;
}

/** 8. Yes, I do! / No, I don't! — stand up for yes, sit down for no. */
export function YesNo(_: GameProps) {
  const director = useDirector();
  const deck = useMemo(buildDeck, []);
  const [i, setI] = useState(0);
  const [phase, setPhase] = useState<'asking' | 'answer' | 'done'>('asking');
  const [answer, setAnswer] = useState<'yes' | 'no' | null>(null);
  const [mood, setMood] = useState<TeddyMood>('idle');
  const card = deck[i];

  const ask = (idx: number) =>
    director.run(async (d) => {
      const c = deck[idx];
      setI(idx);
      setAnswer(null);
      setPhase('asking');
      setMood(c.silly ? 'think' : 'surprised');
      d.sfx(c.silly ? 'slideUp' : 'whoosh');
      await d.wait(500);
      await d.say(c.question, c.silly ? { rate: 0.9 } : undefined);
      if (idx < 2) await d.say(SENTENCES.standSit);
      await d.sayIt();
      setPhase('answer');
      setMood('idle');
    });

  useEffect(() => {
    director.run(async (d) => {
      setMood('wave');
      await d.say("Yes, I do! No, I don't! Stand up for yes! Sit down for no!");
      ask(0);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const choose = (yes: boolean) =>
    director.run(async (d) => {
      setAnswer(yes ? 'yes' : 'no');
      setPhase('done');
      await d.say(yes ? SENTENCES.yesIDo : SENTENCES.noIDont);
      if (card.silly) {
        setMood(yes ? 'laugh' : 'yuck');
        d.sfx(yes ? 'giggle' : 'boing');
        await d.say(yes ? card.silly.yesReply : card.silly.noReply);
      } else if (yes) {
        setMood('dance');
        d.sfx('twinkle');
        celebrate('sparkle', 800, 280);
        await d.say(SENTENCES.meToo(card.plural!));
      } else {
        setMood('shake');
        d.sfx('slideDown');
        await d.say("That's okay!");
      }
      addStar({ x: 800, y: 300 });
      if (i >= 7) markComplete('yesno');
      if (i === deck.length - 1) {
        celebrate('confetti');
        d.sfx('cheer');
        await d.say('Great job, everyone!');
      }
      setMood('happy');
    });

  const next = () => {
    if (phase === 'done') ask(i < deck.length - 1 ? i + 1 : 0);
    else if (phase === 'asking') {
      director.cancel();
      setPhase('answer');
    }
  };
  useTeacherControls({ onNext: next });

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: 'linear-gradient(#FFE6F2, #FFC8E0 60%, #FFB0D2)' }}>
      {/* question */}
      <div key={i} className="pointer-events-none absolute inset-x-0 top-[24px] flex justify-center pop-in [&>*]:pointer-events-auto">
        <button onClick={() => cue(card.question)} className="tap whitespace-nowrap rounded-full bg-white px-10 py-4 text-[54px] font-black text-[#C2185B] shadow-xl">
          {card.question}
        </button>
      </div>

      {/* Teddy holding the item */}
      <div className="absolute left-[600px] top-[150px] w-[400px]">
        <button key={`i${i}`} className="tap pop-in relative z-10 mx-auto block w-[250px]" onClick={() => cue(card.question)}>
          <div className="sway">
            <ItemArt id={card.id} className="w-full drop-shadow-xl" />
          </div>
        </button>
        <div className="-mt-[40px] mx-auto w-[320px]">
          <Teddy mood={mood} />
        </div>
      </div>

      {/* YES */}
      <button
        onClick={() => choose(true)}
        className={`tap absolute left-[50px] top-[200px] flex h-[460px] w-[460px] flex-col items-center justify-center rounded-[70px] bg-[#8AC926] text-white shadow-[0_14px_0_#5E9C12] ${phase === 'answer' ? 'pulse' : ''} ${answer === 'no' ? 'opacity-40' : ''}`}
      >
        <span className="text-[200px] leading-none">👍</span>
        <span className="mt-2 text-[58px] font-black">Yes, I do!</span>
        <span className="mt-2 text-[34px] font-bold opacity-90">🧍 Stand up!</span>
        {phase === 'answer' && <TapHint x="74%" y="62%" />}
      </button>

      {/* NO */}
      <button
        onClick={() => choose(false)}
        className={`tap absolute right-[50px] top-[200px] flex h-[460px] w-[460px] flex-col items-center justify-center rounded-[70px] bg-[#FF595E] text-white shadow-[0_14px_0_#C9363B] ${phase === 'answer' ? 'pulse' : ''} ${answer === 'yes' ? 'opacity-40' : ''}`}
      >
        <span className="text-[200px] leading-none">👎</span>
        <span className="mt-2 text-[58px] font-black">No, I don&apos;t!</span>
        <span className="mt-2 text-[34px] font-bold opacity-90">🪑 Sit down!</span>
        {phase === 'answer' && <TapHint x="74%" y="62%" delay={0.8} />}
      </button>

      <button onClick={() => cue(SENTENCES.standSit)} className="tap absolute bottom-[24px] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/90 px-8 py-3 text-[36px] font-black text-slate-700">
        🧍 Stand up for YES! · 🪑 Sit down for NO!
      </button>

      {phase === 'done' && (
        <button onClick={next} className="tap pulse absolute bottom-[16px] right-[40px] flex h-[124px] w-[124px] items-center justify-center rounded-full bg-[#1982C4] text-[64px] text-white shadow-[0_10px_0_rgba(0,0,0,.18)]">
          ▶
          <TapHint size={80} />
        </button>
      )}
    </div>
  );
}
