import { useRef, useEffect, Suspense, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree, ThreeEvent } from '@react-three/fiber';
import { Environment, useTexture, Text3D, Center, Text } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, Variants } from 'framer-motion';

import { Mountains } from './Mountains';
import { ForestAmbience } from './ForestAmbience';
import ScrollCars from "./ScrollCars";
import { cars } from "../../../../data/cars";

const SEGMENT_LENGTH = 40;
const NUM_SEGMENTS = 10;
const TOTAL_LENGTH = SEGMENT_LENGTH * NUM_SEGMENTS;

export const scrollState = { 
  progress: 0,
  velocity: 0,
  camZ: 8,
  smoothVel: 0,
  smoothProgress: 0,
  step: 0,
  orbitAngle: 0,
  targetOrbitAngle: 0
};

export function updateScroll(progress: number, velocity: number): void {
  scrollState.progress = progress;
  scrollState.velocity = velocity;
}

function SmoothScrollSystem() {
  useFrame((state, delta: number) => {
    const lerp = 1 - Math.pow(0.001, delta);
    scrollState.smoothProgress = THREE.MathUtils.lerp(
      scrollState.smoothProgress,
      scrollState.progress,
      lerp
    );
    scrollState.smoothVel = THREE.MathUtils.lerp(
      scrollState.smoothVel,
      scrollState.velocity,
      lerp
    );
  });
  return null;
}

function StepScrollController() {
  const cooldown = useRef<boolean>(false);
  
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (cooldown.current) return;
      if (Math.abs(e.deltaY) < 10) return;
      
      cooldown.current = true;
      
      if (e.deltaY > 0) {
        scrollState.step += 1;
      } else {
        scrollState.step -= 1;
      }
      
      if (scrollState.step < 0) scrollState.step = 0;
      
      setTimeout(() => {
        cooldown.current = false;
      }, 600);
    };
    
    window.addEventListener("wheel", onWheel);
    return () => window.removeEventListener("wheel", onWheel);
  }, []);
  
  return null;
}

// =============================================
// MANUAL ORBIT CONTROLLER (FOR SIDE VIEW)
// =============================================
function OrbitInteraction() {
  const isDragging = useRef<boolean>(false);
  const previousX = useRef<number>(0);

  useEffect(() => {
    const onPointerDown = (e: Event) => {
      const ptrEvent = e as PointerEvent;
      if (scrollState.step % 3 === 1) {
        isDragging.current = true;
        previousX.current = ptrEvent.clientX;
      }
    };

    const onPointerMove = (e: Event) => {
      const ptrEvent = e as PointerEvent;
      if (isDragging.current && scrollState.step % 3 === 1) {
        const deltaX = ptrEvent.clientX - previousX.current;
        scrollState.targetOrbitAngle -= deltaX * 0.005; 
        previousX.current = ptrEvent.clientX;
      }
    };

    const onPointerUp = () => {
      isDragging.current = false;
    };

    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);

    return () => {
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
    };
  }, []);

  return null;
}

// =============================================
// DYNAMIC CAR LIGHTING (OPTIMIZED)
// =============================================
function DynamicCarLighting() {
  const lightGroupRef = useRef<THREE.Group>(null!);
  
  useFrame(() => {
    if (!lightGroupRef.current) return;
    const step = scrollState.step;
    const carIndexFromStep = Math.floor(step / 3);
    const targetZ = -carIndexFromStep * 35;
    
    lightGroupRef.current.position.z = THREE.MathUtils.lerp(
      lightGroupRef.current.position.z,
      targetZ,
      0.1
    );
  });

  return (
    <group ref={lightGroupRef}>
      <pointLight position={[0, 4, 2]} distance={15} intensity={8} color="#38bdf8" />
      <pointLight position={[0, 0.5, 3]} distance={8} intensity={4} color="#ef4444" />
    </group>
  );
}

// =============================================
// EPIC NIGHT ENVIRONMENT
// =============================================
function EpicMoon() {
  const moonGroupRef = useRef<THREE.Group>(null!);
  const { camera } = useThree();
  const texture = useTexture("/moon_1024.jpg");

  useFrame((state) => {
    moonGroupRef.current.position.x = camera.position.x;
    moonGroupRef.current.position.y = camera.position.y + 45 + Math.sin(state.clock.elapsedTime * 0.5) * 2;
    moonGroupRef.current.position.z = camera.position.z - 180;
  });

  return (
    <group ref={moonGroupRef}>
      <mesh>
        <sphereGeometry args={[8, 64, 64]} />
        <meshBasicMaterial map={texture} color="#ffffff" toneMapped={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[8.6, 32, 32]} />
        <meshBasicMaterial color="#fef08a" transparent opacity={0.15} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[14, 32, 32]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.06} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <directionalLight color="#e0f2fe" intensity={0.3} position={[0, 10, 10]} />
    </group>
  );
}

