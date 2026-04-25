import React, { useEffect, useState } from "react";

export default function IntroLoader({ onComplete }) {
  const [phase, setPhase] = useState(0); // 0: Start, 1: Text Visible, 2: Tagline, 3: Fade Out

  useEffect(() => {
    // Phase 1: Brand Reveal Start
    const t1 = setTimeout(() => setPhase(1), 100);
    // Phase 2: Tagline Fade In
    const t2 = setTimeout(() => setPhase(2), 1200);
    // Phase 3: Start Fade Out the whole screen
    const t3 = setTimeout(() => setPhase(3), 2600);
    // Final: Remove component from DOM
    const t4 = setTimeout(() => {
      sessionStorage.setItem("introPlayed", "true");
      onComplete();
    }, 3200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  return (
    <div 
      className={`fixed inset-0 z-[9999] bg-[#050507] flex flex-col items-center justify-center transition-opacity duration-1000 ease-in-out ${phase === 3 ? "opacity-0 pointer-events-none" : "opacity-100"}`}
    >
      <div className="relative flex flex-col items-center">
        {/* Main Logo */}
        <div className="overflow-hidden mb-2">
          <h1 
            className={`text-6xl md:text-8xl font-black italic uppercase tracking-[0.2em] transition-all duration-1000 ${phase >= 1 ? "animate-letter-reveal animate-glitch-glow" : "opacity-0"}`}
          >
            ADYX
          </h1>
        </div>

        {/* Decorative Line */}
        <div 
          className={`h-[1px] bg-gradient-to-r from-transparent via-blue-500 to-transparent transition-all duration-1000 mb-6 ${phase >= 1 ? "animate-line-grow" : "w-0 opacity-0"}`}
        ></div>

        {/* Tagline */}
        <div className="overflow-hidden">
          <p 
            className={`text-blue-500 text-[10px] md:text-[12px] uppercase tracking-[1em] font-bold transition-all duration-1000 transform ${phase >= 2 ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"}`}
          >
            Beyond Performance
          </p>
        </div>
      </div>

      {/* Subtle Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_4px,3px_100%] opacity-20"></div>
    </div>
  );
}
