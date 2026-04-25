import React, { useState, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stage, useGLTF } from "@react-three/drei";
import { useCars } from "../context/CarContext";

// --- 3D ---
const Model = ({ path }) => {
  const { scene } = useGLTF(path);
  return <primitive object={scene} scale={1.4} />;
};

const CarCanvas = ({ modelPath }) => (
  <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 4], fov: 40 }}>
    <Suspense fallback={null}>
      <Stage environment="city" intensity={0.5}>
        <Model path={modelPath} />
      </Stage>
    </Suspense>
    <OrbitControls autoRotate autoRotateSpeed={3} enableZoom={false} />
  </Canvas>
);

export default function Buy() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const { cars, loading } = useCars();
  
  // Find car using slug
  const car = cars.find((c) => c.slug === slug);

  const [step, setStep] = useState("payment");

  const verifyPayment = () => {
    setStep("verifying");

    setTimeout(() => {
      setStep("success");
      setTimeout(() => {
        navigate("/success", { state: { carName: car.name } });
      }, 2000);
    }, 3500);
  };

  // Safety check before rendering
  if (loading) {
    return <div className="bg-[#050507] h-screen text-white flex items-center justify-center font-sans uppercase tracking-[0.5em]">Loading Neural Data...</div>;
  }

  if (!car) {
    return <div className="bg-[#050507] h-screen text-white flex items-center justify-center font-sans uppercase tracking-[0.5em]">Car Not Found</div>;
  }

  const modelPath = car.model_url || car.modelPath;

  return (
    <div className="min-h-screen bg-[#050507] text-white p-8 relative overflow-hidden">

      {/* Background */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(#00D4FF 1px, transparent 1px), linear-gradient(90deg, #00D4FF 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      <AnimatePresence mode="wait">

        {/* ---------------- PAYMENT UI ---------------- */}
        {step === "payment" && (
          <motion.div
            key="pay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid lg:grid-cols-2 gap-12 max-w-7xl mx-auto relative z-10"
          >
            {/* LEFT SIDE */}
            <div className="bg-[#0d0d11] rounded-3xl border border-white/10 p-10 relative overflow-hidden">

              <div className="absolute -inset-1 blur-3xl bg-cyan-500/10" />

              <p className="text-cyan-400 text-xs tracking-widest mb-3 uppercase">
                Bespoke Deployment
              </p>

              <h1 className="text-5xl font-black italic mb-8">{car.name}</h1>

              <div className="h-64 w-full mb-6">
                {modelPath && (
                  <CarCanvas modelPath={modelPath} />
                )}
              </div>

              <div className="grid grid-cols-2 gap-6 text-sm">
                <div>
                  <p className="text-neutral-500">0-100</p>
                  <p className="text-xl font-bold">{car?.specs?.zeroToSixty || car?.accel || "N/A"}</p>
                </div>
                <div>
                  <p className="text-neutral-500">Top Speed</p>
                  <p className="text-xl font-bold">{car?.specs?.topSpeed || car?.speed || "N/A"}</p>
                </div>
              </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="bg-[#0d0d11] rounded-3xl border border-white/10 p-10 relative">

              <h2 className="text-3xl font-bold mb-6">Authorization Method</h2>

              {/* QR */}
              <div className="flex flex-col items-center">

                <div className="bg-white p-4 rounded-xl mb-6">
                  <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=UPI-PAYMENT"
                    alt="QR"
                  />
                </div>

                <p className="text-cyan-400 text-xs mb-3">
                  ADYX Verified Merchant
                </p>

                <p className="text-neutral-500 text-sm mb-8">
                  Scan and complete payment
                </p>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={verifyPayment}
                  className="px-8 py-3 bg-cyan-500 text-black font-bold rounded-xl hover:bg-cyan-400 transition"
                >
                  I Have Paid
                </motion.button>
              </div>

              {/* Upload */}
              <div className="mt-10 border border-dashed border-white/20 rounded-xl p-6 text-center">
                <p className="text-neutral-400 text-sm">
                  Upload payment screenshot (optional)
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ---------------- VERIFY ---------------- */}
        {step === "verifying" && (
          <motion.div
            key="verify"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col justify-center items-center h-[70vh]"
          >
            <div className="w-20 h-20 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mb-6" />

            <p className="text-cyan-400 text-lg">
              Securing neural payment channel...
            </p>
            <p className="text-neutral-500 mt-2">
              Validating encrypted transaction
            </p>
          </motion.div>
        )}

        {/* ---------------- SUCCESS ---------------- */}
        {step === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col justify-center items-center h-[70vh]"
          >
            <h2 className="text-4xl font-bold text-cyan-400 mb-4">
              Payment Authorized
            </h2>
            <p className="text-neutral-400">
              Allocating your ADYX vehicle...
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}