function CinematicStars() {
  const pointsRef = useRef<THREE.Points>(null!);
  const starCount = 800;

  const starGeometry = useMemo(() => {
    const positions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 600;      
      positions[i+1] = Math.random() * 200 + 10;       
      positions[i+2] = (Math.random() - 0.5) * 600;    
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geometry;
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.005;
    }
  });

  return (
    <points ref={pointsRef} geometry={starGeometry}>
      <pointsMaterial size={0.7} color="#ffffff" transparent opacity={0.8} sizeAttenuation={true} blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  );
}

function HorizonCityGlow() {
  const { camera } = useThree();
  const glowRef = useRef<THREE.Mesh>(null!);
  
  useFrame(() => {
    glowRef.current.position.z = camera.position.z - 200;
    glowRef.current.position.x = camera.position.x;
  });

  return (
    <mesh ref={glowRef} position={[0, 0, -200]}>
      <planeGeometry args={[800, 150]} />
      <meshBasicMaterial color="#0c1d36" transparent opacity={0.5} blending={THREE.AdditiveBlending} depthWrite={false} />
    </mesh>
  );
}

// =============================================
// CITY SKYLINE COMPONENTS (OPTIMIZED & REALISTIC)
// =============================================
interface BuildingData {
  x: number;
  z: number;
  w: number;
  h: number;
}

function CitySkyline() {
  const skylineRef = useRef<THREE.Group>(null!);
  
  const buildings = useMemo<BuildingData[]>(() => {
    return Array.from({ length: 80 }).map(() => {
      const side = Math.random() > 0.5 ? 1 : -1;
      return {
        x: (14 + Math.random() * 30) * side,
        z: -(Math.random() * 600),
        w: 6 + Math.random() * 8,
        h: 25 + Math.random() * 80
      };
    });
  }, []);

  useFrame(() => {
    if (!skylineRef.current) return;
    const camZ = scrollState.camZ;
    skylineRef.current.position.z = Math.floor(camZ / 600) * 600;
  });

  return (
    <group ref={skylineRef}>
      <SkylineLayer buildings={buildings} offset={0} />
      <SkylineLayer buildings={buildings} offset={-600} />
      <SkylineLayer buildings={buildings} offset={600} />
    </group>
  );
}

interface SkylineLayerProps {
  buildings: BuildingData[];
  offset: number;
}

function SkylineLayer({ buildings, offset }: SkylineLayerProps) {
  return (
    <group position={[0, 0, offset]}>
      {buildings.map((b, i) => (
        <SkylineBuilding key={i} x={b.x} z={b.z} w={b.w} h={b.h} />
      ))}
    </group>
  );
}

