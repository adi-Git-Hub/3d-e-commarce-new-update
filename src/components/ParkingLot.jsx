import { useGLTF } from "@react-three/drei";
import { useRef } from "react";

function ParkingCar({ model, position }) {
  const { scene } = useGLTF(model);
  const ref = useRef();

  return (
    <primitive
      ref={ref}
     object={scene.clone()}
      scale={2.5}
      position={position}
    />
  );
}

export default function ParkingLot() {
  return (
     <>
      {/* left */}
      <ParkingCar model="/models/car.glb" position={[-18, -1.4, -12]} />

      {/* mid-left */}
      <ParkingCar model="/models/car.glb" position={[-6, -1.4, -12]} />

      {/* mid-right */}
      <ParkingCar model="/models/car.glb" position={[6, -1.4, -12]} />

      {/* right */}
      <ParkingCar model="/models/car.glb" position={[18, -1.4, -12]} />
    </>
  );
}