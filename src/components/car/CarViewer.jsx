import React, { useEffect, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils';

const CarViewer = ({ modelPath, paintColor, isInterior }) => {
  const { scene } = useGLTF(modelPath);
  const { camera } = useThree();

  // 🔥 IMPORTANT – separate instance
  const clonedScene = useMemo(() => clone(scene), [scene]);

  useEffect(() => {
    if (clonedScene) {
      clonedScene.traverse((object) => {
        if (object.isMesh) {
          const name = object.name.toLowerCase();
          const matName = object.material?.name?.toLowerCase() || '';

          if (
            name.includes('body') || 
            name.includes('paint') || 
            name.includes('exterior') || 
            name.includes('car_body') ||
            matName.includes('body') || 
            matName.includes('paint') ||
            matName.includes('exterior')
          ) {
            object.material.map = null; // 🔥 texture override fix
            object.material.color.set(paintColor);
          }
        }
      });
    }
  }, [clonedScene, paintColor]);

  useEffect(() => {
    if (isInterior) {
      camera.position.set(0, 0.6, 0.2); 
    } else {
      camera.position.set(5, 2, 5);
    }
  }, [isInterior, camera]);

  return (
    <primitive 
      object={clonedScene} 
      scale={1.6} 
      position={[0, -1, 0]} 
    />
  );
};

export default CarViewer;