function SkylineBuilding({ x, z, w, h }: BuildingData) {
  const depth = useMemo(() => 4 + Math.random() * 6, []);
  const rows = Math.floor(h / 2);
  const cols = Math.floor(w * 2);

  const bldgColor = useMemo(() => {
    const colors = ['#050b14', '#071226', '#0a0f1c', '#09101c', '#020617'];
    return colors[Math.floor(Math.random() * colors.length)];
  }, []);

  const windows = useMemo(() => {
    const list: { x: number; y: number; z: number }[] = [];
    for (let y = 0; y < rows; y++) {
      if (Math.random() > 0.75) continue; 
      
      for (let winX = 0; winX < cols; winX++) {
        if (Math.random() > 0.60) continue; 
        
        list.push({
          x: (winX - cols / 2) * 0.5,
          y: (y - rows / 2),
          z: depth / 2 + 0.05
        });
      }
    }
    return list;
  }, [rows, cols, depth]);

  const doors = useMemo(() => {
    const arr: { x: number; y: number; z: number; isOpen: boolean; color: string }[] = [];
    const numDoors = 1 + Math.floor(Math.random() * 3);
    for (let i = 0; i < numDoors; i++) {
      const isOpen = Math.random() > 0.4;
      const xPos = (i - numDoors / 2) * 2 + 1;
      if (Math.abs(xPos) > w / 2 - 0.8) continue;
      arr.push({
        x: xPos,
        y: -h / 2 + 1,
        z: depth / 2 + 0.06,
        isOpen,
        color: isOpen ? ['#fef08a', '#38bdf8', '#ffedd5', '#a7f3d0'][Math.floor(Math.random() * 4)] : '#020617'
      });
    }
    return arr;
  }, [w, h, depth]);

  const roofFeature = useMemo(() => {
    const type = Math.floor(Math.random() * 4);
    const offset = (Math.random() * (w / 2 - 1)) * (Math.random() > 0.5 ? 1 : -1);
    return { type, offset };
  }, [w]);

  const windowGeometry = useMemo(() => new THREE.PlaneGeometry(0.35, 0.45), []);
  const windowMaterial = useMemo(() => new THREE.MeshBasicMaterial({ toneMapped: false, transparent: true, opacity: 0.9 }), []);

  const instancedMeshRef = useRef<THREE.InstancedMesh>(null!);

  useEffect(() => {
    if (!instancedMeshRef.current || windows.length === 0) return;
    
    const dummy = new THREE.Object3D();
    const tempColor = new THREE.Color();
    const windowColors = ['#e0f2fe', '#fef08a', '#38bdf8', '#fdba74', '#1e3a8a'];

    windows.forEach((win, i) => {
      dummy.position.set(win.x, win.y, win.z);
      dummy.updateMatrix();
      instancedMeshRef.current.setMatrixAt(i, dummy.matrix);
      tempColor.set(windowColors[Math.floor(Math.random() * windowColors.length)]);
      instancedMeshRef.current.setColorAt(i, tempColor);
    });
    
    instancedMeshRef.current.instanceMatrix.needsUpdate = true;
    if (instancedMeshRef.current.instanceColor) {
      instancedMeshRef.current.instanceColor.needsUpdate = true;
    }
    
    if (instancedMeshRef.current.geometry) {
      instancedMeshRef.current.computeBoundingSphere();
    }
  }, [windows]);

  return (
    <group position={[x, h / 2, z]}>
      <mesh>
        <boxGeometry args={[w, h, depth]} />
        <meshStandardMaterial color={bldgColor} roughness={0.9} metalness={0.2} />
      </mesh>

      {doors.map((door, idx) => (
        <group key={`door-${idx}`} position={[door.x, door.y, door.z]}>
          <mesh>
             <planeGeometry args={[1.2, 2]} />
             {door.isOpen ? (
               <meshBasicMaterial color={door.color} toneMapped={false} />
             ) : (
               <meshStandardMaterial color={door.color} roughness={0.8} />
             )}
          </mesh>
          <mesh position={[0, 1.1, 0.2]}>
             <boxGeometry args={[1.4, 0.1, 0.4]} />
             <meshStandardMaterial color="#1e293b" roughness={0.9} />
          </mesh>
        </group>
      ))}

      {windows.length > 0 && (
        <instancedMesh 
          ref={instancedMeshRef} 
          args={[windowGeometry, windowMaterial, windows.length]}
          frustumCulled={false} 
        />
      )}

      <group position={[0, h / 2, 0]}>
        <mesh position={[0, 0.25, 0]}>
          <boxGeometry args={[w, 0.5, depth]} />
          <meshStandardMaterial color={bldgColor} roughness={1} />
        </mesh>
        
        {roofFeature.type === 1 && (
          <mesh position={[roofFeature.offset, 1.5, 0]}>
            <boxGeometry args={[2, 2, 2]} />
            <meshStandardMaterial color="#1e293b" roughness={0.7} />
          </mesh>
        )}
        {roofFeature.type === 2 && (
          <mesh position={[roofFeature.offset, 3, 0]}>
            <cylinderGeometry args={[0.02, 0.1, 6]} />
            <meshBasicMaterial color="#ef4444" toneMapped={false} />
          </mesh>
        )}
        {roofFeature.type === 3 && (
          <mesh position={[0, 1.5, 0]}>
            <boxGeometry args={[w - 2, 2, 0.5]} />
            <meshStandardMaterial color="#0f172a" roughness={0.9} />
          </mesh>
        )}
      </group>
    </group>
  );
}

// =============================================
// FOOTPATH PROPS (CAT, TRASH, PAPERS)
// =============================================
interface LowPolyCatProps {
  position: [number, number, number];
  side: number;
}

function LowPolyCat({ position, side }: LowPolyCatProps) {
  return (
    <group position={position} rotation={[0, side === 1 ? -Math.PI / 2 : Math.PI / 2, 0]}>
      <mesh position={[0, 0.15, 0]} castShadow>
        <boxGeometry args={[0.3, 0.2, 0.15]} />
        <meshStandardMaterial color="#020617" roughness={1} />
      </mesh>
      <mesh position={[0.15, 0.3, 0]} castShadow>
        <boxGeometry args={[0.15, 0.15, 0.15]} />
        <meshStandardMaterial color="#020617" roughness={1} />
      </mesh>
      <mesh position={[0.15, 0.4, 0.04]}>
        <coneGeometry args={[0.03, 0.08, 4]} />
        <meshStandardMaterial color="#020617" roughness={1} />
      </mesh>
      <mesh position={[0.15, 0.4, -0.04]}>
        <coneGeometry args={[0.03, 0.08, 4]} />
        <meshStandardMaterial color="#020617" roughness={1} />
      </mesh>
      <mesh position={[-0.15, 0.2, 0]} rotation={[0, 0, -Math.PI / 4]}>
         <cylinderGeometry args={[0.015, 0.015, 0.25]} />
         <meshStandardMaterial color="#020617" roughness={1} />
      </mesh>
    </group>
  );
}

