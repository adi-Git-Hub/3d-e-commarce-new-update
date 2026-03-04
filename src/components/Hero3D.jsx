import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Environment, ContactShadows, OrbitControls } from "@react-three/drei";
import { Suspense, useRef, useEffect } from "react";
import * as THREE from "three";
import mountainBg from "../assets/mountain.png";

export let globalCamera = null;
export let carRef = { current: null };
export let bgRef = { current: null };

useGLTF.preload("/models/car.glb");

function Car() {
  const { scene } = useGLTF("/models/car.glb");
  const ref = useRef();

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          child.material.envMapIntensity = 2;
          child.material.roughness = 0.15;
        }
      }
    });
  }, [scene]);

  useFrame(() => { carRef.current = ref.current; });

  return (
    <primitive ref={ref} object={scene} scale={2.7} position={[0, -1.4, 0]} />
  );
}

export default function Hero3D() {
  const localBgRef = useRef();
  useEffect(() => { bgRef.current = localBgRef.current; }, []);

  return (
    <div className="fixed inset-0 w-full h-full bg-[#050507] overflow-hidden">
      <img
        ref={localBgRef}
        src={mountainBg}
        className="absolute inset-0 w-full h-full object-cover opacity-40 grayscale-[10%]"
        style={{ transform: "scale(1.1)", zIndex: 0 }}
      />
      <div className="absolute inset-0 z-[1] pointer-events-none">
        <Canvas shadows gl={{ antialias: true, alpha: true }} camera={{ position: [0, 1.2, 20], fov: 40 }}
          onCreated={({ camera, scene }) => { 
            globalCamera = camera;
            scene.fog = new THREE.Fog("#050507", 15, 60); 
          }}
        >
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 15, 10]} intensity={2.5} castShadow />
          <Environment preset="sunset" />
          <Suspense fallback={null}>
            <Car />
            <ContactShadows position={[0, -1.4, 0]} opacity={0.8} scale={20} blur={2.5} far={4.5} />
          </Suspense>
          <OrbitControls enableZoom={false} enablePan={false} minPolarAngle={Math.PI / 3} maxPolarAngle={Math.PI / 2} makeDefault />
        </Canvas>
      </div>
    </div>
  );
}