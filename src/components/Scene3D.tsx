'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Float } from '@react-three/drei';
import DNAHelix from './DNAHelix';

export default function Scene3D({ isMobile = false }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 15], fov: 45 }}
      style={{ background: 'transparent' }}
      className="pointer-events-none" // Allow clicks to pass through by default
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, -10, -5]} color="#ec4899" intensity={1} />
      <pointLight position={[10, 10, 5]} color="#3b82f6" intensity={1} />

      <DNAHelix
        count={isMobile ? 20 : 40}
        radius={1.5}
        height={12}
        speed={isMobile ? 0.3 : 0.5} // Slower speed on mobile for less chaotic feel
      />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableRotate={false}
      />
    </Canvas>
  );
}
