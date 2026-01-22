'use client';

import { useRef, ReactNode } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';

interface Scene3DProps {
  children: ReactNode;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  enableControls?: boolean;
  enablePostProcessing?: boolean;
  showStars?: boolean;
  ambientIntensity?: number;
}

// Standard lighting setup for blockchain aesthetic
function Lights({ ambientIntensity = 0.3 }: { ambientIntensity?: number }) {
  return (
    <>
      <ambientLight intensity={ambientIntensity} color="#4f46e5" />
      <pointLight position={[10, 10, 10]} intensity={1} color="#60a5fa" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#a855f7" />
      <spotLight
        position={[0, 20, 0]}
        intensity={0.8}
        angle={0.5}
        penumbra={1}
        color="#818cf8"
      />
    </>
  );
}

// Post-processing effects for glow/bloom
function PostProcessingEffects() {
  return (
    <EffectComposer>
      <Bloom
        intensity={0.5}
        luminanceThreshold={0.2}
        luminanceSmoothing={0.9}
        radius={0.8}
      />
      <Vignette eskil={false} offset={0.1} darkness={0.5} />
    </EffectComposer>
  );
}

// Auto-rotating camera controller
function AutoRotateController({ speed = 0.5 }: { speed?: number }) {
  const { camera } = useThree();
  const angle = useRef(0);

  useFrame((_, delta) => {
    angle.current += delta * speed;
    const radius = 20;
    camera.position.x = Math.sin(angle.current) * radius;
    camera.position.z = Math.cos(angle.current) * radius;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

export function Scene3D({
  children,
  autoRotate = true,
  autoRotateSpeed = 0.3,
  enableControls = false,
  enablePostProcessing = true,
  showStars = true,
  ambientIntensity = 0.3,
}: Scene3DProps) {
  return (
    <>
      {/* Lighting */}
      <Lights ambientIntensity={ambientIntensity} />

      {/* Background stars */}
      {showStars && (
        <Stars
          radius={100}
          depth={50}
          count={2000}
          factor={4}
          saturation={0}
          fade
          speed={0.5}
        />
      )}

      {/* Camera controls or auto-rotation */}
      {enableControls ? (
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          maxPolarAngle={Math.PI / 1.5}
          minPolarAngle={Math.PI / 3}
          autoRotate={autoRotate}
          autoRotateSpeed={autoRotateSpeed}
        />
      ) : autoRotate ? (
        <AutoRotateController speed={autoRotateSpeed} />
      ) : null}

      {/* Scene content */}
      {children}

      {/* Post-processing */}
      {enablePostProcessing && <PostProcessingEffects />}
    </>
  );
}

// Separate component for just lights (can be used independently)
export function SceneLights({
  ambientIntensity = 0.3,
  primaryColor = '#60a5fa',
  secondaryColor = '#a855f7',
}: {
  ambientIntensity?: number;
  primaryColor?: string;
  secondaryColor?: string;
}) {
  return (
    <>
      <ambientLight intensity={ambientIntensity} color="#4f46e5" />
      <pointLight position={[10, 10, 10]} intensity={1} color={primaryColor} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color={secondaryColor} />
      <spotLight
        position={[0, 20, 0]}
        intensity={0.8}
        angle={0.5}
        penumbra={1}
        color="#818cf8"
      />
    </>
  );
}

// Fog effect for depth
export function SceneFog({
  color = '#0f172a',
  near = 10,
  far = 50,
}: {
  color?: string;
  near?: number;
  far?: number;
}) {
  const { scene } = useThree();

  scene.fog = new THREE.Fog(color, near, far);

  return null;
}

export default Scene3D;
