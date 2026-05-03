import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useCars } from "../context/CarContext";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import Scene3D from "../components/Scene3D";
import MarketplaceSections from "../components/MarketplaceSections";
import Navbar from "../components/Navbar";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// --- Sub-component for structured car details ---
function CarDetailCard({ car, isActive }) {
  const navigate = useNavigate();

  // Dummy safety/interior data if not present in car object
  const safety = car.safety || ["9 Airbags", "Level 2 ADAS", "ABS with EBD"];
  const interior = car.interior || ["15.5\" Cinematic Display", "Heated Premium Seats", "Dolby Atmos Audio"];

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: false, amount: 0.3 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="min-h-screen w-full flex flex-col lg:flex-row items-center justify-between px-6 md:px-20 py-24 gap-12 pointer-events-none"
    >
      {/* Left: Performance & Technical Specs */}
      <div className="w-full lg:w-1/3 space-y-8 pointer-events-auto">
        <div className="space-y-2">
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            className="text-cyan-400 font-black uppercase tracking-[0.4em] text-[10px]"
          >
            Engineering Excellence
          </motion.p>
          <h2 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-[0.8] text-white">
            {car.name}
          </h2>
          <p className="text-2xl font-mono font-bold text-white/40 italic">₹ {car.price}</p>
        </div>

        <div className="grid grid-cols-2 gap-6 pt-4">
          <div className="p-4 bg-white/[0.03] border border-white/5 rounded-xl backdrop-blur-sm group hover:border-cyan-500/30 transition-all">
            <p className="text-[9px] text-white/30 uppercase tracking-widest mb-1">Top Speed</p>
            <p className="text-xl font-black text-white">{car.specs?.topSpeed || "250 km/h"}</p>
          </div>
          <div className="p-4 bg-white/[0.03] border border-white/5 rounded-xl backdrop-blur-sm group hover:border-cyan-500/30 transition-all">
            <p className="text-[9px] text-white/30 uppercase tracking-widest mb-1">0-100 km/h</p>
            <p className="text-xl font-black text-white">{car.specs?.zeroToSixty || "3.2s"}</p>
          </div>
          <div className="p-4 bg-white/[0.03] border border-white/5 rounded-xl backdrop-blur-sm group hover:border-cyan-500/30 transition-all">
            <p className="text-[9px] text-white/30 uppercase tracking-widest mb-1">Range</p>
            <p className="text-xl font-black text-white">{car.specs?.range || "520 km"}</p>
          </div>
          <div className="p-4 bg-white/[0.03] border border-white/5 rounded-xl backdrop-blur-sm group hover:border-cyan-500/30 transition-all">
            <p className="text-[9px] text-white/30 uppercase tracking-widest mb-1">Drive</p>
            <p className="text-xl font-black text-white">{car.details?.drive || "AWD"}</p>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="space-y-4 pt-6">
           <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 border-b border-white/5 pb-2">Why Choose This Machine</h3>
           <div className="grid grid-cols-1 gap-3">
              {[
                { title: "Precision Control", desc: "Proprietary neural-link steering for ultimate response." },
                { title: "Sustainable Power", desc: "Next-gen fusion core or solid-state battery tech." },
                { title: "Safe Intelligence", desc: "360° LiDAR shield with real-time threat avoidance." }
              ].map((h, i) => (
                <div key={i} className="flex gap-4 items-start">
                   <div className="w-1 h-1 bg-cyan-500 rounded-full mt-2" />
                   <div>
                      <p className="text-[11px] font-black uppercase text-white/80">{h.title}</p>
                      <p className="text-[10px] text-white/40 leading-relaxed">{h.desc}</p>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* Center: Invisible spacer for 3D model */}
      <div className="flex-1" />

      {/* Right: Interior & Safety Stats */}
      <div className="w-full lg:w-1/3 space-y-10 text-right pointer-events-auto">
        <div className="space-y-6">
          <div className="space-y-2">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400">Interior Luxury</h4>
            <div className="flex flex-col gap-2">
               {interior.map((item, i) => (
                 <p key={i} className="text-sm font-medium text-white/60">{item}</p>
               ))}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">Safety Rating</h4>
            <div className="flex flex-col gap-2">
               {safety.map((item, i) => (
                 <p key={i} className="text-sm font-medium text-white/60">{item}</p>
               ))}
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col items-end gap-4">
           <button 
             onClick={() => navigate(`/car/${car.slug}`)}
             className="w-full md:w-64 py-5 bg-white text-black font-black uppercase text-[10px] tracking-[0.5em] hover:bg-cyan-500 hover:text-white transition-all shadow-2xl"
           >
             Configure Asset
           </button>
           <button 
             onClick={() => navigate(`/buy/${car.slug}`)}
             className="w-full md:w-64 py-5 border border-white/20 text-white font-black uppercase text-[10px] tracking-[0.5em] hover:border-cyan-400 hover:text-cyan-400 transition-all"
           >
             Secure Purchase
           </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function Home() {
  const { cars = [], loading } = useCars();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef();

  // Scroll logic to update active car
  useEffect(() => {
    if (!cars.length) return;

    const sections = gsap.utils.toArray(".car-section");
    const triggers = [];

    sections.forEach((section, i) => {
      triggers.push(
        ScrollTrigger.create({
          trigger: section,
          start: "top center",
          end: "bottom center",
          onEnter: () => setCurrentIndex(i),
          onEnterBack: () => setCurrentIndex(i),
        })
      );
    });

    return () => triggers.forEach(t => t.kill());
  }, [cars]);

  const currentCar = cars && cars.length > 0 ? cars[currentIndex] : null;

  if (loading && (!cars || cars.length === 0)) {
    return (
      <div className="h-screen w-full bg-black flex items-center justify-center">
        <div className="text-cyan-500 font-mono text-xs animate-pulse uppercase tracking-[0.5em]">
          Syncing_Neural_Assets...
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative bg-black w-full overflow-x-hidden">
      {/* 3D Scene — fixed background */}
      <div className="fixed top-0 left-0 w-full h-screen -z-10">
        <Scene3D 
          model={currentCar?.model_url || "/models/car.glb"} 
          allModels={cars?.map(c => c.model_url) || []} 
        />
        {/* Cinematic platform/base visual for the car */}
        <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 w-[60vw] h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent blur-[2px] z-[5]" />
        <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 w-[40vw] h-[40vw] bg-cyan-500/5 blur-[120px] rounded-full -z-10" />
      </div>

      <div className="relative z-10">
        <Navbar />

        {/* ── HERO SECTION ── */}
        <section className="h-screen w-full flex flex-col items-center justify-center text-center px-6 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="space-y-6"
          >
            <span className="text-cyan-400 text-xs font-black uppercase tracking-[0.8em]">ADYX AUTOMOTIVE</span>
            <h1 className="text-[clamp(3rem,10vw,8rem)] font-black italic uppercase leading-[0.9] text-white tracking-tighter">
              Experience The<br />Future Of Driving
            </h1>
            <p className="text-white/40 text-sm md:text-base uppercase tracking-[0.3em] max-w-2xl mx-auto leading-relaxed">
              Step into the next generation of performance machines. Precision engineering meets autonomous luxury.
            </p>
            <div className="pt-10">
              <button 
                onClick={() => document.getElementById('collection').scrollIntoView({ behavior: 'smooth' })}
                className="px-16 py-6 bg-white text-black font-black uppercase text-[11px] tracking-[0.6em] rounded-full hover:bg-cyan-500 hover:text-white transition-all shadow-2xl"
              >
                Explore Cars
              </button>
            </div>
          </motion.div>
          
          {/* Scroll prompt */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-20">
             <span className="text-[9px] font-black uppercase tracking-widest">Scroll Down</span>
             <div className="w-[1px] h-10 bg-white" />
          </div>
        </section>

        {/* ── COLLECTION SHOWCASE ── */}
        <div id="collection" className="relative">
          {cars.map((car, i) => (
            <div key={car.id || i} className="car-section">
              <CarDetailCard car={car} isActive={currentIndex === i} />
            </div>
          ))}
        </div>

        {/* ── MARKETPLACE ── */}
        <div id="main-content" className="min-h-screen bg-black/40 backdrop-blur-3xl border-t border-white/5 relative z-20">
          <div className="absolute inset-x-0 -top-24 h-24 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
          <MarketplaceSections />
        </div>

        {/* ── FOOTER / THANK YOU ── */}
        <div className="min-h-[80vh] flex flex-col items-center justify-center bg-[#050507] border-t border-white/5 relative z-20">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-center space-y-8"
          >
            <p className="text-white/20 text-[10px] uppercase tracking-[0.5em]">The End Of Ordinary</p>
            <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-white leading-none">
              Thank you for exploring<br />our fleet
            </h2>
            <p className="text-white/40 text-sm tracking-[0.2em] uppercase">Join the elite world of ADYX performance.</p>
            <div className="pt-8">
              <button
                onClick={() => navigate("/contact")}
                className="px-12 py-5 border border-cyan-500 text-cyan-400 font-black uppercase text-[11px] tracking-[0.4em] hover:bg-cyan-500 hover:text-black transition-all"
              >
                Connect With Us
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      <style>{`
        .metallic-text {
          background: linear-gradient(to bottom, #fff 20%, #64748b 40%, #fff 45%, #64748b 50%, #fff 70%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        ::selection {
          background: #00e0ff;
          color: #000;
        }
      `}</style>
    </div>
  );
}