// =============================================
// ROAD & LIGHTS
// =============================================
interface RoadSegmentProps {
  index: number;
}

function RoadSegment({ index }: RoadSegmentProps) {
  const groupRef = useRef<THREE.Group>(null!);
  
  useFrame(() => {
    if (!groupRef.current) return;
    const camZ = scrollState.camZ;
    let baseZ = -index * SEGMENT_LENGTH;
    while (baseZ > camZ + SEGMENT_LENGTH) baseZ -= TOTAL_LENGTH;
    while (baseZ < camZ - TOTAL_LENGTH + SEGMENT_LENGTH) baseZ += TOTAL_LENGTH;
    groupRef.current.position.z = baseZ;
  });

  const footpathProps = useMemo(() => {
    const props: { type: 'bin' | 'paper' | 'cat'; side: number; z: number; rot?: number }[] = [];
    const numBins = 1 + Math.floor(Math.random() * 2);
    for (let i = 0; i < numBins; i++) {
      props.push({ type: 'bin', side: Math.random() > 0.5 ? 1 : -1, z: -Math.random() * SEGMENT_LENGTH });
    }
    for (let i = 0; i < 6; i++) {
      props.push({ type: 'paper', side: Math.random() > 0.5 ? 1 : -1, z: -Math.random() * SEGMENT_LENGTH, rot: Math.random() * Math.PI });
    }
    if (Math.random() > 0.8) {
      props.push({ type: 'cat', side: Math.random() > 0.5 ? 1 : -1, z: -Math.random() * SEGMENT_LENGTH });
    }
    return props;
  }, []);

  return (
    <group ref={groupRef}>
      <mesh position={[0, -0.01, -SEGMENT_LENGTH / 2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[8, SEGMENT_LENGTH]} />
        <meshStandardMaterial color="#0f172a" roughness={0.95} metalness={0} />
      </mesh>
      
      {[-9, 9].map((x, i) => (
        <mesh key={`footpath-${i}`} position={[x, 0.02, -SEGMENT_LENGTH / 2]} receiveShadow>
          <boxGeometry args={[10, 0.05, SEGMENT_LENGTH]} />
          <meshStandardMaterial color="#2d3748" roughness={0.9} metalness={0.1} />
        </mesh>
      ))}

      {[-9, 9].map((x, sideIdx) => (
        <group key={`joints-${sideIdx}`}>
          {Array.from({ length: 8 }).map((_, i) => (
            <mesh key={`joint-${i}`} position={[x, 0.021, -i * 5]} receiveShadow>
              <boxGeometry args={[10, 0.051, 0.05]} />
              <meshStandardMaterial color="#1a202c" roughness={1} />
            </mesh>
          ))}
        </group>
      ))}

      {[-4.1, 4.1].map((x, i) => (
        <mesh key={`curb-${i}`} position={[x, 0.06, -SEGMENT_LENGTH / 2]} receiveShadow>
          <boxGeometry args={[0.3, 0.15, SEGMENT_LENGTH]} />
          <meshStandardMaterial color="#4a5568" roughness={0.8} />
        </mesh>
      ))}

      {[-4.3, 4.3].map((x, i) => (
        <mesh key={`paint-${i}`} position={[x, 0.046, -SEGMENT_LENGTH / 2]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.05, SEGMENT_LENGTH]} />
          <meshStandardMaterial color="#eab308" roughness={0.5} emissive="#eab308" emissiveIntensity={0.2} toneMapped={false} />
        </mesh>
      ))}

      {[-3.9, 3.9].map((x, i) => (
        <mesh key={i} position={[x, 0.001, -SEGMENT_LENGTH / 2]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.1, SEGMENT_LENGTH]} />
          <meshStandardMaterial color="#ffffff" opacity={0.8} transparent />
        </mesh>
      ))}

      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={i} position={[0, 0.002, -(i * 7) - 2]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.08, 3]} />
          <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={2} />
        </mesh>
      ))}

      {Array.from({ length: 4 }).map((_, i) => (
        <group key={i}>
          {[-4, 4].map((x) => (
            <mesh key={x} position={[x, 0.05, -(i * 10) - 5]}>
              <boxGeometry args={[0.05, 0.05, 0.05]} />
              <meshStandardMaterial color="#ffe082" emissive="#ffd54f" emissiveIntensity={2} toneMapped={false} />
            </mesh>
          ))}
        </group>
      ))}

      {footpathProps.map((prop, idx) => {
        if (prop.type === 'bin') {
          return (
            <mesh key={`prop-${idx}`} position={[prop.side * (4.5 + Math.random()), 0.3, prop.z]}>
              <cylinderGeometry args={[0.2, 0.15, 0.5, 8]} />
              <meshStandardMaterial color="#475569" roughness={0.8} />
            </mesh>
          );
        } else if (prop.type === 'paper') {
          return (
            <mesh key={`prop-${idx}`} position={[prop.side * (4.5 + Math.random() * 3), 0.05, prop.z]} rotation={[-Math.PI / 2, 0, prop.rot ?? 0]}>
              <planeGeometry args={[0.3, 0.4]} />
              <meshStandardMaterial color="#e2e8f0" roughness={0.9} />
            </mesh>
          );
        } else if (prop.type === 'cat') {
          return <LowPolyCat key={`prop-${idx}`} position={[prop.side * (4.8 + Math.random()), 0.05, prop.z]} side={prop.side} />;
        }
        return null;
      })}
    </group>
  );
}

