import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCars } from "../context/CarContext";
import Scene3D from "../components/Scene3D";
import CarStory from "../components/CarStory";
import MarketplaceSections from "../components/MarketplaceSections";
import Navbar from "../components/Navbar";

export default function Home() {
  const { cars, loading } = useCars();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentCar = cars[currentIndex] || null;

  const handleCarChange = useCallback((index) => {
    setCurrentIndex(index);
  }, []);

  return (
    <div className="relative bg-black w-full">
      {/* 3D Scene — fixed background, model swaps on scroll */}
      <div className="fixed top-0 left-0 w-full h-screen -z-10">
        <Scene3D 
          model={currentCar?.model_url || "/models/car.glb"} 
          allModels={cars.map(c => c.model_url)} 
        />
      </div>

      <div className="relative z-10">
        <Navbar />

        {/* One CarStory section per car — scroll drives currentIndex */}
        {!loading && cars.length > 0 && (
          <CarStory cars={cars} onCarChange={handleCarChange} />
        )}

        {/* 🔥 Added main-content id here for smooth scroll from login */}
        <div id="main-content" className="min-h-screen">
          <MarketplaceSections />
        </div>

        {/* Thank You section after last car */}
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#050507] border-t border-white/5">
          <p className="text-white/20 text-[10px] uppercase tracking-[0.5em] mb-6">End of Collection</p>
          <h2 className="text-5xl font-black italic uppercase tracking-tighter text-white text-center mb-4">
            Thank you for exploring<br />our collection
          </h2>
          <p className="text-white/40 text-sm mb-12">We'd love to hear what you think.</p>
          <button
            onClick={() => navigate("/contact")}
            className="px-10 py-4 border border-cyan-500 text-cyan-400 font-black uppercase text-[11px] tracking-[0.3em] hover:bg-cyan-500 hover:text-black transition-all"
          >
            Give Feedback
          </button>
        </div>
      </div>
    </div>
  );
}
