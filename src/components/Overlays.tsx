import { useEffect } from 'react';
import { resetClass, settingsStore, uiStore, useStore } from '../state/store';
import { cue } from './cue';
import { skipSayIt } from '../audio/director';
import { playSfx } from '../audio/sfx';
import { Teddy } from './Teddy';
import { StarShape } from './StarJar';
import { TapHint } from './common';

/** Big pulsing "🗣️ Say it!" prompt shown while the class shouts the answer. Tap to reveal now. */
export function SayItBubble() {
  const { sayIt } = useStore(uiStore);
  if (!sayIt) return null;
  return (
    <div key={sayIt.id} className="pointer-events-none absolute inset-x-0 top-[34px] z-[55] flex justify-center">
      <button onClick={skipSayIt} className="pointer-events-auto pop-in" aria-label="Say it! Tap to reveal">
        <div className="sayit flex items-center gap-4 rounded-[48px] bg-white px-10 py-4 shadow-[0_10px_0_rgba(0,0,0,.15)] border-[6px] border-[#FFCA3A]">
          <span className="text-[86px] leading-none">🗣️</span>
          <span className="text-[64px] font-black text-[#FF595E] leading-none">Say it!</span>
        </div>
        <div className="mx-auto mt-3 h-3 w-[70%] rounded-full bg-white/50 overflow-hidden">
          <div className="h-full bg-[#FFCA3A] origin-left" style={{ animation: `sayit-bar ${sayIt.ms}ms linear forwards` }} />
        </div>
      </button>
    </div>
  );
}

export function CompleteOverlay({ onHome, onNext, hasNext }: { onHome: () => void; onNext: () => void; hasNext: boolean }) {
  const { overlay } = useStore(uiStore);
  useEffect(() => {
    if (overlay === 'complete') {
      playSfx('cheer');
      cue('Great job, everyone!');
    }
  }, [overlay]);
  if (overlay !== 'complete') return null;
  return (
    <div className="absolute inset-0 z-[58] flex items-center justify-center bg-[#1d1b3a]/60 fade-in">
      <div className="pop-in flex flex-col items-center gap-6 rounded-[60px] bg-white px-20 py-10 shadow-2xl">
        <div className="flex items-end gap-4">
          <StarShape size={90} className="float" />
          <Teddy mood="happy" style={{ width: 220 }} />
          <StarShape size={90} className="float" />
        </div>
        <div className="text-[72px] font-black text-[#FF595E]" onClick={() => cue('Great job!')}>Great job!</div>
        <div className="flex gap-6">
          <button onClick={onHome} className="tap rounded-[36px] bg-[#1982C4] px-10 py-5 text-[48px] font-black text-white">🏠 Map</button>
          {hasNext && (
            <button onClick={onNext} className="tap pulse relative rounded-[36px] bg-[#8AC926] px-10 py-5 text-[48px] font-black text-white">
              ▶ Next game
              <TapHint />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function SettingsModal({ onClose }: { onClose: () => void }) {
  const s = useStore(settingsStore);
  const row = 'flex items-center justify-between gap-6 py-3 border-b border-slate-200';

  return (
    <div className="absolute inset-0 z-[70] flex items-center justify-center bg-black/50 fade-in" onClick={onClose}>
      <div className="w-[900px] rounded-[36px] bg-white p-10 text-slate-800 shadow-2xl text-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-4xl font-black">⚙️ Teacher Settings</h2>
          <button onClick={onClose} className="tap rounded-2xl bg-slate-100 px-6 py-3 text-3xl font-black">✕</button>
        </div>
        <div className={row}>
          <label>
            Time to read each line: {s.readPace === 1 ? 'normal' : s.readPace < 1 ? 'shorter' : 'longer'}
            <span className="block text-lg text-slate-400">Lines to read aloud appear in the bar at the bottom of the screen.</span>
          </label>
          <input type="range" min={0.6} max={1.8} step={0.1} value={s.readPace} onChange={(e) => settingsStore.set({ readPace: Number(e.target.value) })} className="w-[360px]" />
        </div>
        <div className={row}>
          <label>"Say it!" pause before reveal: {s.pauseSec} s</label>
          <input type="range" min={2} max={6} step={0.5} value={s.pauseSec} onChange={(e) => settingsStore.set({ pauseSec: Number(e.target.value) })} className="w-[360px]" />
        </div>
        <div className={row}>
          <label>Sound effects &amp; music</label>
          <input type="checkbox" className="h-8 w-8" checked={s.soundOn} onChange={(e) => settingsStore.set({ soundOn: e.target.checked })} />
        </div>
        <div className={row}>
          <label>Background music</label>
          <input type="checkbox" className="h-8 w-8" checked={s.musicOn} onChange={(e) => settingsStore.set({ musicOn: e.target.checked })} />
        </div>
        <div className="mt-6 flex items-center justify-end gap-4">
          <button
            className="tap rounded-2xl bg-[#FF595E] px-6 py-3 font-bold text-white"
            onClick={() => {
              if (confirm('Start a new class? This empties the Star Jar, clears the map stars and restarts the timer.')) {
                resetClass();
                onClose();
              }
            }}
          >
            🔄 New class (reset stars &amp; timer)
          </button>
        </div>
        <p className="mt-6 text-lg text-slate-500">
          Tip: tap the "Say it!" bubble to reveal the answer early. Edit words in <code>src/content/vocab.ts</code>.
        </p>
      </div>
    </div>
  );
}
