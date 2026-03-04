import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF, OrbitControls, Stage, Environment, ContactShadows, Center } from "@react-three/drei";

function Model({ path }) {
  const { scene } = useGLTF(path);
  return <primitive object={scene} />;
}

const BookingCarViewer = ({ modelPath }) => {
  return (
    <div className="w-full h-[450px] rounded-2xl overflow-hidden bg-[#050507] border border-white/5 relative group">
      <Canvas dpr={[1, 2]} shadows camera={{ position: [0, 0, 5], fov: 25 }}>
        {/* Cinematic Lighting for Reflections */}
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} />
        
        <Suspense fallback={null}>
          {/* Stage automatically handles scaling and perfect centering */}
          <Stage environment="city" intensity={0.5} contactShadow={false} adjustCamera={true}>
            <Center top>
               <Model path={modelPath} />
            </Center>
          </Stage>
          
          <Environment preset="night" />
          
          <ContactShadows 
            position={[0, -0.01, 0]}
            opacity={0.7} 
            scale={15} 
            blur={2.5} 
            far={2} 
            color="#000000"
          />
        </Suspense>

        <OrbitControls 
          enableZoom={true} 
          minPolarAngle={Math.PI / 4} 
          maxPolarAngle={Math.PI / 2.1} 
          makeDefault 
          autoRotate={false}
        />
      </Canvas>

      {/* Control Hint Label */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 px-4 py-1 rounded-full">
           <p className="text-[10px] text-white/40 uppercase tracking-[0.4em] font-bold">
             Interact 360°
           </p>
        </div>
      </div>
    </div>
  );
};

export default BookingCarViewer;