interface StreetLightSegmentProps {
  index: number;
}

function StreetLightSegment({ index }: StreetLightSegmentProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const side = index % 2 === 0 ? -1 : 1;
  const POLE_H = 7;

  useFrame(() => {
    if (!groupRef.current) return;
    const camZ = scrollState.camZ;
    let baseZ = -index * SEGMENT_LENGTH;
    while (baseZ > camZ + SEGMENT_LENGTH) baseZ -= TOTAL_LENGTH;
    while (baseZ < camZ - TOTAL_LENGTH + SEGMENT_LENGTH) baseZ += TOTAL_LENGTH;
    groupRef.current.position.z = baseZ;
  });

  return (
    <group ref={groupRef}>
      <mesh position={[side * 6, POLE_H / 2, -SEGMENT_LENGTH / 2]}>
        <cylinderGeometry args={[0.05, 0.1, POLE_H]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      <mesh position={[side * 5.2, POLE_H, -SEGMENT_LENGTH / 2]}>
        <boxGeometry args={[1.5, 0.2, 0.5]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      <mesh position={[side * 5, POLE_H - 0.15, -SEGMENT_LENGTH / 2]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={5} toneMapped={false} />
      </mesh>
    </group>
  );
}

// =============================================
// SCROLL WATCHER & CAMERA
// =============================================
interface ScrollWatcherProps {
  setCurrentCar: (v: number) => void;
  setViewMode: (v: "preview" | "detail") => void;
}

function ScrollWatcher({ setCurrentCar, setViewMode }: ScrollWatcherProps) {
  const lastCarRef = useRef<number>(0);

  useFrame(() => {
    const activeCarIndex = Math.min(
      Math.floor(scrollState.step / 3),
      cars.length - 1
    );
    
    if (lastCarRef.current !== activeCarIndex) {
      lastCarRef.current = activeCarIndex;
      setCurrentCar(activeCarIndex);
    }
    
    if (scrollState.velocity !== 0) {
      setViewMode("preview");
    }
  });
  return null;
}

interface CinematicCameraProps {
  viewMode: "preview" | "detail";
  carIndex: number;
}

function CinematicCamera({ viewMode, carIndex }: CinematicCameraProps) {
  const { camera } = useThree();
  const smoothPos = useRef<THREE.Vector3>(new THREE.Vector3());
  const smoothTarget = useRef<THREE.Vector3>(new THREE.Vector3());

  useEffect(() => {
    smoothPos.current.set(0, 2.5, 8);
    smoothTarget.current.set(0, 1.0, -2);
    camera.position.copy(smoothPos.current);
    camera.lookAt(smoothTarget.current);
  }, [camera]);

  useFrame((state, delta: number) => {
    const lerp = 1 - Math.pow(0.00001, delta);
    
    const step = scrollState.step;
    const stage = step % 3;
    const carIndexFromStep = Math.floor(step / 3);
    const carZ = -carIndexFromStep * 35;

    if (stage !== 1) {
      scrollState.targetOrbitAngle = 0;
    }
    
    scrollState.orbitAngle = THREE.MathUtils.lerp(
      scrollState.orbitAngle,
      scrollState.targetOrbitAngle,
      lerp
    );

    const pos = new THREE.Vector3();
    const look = new THREE.Vector3();

    if (stage === 0) {
      pos.set(0, 2.2, carZ + 7.5);
      look.set(0, 0.9, carZ - 3);
    } else if (stage === 1) {
      const radius = 8.5;
      const angle = scrollState.orbitAngle;
      
      pos.set(Math.cos(angle) * radius, 1.2, carZ + Math.sin(angle) * radius);
      look.set(0, 0.8, carZ);
    } else {
      pos.set(3.2, 1.3, carZ + 1.8);
      look.set(0, 1.0, carZ - 0.8);
    }

    smoothPos.current.lerp(pos, lerp);
    smoothTarget.current.lerp(look, lerp);
    
    scrollState.camZ = smoothPos.current.z;

    camera.position.copy(smoothPos.current);
    camera.lookAt(smoothTarget.current);
  });
  
  return null;
}

// =============================================
// CYBER PARTICLES (Ambient Effect)
// =============================================
function CyberParticles() {
  const count = 300;
  const pointsRef = useRef<THREE.Points>(null!);
  
  const positions = useMemo(() => new Float32Array(count * 3), [count]);
  const speeds = useMemo(() => new Float32Array(count), [count]);

  useEffect(() => {
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30;     
      positions[i * 3 + 1] = Math.random() * 8;          
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30; 
      speeds[i] = 0.005 + Math.random() * 0.015;
    }
    if (pointsRef.current) {
        pointsRef.current.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    }
  }, [count, positions, speeds]);

  useFrame(() => {
    if (!pointsRef.current) return;
    const positionsAtt = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    
    const carZ = -Math.floor(scrollState.step / 3) * 35; 

    for (let i = 0; i < count; i++) {
      let y = positionsAtt.getY(i);
      y += speeds[i];
      if (y > 8) y = 0;
      positionsAtt.setY(i, y);
    }
    
    positionsAtt.needsUpdate = true;
    pointsRef.current.position.z = THREE.MathUtils.lerp(pointsRef.current.position.z, carZ, 0.05);
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry />
      <pointsMaterial size={0.08} color="#38bdf8" transparent opacity={0.6} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
    </points>
  );
}

// =============================================
// FUTURISTIC 3D SHOWCASE UI COMPONENTS
// =============================================
interface CarData {
  name?: string;
  price?: number | string;
  model?: string;
  description?: string;
  speed?: string;
  accel?: string;
  hp?: string;
  range?: string;
  drivetrain?: string;
  battery?: string;
}

interface Futuristic3DUIProps {
  currentCar: number;
  navigate: ReturnType<typeof useNavigate>;
}

interface HologramButtonProps {
  position: [number, number, number];
  text: string;
  primary?: boolean;
  onClick: () => void;
}

function HologramButton({ position, text, primary, onClick }: HologramButtonProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    const targetScale = hovered ? 1.08 : 1;
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.15);
  });

  return (
    <group position={position}>
      <mesh 
        ref={meshRef}
        onClick={(e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onClick(); }}
        onPointerOver={(e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={(e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); setHovered(false); document.body.style.cursor = 'auto'; }}
      >
        <boxGeometry args={[0.9, 0.22, 0.04]} />
        <meshBasicMaterial 
          color={primary ? "#0ea5e9" : "#0f172a"} 
          transparent 
          opacity={hovered ? 0.9 : 0.6} 
          toneMapped={false} 
          blending={THREE.NormalBlending}
        />
        
        <mesh>
           <boxGeometry args={[0.95, 0.25, 0.02]} />
           <meshBasicMaterial 
              color={primary ? "#38bdf8" : "#38bdf8"} 
              transparent 
              opacity={hovered ? 0.8 : 0.2} 
              wireframe 
              blending={THREE.AdditiveBlending} 
              toneMapped={false}
           />
        </mesh>
        
        <Text position={[0, 0, 0.03]} fontSize={0.09} color={primary ? "#ffffff" : "#38bdf8"} letterSpacing={0.1}>
          {text}
        </Text>
      </mesh>
    </group>
  );
}

function Floating3DTitle({ currentCar }: { currentCar: number }) {
  const groupRef = useRef<THREE.Group>(null!);
  const car = cars[currentCar] as CarData | undefined;

  useFrame((state) => {
    if (!groupRef.current) return;
    
    const activeCarIndex = Math.floor(scrollState.step / 3);
    const carZ = -activeCarIndex * 35;
    const stage = scrollState.step % 3;
    
    // FIX: Significantly lowered the Y position so the text never goes above the browser viewport bounds
    const targetY = 2.5; 
    
    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, 0, 0.08); 
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY + Math.sin(state.clock.elapsedTime * 1.5) * 0.1, 0.08);
    groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, carZ, 0.08);
    
    groupRef.current.lookAt(state.camera.position);

    // FIX: Title is strictly limited to Stage 2 to prevent any overlap in Stage 1
    const targetScale = stage === 2 ? 0.7 : 0;
    groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.08);

    if (groupRef.current.scale.x < 0.01 && targetScale === 0) {
       groupRef.current.visible = false;
    } else {
       groupRef.current.visible = true;
    }
  });

  return (
    <group ref={groupRef} position={[0, 2.5, 0]} scale={0}>
      <Center>
        <Text3D 
          font="https://cdn.jsdelivr.net/npm/three/examples/fonts/helvetiker_bold.typeface.json"
          size={0.4} 
          height={0.05} 
          curveSegments={4}
          bevelEnabled
          bevelThickness={0.01}
          bevelSize={0.005}
          bevelSegments={1}
        >
          {car?.name || "SPECTRE"}
          <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={2.5} toneMapped={false} />
        </Text3D>
      </Center>
      <Center position={[0, -0.35, 0]}>
        <Text3D 
          font="https://cdn.jsdelivr.net/npm/three/examples/fonts/helvetiker_bold.typeface.json"
          size={0.15} 
          height={0.02} 
          curveSegments={4}
        >
          {car?.model || "PREMIUM EDITION"}
          <meshStandardMaterial color="#fef08a" emissive="#fef08a" emissiveIntensity={1.5} toneMapped={false} />
        </Text3D>
      </Center>
    </group>
  );
}

