import { HighwayScene, updateScroll } from "../components/three/HighwayScene";
import { useEffect, useRef, useState } from "react";

const Index = () => {
  const lastScroll = useRef(0);
  const [showIndicator, setShowIndicator] = useState(true);

  useEffect(() => {
    let rafId: number;
    let hidden = false;

    const onScroll = () => {
      cancelAnimationFrame(rafId);
      if (!hidden && window.scrollY > 20) {
        hidden = true;
        setShowIndicator(false);
      }
      rafId = requestAnimationFrame(() => {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
        const velocity = (window.scrollY - lastScroll.current) / window.innerHeight;
        lastScroll.current = window.scrollY;
        updateScroll(Math.min(progress, 1), velocity);
      });
    };

    onScroll();

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <>
      {/* Fixed 3D background */}
      <HighwayScene />

      {/* Fixed UI overlay */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10, pointerEvents: 'none' }}>
        {/* CloudCar Logo */}
        <div style={{
          position: 'absolute',
          top: 24,
          left: 24,
          fontFamily: 'Space Grotesk, sans-serif',
          fontWeight: 600,
          fontSize: 20,
          letterSpacing: '0.12em',
          color: '#FFD700',
          textShadow: '0 0 15px rgba(255,215,0,0.3)',
        }}>
          CLOUDCAR
        </div>

        {/* Scroll to Start */}
        <div style={{
          position: 'absolute',
          bottom: 32,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 10,
          opacity: showIndicator ? 1 : 0,
          transition: 'opacity 0.6s ease-out',
        }}>
          <span style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: 11,
            letterSpacing: '0.35em',
            textTransform: 'uppercase',
            color: '#FFD700',
            opacity: 0.6,
          }}>
            Scroll to Start
          </span>
          <div style={{
            width: 1,
            height: 30,
            background: 'linear-gradient(to bottom, rgba(255,215,0,0.5), transparent)',
          }} />
        </div>
      </div>

      {/* Scroll spacer — must be above canvas to receive scroll */}
      <div style={{ height: '1000vh', position: 'relative', zIndex: 5 }} />
    </>
  );
};

export default Index;
