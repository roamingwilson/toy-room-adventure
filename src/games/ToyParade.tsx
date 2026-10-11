import { useEffect, useState } from 'react';
import type { GameProps } from './index';
import { TOYS, SENTENCES } from '../content/vocab';
import { useDirector } from '../audio/director';
import { playMusic, stopMusic } from '../audio/music';
import { playSfx } from '../audio/sfx';
import { cue } from '../components/cue';
import { ItemArt } from '../components/ItemArt';
import { Teddy, type TeddyMood } from '../components/Teddy';
import { BigButton, TapHint, Word } from '../components/common';
import { addStar, celebrate } from '../components/fx';
import { useTeacherControls } from '../components/teacher';
import { markComplete } from '../state/store';

type Phase = 'intro' | 'marching' | 'talking' | 'waiting' | 'review' | 'parade';

/** 1. Toy Parade — toys march in one by one and say hello; then a tap-to-review parade. */
export function ToyParade(_: GameProps) {
  const director = useDirector();
  const [phase, setPhase] = useState<Phase>('intro');
  const [idx, setIdx] = useState(-1);
  const [lined, setLined] = useState<number[]>([]);
  const [showWord, setShowWord] = useState(false);
  const [jumping, setJumping] = useState<Record<number, number>>({});
  const [spot, setSpot] = useState<number | null>(null);
  const [teddy, setTeddy] = useState<TeddyMood>('wave');
  const [tapped, setTapped] = useState<number[]>([]);

  const bringToy = (i: number) =>
    director.run(async (d) => {
      setIdx(i);
      setShowWord(false);
      setPhase('marching');
      setTeddy('dance');
      playMusic('march');
      await d.wait(4300); // one phrase of "Yankee Doodle" while the toy marches in
      stopMusic(false);
      setPhase('talking');
      setTeddy('wave');
      d.sfx('pop');
      await d.say(TOYS[i].hello);
      await d.say(SENTENCES.whatIsThis);
      await d.sayIt();
      setShowWord(true);
      d.sfx('tada');
      celebrate('confetti');
      setTeddy('happy');
      await d.say(SENTENCES.thisIsName(TOYS[i].thisIs, TOYS[i].word));
      addStar({ x: 800, y: 320 });
      await d.wait(600);
      setLined((l) => [...l, i]);
      setIdx(-1);
      setTeddy('idle');
      if (i < TOYS.length - 1) {
        setPhase('waiting');
        await d.say('Who is next?');
      } else {
        setPhase('review');
        markComplete('parade');
        await d.say('Hooray! All the toys are here! Tap a toy!');
      }
    });

  useEffect(() => {
    director.run(async (d) => {
      setTeddy('wave');
      await d.say('Toy Parade! Here come the toys!');
      d.sfx('drum');
      await d.wait(300);
      bringToy(0);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const next = () => {
    if (phase === 'waiting') bringToy(lined.length);
    else if (phase === 'review') startParade();
    else if (phase === 'parade') stopParade();
  };

  const startParade = () =>
    director.run(async (d) => {
      setPhase('parade');
      setTeddy('dance');
      playMusic('march');
      await d.say("Parade time! Let's march!");
      for (let loop = 0; loop < 2; loop++) {
        for (let i = 0; i < TOYS.length; i++) {
          setSpot(i);
          setJumping((j) => ({ ...j, [i]: (j[i] ?? 0) + 1 }));
          await d.say(SENTENCES.name(TOYS[i].word));
          await d.wait(250);
        }
      }
      setSpot(null);
      stopMusic(false);
      setPhase('review');
      setTeddy('happy');
      addStar({ x: 800, y: 500 });
      await d.say('Great marching!');
    });

  const stopParade = () => {
    director.cancel();
    stopMusic(false);
    setSpot(null);
    setPhase('review');
    setTeddy('idle');
  };

  useTeacherControls({ onNext: next });

  const tapReview = (i: number) => {
    if (phase !== 'review') {
      cue(SENTENCES.name(TOYS[i].word));
      return;
    }
    setJumping((j) => ({ ...j, [i]: (j[i] ?? 0) + 1 }));
    setTapped((t) => (t.includes(i) ? t : [...t, i]));
    playSfx('pop');
    setSpot(i);
    director.run(async (d) => {
      await d.say(SENTENCES.nameThisIs(TOYS[i].word, TOYS[i].thisIs));
      setSpot(null);
    });
  };

  const reviewMode = phase === 'review' || phase === 'parade';
  // in the review, the hand points at the next toy nobody has tapped yet
  const hintToy = phase === 'review' && spot === null ? TOYS.findIndex((_, i) => !tapped.includes(i)) : -1;
  const toy = idx >= 0 ? TOYS[idx] : null;

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: 'radial-gradient(ellipse at 50% 30%, #FFF1C9 0%, #FFD07A 45%, #E8833A 100%)' }}>
      {/* stage floor + curtains */}
      <div className="absolute bottom-0 left-0 right-0 h-[240px]" style={{ background: 'repeating-linear-gradient(90deg,#C77B3B 0 120px,#B86B32 120px 240px)' }} />
      <div className="absolute bottom-[236px] left-0 right-0 h-[12px] bg-[#8A4B1F]" />
      <div className="absolute left-0 top-0 h-full w-[160px]" style={{ background: 'repeating-linear-gradient(90deg,#D62839 0 40px,#B71C2C 40px 80px)', borderBottomRightRadius: 120 }} />
      <div className="absolute right-0 top-0 h-full w-[160px]" style={{ background: 'repeating-linear-gradient(90deg,#B71C2C 0 40px,#D62839 40px 80px)', borderBottomLeftRadius: 120 }} />
      <div className="absolute left-0 right-0 top-0 h-[70px]" style={{ background: 'radial-gradient(circle at 60px 0, #D62839 58px, transparent 60px) 0 0/120px 70px repeat-x, #B71C2C' }} />
      {/* spotlight */}
      <div className="absolute left-[500px] top-[60px] h-[620px] w-[600px] rounded-full" style={{ background: 'radial-gradient(ellipse at 50% 60%, rgba(255,255,255,.55), transparent 65%)' }} />

      {/* Teddy the host */}
      <div className="absolute transition-all duration-700" style={reviewMode ? { left: 190, top: 80, width: 190 } : { left: 180, top: 360, width: 230 }}>
        <Teddy mood={teddy} />
      </div>

      {/* the marching / talking toy */}
      {toy && (
        <div className="absolute left-[620px] top-[150px] w-[360px]" style={phase === 'marching' ? { animation: 'march-in 4.3s cubic-bezier(.2,.6,.4,1) both' } : undefined}>
          <div style={phase === 'marching' ? { animation: 'march-step .42s ease-in-out infinite' } : undefined} className={phase === 'talking' ? 'jump' : ''}>
            <button className="tap block w-full" onClick={() => cue(toy.hello)}>
              <ItemArt id={toy.id} className="w-full drop-shadow-xl" />
            </button>
          </div>
          {showWord && (
            <div className="pop-in mt-2 text-center">
              <Word text={toy.word} className="rounded-full bg-white px-10 py-3 text-[64px] text-[#FF595E] shadow-lg" />
            </div>
          )}
        </div>
      )}

      {/* toys lined up at the front of the stage */}
      <div className={`absolute left-[200px] right-[200px] flex justify-center gap-4 transition-all duration-700 ${reviewMode ? 'bottom-[150px]' : 'bottom-[20px]'}`}>
        {TOYS.map((t, i) =>
          lined.includes(i) ? (
            <button
              key={t.id}
              onClick={() => tapReview(i)}
              className={`tap relative flex flex-col items-center rise-in ${spot === i ? 'scale-110' : ''} transition-transform`}
              style={{ width: reviewMode ? 190 : 150 }}
            >
              <div key={jumping[i] ?? 0} className={jumping[i] ? 'jump' : ''} style={phase === 'parade' ? { animation: `march-step .42s ease-in-out ${i * 0.07}s infinite` } : undefined}>
                <ItemArt id={t.id} className={`w-full drop-shadow-lg ${phase === 'review' ? 'tappable' : ''}`} />
              </div>
              {hintToy === i && <TapHint y="40%" />}
              {reviewMode && (
                <span className={`mt-1 whitespace-nowrap rounded-full px-4 py-1 text-[30px] font-black ${spot === i ? 'bg-[#FFCA3A] text-white' : 'bg-white/90 text-slate-700'}`}>{t.word}</span>
              )}
            </button>
          ) : (
            <div key={t.id} style={{ width: reviewMode ? 190 : 150 }} />
          ),
        )}
      </div>

      {/* next toy drum */}
      {phase === 'waiting' && (
        <div className="absolute right-[200px] top-[260px] pop-in">
          <BigButton onClick={next} color="#8E5CF7" className="pulse h-[220px] w-[220px] !rounded-full !text-[110px]">🥁</BigButton>
          <TapHint />
        </div>
      )}
      {phase === 'review' && (
        <div className="absolute right-[190px] top-[150px] pop-in">
          <BigButton onClick={next} color="#FF595E" className="pulse">🥁 Parade!</BigButton>
        </div>
      )}
      {phase === 'parade' && (
        <div className="absolute right-[190px] top-[150px]">
          <BigButton onClick={next} color="#1982C4">✋ Stop</BigButton>
        </div>
      )}
    </div>
  );
}

