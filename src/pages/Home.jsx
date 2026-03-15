import Scene3D from "../components/scene/Scene3D";
import ParkingSection from "../components/ParkingSection";
import { useEffect } from "react";
import { globalCamera, carRef, bgRef } from "../components/Hero3D";

export default function Home() {

  useEffect(() => {

    const onScroll = () => {
      const scrollY = window.scrollY;

      if (globalCamera) {
        globalCamera.position.z = 20 - scrollY * 0.01;
      }

      if (carRef.current) {
        carRef.current.rotation.y = scrollY * 0.002;
      }

      if (bgRef.current) {
        bgRef.current.style.transform = `scale(${1.1 + scrollY * 0.0005})`;
      }
    };

    window.addEventListener("scroll", onScroll);

    return () => window.removeEventListener("scroll", onScroll);

  }, []);

  return (
    <div className="relative">

      {/* Road Scene */}
      <Scene3D />

      <section className="h-[200vh] flex items-center justify-center text-white">
        <h1 className="text-6xl font-bold">
          Every journey begins with a road
        </h1>
      </section>

      <ParkingSection />

    </div>
  );
}