function InteractiveHologramPanel({ currentCar, navigate }: Futuristic3DUIProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const detailsRef = useRef<THREE.Group>(null!);
  const [showDetails, setShowDetails] = useState(false);
  const car = cars[currentCar] as CarData | undefined;

  const specs = useMemo(() => [
    { label: "TOP SPEED", value: car?.speed || "320 KM/H" },
    { label: "0-100 RAFTAR", value: car?.accel || "2.1 SEC" },
    { label: "TAAQAT (HP)", value: car?.hp || "1020 HP" },
    { label: "MAX RANGE", value: car?.range || "650 KM" },
    { label: "DRIVETRAIN", value: car?.drivetrain || "AWD Dual" },
    { label: "BATTERY", value: car?.battery || "120 kWh" },
  ], [car]);

  useFrame((state) => {
    if (!groupRef.current) return;
    
    const step = scrollState.step;
    const stage = step % 3;
    const activeCarIndex = Math.floor(step / 3);
    const isActive = stage === 2;
    const carZ = -activeCarIndex * 35;
    
    const targetZ = carZ - 0.5; 
    // FIX: Buttons placed strictly in between the lowered Title and the Car Roof 
    const targetY = 1.6; 
    
    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, 0, 0.08); 
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY + Math.sin(state.clock.elapsedTime * 1.2) * 0.05, 0.08);
    groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetZ, 0.08); 

    groupRef.current.lookAt(state.camera.position);

    // FIX: Further scaled down to avoid overlap
    const targetScale = isActive ? 0.65 : 0;
    groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.08);

    if (groupRef.current.scale.x < 0.01 && targetScale === 0) {
      groupRef.current.visible = false;
    } else {
      groupRef.current.visible = true;
    }

    if (!isActive && showDetails) setShowDetails(false);

    if (detailsRef.current) {
      const detailScale = showDetails ? 1 : 0;
      detailsRef.current.scale.lerp(new THREE.Vector3(detailScale, detailScale, detailScale), 0.15);
    }
  });

  return (
    <group ref={groupRef} scale={0}>
       {/* FIX: Rupee format preserved */}
       <Text position={[0, 0.45, 0]} fontSize={0.12} color="#FFD700" letterSpacing={0.1}>
          PRICE: ₹{car?.price || "11 Crore"}
          <meshBasicMaterial color="#FFD700" toneMapped={false} />
       </Text>
       
       <HologramButton position={[0, 0.1, 0]} text="BOOK NOW" primary onClick={() => navigate('/booking')} />
       <HologramButton position={[0, -0.25, 0]} text="BUY NOW" primary onClick={() => navigate('/buy')} />
       <HologramButton position={[0, -0.6, 0]} text={showDetails ? "HIDE INFO" : "MORE INFO"} onClick={() => setShowDetails(!showDetails)} />

       <group ref={detailsRef} position={[1.6, -0.2, 0]} scale={0}>
          <mesh>
            <planeGeometry args={[1.8, 2.0]} />
            <meshBasicMaterial color="#020617" transparent opacity={0.7} side={THREE.DoubleSide} blending={THREE.NormalBlending} />
          </mesh>
          <mesh>
            <boxGeometry args={[1.85, 2.05, 0.01]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.4} wireframe blending={THREE.AdditiveBlending} toneMapped={false} />
          </mesh>
          
          <Text position={[0, 0.8, 0.02]} fontSize={0.1} color="#38bdf8" letterSpacing={0.1}>
            GAADI KI JAANKARI
            <meshBasicMaterial color="#38bdf8" toneMapped={false} />
          </Text>
          <mesh position={[0, 0.65, 0.02]}>
            <planeGeometry args={[1.5, 0.01]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.5} blending={THREE.AdditiveBlending} toneMapped={false} />
          </mesh>

          {specs.map((spec, i) => (
             <group key={i} position={[-0.7, 0.45 - i * 0.2, 0.02]}>
                <Text position={[0, 0, 0]} fontSize={0.07} color="#94a3b8" anchorX="left">
                   {spec.label}
                </Text>
                <Text position={[1.4, 0, 0]} fontSize={0.09} color="#fef08a" anchorX="right">
                   {spec.value}
                   <meshBasicMaterial color="#fef08a" toneMapped={false} />
                </Text>
             </group>
          ))}
       </group>
    </group>
  );
}

