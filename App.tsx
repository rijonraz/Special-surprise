
import React, { useState, useRef, useCallback } from 'react';
import { useCountdown } from './hooks/useCountdown';
import ThreeScene from './components/ThreeScene';
import type { ThreeSceneHandle } from './types';

const App: React.FC = () => {
  const [armyMode, setArmyMode] = useState(false);
  const [sakuraEnabled, setSakuraEnabled] = useState(true);
  const [lightstickOn, setLightstickOn] = useState(true);
  const [performanceMode, setPerformanceMode] = useState(false);
  const [tiltEnabled, setTiltEnabled] = useState(false);
  
  const threeSceneRef = useRef<ThreeSceneHandle>(null);
  const { days, hours, minutes, seconds, isBirthday } = useCountdown();

  const buzz = (pattern: number | number[] = 10) => {
    if (navigator.vibrate) navigator.vibrate(pattern);
  };

  const handleArmyToggle = useCallback(() => {
    setArmyMode(prev => !prev);
    buzz(12);
  }, []);
  
  const handleFireworks = useCallback(() => {
    threeSceneRef.current?.triggerFireworks();
  }, []);

  const handleSakuraToggle = useCallback(() => {
    setSakuraEnabled(prev => !prev);
    buzz();
  }, []);

  const handleLightstickToggle = useCallback(() => {
    setLightstickOn(prev => !prev);
    buzz();
  }, []);
  
  const handlePerformanceToggle = useCallback(() => {
    setPerformanceMode(prev => !prev);
    buzz(8);
  }, []);
  
  const handleTiltToggle = useCallback(async () => {
    if (tiltEnabled) return;
    const enabled = await threeSceneRef.current?.toggleTilt();
    setTiltEnabled(Boolean(enabled));
  }, [tiltEnabled]);
  
  const handleChime = useCallback(() => {
    threeSceneRef.current?.playChime();
  }, []);

  const handleFullscreen = useCallback(() => {
    threeSceneRef.current?.toggleFullscreen();
  }, []);

  const dockButtonClass = "flex-shrink-0 bg-[#2d2857] border border-[rgba(167,139,250,.5)] text-[#eee8ff] rounded-full px-4 py-3 text-sm font-extrabold tracking-tight flex items-center gap-2 cursor-pointer select-none transition-transform active:translate-y-px active:scale-[.98]";

  return (
    <div className={`w-screen h-screen sky-pulse bg-[radial-gradient(1200px_700px_at_60%_25%,#1a1635,#0b0a1a)]`}>
      <ThreeScene 
        ref={threeSceneRef}
        armyMode={armyMode}
        sakuraEnabled={sakuraEnabled}
        lightstickOn={lightstickOn}
        performanceMode={performanceMode}
        onBirthday={isBirthday}
      />

      <div id="hud" className="fixed inset-0 grid grid-rows-[auto_1fr_auto] pointer-events-none z-10">
        <div className="topbar flex items-center justify-between gap-2 p-3 sm:p-4 bg-gradient-to-r from-[rgba(45,40,87,.55)] to-[rgba(20,18,40,.35)] backdrop-blur-md border-b border-[rgba(167,139,250,.25)] pointer-events-auto">
          <div className="brand flex items-center gap-2 font-extrabold tracking-wide">
            <span className="[filter:drop-shadow(0_0_8px_rgba(167,139,250,.9))]">💜</span>
            <span>Ava — Birthday</span>
          </div>
          <button onClick={handleFullscreen} className="bg-[#2d2857] border border-[rgba(167,139,250,.5)] text-[#eee8ff] rounded-full px-3 py-2 text-xs font-extrabold flex items-center gap-2 cursor-pointer select-none transition-transform active:translate-y-px active:scale-[.98]">
            ⛶ Fullscreen
          </button>
        </div>

        <div className="flex items-center justify-center text-center p-3">
          <div>
            <h1 className="text-[clamp(24px,6vw,56px)] font-extrabold leading-tight [text-shadow:0_3px_12px_rgba(0,0,0,.55)]">
              Happy Birthday, <span className="text-[#8b5cf6]">Ava</span>!
            </h1>
            <p className="mt-1.5 text-[clamp(13px,3.6vw,18px)] text-[#c4bdf2]">
              생일 축하해! • お誕生日おめでとう！ • I purple you (보라해)
            </p>
            <div className="inline-flex flex-wrap justify-center gap-2 mt-3 bg-[rgba(29,25,58,.55)] border border-[rgba(167,139,250,.35)] rounded-full p-2 text-sm font-bold">
              <span className="chip px-3 py-1 rounded-full bg-[rgba(167,139,250,.12)]"><strong>Target:</strong> Sep 7</span>
              <span className="chip px-3 py-1 rounded-full bg-[rgba(167,139,250,.12)]">{days}d</span>
              <span className="chip px-3 py-1 rounded-full bg-[rgba(167,139,250,.12)]">{hours}h</span>
              <span className="chip px-3 py-1 rounded-full bg-[rgba(167,139,250,.12)]">{minutes}m</span>
              <span className="chip px-3 py-1 rounded-full bg-[rgba(16,185,129,.15)] border border-[rgba(16,185,129,.35)]">{seconds}s</span>
            </div>
          </div>
        </div>

        <div className="dock relative pointer-events-auto flex gap-2.5 overflow-x-auto pb-[calc(10px+env(safe-area-inset-bottom))] px-3 pt-2.5 bg-gradient-to-r from-[rgba(45,40,87,.55)] to-[rgba(20,18,40,.35)] border-t border-[rgba(167,139,250,.25)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button onClick={handleArmyToggle} className={dockButtonClass}>{armyMode ? '💜 ARMY ✓' : '💜 ARMY'}</button>
          <button onClick={handleFireworks} className={dockButtonClass}>🎆 Fireworks</button>
          <button onClick={handleSakuraToggle} className={dockButtonClass}>{sakuraEnabled ? '🌸 Sakura' : '🌸 Sakura (off)'}</button>
          <button onClick={handleLightstickToggle} className={dockButtonClass}>{lightstickOn ? '🔦 Lightstick' : '🔦 Lightstick (off)'}</button>
          <button onClick={handleTiltToggle} className={`${dockButtonClass} ${tiltEnabled ? 'border-[rgba(16,185,129,.5)]' : ''}`}>{tiltEnabled ? '🎮 Tilt/Shake ✓' : '🎮 Enable Tilt/Shake'}</button>
          <button onClick={handlePerformanceToggle} className={dockButtonClass}>{performanceMode ? '⚡ FPS Boost ✓' : '⚡ FPS Boost'}</button>
          <button onClick={handleChime} className={dockButtonClass}>🔊 Chime</button>
        </div>
      </div>

       <div className="footchips fixed left-3 bottom-[calc(80px+env(safe-area-inset-bottom))] z-10 flex gap-2 flex-wrap max-w-[92vw] pointer-events-none">
          <span className="tag pointer-events-auto bg-[rgba(167,139,250,.12)] border border-[rgba(16,185,129,.45)] px-3 py-1.5 rounded-full whitespace-nowrap font-bold text-sm">🇰🇷 생일 축하해</span>
          <span className="tag pointer-events-auto bg-[rgba(167,139,250,.12)] border border-[rgba(230,0,38,.45)] px-3 py-1.5 rounded-full whitespace-nowrap font-bold text-sm">🇯🇵 お誕生日おめでとう</span>
          <span className="tag pointer-events-auto bg-[rgba(167,139,250,.12)] border border-[rgba(167,139,250,.35)] px-3 py-1.5 rounded-full whitespace-nowrap font-bold text-sm">🫰 보라해</span>
       </div>
    </div>
  );
};

export default App;
