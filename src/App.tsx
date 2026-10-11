import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { progressStore, markComplete, resetClass, uiStore, type GameId } from './state/store';
import { clearCue } from './components/cue';
import { unlockAudio, playSfx } from './audio/sfx';
import { stopMusic } from './audio/music';
import { SENTENCES } from './content/vocab';
import { STAGE_H, STAGE_W, GAME_H, registerStage } from './components/fx';
import { Celebration } from './components/Celebration';
import { StarJar, FlyingStars } from './components/StarJar';
import { TeacherBar, toggleFullscreen } from './components/TeacherBar';
import { SayItBubble, CompleteOverlay, SettingsModal } from './components/Overlays';
import { HomeMap } from './components/HomeMap';
import { Teddy } from './components/Teddy';
import { ACTIVITIES } from './components/activities';
import { BigButton, TapHint } from './components/common';
import { GAMES } from './games';

type Screen = { kind: 'start' } | { kind: 'home' } | { kind: 'game'; id: GameId };

/** Scales the fixed 1600×900 stage to fit any screen (letterboxed, 16:9, centred). */
function useStageFit() {
  const [fit, setFit] = useState({ scale: 1, left: 0, top: 0 });
  useLayoutEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const scale = Math.min(w / STAGE_W, h / STAGE_H);
      setFit({ scale, left: (w - STAGE_W * scale) / 2, top: (h - STAGE_H * scale) / 2 });
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return fit;
}

function StartScreen({ onStart }: { onStart: (fresh: boolean) => void }) {
  const hasProgress = progressStore.get().stars > 0 || progressStore.get().completed.length > 0;
  return (
    <div className="absolute inset-0 flex items-center justify-center gap-16" style={{ background: 'radial-gradient(circle at 50% 40%, #FFE8A3, #FF924C 70%, #FF595E)' }}>
      <div className="w-[420px] float">
        <Teddy mood="wave" />
      </div>
      <div className="flex flex-col items-center gap-8">
        <div className="text-center">
          <div className="text-[110px] font-black text-white drop-shadow-[0_8px_0_#8E5CF7] leading-none">Toy Room</div>
          <div className="text-[110px] font-black text-[#FFE066] drop-shadow-[0_8px_0_#1982C4] leading-none">Adventure!</div>
        </div>
        <div className="relative">
          <BigButton onClick={() => onStart(false)} color="#8AC926" className="pulse px-20 py-6 !text-[80px]">
            ▶ Play
          </BigButton>
          <TapHint />
        </div>
        <div className="flex gap-4">
          {hasProgress && (
            <button className="tap rounded-2xl bg-white/30 px-6 py-3 text-2xl font-bold text-white" onClick={() => onStart(true)}>
              🔄 New class
            </button>
          )}
          <button className="tap rounded-2xl bg-white/30 px-6 py-3 text-2xl font-bold text-white" onClick={toggleFullscreen}>
            ⛶ Fullscreen
          </button>
        </div>
        <div className="text-xl text-white/80">Teacher: tap ▶ Play to start the sound and the class timer.</div>
      </div>
    </div>
  );
}

export default function App() {
  const { scale, left, top } = useStageFit();
  const stageRef = useRef<HTMLDivElement>(null);
  const [screen, setScreen] = useState<Screen>({ kind: 'start' });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [greeting, setGreeting] = useState<string | undefined>();

  useLayoutEffect(() => registerStage(stageRef.current, scale), [scale]);

  // Leaving a screen: hush everything.
  useEffect(() => {
    uiStore.set({ overlay: null, sayIt: null });
    return () => {
      clearCue();
      stopMusic(false);
    };
  }, [screen]);

  const start = (fresh: boolean) => {
    unlockAudio();
    const p = progressStore.get();
    // A class is ~90 minutes: restart the timer if the last session is old.
    if (fresh) resetClass();
    else if (!p.sessionStart || Date.now() - p.sessionStart > 4 * 3600_000) progressStore.set({ sessionStart: Date.now() });
    playSfx('cheer');
    setGreeting(SENTENCES.welcome);
    setScreen({ kind: 'home' });
  };

  const goGame = (id: GameId) => {
    setGreeting(undefined);
    setScreen({ kind: 'game', id });
  };
  const currentIdx = screen.kind === 'game' ? ACTIVITIES.findIndex((a) => a.id === screen.id) : -1;
  const nextGame = currentIdx >= 0 && currentIdx < ACTIVITIES.length - 1 ? ACTIVITIES[currentIdx + 1].id : null;

  const finish = () => {
    if (screen.kind !== 'game') return;
    markComplete(screen.id);
    uiStore.set({ overlay: 'complete', sayIt: null });
  };

  const Game = screen.kind === 'game' ? GAMES[screen.id] : null;

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#1d1b3a]">
      <div
        ref={stageRef}
        className="absolute overflow-hidden"
        style={{ left, top, width: STAGE_W, height: STAGE_H, transform: `scale(${scale})`, transformOrigin: '0 0' }}
      >
        {screen.kind === 'start' ? (
          <StartScreen onStart={start} />
        ) : (
          <>
            <div className="absolute left-0 right-0 top-0 overflow-hidden" style={{ height: GAME_H }}>
              {screen.kind === 'home' && (
                <HomeMap
                  onPlay={goGame}
                  greeting={greeting}
                />
              )}
              {Game && screen.kind === 'game' && <Game key={screen.id} onFinish={finish} />}
              <StarJar />
              <SayItBubble />
            </div>
            <TeacherBar
              inGame={screen.kind === 'game'}
              onHome={() => setScreen({ kind: 'home' })}
              onSkip={() => (nextGame ? goGame(nextGame) : setScreen({ kind: 'home' }))}
              onDone={finish}
              onSettings={() => setSettingsOpen(true)}
            />
            <CompleteOverlay
              hasNext={!!nextGame}
              onHome={() => setScreen({ kind: 'home' })}
              onNext={() => nextGame && goGame(nextGame)}
            />
          </>
        )}
        <Celebration />
        <FlyingStars />
        {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
      </div>
    </div>
  );
}