function SideViewInfoPanel({ currentCar }: { currentCar: number }) {
  const groupRef = useRef<THREE.Group>(null!);
  const car = cars[currentCar] as CarData | undefined;

  useFrame((state) => {
    if (!groupRef.current) return;
    
    const step = scrollState.step;
    const stage = step % 3;
    const activeCarIndex = Math.floor(step / 3);
    const carZ = -activeCarIndex * 35;
    
    // FIX: Scaled this block so it is centered securely when moving into the side-view angle
    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, 0, 0.08); 
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, 2.0 + Math.sin(state.clock.elapsedTime * 1.2) * 0.1, 0.08);
    groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, carZ, 0.08);

    groupRef.current.lookAt(state.camera.position);

    const targetScale = stage === 1 ? 0.7 : 0;
    groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.08);

    if (groupRef.current.scale.x < 0.01 && targetScale === 0) {
      groupRef.current.visible = false;
    } else {
      groupRef.current.visible = true;
    }
  });

  return (
    <group ref={groupRef} scale={0}>
      <mesh position={[0, 0, -0.05]}>
        <planeGeometry args={[2.5, 1.2]} />
        <meshBasicMaterial color="#020617" transparent opacity={0.6} blending={THREE.NormalBlending} />
      </mesh>
      <mesh position={[0, 0, -0.04]}>
        <boxGeometry args={[2.55, 1.25, 0.01]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.3} wireframe blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>

      {/* FIX: Rupee format added here as well */}
      <Text position={[0, 0.35, 0]} fontSize={0.14} color="#FFD700" letterSpacing={0.1}>
        PRICE: ₹{car?.price || "11 Crore"}
        <meshBasicMaterial color="#FFD700" toneMapped={false} />
      </Text>
      <Text position={[0, 0.05, 0]} fontSize={0.11} color="#ffffff" letterSpacing={0.1}>
        RANGE: {car?.range || "610 km"}
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </Text>
      <Text position={[0, -0.15, 0]} fontSize={0.11} color="#ffffff" letterSpacing={0.1}>
        TAAQAT: {car?.hp || "920 HP"}
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </Text>
      <Text position={[0, -0.35, 0]} fontSize={0.11} color="#ffffff" letterSpacing={0.1}>
        TOP SPEED: {car?.speed || "340 km/h"}
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </Text>
    </group>
  );
}

