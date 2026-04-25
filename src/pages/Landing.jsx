import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Landing() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [isExiting, setIsExiting] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  // Handle Mouse Parallax
  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = (clientX / innerWidth - 0.5) * 20; // Max 20px shift
    const y = (clientY / innerHeight - 0.5) * 20;
    setMousePos({ x, y });
  };

  const handleEnter = () => {
    setIsExiting(true);
    setTimeout(() => {
      sessionStorage.setItem("entered_experience", "true");
      navigate("/intro");
    }, 1000); // Match CSS transition duration
  };

  return (
    <div 
      onMouseMove={handleMouseMove}
      className={`h-screen w-full bg-[#050507] flex flex-col items-center justify-center text-white font-sans overflow-hidden relative transition-opacity duration-1000 ${isExiting ? 'fade-out-active' : 'opacity-100'}`}
    >
      {/* --- BACKGROUND ELEMENTS --- */}
      
      {/* 1. Dynamic Radial Glows */}
      <div 
        className="absolute w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] -z-10 transition-transform duration-300 ease-out"
        style={{ transform: `translate(${mousePos.x * -1.5}px, ${mousePos.y * -1.5}px)` }}
      ></div>
      <div 
        className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-600/5 rounded-full blur-[100px] -z-10 transition-transform duration-500 ease-out"
        style={{ transform: `translate(${mousePos.x * 1.2}px, ${mousePos.y * 1.2}px)` }}
      ></div>

      {/* 2. CSS Particles Layer */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              animationDuration: `${Math.random() * 10 + 5}s`,
              animationDelay: `${Math.random() * 5}s`
            }}
          ></div>
        ))}
      </div>

      {/* --- CONTENT LAYER --- */}
      <div 
        className="text-center z-10 px-4 transition-transform duration-300 ease-out"
        style={{ transform: `translate(${mousePos.x}px, ${mousePos.y}px)` }}
      >
        <div className="relative inline-block mb-4 animate-in fade-in slide-in-from-top-8 duration-1000">
          {/* Logo Glow */}
          <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full scale-150 -z-10"></div>
          
          <h1 className="text-8xl md:text-[12rem] font-black italic tracking-tighter uppercase metallic-text leading-none">
            ADYX
          </h1>
        </div>

        <p className="text-blue-400 text-[10px] md:text-[13px] uppercase tracking-[0.8em] font-bold mb-16 ml-[0.8em] animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
          Beyond Performance
        </p>

        <button
          onClick={handleEnter}
          disabled={isExiting}
          className="group relative px-14 py-5 glass-button overflow-hidden rounded-full transition-all duration-700 hover:scale-105 animate-in fade-in zoom-in-95 duration-1000 delay-500"
        >
          {/* Internal Button Glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-blue-600/20 to-blue-600/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          
          <span className="relative z-10 text-[11px] font-black uppercase tracking-[0.5em] group-hover:text-white transition-colors duration-500">
            {isExiting ? "Initializing..." : "Enter Experience"}
          </span>
        </button>
      </div>

      {/* --- FOOTER DECORATION --- */}
      <div className="absolute bottom-12 flex flex-col items-center gap-6 opacity-30 animate-in fade-in duration-1000 delay-700">
        <div className="w-[1px] h-24 bg-gradient-to-t from-blue-500 to-transparent"></div>
        <p className="text-[10px] uppercase tracking-[0.6em] text-blue-100/50">Shift your Perspective</p>
      </div>
    </div>
  );
}
