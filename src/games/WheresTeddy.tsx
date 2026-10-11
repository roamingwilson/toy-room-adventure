import { useEffect, useRef, useState } from 'react';
import type { GameProps } from './index';
import { HIDING_SPOTS, SENTENCES, item, type Prep, type RoomId } from '../content/vocab';
import { useDirector } from '../audio/director';
import { cue } from '../components/cue';
import { playSfx, type SfxName } from '../audio/sfx';
import { BedArt, ClockArt, DoorArt, LampArt, ToyBoxArt, WindowArt } from '../components/ItemArt';
import { Teddy, type TeddyMood } from '../components/Teddy';
import { ModeButton, TapHint, pickOne } from '../components/common';
import { addStar, celebrate, stagePoint } from '../components/fx';
import { useTeacherControls } from '../components/teacher';
import { markComplete } from '../state/store';

/** Room layout in stage pixels: each object is a square box drawn from its 200×200 art. */
const OBJECTS: Record<RoomId, { x: number; y: number; size: number }> = {
  bed: { x: 20, y: 300, size: 480 },
  lamp: { x: 480, y: 290, size: 400 },
  window: { x: 760, y: 70, size: 300 },
  clock: { x: 180, y: 50, size: 200 },
  toybox: { x: 1050, y: 470, size: 300 },
  door: { x: 1300, y: 210, size: 380 },
};

/** Where Teddy sits for each hiding spot: centre x, feet y, width. */
const SPOT_POS: Record<string, { x: number; bottom: number; w: number }> = {
  'in-toybox': { x: 1200, bottom: 690, w: 165 },
  'on-toybox': { x: 1200, bottom: 574, w: 140 },
  'on-bed': { x: 300, bottom: 535, w: 150 },
  'under-bed': { x: 260, bottom: 768, w: 112 },
  'under-lamp': { x: 622, bottom: 662, w: 104 },
  'on-lamp': { x: 680, bottom: 338, w: 110 },
  'in-window': { x: 910, bottom: 338, w: 140 },
  'under-window': { x: 910, bottom: 735, w: 130 },
};
const teddyH = (w: number) => w * 1.2;

const SILLY: SfxName[] = ['boing', 'slideDown', 'giggle', 'burp'];

type Mode = 'hide' | 'drag';
type Phase = 'intro' | 'hiding' | 'seeking' | 'found' | 'free';

