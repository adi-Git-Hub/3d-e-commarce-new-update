import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Environment, ContactShadows, OrbitControls } from "@react-three/drei";
import { Suspense, useRef, useEffect } from "react";
import * as THREE from "three";
import mountainBg from "../assets/mountain.png";
import ParkingLot from "./ParkingLot";

export let globalCamera = null;
export let carRef = { current: null };
export let bgRef = { current: null };

useGLTF.preload("/models/car.glb");

function Car({ model }) {
  const { scene } = useGLTF(model);
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
    <primitive ref={ref} object={scene} scale={2.7} position={[0, -0.8, 0]} />
  );
}

/* 👇 YAHI PASTE KARNA HAI (Car ke niche) */

function Ground() {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -1.05, 0]}
      receiveShadow
    >
      <planeGeometry args={[200, 200]} />
      <meshStandardMaterial
        color="#0a0a0c"
        roughness={0.9}
        metalness={0.1}
      />
    </mesh>
  );
}

export default function Hero3D({ model = "/models/car.glb" }) {
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
       <Canvas
 shadows
 dpr={[1,1.5]}
 gl={{ antialias:true, alpha:true }}
 camera={{ position: [0, 2.2, 8], fov: 38 }}
          onCreated={({ camera, scene }) => { 
            globalCamera = camera;
            scene.fog = new THREE.Fog("#050507", 15, 60); 
          }}
        >
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 15, 10]} intensity={1.5} castShadow />
          <Environment preset="sunset" />
          <Suspense fallback={null}>
 <Car model={model} />

  {/* parking cars */}
 <group position={[0,-0.1,-6]}>
  <ParkingLot />
</group>

  <Ground />
  <ContactShadows position={[0,-1.05,0]} opacity={0.8} scale={20} blur={2.5} far={4.5} />
</Suspense>
         <OrbitControls
  enableZoom={false}
  enablePan={false}
  enableRotate={true}
/>
        </Canvas>
      </div>
    </div>
  );
}