import { useEffect, useState, useSyncExternalStore } from 'react';
import { progressStore, settingsStore, uiStore, useStore } from '../state/store';
import { getTeacherHandlers, onTeacherHandlersChange } from './teacher';
import { BAR_H } from './fx';

export function toggleFullscreen() {
  const d = document as Document & { webkitFullscreenElement?: Element; webkitExitFullscreen?: () => void };
  const el = document.documentElement as HTMLElement & { webkitRequestFullscreen?: () => void };
  if (document.fullscreenElement || d.webkitFullscreenElement) {
    (document.exitFullscreen?.() ?? d.webkitExitFullscreen?.());
  } else {
    (el.requestFullscreen?.() ?? el.webkitRequestFullscreen?.())?.catch?.(() => {});
  }
}

function BarButton({ children, onClick, title, wide }: { children: React.ReactNode; onClick: () => void; title: string; wide?: boolean }) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={title}
      className={`tap h-[60px] shrink-0 ${wide ? 'px-5' : 'w-[62px]'} rounded-2xl bg-white/10 text-white text-[28px] font-bold hover:bg-white/20 active:bg-white/30 flex items-center justify-center gap-2`}
    >
      {children}
    </button>
  );
}

/** The line for the teacher to read aloud to the class. */
function CueLine() {
  const { cue } = useStore(uiStore);
  if (!cue) return <div className="flex-1" />;
  const long = cue.text.length > 60;
  return (
    <div className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl bg-white px-4 py-1" style={{ height: BAR_H - 16 }} title="Read this aloud to the class">
      <span className="shrink-0 text-[32px] leading-none" aria-hidden>🗣️</span>
      <div
        key={cue.id}
        className={`rise-in line-clamp-2 font-black leading-[1.1] text-[#2B2D42] ${long ? 'text-[24px]' : 'text-[32px]'}`}
        style={{ animationDuration: '.25s' }}
        data-testid="teacher-cue"
      >
        {cue.text}
      </div>
    </div>
  );
}

export function TeacherBar({ inGame, onHome, onSkip, onDone, onSettings }: { inGame: boolean; onHome: () => void; onSkip: () => void; onDone: () => void; onSettings: () => void }) {
  const settings = useStore(settingsStore);
  const { sessionStart } = useStore(progressStore);
  const handlersRef = useSyncExternalStore(onTeacherHandlersChange, getTeacherHandlers);
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(t);
  }, []);
  const mins = sessionStart ? Math.floor((now - sessionStart) / 60000) : 0;

  return (
    <div className="absolute bottom-0 left-0 right-0 z-[60] flex items-center gap-2 px-3 bg-[#1d1b3a]" style={{ height: BAR_H }}>
      <BarButton title="Home map" onClick={onHome}>🏠</BarButton>
      {inGame && (
        <>
          <BarButton title="Next" onClick={() => handlersRef.current.onNext?.()} wide>
            ▶ <span className="text-xl">Next</span>
          </BarButton>
          <BarButton title="Done — mark this game complete" onClick={onDone}>✅</BarButton>
          <BarButton title="Skip to the next game" onClick={onSkip}>⏭</BarButton>
        </>
      )}
      <CueLine />
      <div className="flex shrink-0 items-center gap-2 text-white/80 text-xl">
        <button className="tap text-[28px]" title="Sound on/off" onClick={() => settingsStore.set({ soundOn: !settings.soundOn })}>
          {settings.soundOn ? '🔊' : '🔇'}
        </button>
        <input
          type="range" min={0} max={1} step={0.05} value={settings.volume}
          onChange={(e) => settingsStore.set({ volume: Number(e.target.value) })}
          className="w-24 accent-yellow-300" aria-label="Volume"
        />
      </div>
      <div className="shrink-0 px-2 text-xl font-bold tabular-nums text-white/80" title="Minutes since class started">⏱ {mins}′</div>
      <BarButton title="Settings" onClick={onSettings}>⚙️</BarButton>
      <BarButton title="Fullscreen" onClick={toggleFullscreen}>⛶</BarButton>
    </div>
  );
}
