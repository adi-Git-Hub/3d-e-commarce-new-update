import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function CarStory({ car }) {
  const sectionRef = useRef();
  const buttonsRef = useRef();

  useEffect(() => {
    const section = sectionRef.current;

    gsap.fromTo(
      buttonsRef.current,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: section,
          start: "40% center",
          end: "60% center",
          scrub: true,
        },
      }
    );
  }, []);

  return (
    <section ref={sectionRef} className="h-screen relative">
      <div
        ref={buttonsRef}
        className="absolute bottom-28 left-1/2 -translate-x-1/2 flex gap-6 z-20"
      >
        <button className="px-8 py-4 bg-white text-black font-bold">
          Explore
        </button>

        <button className="px-8 py-4 border border-white text-white font-bold">
          Buy
        </button>
      </div>
    </section>
  );
}