import { useEffect, useRef, useState } from 'react';
import type { GameProps } from './index';
import { SHAPES, SENTENCES, type ShapeId } from '../content/vocab';
import { useDirector } from '../audio/director';
import { playMusic, stopMusic } from '../audio/music';
import { cue } from '../components/cue';
import { ItemArt, SHAPE_COLORS, SHAPE_PATHS, ShapeArt } from '../components/ItemArt';
import { Teddy } from '../components/Teddy';
import { BigButton, TapHint, Word, pickOne } from '../components/common';
import { addStar, celebrate } from '../components/fx';
import { useTeacherControls } from '../components/teacher';
import { markComplete } from '../state/store';

type Phase = 'intro' | 'dancing' | 'frozen' | 'drawing' | 'reveal';

const DANCERS: { id: ShapeId; x: number; y: number; delay: number }[] = [
  { id: 'circle', x: 120, y: 140, delay: 0 },
  { id: 'square', x: 1180, y: 300, delay: 0.25 },
  { id: 'triangle', x: 260, y: 480, delay: 0.5 },
  { id: 'heart', x: 1000, y: 540, delay: 0.15 },
];

/** 3. Shape Freeze Dance — dance, freeze, draw the shape in the air! */
export function FreezeDance(_: GameProps) {
  const director = useDirector();
  const [phase, setPhase] = useState<Phase>('intro');
  const [shape, setShape] = useState<ShapeId>('circle');
  const rounds = useRef(0);

  const dance = () =>
    director.run(async (d) => {
      setPhase('dancing');
      playMusic('dance');
      await d.say('Dance, dance, dance!');
    });

  useEffect(() => {
    director.run(async (d) => {
      await d.say('Shape Freeze Dance! When the music stops... freeze!');
      dance();
    });
    return () => stopMusic(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const freeze = () =>
    director.run(async (d) => {
      stopMusic(true);
      const s = pickOne(SHAPES.filter((x) => x.id !== shape));
      setShape(s.id);
      setPhase('frozen');
      await d.say('Freeze!', { rate: 1.1 });
      d.sfx('pop');
      await d.wait(600);
      await d.say(SENTENCES.whatShape);
      await d.sayIt();
      setPhase('drawing');
      await d.say(SENTENCES.drawA(s.word));
      await d.wait(4200);
      setPhase('reveal');
      d.sfx('tada');
      celebrate('confetti');
      await d.say(SENTENCES.itIsTwice(s.itIs, s.word));
      addStar({ x: 800, y: 380 });
      rounds.current++;
      if (rounds.current >= 6) markComplete('freeze');
    });

  const next = () => {
    if (phase === 'dancing') freeze();
    else if (phase === 'reveal' || phase === 'drawing') dance();
  };
  useTeacherControls({ onNext: next });

  const dancing = phase === 'dancing' || phase === 'intro';
  const shapeInfo = SHAPES.find((s) => s.id === shape)!;

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: dancing ? 'linear-gradient(135deg,#FFE3F1,#E6DAFF 50%,#D6F5FF)' : 'linear-gradient(135deg,#E9F3FF,#F4EEFF)', transition: 'background 1s' }}>
      {/* gentle rotating light rays (slow — no flashing) */}
      <div
        className="absolute left-1/2 top-1/2 h-[2400px] w-[2400px] -translate-x-1/2 -translate-y-1/2 opacity-40"
        style={{
          background: 'repeating-conic-gradient(from 0deg, #FFFFFF 0deg 12deg, transparent 12deg 30deg)',
          animation: 'spin 40s linear infinite',
          animationPlayState: dancing ? 'running' : 'paused',
        }}
      />

      {/* dancing shapes */}
      {DANCERS.map((s) => (
        <button
          key={s.id}
          className="tap absolute w-[220px]"
          style={{ left: s.x, top: s.y, opacity: phase === 'frozen' || phase === 'drawing' || phase === 'reveal' ? 0.25 : 1, transition: 'opacity .4s' }}
          onClick={() => cue(SHAPES.find((x) => x.id === s.id)!.word)}
        >
          <div style={{ animation: `dance-shape .97s ease-in-out ${s.delay}s infinite`, animationPlayState: dancing ? 'running' : 'paused' }}>
            <ItemArt id={s.id} className="w-full drop-shadow-lg" />
          </div>
        </button>
      ))}

      <div className="absolute left-[680px] top-[300px] w-[240px]" style={{ opacity: dancing ? 1 : 0, transition: 'opacity .3s' }}>
        <Teddy mood={dancing ? 'dance' : 'surprised'} />
      </div>

      {/* the giant freeze shape */}
      {!dancing && (
        <div className="absolute left-1/2 top-[30px] w-[640px] -translate-x-1/2">
          <div className="text-center">
            <Word text="FREEZE!" say="Freeze!" className="text-[90px] text-[#1982C4] drop-shadow-[0_6px_0_#fff]" />
          </div>
          <div key={shape} className={`relative mx-auto w-[540px] ${phase === 'reveal' ? 'spin-reveal' : 'pop-in'}`}>
            <svg viewBox="0 0 200 200" className="w-full" overflow="visible" onClick={() => cue(shapeInfo.word)}>
              <g opacity={phase === 'drawing' ? 0.3 : 1} style={{ transition: 'opacity .5s' }}>
                <ShapeArt id={shape} face={phase !== 'drawing'} />
              </g>
            </svg>
            {phase === 'drawing' && (
              // separate <svg> so the SMIL timeline starts exactly when drawing begins
              <svg viewBox="0 0 200 200" className="pointer-events-none absolute inset-0 w-full" overflow="visible">
                <path d={SHAPE_PATHS[shape]} fill="none" stroke={SHAPE_COLORS[shape]} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round"
                  pathLength={1} strokeDasharray="1" style={{ animation: 'draw-path 3.6s linear both' }} />
                <g>
                  <circle r={13} fill="#FFCA3A" stroke="#fff" strokeWidth={4} />
                  <text y={-18} fontSize={34} textAnchor="middle">☝️</text>
                  <animateMotion dur="3.6s" fill="freeze" path={SHAPE_PATHS[shape]} />
                </g>
              </svg>
            )}
          </div>
          {(phase === 'drawing' || phase === 'reveal') && (
            <div className="pop-in -mt-4 text-center">
              <Word text={phase === 'drawing' ? SENTENCES.drawA(shapeInfo.word) : shapeInfo.itIs} className="rounded-full bg-white px-10 py-3 text-[56px] text-[#FF595E] shadow-lg" />
            </div>
          )}
        </div>
      )}

      <div className="absolute bottom-[30px] right-[40px]">
        {phase === 'dancing' && (
          <>
            <BigButton onClick={freeze} color="#FF595E" className="h-[180px] w-[300px] !text-[64px]">✋ Stop</BigButton>
            <TapHint />
          </>
        )}
        {(phase === 'reveal' || phase === 'drawing') && (
          <>
            <BigButton onClick={dance} color="#8AC926" className={`h-[180px] w-[300px] !text-[60px] ${phase === 'reveal' ? 'pulse' : ''}`}>💃 Dance</BigButton>
            {phase === 'reveal' && <TapHint />}
          </>
        )}
      </div>
    </div>
  );
}
