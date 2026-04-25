import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Environment, ContactShadows, OrbitControls } from "@react-three/drei";
import { Suspense, useRef, useEffect, useState, Component } from "react";
import * as THREE from "three";
import mountainBg from "../assets/mountain.png";
import ParkingLot from "./ParkingLot";

export let globalCamera = null;
export let carRef = { current: null };
export let bgRef = { current: null };

const FALLBACK_MODEL = "/models/car.glb";

// --- Robust Error Boundary ---
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, lastModel: props.model };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.warn("3D Model failed to load, switching to fallback.", error);
  }

  // Reset error state if the model prop changes
  static getDerivedStateFromProps(props, state) {
    if (props.model !== state.lastModel) {
      return { hasError: false, lastModel: props.model };
    }
    return null;
  }

  render() {
    if (this.state.hasError) {
      return <Car model={FALLBACK_MODEL} />;
    }
    return this.props.children;
  }
}

function Car({ model }) {
  // This hook will throw an error if model is 404, caught by ErrorBoundary
  const { scene } = useGLTF(model || FALLBACK_MODEL);
  const ref = useRef();

  useEffect(() => {
    if (!scene) return;
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
    <primitive 
      key={model} 
      ref={ref} 
      object={scene} 
      scale={2.7} 
      position={[0, -0.8, 0]} 
    />
  );
}

export default function Hero3D({ model = FALLBACK_MODEL, allModels = [] }) {
  const localBgRef = useRef();
  useEffect(() => { bgRef.current = localBgRef.current; }, []);

  // Preloading is disabled for external URLs to prevent "Uncaught 404" crashes
  // Only preload the reliable local fallback
  useEffect(() => {
    useGLTF.preload(FALLBACK_MODEL);
  }, []);

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
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
          camera={{ position: [0, 2.2, 8], fov: 38 }}
          onCreated={({ camera, scene }) => { 
            globalCamera = camera;
            scene.fog = new THREE.Fog("#050507", 15, 60); 
          }}
          onError={(e) => console.error("Canvas Error:", e)}
        >
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 15, 10]} intensity={1.5} castShadow />
          <Environment preset="sunset" />
          
          <Suspense fallback={null}>
            <ErrorBoundary model={model}>
              <Car model={model} />
            </ErrorBoundary>
            
            <group position={[0, -0.1, -6]}>
              <ParkingLot />
            </group>

            <Ground />
            <ContactShadows position={[0, -1.05, 0]} opacity={0.8} scale={20} blur={2.5} far={4.5} />
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
