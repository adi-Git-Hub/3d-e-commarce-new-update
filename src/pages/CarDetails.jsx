import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCars } from '../context/CarContext';
import CarPreview from '../three/CarPreview';

const CarDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { cars, loading } = useCars();
  // match strictly by slug
  const car = cars.find((c) => c.slug === slug);

  console.log("Route slug:", slug);
  console.log("Cars from context:", cars);
  console.log("Matched car:", car);
  
  const [activeColor, setActiveColor] = useState("#050505");
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processMessage, setProcessMessage] = useState("");

  if (loading) return <div className="h-screen bg-black text-white flex items-center justify-center font-black uppercase tracking-[1em]">Loading...</div>;
  if (!car) return <div className="h-screen bg-black text-white flex items-center justify-center font-black uppercase tracking-[1em]">Neural Node Not Found</div>;

  const handlePayment = async (e) => {
  if (e) e.preventDefault();

  setIsProcessing(true);
  setProcessMessage(
    paymentMethod === "card"
      ? "Encrypting Neural Authorization..."
      : "Handshaking with UPI Gateway..."
  );

  try {
    await fetch("http://localhost:5000/api/payment/success", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
  body: JSON.stringify({
    carName: car.name,
  }),
});

    setTimeout(() => {
      navigate("/payment-success", { state: { carName: car.name } });
    }, 2000);
  } catch (error) {
    console.error("Payment API Error:", error);
  }
};

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-[#020203] overflow-hidden font-sans selection:bg-cyan-500">
      
      {/* LEFT: THE INTELLIGENCE VIEW */}
      <div className="flex-[1.8] h-[55vh] lg:h-full relative flex items-center justify-center bg-[#050507] overflow-hidden group">
        
        {/* Spotlight Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-64 bg-cyan-500/5 blur-[100px] pointer-events-none" />
        
        {/* Animated Left Edge Line */}
        <motion.div 
          animate={{ height: ["10%", "40%", "10%"], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute left-2 top-1/4 w-[1px] bg-cyan-500 z-20"
        />

        {/* Floor Reflection Gradient */}
        <div className="absolute bottom-0 w-full h-[30%] bg-gradient-to-t from-cyan-500/10 to-transparent pointer-events-none z-0" />

        <div className="absolute top-10 left-10 z-20 space-y-3">
            <div className="flex items-center gap-3 text-[10px] font-black text-cyan-500 tracking-[0.3em] uppercase">
                <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" /> Edge Network Online
            </div>
            <div className="flex flex-col gap-1">
               <span className="text-[7px] text-white/20 uppercase tracking-widest">Global Latency: 0.04ms</span>
               <span className="text-[7px] text-white/20 uppercase tracking-widest">Encryption: AES-256</span>
            </div>
        </div>

        <div className="absolute top-10 right-10 z-20 text-right opacity-30">
            <p className="text-[8px] font-mono text-white uppercase tracking-tighter">System_Ref: {car.slug.toUpperCase()}</p>
            <p className="text-[8px] font-mono text-white uppercase tracking-tighter">Coord: 28.6139° N, 77.2090° E</p>
        </div>

        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] select-none pointer-events-none">
          <h1 className="text-[20vw] font-black italic uppercase tracking-tighter text-white leading-none">
            {car.name.split(' ')[1] || car.name}
          </h1>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative z-10 w-full h-full flex items-center justify-center">
          <CarPreview modelPath={car.model_url} paintColor={activeColor} autoRotate={false} />
        </motion.div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 w-full max-w-2xl px-6">
          <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/10 rounded-2xl p-6 flex justify-around items-center shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <div className="text-center">
              <p className="text-[7px] font-black text-cyan-500 uppercase tracking-widest mb-1">AI Score</p>
              <p className="text-2xl font-black italic text-white tracking-tighter">94%</p>
            </div>
            <div className="h-8 w-[1px] bg-white/5" />
            <div className="text-center">
              <p className="text-[7px] font-black text-cyan-500 uppercase tracking-widest mb-1">Compute</p>
              <p className="text-2xl font-black italic text-white tracking-tighter uppercase">Edge</p>
            </div>
            <div className="h-8 w-[1px] bg-white/5" />
            <div className="text-center">
              <p className="text-[7px] font-black text-cyan-500 uppercase tracking-widest mb-1">Sync</p>
              <p className="text-2xl font-black italic text-white tracking-tighter">L4</p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT: SYSTEM CONFIGURATION CONSOLE */}
      <div className="w-full lg:w-[480px] h-full bg-[#08080a] bg-[radial-gradient(circle_at_top_right,_rgba(6,182,212,0.05),_transparent)] border-l border-white/5 p-12 lg:p-16 flex flex-col justify-between relative z-30 shadow-[-30px_0_100px_rgba(0,0,0,0.8)] overflow-y-auto">
        {/* Diagonal Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: `repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)`, backgroundSize: '10px 10px' }} />

        <div className="space-y-10 relative z-10">
          <div className="space-y-4">
            <h1 className="text-6xl font-black italic uppercase tracking-tighter text-white leading-none">
              {car.name}<span className="text-cyan-500">.</span>
            </h1>
            <p className="text-white/40 text-[10px] uppercase leading-relaxed tracking-widest border-l border-white/10 pl-4 italic">
               Distributed intelligence architecture. Real-time neural optimization.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
             {["NN v4.2", "OTA Sync", "AI Battery", "Auto Nav"].map((stat) => (
               <div key={stat} className="bg-white/[0.02] border border-white/5 p-4 rounded-xl">
                  <p className="text-[7px] text-cyan-500 font-black uppercase mb-1">{stat}</p>
                  <p className="text-[10px] font-bold text-white uppercase tracking-tighter italic">Optimized</p>
               </div>
             ))}
          </div>

          {/* PERFORMANCE STRIP */}
          <div className="pt-4 space-y-4">
             <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Performance Metrics</p>
             <div className="flex justify-between items-center py-4 border-y border-white/5">
                <div className="text-center">
                   <p className="text-[14px] font-bold text-white italic">310<span className="text-[8px] text-cyan-500 not-italic ml-1">KM/H</span></p>
                </div>
                <div className="w-[1px] h-4 bg-white/10" />
                <div className="text-center">
                   <p className="text-[14px] font-bold text-white italic">2.8<span className="text-[8px] text-cyan-500 not-italic ml-1">SEC</span></p>
                </div>
                <div className="w-[1px] h-4 bg-white/10" />
                <div className="text-center">
                   <p className="text-[14px] font-bold text-white italic">870<span className="text-[8px] text-cyan-500 not-italic ml-1">HP</span></p>
                </div>
             </div>
          </div>

          <div className="space-y-6">
            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Exterior Selection</p>
            <div className="flex gap-5">
              {(car.colors || [{ name: "Default", hex: "#050505" }, { name: "White", hex: "#e0e0e0" }, { name: "Red", hex: "#4a0000" }]).map((color, index) => (
                <button key={index} onClick={() => setActiveColor(color.hex)} style={{ backgroundColor: color.hex }}
                  className={`w-10 h-10 rounded-full transition-all duration-700 ${activeColor === color.hex ? 'scale-110 ring-2 ring-cyan-500 ring-offset-4 ring-offset-black' : 'opacity-20 hover:opacity-100'}`} />
              ))}
            </div>
          </div>
        </div>

        {/* Action Bottom */}
        <div className="pt-10 space-y-8 relative z-10">
           <div className="space-y-2 mb-8">
              <p className="text-[11px] text-white font-medium leading-relaxed italic">“Engineered for dominance. Designed for Indian roads. Powered by adaptive neural intelligence.”</p>
           </div>

           <div className="flex justify-between items-end bg-cyan-500/5 p-6 rounded-2xl border border-cyan-500/10 shadow-[0_0_30px_rgba(6,182,212,0.05)]">
              <div>
                <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Asset Value</p>
                <h2 className="text-4xl font-mono font-bold text-white italic tracking-tighter">₹ {car.price}</h2>
                <p className="text-[7px] text-white/30 uppercase mt-1">Ex-Showroom India. On-road price may vary by state.</p>
              </div>
              <p className="text-[8px] text-cyan-500 font-bold uppercase animate-pulse">Node Available</p>
           </div>
           
           <div className="flex flex-col gap-4">
              <button onClick={() => navigate(`/booking/${car.id}`, { state: { car, activeColor } })} className="w-full bg-white text-black py-5 font-black uppercase text-[10px] tracking-[0.4em] hover:bg-cyan-500 hover:text-white transition-all shadow-xl shadow-black">Pre-Authorize</button>
              <button onClick={() => setShowCheckout(true)} className="w-full border border-cyan-500/50 text-cyan-500 py-5 font-black uppercase text-[10px] tracking-[0.4em] hover:bg-cyan-500/10 transition-all">Instant Deploy</button>
           </div>
        </div>
      </div>

      {/* 🔥 MODAL: REFINED UPI/INDIAN CONSOLE */}
      <AnimatePresence>
        {showCheckout && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-black/90 backdrop-blur-[20px]">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-[#0a0a0c] border border-cyan-500/20 w-full max-w-6xl rounded-[40px] overflow-hidden flex flex-col md:flex-row shadow-[0_0_100px_rgba(6,182,212,0.15)]">
              
              <div className="w-full md:w-[45%] bg-gradient-to-br from-white/[0.03] to-transparent p-12 flex flex-col justify-between border-r border-white/5">
                <div className="space-y-6">
                  <span className="text-cyan-500 text-[10px] font-black uppercase tracking-[0.5em]">Bespoke Deployment</span>
                  <h2 className="text-5xl font-black italic uppercase text-white leading-none">{car.name}</h2>
                  <div className="h-64 w-full relative"><CarPreview modelPath={car.model_url} paintColor={activeColor} autoRotate={false} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                   <div className="p-4 bg-white/[0.02] rounded-xl border border-white/5">
                      <p className="text-[7px] text-white/30 uppercase">Protocol</p>
                      <p className="text-[10px] text-white font-mono uppercase tracking-tighter">ADYX-NORD-SYNC</p>
                   </div>
                   <div className="p-4 bg-white/[0.02] rounded-xl border border-white/5">
                      <p className="text-[7px] text-white/30 uppercase">Server</p>
                      <p className="text-[10px] text-white font-mono uppercase tracking-tighter">MUMBAI-SOUTH-01</p>
                   </div>
                </div>
              </div>

              <div className="w-full md:w-[55%] p-12 flex flex-col relative bg-[#0d0d0f] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
                <button onClick={() => setShowCheckout(false)} className="absolute top-10 right-10 w-10 h-10 flex items-center justify-center rounded-full border border-white/5 text-white/20 hover:text-white hover:border-white/20 transition-all">✕</button>
                <h3 className="text-2xl font-black italic uppercase text-white mb-10 tracking-tight">Authorization Method</h3>

                {isProcessing ? (
                  <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                    <div className="w-20 h-20 border-4 border-cyan-500/10 border-t-cyan-500 rounded-full animate-spin" />
                    <p className="text-cyan-500 font-black uppercase tracking-[0.4em] text-sm animate-pulse">{processMessage}</p>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-8 mb-12 border-b border-white/5">
                      <button onClick={() => setPaymentMethod('card')} className={`pb-5 px-2 text-[10px] font-black uppercase transition-all ${paymentMethod === 'card' ? "text-cyan-400 border-b-2 border-cyan-400" : "text-white/20"}`}>Credit Card</button>
                      <button onClick={() => setPaymentMethod('upi')} className={`pb-5 px-2 text-[10px] font-black uppercase transition-all flex items-center gap-2 ${paymentMethod === 'upi' ? "text-cyan-400 border-b-2 border-cyan-400" : "text-white/20"}`}>UPI / QR Pay <span className="text-[14px]">🇮🇳</span></button>
                    </div>

                    <AnimatePresence mode="wait">
                      {paymentMethod === 'card' ? (
                        <motion.form key="card" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-8" onSubmit={handlePayment}>
                          <div className="space-y-1">
                            <label className="text-[7px] font-black text-white/30 uppercase tracking-widest ml-1">Cardholder Name</label>
                            <input type="text" placeholder="NAME AS PER RECORDS" required className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-6 py-4 outline-none focus:border-cyan-500 text-[10px] font-bold uppercase text-white transition-all" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[7px] font-black text-white/30 uppercase tracking-widest ml-1">Card Number</label>
                            <input type="text" placeholder="XXXX XXXX XXXX XXXX" required className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-6 py-4 outline-none focus:border-cyan-500 text-[10px] font-bold uppercase text-white transition-all" />
                          </div>
                          <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-1">
                              <label className="text-[7px] font-black text-white/30 uppercase tracking-widest ml-1">Expiry</label>
                              <input type="text" placeholder="MM/YY" required className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-6 py-4 outline-none focus:border-cyan-500 text-[10px] font-bold uppercase text-white transition-all" />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[7px] font-black text-white/30 uppercase tracking-widest ml-1">Security Code</label>
                              <input type="password" placeholder="CVV" required className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-6 py-4 outline-none focus:border-cyan-500 text-[10px] font-bold uppercase text-white transition-all" />
                            </div>
                          </div>
                          <button className="w-full bg-cyan-600 text-white py-6 rounded-2xl font-black uppercase text-[11px] mt-10 hover:bg-white hover:text-black transition-all shadow-lg shadow-cyan-900/20">Authorize Transaction</button>
                        </motion.form>
                      ) : (
                        <motion.div key="upi" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-10">
                           <div className="flex flex-col md:flex-row gap-12 items-center bg-white/[0.02] p-8 rounded-3xl border border-white/5">
                              <div
  onClick={handlePayment}
  className="p-4 bg-white rounded-2xl cursor-pointer shadow-[0_0_50px_rgba(6,182,212,0.2)] hover:scale-105 transition-all"
>
  {(() => {
  const upiLink = `upi://pay?pa=7498463025@ibl&pn=Aditya&am=11&cu=INR&tn=ADYXPayment`;
  const encodedLink = encodeURIComponent(upiLink);

  return (
    <img
      src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodedLink}`}
      alt="Scan to Pay"
      className="w-40 h-40"
    />
  );
})()}
</div>
                              <div className="flex-1 space-y-6 text-center md:text-left">
                                 <div className="flex justify-center md:justify-start gap-4 opacity-50">
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" alt="UPI" className="h-5" />
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg" alt="GPay" className="h-5" />
                                 </div>
                                 <div className="space-y-4">
                                    <div className="p-4 bg-black/40 border border-white/5 rounded-xl">
                                       <p className="text-[8px] text-white/30 uppercase font-black">Merchant ID</p>
                                       <p className="text-[11px] text-cyan-500 font-mono italic">ADYX_INDIA_CORP</p>
                                    </div>
                                    <div className="p-4 bg-black/40 border border-white/5 rounded-xl">
                                       <p className="text-[8px] text-white/30 uppercase font-black">Secure Status</p>
                                       <p className="text-[10px] text-emerald-400 font-bold uppercase">Ready for Scan</p>
                                    </div>
                                 </div>
                              </div>
                           </div>
                           <p className="text-[9px] text-white/20 italic uppercase tracking-[0.2em] text-center">Authorized payment console secured by 256-bit encryption protocol.</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CarDetails;