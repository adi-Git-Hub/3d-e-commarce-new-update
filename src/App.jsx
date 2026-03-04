import { useEffect, useRef } from "react";
import { Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import Hero3D, { globalCamera, carRef, bgRef } from "./components/Hero3D";
import SuccessPage from './pages/SuccessPage';
import { useGLTF } from "@react-three/drei";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute"; 

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyOTP from "./pages/VerifyOTP";
import SetRegisterPassword from "./pages/SetRegisterPassword";
import Profile from "./pages/Profile"; 
import About from "./pages/About"; 
import Contact from "./pages/Contact"; 
import { useAuth } from "./context/AuthContext";

// Forgot Password
import ForgotPassword from "./pages/ForgotPassword";
import ForgotPasswordOTP from "./pages/ForgotPasswordOTP";
import ResetPassword from "./pages/ResetPassword";

// Cars Pages 
import Cars, { cars } from "./pages/Cars"; 
import CarDetails from "./pages/CarDetails";
import Booking from "./pages/Booking";
import Buy from "./pages/Buy";

gsap.registerPlugin(ScrollTrigger);

function App() {
  const { user, logout } = useAuth(); // Added logout from context
  const heroTextRef = useRef(null);
  const finalUIRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const showDirectContent = location.hash === "#main-content";

  // --- NEW: LOGOUT CONFIRMATION LOGIC ---
  const handleLogout = async () => {
    const confirmLogout = window.confirm("You really want to logout?");
    if (confirmLogout) {
      try {
        // Navigate to landing page first to avoid ProtectedRoute "Login First" alert
        navigate("/"); 
        await logout();
      } catch (error) {
        console.error("Logout failed:", error);
      }
    }
  };

  useEffect(() => {
    if (cars && Array.isArray(cars)) {
      cars.forEach(car => {
        if (car.modelPath) useGLTF.preload(car.modelPath);
      });
    }
  }, []);

  const messages = [
    "NOT FOR EVERYONE.",
    "NOT FOR THE ORDINARY.",
    "ONLY FOR THE CHOSEN.",
    "WELCOME TO ADYX."
  ];

  const messageStyles = [
    "from-white/90 to-white/40",           
    "from-slate-200 to-slate-500",        
    "from-blue-100 to-blue-300",          
    "from-blue-400 via-blue-200 to-white" 
  ];

  useEffect(() => {
    if (!showDirectContent) return;

    const syncState = setInterval(() => {
      if (globalCamera && bgRef.current) {
        gsap.set(globalCamera.position, { x: 1.4, y: 1.35, z: 9 });
        gsap.set(bgRef.current, { scale: 1.4, y: 100 });
        clearInterval(syncState);
      }
    }, 50);

    return () => clearInterval(syncState);
  }, [showDirectContent]);

  useEffect(() => {
    if (location.pathname !== "/" || showDirectContent) return;

    const lenis = new Lenis({
      duration: 1.5,
      smoothWheel: true,
      wheelMultiplier: 0.9,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
    lenis.on("scroll", ScrollTrigger.update);

    const wait = setInterval(() => {
      if (!globalCamera || !carRef.current || !bgRef.current) return;
      clearInterval(wait);

      const cam = globalCamera;
      const bg = bgRef.current;

      gsap.set(finalUIRef.current, { opacity: 0 });

      gsap.to(heroTextRef.current, {
        opacity: 0,
        y: -30,
        scrollTrigger: { trigger: ".hero", start: "top top", end: "5% top", scrub: true }
      });

      messages.forEach((msg, i) => {
        const start = 12 + (i * 18);
        const tlText = gsap.timeline({
          scrollTrigger: { trigger: ".hero", start: `${start}% top`, end: `${start + 12}% top`, scrub: 1 }
        });

        tlText.fromTo(
          `.story-line-${i}`,
          { opacity: 0, z: -80, scale: 0.92, filter: "blur(4px)" },
          { 
            opacity: 1, 
            z: 0, 
            scale: 1, 
            filter: "blur(0px)",
            duration: 1.2,
            ease: "expo.out"
          }
        ).to(`.story-line-${i}`, { 
          opacity: 0, 
          scale: 1.05, 
          z: 40, 
          filter: "blur(4px)",
          ease: "expo.in" 
        }, "+=0.4");
      });

      gsap.to(finalUIRef.current, {
        opacity: 1,
        scrollTrigger: { trigger: ".hero", start: "88% top", end: "95% top", scrub: 1 }
      });

      const masterTl = gsap.timeline({
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom bottom", scrub: 2 }
      });

      masterTl
        .to(cam.position, { z: 15, y: 1.4, ease: "none" })
        .to(bg, { scale: 1.1, ease: "none" }, "<")
        .to(cam.position, { x: 4.5, y: 1.1, z: 13, ease: "none" })
        .to(bg, { scale: 1.2, y: 30, ease: "none" }, "<")
        .to(cam.position, { x: -3.5, y: 1.8, z: 11, ease: "none" })
        .to(bg, { scale: 1.3, y: 60, ease: "none" }, "<")
        .to(cam.position, { x: 1.4, y: 1.35, z: 9, ease: "none" })
        .to(bg, { scale: 1.4, y: 100, ease: "none" }, "<");

      ScrollTrigger.refresh();
    }, 100);

    return () => {
      ScrollTrigger.killAll();
      if (lenis) lenis.destroy();
    };
  }, [location.pathname, showDirectContent]);

  return (
    <>
      {/* Pass handleLogout to Navbar */}
      <Navbar onLogout={handleLogout} />
      <Routes>
        <Route
          path="/"
          element={
            <div className="bg-[#050507] text-white overflow-x-hidden selection:bg-blue-600 font-sans antialiased italic">
              <main>
                <div className="fixed inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/90 pointer-events-none z-[5] shadow-[inset_0_0_200px_rgba(0,0,0,0.8)]" />

                {showDirectContent ? (
                  <section className="h-screen relative flex items-center justify-center bg-black overflow-hidden">
                    <div className="absolute inset-0 opacity-40"><Hero3D /></div>
                    <div className="z-[100] w-full h-full flex flex-col items-center justify-center px-6 text-center bg-gradient-to-t from-black/90 via-black/20 to-black/80">
                      <div className="w-20 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent mb-12 shadow-[0_0_20px_rgba(59,130,246,0.3)]" />
                      <h2 className="text-6xl md:text-8xl font-black tracking-[0.05em] uppercase leading-tight relative">
                        <div className="absolute inset-0 bg-blue-600/5 blur-[100px] -z-10" />
                        FROM VISION <br /> 
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-blue-500 to-blue-800 drop-shadow-[0_0_35px_rgba(59,130,246,0.4)]">
                          TO REALITY.
                        </span>
                      </h2>
                      <p className="mt-12 text-xs md:text-sm text-white/40 tracking-[0.8em] uppercase font-black max-w-2xl drop-shadow-md">
                        CLOUD NATIVE • INTELLIGENT • ADYX
                      </p>
                      <div className="flex flex-col sm:flex-row gap-6 mt-20 w-full max-w-md pointer-events-auto">
                        <button onClick={() => navigate("/cars")} className="flex-1 px-8 py-5 bg-white text-black font-black uppercase tracking-[0.4em] text-[9px] transition-all duration-700 hover:bg-blue-600 hover:text-white hover:scale-105 active:scale-95">Enter Showroom</button>
                        <button onClick={() => navigate("/login")} className="flex-1 px-8 py-5 bg-black/40 border border-white/10 text-white font-black uppercase tracking-[0.4em] text-[9px] transition-all duration-700 hover:bg-white hover:text-black hover:border-white hover:scale-105 active:scale-95">Identify Self</button>
                      </div>
                      <p className="absolute bottom-12 text-[8px] text-white/10 uppercase tracking-[1em] font-bold">ADYX AUTOMOTIVE GROUP • EST. 2026</p>
                    </div>
                  </section>
                ) : (
                  <section className="hero h-[1100vh] relative">
                    <Hero3D />
                    <div ref={heroTextRef} className="fixed inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
                      <h1 className="text-[14vw] font-black tracking-[-0.05em] opacity-5 uppercase leading-none text-white">ADYX</h1>
                      <div className="h-[1px] w-12 bg-white/5 mt-8" />
                      <p className="text-[9px] uppercase tracking-[2.5em] text-white/10 mt-4 ml-[2.5em]">Evolution in Motion</p>
                    </div>
                    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none text-center">
                      <div className="relative perspective-1000">
                        {messages.map((text, i) => (
                          <h2 key={i} className={`story-line-${i} absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[4.2vw] font-black tracking-[0.2em] opacity-0 whitespace-nowrap uppercase text-transparent bg-clip-text bg-gradient-to-r ${messageStyles[i]} drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]`}>
                            {text}
                          </h2>
                        ))}
                      </div>
                    </div>
                    <div id="main-content" ref={finalUIRef} className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center">
                      <div className="pointer-events-auto w-full h-full flex flex-col items-center justify-center px-6 text-center transition-all duration-1000 bg-gradient-to-t from-black/90 via-black/20 to-black/80">
                        <div className="w-20 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent mb-12 shadow-[0_0_20px_rgba(59,130,246,0.3)]" />
                        <h2 className="text-6xl md:text-8xl font-black tracking-[0.05em] uppercase leading-tight relative">
                          <div className="absolute inset-0 bg-blue-600/5 blur-[100px] -z-10" />
                          FROM VISION <br /> 
                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-blue-500 to-blue-800 drop-shadow-[0_0_35px_rgba(59,130,246,0.4)]">
                            TO REALITY.
                          </span>
                        </h2>
                        <p className="mt-12 text-xs md:text-sm text-white/40 tracking-[0.8em] uppercase font-black max-w-2xl drop-shadow-md">
                          CLOUD NATIVE • INTELLIGENT • ADYX
                        </p>
                        <div className="flex flex-col sm:flex-row gap-6 mt-20 w-full max-w-md">
                          <button onClick={() => navigate("/cars")} className="flex-1 px-8 py-5 bg-white text-black font-black uppercase tracking-[0.4em] text-[9px] transition-all duration-700 hover:bg-blue-600 hover:text-white hover:scale-105 active:scale-95">Enter Showroom</button>
                          <button onClick={() => navigate("/login")} className="flex-1 px-8 py-5 bg-black/40 border border-white/10 text-white font-black uppercase tracking-[0.4em] text-[9px] transition-all duration-700 hover:bg-white hover:text-black hover:border-white hover:scale-105 active:scale-95">Identify Self</button>
                        </div>
                        <p className="absolute bottom-12 text-[8px] text-white/10 uppercase tracking-[1em] font-bold">ADYX AUTOMOTIVE GROUP • EST. 2026</p>
                      </div>
                    </div>
                  </section>
                )}
              </main>
            </div>
          }
        />
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/set-register-password" element={<SetRegisterPassword />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/forgot-password-otp" element={<ForgotPasswordOTP />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/payment-success" element={<SuccessPage />} />

        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/about" element={<About />} /> 
        <Route path="/contact" element={<Contact />} /> 

        <Route path="/cars" element={<ProtectedRoute><Cars /></ProtectedRoute>} />
        <Route path="/car/:id" element={<ProtectedRoute><CarDetails /></ProtectedRoute>} />
        <Route path="/booking/:id" element={<ProtectedRoute><Booking /></ProtectedRoute>} />
        <Route path="/buy/:id" element={<ProtectedRoute><Buy /></ProtectedRoute>} />
      </Routes>
    </>
  );
}

export default App;