function Futuristic3DUI({ currentCar, navigate }: Futuristic3DUIProps) {
  return (
    <>
      <Floating3DTitle currentCar={currentCar} />
      <InteractiveHologramPanel currentCar={currentCar} navigate={navigate} />
      <SideViewInfoPanel currentCar={currentCar} />
    </>
  );
}

// =============================================
// MAIN SCENE
// =============================================
export function HighwayScene() {
  const [viewMode, setViewMode] = useState<"preview" | "detail">("preview");
  const [currentCar, setCurrentCar] = useState<number>(0);
  const segments = useMemo(() => Array.from({ length: NUM_SEGMENTS }, (_, i) => i), []);
  const navigate = useNavigate();

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: '#030612', touchAction: 'none' }}>
      
      <Canvas 
        dpr={[1, 1.5]} 
        gl={{ 
          antialias: false, 
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping, 
          toneMappingExposure: 0.5 
        }} 
        camera={{ fov: 58, near: 0.5, far: 400 }}
      >
        <color attach="background" args={['#030612']} />
        <fog attach="fog" args={['#030612', 20, 220]} />
        
        <CinematicCamera viewMode={viewMode} carIndex={currentCar} />
        <ScrollWatcher setCurrentCar={setCurrentCar} setViewMode={setViewMode} />
        <SmoothScrollSystem />
        <StepScrollController />
        
        <OrbitInteraction />
        
        <DynamicCarLighting />

        <Suspense fallback={null}>
          <ambientLight intensity={0.4} color="#0f172a" />
          <Environment preset="sunset" background={false} environmentIntensity={0.1} />
          
          <HorizonCityGlow />
          <CinematicStars />
          <EpicMoon /> 
          
          {/* Futuristic AAA 3D Game Showroom Features */}
          <CyberParticles />
          <Futuristic3DUI currentCar={currentCar} navigate={navigate} />
          
          <ForestAmbience />
          <Mountains />
          <CitySkyline />
          <ScrollCars />
          
          <mesh position={[0, 1.5, -320]}>
            <planeGeometry args={[500, 20]} />
            <meshBasicMaterial color="#FFD700" transparent opacity={0.015} side={THREE.DoubleSide} />
          </mesh>

          {segments.map(i => <RoadSegment key={`r-${i}`} index={i} />)}
          {segments.map(i => <StreetLightSegment key={`l-${i}`} index={i} />)}

          <EffectComposer multisampling={0}>
            <Bloom intensity={1.3} luminanceThreshold={0.4} mipmapBlur radius={0.5} />
            <Vignette darkness={0.9} offset={0.1} />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  );
}