import { useEffect } from 'react';
import { progressStore, useStore, type GameId } from '../state/store';
import { cue } from './cue';
import { playSfx } from '../audio/sfx';
import { ACTIVITIES } from './activities';
import { ItemArt } from './ItemArt';
import { Teddy } from './Teddy';
import { Monster } from './Monster';
import { StarShape } from './StarJar';
import { GAME_H } from './fx';
import { TapHint } from './common';

const STOPS = [
  { x: 160, y: 310 }, { x: 470, y: 225 }, { x: 740, y: 300 }, { x: 1010, y: 220 }, { x: 1280, y: 320 },
  { x: 1300, y: 575 }, { x: 1030, y: 615 }, { x: 760, y: 555 }, { x: 490, y: 620 }, { x: 210, y: 575 },
];

/** Smooth Catmull-Rom curve through the stops. */
function pathThrough(pts: { x: number; y: number }[]) {
  let d = `M${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] ?? p2;
    d += ` C${p1.x + (p2.x - p0.x) / 6} ${p1.y + (p2.y - p0.y) / 6} ${p2.x - (p3.x - p1.x) / 6} ${p2.y - (p3.y - p1.y) / 6} ${p2.x} ${p2.y}`;
  }
  return d;
}

export function HomeMap({ onPlay, greeting }: { onPlay: (id: GameId) => void; greeting?: string }) {
  const { completed } = useStore(progressStore);
  const nextIdx = Math.max(0, ACTIVITIES.findIndex((a) => !completed.includes(a.id)));
  const allDone = completed.length >= ACTIVITIES.length;

  useEffect(() => {
    const t = setTimeout(() => cue(allDone ? 'Great job! We did everything!' : greeting ?? "Let's play!"), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allDone]);

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ height: GAME_H, background: 'linear-gradient(#8ED6FF 0%, #C8ECFF 45%, #9BE15D 45%, #6CC04A 100%)' }}>
      {/* sun + clouds */}
      <div className="absolute left-[1180px] top-[30px] h-[110px] w-[110px] rounded-full bg-[#FFE066] shadow-[0_0_60px_#FFE066]" />
      {[{ l: 80, t: 60, s: 1 }, { l: 620, t: 40, s: 0.8 }, { l: 900, t: 110, s: 0.6 }].map((c, i) => (
        <div key={i} className="absolute float" style={{ left: c.l, top: c.t, transform: `scale(${c.s})`, animationDelay: `${i * 0.7}s` }}>
          <div className="relative h-[60px] w-[180px] rounded-full bg-white/90">
            <div className="absolute -top-[34px] left-[30px] h-[70px] w-[70px] rounded-full bg-white/90" />
            <div className="absolute -top-[20px] left-[85px] h-[56px] w-[56px] rounded-full bg-white/90" />
          </div>
        </div>
      ))}

      <button
        className="tap absolute left-[40px] top-[24px] text-left"
        onClick={() => cue('Toy Room Adventure!')}
      >
        <div className="text-[64px] font-black text-white drop-shadow-[0_5px_0_#FF595E] leading-none">Toy Room</div>
        <div className="text-[64px] font-black text-[#FFCA3A] drop-shadow-[0_5px_0_#8E5CF7] leading-none">Adventure!</div>
      </button>

      <svg className="absolute inset-0 pointer-events-none" width={1600} height={GAME_H}>
        <path d={pathThrough(STOPS)} stroke="#F7E3B5" strokeWidth={46} fill="none" strokeLinecap="round" />
        <path d={pathThrough(STOPS)} stroke="#fff" strokeWidth={8} strokeDasharray="4 26" fill="none" strokeLinecap="round" />
      </svg>

      {ACTIVITIES.map((a, i) => {
        const p = STOPS[i];
        const done = completed.includes(a.id);
        const isNext = i === nextIdx && !allDone;
        return (
          <button
            key={a.id}
            className="tap absolute flex flex-col items-center"
            style={{ left: p.x - 85, top: p.y - 85, width: 170 }}
            onClick={() => {
              playSfx('pop');
              onPlay(a.id);
            }}
          >
            <div
              className={`relative flex h-[170px] w-[170px] items-center justify-center rounded-full border-[8px] border-white shadow-[0_10px_0_rgba(0,0,0,.18)] ${isNext ? 'pulse' : ''}`}
              style={{ background: a.color }}
            >
              <div className="h-[118px] w-[118px]">
                {a.icon === 'teddy-mascot' ? (
                  <Teddy mood="wave" className="h-full w-full" />
                ) : a.icon === 'monster' ? (
                  <Monster className="h-full w-full" />
                ) : a.icon === 'escape' ? (
                  <div className="relative h-full w-full">
                    <Monster className="absolute -left-2 bottom-0 w-[62%]" mood="open" />
                    <Teddy mood="surprised" className="absolute -right-1 top-0 w-[62%]" />
                  </div>
                ) : (
                  <ItemArt id={a.icon as never} className="h-full w-full" />
                )}
              </div>
              <div className="absolute -left-2 -top-2 flex h-[52px] w-[52px] items-center justify-center rounded-full bg-white text-[30px] font-black" style={{ color: a.color }}>
                {i + 1}
              </div>
              {isNext && <TapHint size={90} />}
              {done && (
                <div className="absolute -right-4 -top-4 pop-in">
                  <StarShape size={70} />
                </div>
              )}
            </div>
            <div className="mt-2 whitespace-nowrap rounded-full bg-white/90 px-4 py-1 text-[22px] font-black text-slate-700">
              {a.name} <span className="text-slate-400 text-[18px]">· {a.minutes}′</span>
            </div>
          </button>
        );
      })}

      {!allDone && (
        <div className="pointer-events-none absolute transition-all duration-700" style={{ left: STOPS[nextIdx].x + 70, top: STOPS[nextIdx].y - 110, width: 120 }}>
          <Teddy mood="wave" />
        </div>
      )}
      {allDone && (
        <div className="pointer-events-none absolute left-[1250px] top-[560px] w-[200px]">
          <Teddy mood="dance" />
        </div>
      )}
    </div>
  );
}
