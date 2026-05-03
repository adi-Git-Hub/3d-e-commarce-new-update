import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function Welcome() {
  const navigate = useNavigate();
  const [isExiting, setIsExiting] = useState(false);

  const handleEnter = () => {
    setIsExiting(true);
    setTimeout(() => {
      navigate("/intro");
    }, 1000);
  };

  const titleWords = ["WELCOME", "TO", "ADYX"];

  // Animation variants for unified section entry
  const sectionContentVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] } 
    }
  };

  return (
    <div className={`min-h-screen w-full bg-black text-white overflow-x-hidden overflow-y-auto relative font-sans scroll-smooth transition-all duration-1000 ${isExiting ? 'scale-110 opacity-0 blur-2xl' : 'opacity-100'}`}
         style={{ filter: 'contrast(1.05) brightness(0.95)' }}>
      
      {/* ── SECTION 1: CINEMATIC HERO ── */}
      <section className="relative h-screen w-full flex flex-col items-center justify-start pt-[15vh]">
        {/* Background Layer */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover scale-105" style={{ zIndex: -2 }}>
            <source src="/hero.mp4" type="video/mp4" />
          </video>
          {/* Blend Gradient (Bottom) */}
          <div className="absolute inset-0 z-[-1]" 
               style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 40%, transparent 70%, rgba(0,0,0,0.8) 100%)' }} />
        </div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={sectionContentVariants}
          className="relative z-10 w-full px-6 flex flex-col md:flex-row items-center justify-center gap-x-8"
        >
           {titleWords.map((word, i) => (
             <motion.span 
               key={i} 
               initial={{ opacity: 0, y: 60, filter: "blur(25px)" }} 
               animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} 
               transition={{ duration: 1.8, delay: i * 0.4, ease: [0.16, 1, 0.3, 1] }} 
               className="text-[clamp(2.5rem,12vw,8rem)] font-black italic uppercase metallic-text leading-none tracking-tighter"
             >
               {word}
             </motion.span>
           ))}
        </motion.div>

        <motion.div animate={{ opacity: 0.4, y: [0, 8, 0] }} transition={{ delay: 2.5, repeat: Infinity, duration: 2.5 }} className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 pointer-events-none">
          <span className="text-[9px] uppercase tracking-[0.8em] font-light">Explore Below</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-white to-transparent" />
        </motion.div>
      </section>

      {/* ── SECTION 2: THE STATEMENT (Unified Flow) ── */}
      <section className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden border-t border-white/5">
        {/* Background Image Layer */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat" 
          style={{ 
            backgroundImage: 'url("/showroom.png")',
            filter: 'brightness(0.7) contrast(1.1)'
          }}
        />
        
        {/* Continuity Overlays: Blends Page 1 and Page 3 */}
        <div className="absolute inset-0 z-[1]" 
             style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 30%, rgba(0,0,0,0.4) 70%, rgba(0,0,0,0.9) 100%)' }} />

        <div className="absolute inset-0 z-[2] backdrop-blur-[1px] pointer-events-none" />

        {/* Staggered Content Animation */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={sectionContentVariants}
          className="relative z-[10] max-w-4xl px-8 text-center space-y-10"
        >
           <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tight text-white leading-tight"
               style={{ textShadow: '0 0 30px rgba(0, 224, 255, 0.35)' }}>
             Not Just Cars. <br /> <span className="text-cyan-400">A Statement.</span>
           </h2>
           
           <p className="text-sm md:text-xl text-white/80 uppercase tracking-[0.4em] leading-loose max-w-2xl mx-auto italic font-medium">
             Own machines that define power, precision, and prestige.
           </p>
        </motion.div>
        
        <motion.div animate={{ y: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 3 }} className="absolute bottom-10 z-[10] opacity-30 text-[8px] uppercase tracking-[0.4em]">
          Scroll to Enter
        </motion.div>
      </section>

      {/* ── SECTION 3: FINAL CTA (Continuity Blend) ── */}
      <section className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden border-t border-white/5">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover" style={{ zIndex: -2, filter: 'blur(3px) brightness(0.7) contrast(1.1)', opacity: 0.65 }}>
            <source src="/car.mp4" type="video/mp4" />
          </video>
          {/* Top blend gradient for Page 2 -> Page 3 transition */}
          <div className="absolute inset-0 z-[-1]" 
               style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0.6) 100%)' }} />
        </div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={sectionContentVariants}
          className="relative z-10 max-w-4xl px-8 text-center space-y-12"
        >
           <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-normal text-white">
             Ready To <span className="text-cyan-400">Take Control?</span>
           </h2>
           <p className="text-xs md:text-base text-white/40 uppercase tracking-[0.3em] leading-loose max-w-xl mx-auto font-bold">
             Step into the showroom and experience precision like never before.
           </p>
           <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
             <button onClick={handleEnter} className="group relative px-24 py-6 bg-white rounded-full transition-all shadow-[0_0_50px_rgba(255,255,255,0.2)]">
                <span className="relative z-10 text-black font-black uppercase tracking-[0.6em] text-[11px]">Go To Showroom</span>
                <div className="absolute inset-0 rounded-full bg-cyan-400 opacity-0 group-hover:opacity-10 blur-xl transition-opacity" />
             </button>
           </motion.div>
        </motion.div>
      </section>

      {/* ── FIXED OVERLAY STATS ── */}
      <div className="fixed bottom-8 left-12 right-12 z-20 flex justify-between items-end opacity-10 pointer-events-none font-mono">
         <div className="space-y-1">
            <p className="text-[8px] uppercase tracking-widest">ENGINE: v4.2</p>
            <p className="text-[8px] uppercase tracking-widest">GATEWAY: ACTIVE</p>
         </div>
         <div className="text-right space-y-1">
            <p className="text-[8px] uppercase tracking-widest">OWNERSHIP: SYNCED</p>
            <p className="text-[8px] uppercase tracking-widest">© 2026 ADYX</p>
         </div>
      </div>

      <style>{`
        .metallic-text {
          background: linear-gradient(to bottom, #fff 20%, #94a3b8 40%, #fff 45%, #94a3b8 50%, #fff 70%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 0 30px rgba(255,255,255,0.1));
        }
        /* Custom scrollbar to keep it clean */
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #000; }
        ::-webkit-scrollbar-thumb { background: #111; border-radius: 10px; }
      `}</style>
    </div>
  );
}
