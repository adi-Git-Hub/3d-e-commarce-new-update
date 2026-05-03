import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF, OrbitControls, Stage, Environment, Center } from "@react-three/drei";

function Model({ path }) {
  const { scene } = useGLTF(path);
  return <primitive object={scene} />;
}

const BookingCarViewer = ({ modelPath }) => {
  return (
    <div className="w-full h-full relative" style={{ minHeight: '500px' }}>
      <Canvas 
        dpr={[1, 2]} 
        shadows 
        camera={{ position: [0, 0, 5], fov: 35 }} 
        gl={{ alpha: true, antialias: true }}
        style={{ pointerEvents: 'auto', zIndex: 10 }}
      >
        <ambientLight intensity={0.7} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} />
        
        <Suspense fallback={null}>
          {/* adjustCamera={true} guarantees the car will be visible and centered */}
          <Stage environment="city" intensity={0.6} contactShadow={false} adjustCamera={true}>
            <Center top>
               <Model path={modelPath} />
            </Center>
          </Stage>
          <Environment preset="night" />
        </Suspense>

        <OrbitControls 
          enableZoom={false} 
          minPolarAngle={Math.PI / 4} 
          maxPolarAngle={Math.PI / 2.1} 
          makeDefault 
        />
      </Canvas>
    </div>
  );
};

export default BookingCarViewer;