/** 5. Where's Teddy? — Teddy hides in / on / under things. Tap to find him, or drag him around. */
export function WheresTeddy(_: GameProps) {
  const director = useDirector();
  const [mode, setMode] = useState<Mode>('hide');
  const [phase, setPhase] = useState<Phase>('intro');
  const [spotId, setSpotId] = useState('on-bed');
  const [dark, setDark] = useState(false);
  const [mood, setMood] = useState<TeddyMood>('wave');
  const [shakeKey, setShakeKey] = useState<Record<string, number>>({});
  const [wrong, setWrong] = useState(0);
  const [label, setLabel] = useState<{ prep: Prep; obj: RoomId } | null>(null);
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null);
  const [dragged, setDragged] = useState(false);
  const found = useRef(0);

  const spot = HIDING_SPOTS.find((s) => s.id === spotId)!;
  const pos = SPOT_POS[spotId];

  const hide = () =>
    director.run(async (d) => {
      setPhase('hiding');
      setLabel(null);
      setWrong(0);
      setMood('cover');
      await d.say('Close your eyes! Teddy is hiding!');
      d.sfx('lightsOff');
      setDark(true);
      await d.wait(900);
      setSpotId((cur) => pickOne(HIDING_SPOTS.filter((s) => s.id !== cur)).id);
      d.sfx('giggle');
      await d.wait(1600);
      setDark(false);
      setPhase('seeking');
      await d.wait(700);
      await d.say(SENTENCES.openYourEyes);
    });

  useEffect(() => {
    director.run(async (d) => {
      setMood('wave');
      await d.say("Where's Teddy? This is Teddy's bedroom! Let's play hide and seek!");
      hide();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reveal = () =>
    director.run(async (d) => {
      setPhase('found');
      setMood('surprised');
      d.sfx('slideUp');
      await d.wait(300);
      d.sfx('giggle');
      await d.say('Peek-a-boo!');
      setMood('happy');
      await d.say(SENTENCES.whereIsTeddy);
      await d.sayIt();
      setLabel({ prep: spot.prep, obj: spot.object });
      d.sfx('tada');
      celebrate('confetti');
      await d.say(SENTENCES.teddyIs(spot.prep, item(spot.object).word));
      addStar({ x: pos.x, y: pos.bottom - 80 });
      found.current++;
      if (found.current >= 6) markComplete('where');
      setMood('wave');
    });

  const tapObject = (id: RoomId) => {
    if (mode === 'drag' || phase !== 'seeking') {
      cue(item(id).word);
      setShakeKey((k) => ({ ...k, [id]: (k[id] ?? 0) + 1 }));
      return;
    }
    setShakeKey((k) => ({ ...k, [id]: (k[id] ?? 0) + 1 }));
    if (id === spot.object) {
      reveal();
    } else {
      playSfx(pickOne(SILLY));
      setWrong((w) => w + 1);
      director.run(async (d) => {
        await d.say(SENTENCES.notThe(item(id).word));
      });
    }
  };

  // ----- drag mode -----
  const sayWhere = (sid: string) => {
    const s = HIDING_SPOTS.find((h) => h.id === sid)!;
    setLabel({ prep: s.prep, obj: s.object });
    setMood('happy');
    director.run(async (d) => {
      d.sfx('pop');
      await d.say(SENTENCES.teddyIs(s.prep, item(s.object).word));
      setMood('idle');
    });
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (mode !== 'drag') return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    setLabel(null);
    setMood('surprised');
    setDrag(stagePoint(e.clientX, e.clientY));
    setDragged(true);
    playSfx('pop');
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (drag) setDrag(stagePoint(e.clientX, e.clientY));
  };
  const onPointerUp = () => {
    if (!drag) return;
    let best: string | null = null;
    let bestD = 230;
    for (const [id, p] of Object.entries(SPOT_POS)) {
      const cy = p.bottom - teddyH(p.w) / 2;
      const dd = Math.hypot(drag.x - p.x, drag.y - cy);
      if (dd < bestD) {
        bestD = dd;
        best = id;
      }
    }
    setDrag(null);
    if (best) {
      setSpotId(best);
      sayWhere(best);
    } else {
      playSfx('boing');
      setMood('idle');
      sayWhere(spotId);
    }
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    setDark(false);
    if (m === 'drag') {
      director.cancel();
      setPhase('free');
      setLabel(null);
      setMood('wave');
      director.run(async (d) => {
        await d.say('Move Teddy! Where is Teddy?');
      });
    } else hide();
  };

  const next = () => {
    if (mode === 'drag') {
      const s = pickOne(HIDING_SPOTS.filter((h) => h.id !== spotId)).id;
      setSpotId(s);
      sayWhere(s);
    } else if (phase === 'found') hide();
    else if (phase === 'seeking') reveal();
  };
  useTeacherControls({ onNext: next });

  const teddyVisible = phase === 'intro' || phase === 'found' || phase === 'free' || (phase === 'hiding' && !dark && mood === 'cover');
  const inBox = spotId === 'in-toybox' && !drag;
  const seeking = mode === 'hide' && phase === 'seeking';
  const hintObj = seeking && wrong >= 2 ? spot.object : null;

  const teddyStyle: React.CSSProperties = drag
    ? { left: drag.x - 70, top: drag.y - 84, width: 140, zIndex: 30 }
    : { left: pos.x - pos.w / 2, top: pos.bottom - teddyH(pos.w), width: pos.w, zIndex: inBox ? 6 : 20, transition: phase === 'free' ? 'left .3s, top .3s' : undefined };

  const objectButton = (id: RoomId, art: JSX.Element, z = 5) => {
    const o = OBJECTS[id];
    return (
      <button
        key={id}
        className="absolute"
        style={{ left: o.x, top: o.y, width: o.size, height: o.size, zIndex: z }}
        onClick={() => tapObject(id)}
        aria-label={item(id).word}
      >
        <div className={hintObj === id ? 'hint-glow' : ''} style={{ width: '100%', height: '100%' }}>
          <div key={shakeKey[id] ?? 0} className={shakeKey[id] ? 'wobble' : ''} style={{ width: '100%', height: '100%' }}>
            <svg viewBox="0 0 200 200" className={`h-full w-full ${seeking && hintObj !== id ? 'tappable' : ''}`} overflow="visible">{art}</svg>
          </div>
        </div>
        {hintObj === id && <TapHint />}
      </button>
    );
  };

  const boxOpen = phase === 'found' && spotId === 'in-toybox' && mode === 'hide';

  return (
    <div className="absolute inset-0 overflow-hidden" onPointerMove={onPointerMove} onPointerUp={onPointerUp} style={{ touchAction: 'none' }}>
      {/* wall + floor */}
      <div className="absolute inset-0" style={{ background: 'repeating-linear-gradient(90deg,#FFE9F0 0 60px,#FFDDE8 60px 120px)' }} />
      <div className="absolute bottom-0 left-0 right-0 h-[250px]" style={{ background: 'repeating-linear-gradient(90deg,#E8B07A 0 160px,#DDA06A 160px 320px)' }} />
      <div className="absolute bottom-[244px] left-0 right-0 h-[14px] bg-white/80" />
      <div className="absolute bottom-[40px] left-[560px] h-[120px] w-[520px] rounded-[50%] bg-[#8AC926]/50" />

      {objectButton('clock', <ClockArt />)}
      {objectButton('window', <WindowArt />)}
      {objectButton('door', <DoorArt />)}
      {objectButton('bed', <BedArt />)}
      {objectButton('lamp', <LampArt on={!dark} />)}
      {/* toy box drawn in two layers so Teddy can sit IN it */}
      <div className="pointer-events-none absolute" style={{ left: OBJECTS.toybox.x, top: OBJECTS.toybox.y, width: OBJECTS.toybox.size, height: OBJECTS.toybox.size, zIndex: 4 }}>
        <svg viewBox="0 0 200 200" className="h-full w-full" overflow="visible">
          <ToyBoxArt open={boxOpen || (mode === 'drag' && inBox)} layer="back" />
        </svg>
      </div>
      {objectButton('toybox', <ToyBoxArt open={boxOpen || (mode === 'drag' && inBox)} layer="front" />, 8)}

      {/* Teddy */}
      {(teddyVisible || drag) && (
        <div
          className={`absolute ${phase === 'found' && !drag ? 'pop-in' : ''} ${mode === 'drag' ? 'cursor-grab' : ''}`}
          style={{ ...teddyStyle, pointerEvents: mode === 'drag' ? 'auto' : 'none', touchAction: 'none' }}
          onPointerDown={onPointerDown}
        >
          <Teddy mood={mood} />
          {mode === 'drag' && !dragged && !drag && <TapHint y="55%" />}
        </div>
      )}

      {/* the preposition highlight */}
      {label && !drag && (
        <>
          <div className="pointer-events-none absolute z-[25]" style={{ left: pos.x - 50, top: pos.bottom - teddyH(pos.w) - 150 }}>
            <svg viewBox="0 0 100 120" width={100} height={120} style={{ animation: 'bounce-arrow .8s ease-in-out infinite', filter: 'drop-shadow(0 4px 0 rgba(0,0,0,.2))' }}>
              <path d="M30 6 H70 V60 H94 L50 114 L6 60 H30 Z" fill="#FFCA3A" stroke="#fff" strokeWidth={7} strokeLinejoin="round" />
            </svg>
          </div>
          <div className="pointer-events-none absolute z-[26] inset-x-0 top-[16px] flex justify-center pop-in [&>*]:pointer-events-auto">
            <button
              onClick={() => cue(SENTENCES.teddyIs(label.prep, item(label.obj).word))}
              className="tap whitespace-nowrap rounded-full bg-white px-10 py-4 text-[54px] font-black text-slate-700 shadow-xl"
            >
              Teddy is <span className="rounded-2xl bg-[#FFCA3A] px-4 text-white">{label.prep.toUpperCase()}</span> the {item(label.obj).word}.
            </button>
          </div>
        </>
      )}

      {/* lights off */}
      <div className="pointer-events-none absolute inset-0 z-[40] bg-[#0b0a24] transition-opacity duration-1000" style={{ opacity: dark ? 0.82 : 0 }} />
      {dark && <div className="pointer-events-none absolute left-1/2 top-[300px] z-[41] -translate-x-1/2 text-[120px]">🙈</div>}

      {/* mode buttons */}
      <div className="absolute left-[24px] top-[20px] z-[45] flex flex-col gap-3">
        <ModeButton active={mode === 'hide'} onClick={() => switchMode('hide')} color="#fff">
          <div className="text-[64px] leading-none">🙈</div>
        </ModeButton>
        <ModeButton active={mode === 'drag'} onClick={() => switchMode('drag')} color="#fff">
          <div className="text-[64px] leading-none">✋</div>
        </ModeButton>
      </div>
      {mode === 'hide' && phase === 'found' && (
        <button onClick={hide} className="tap pulse absolute bottom-[30px] right-[60px] z-[45] flex h-[150px] w-[150px] items-center justify-center rounded-full bg-[#8AC926] text-[76px] text-white shadow-[0_10px_0_rgba(0,0,0,.18)]">
          🙈
          <TapHint />
        </button>
      )}
    </div>
  );
}
