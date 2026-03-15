import { useGLTF } from "@react-three/drei"
import { cars } from "../../../../data/cars"
import * as THREE from "three"
import { useMemo, useEffect, useRef } from "react"
import { GLTF } from "three-stdlib"
import { useThree, useFrame } from "@react-three/fiber"

const SPACING = 35
const TARGET_SIZE = 4.5

function CarModel({ path, position }: any) {

  const { scene } = useGLTF(path) as GLTF

  const { normalizedScene, scale } = useMemo(() => {

    const cloned = scene.clone()

    const box = new THREE.Box3().setFromObject(cloned)
    const size = new THREE.Vector3()
    const center = new THREE.Vector3()

    box.getSize(size)
    box.getCenter(center)

    // center model
    cloned.position.sub(center)

    const maxDim = Math.max(size.x, size.y, size.z)

    const scaleFactor = TARGET_SIZE / maxDim

    return {
      normalizedScene: cloned,
      scale: scaleFactor
    }

  }, [scene])

  useEffect(() => {

    const box = new THREE.Box3().setFromObject(scene)
    const size = new THREE.Vector3()

    box.getSize(size)

    console.log("MODEL:", path)
    console.log("WIDTH:", size.x)
    console.log("HEIGHT:", size.y)
    console.log("LENGTH:", size.z)

  }, [scene, path])

  return (
    <group
      position={position}
      scale={scale}
      rotation={[0, Math.PI, 0]}
    >
      <primitive object={normalizedScene} />
    </group>
  )
}

export default function ScrollCars() {

  const groupRef = useRef<THREE.Group>(null!)
  const { mouse } = useThree()

  // smooth mouse rotation
  useFrame(() => {

    if (!groupRef.current) return

    const targetRotation = mouse.x * 0.6

    groupRef.current.rotation.y +=
      (targetRotation - groupRef.current.rotation.y) * 0.08

  })

  return (
    <group ref={groupRef}>

      {cars.map((car, i) => (

        <CarModel
          key={car.id}
          path={car.modelPath}
          position={[0, 0.6, -i * SPACING]}
        />

      ))}

    </group>
  )
}