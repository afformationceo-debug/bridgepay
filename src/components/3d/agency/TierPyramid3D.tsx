// src/components/3d/agency/TierPyramid3D.tsx
// 에이전시 등급 피라미드 3D 시각화

'use client';

import { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Float } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { motion } from 'framer-motion';

type TierType = 'platinum' | 'gold' | 'silver' | 'bronze';

interface TierPyramid3DProps {
  currentTier: TierType;
  className?: string;
}

const tierConfig = {
  platinum: { index: 4, color: '#A855F7', label: 'Platinum', requirement: '50억+' },
  gold: { index: 3, color: '#F59E0B', label: 'Gold', requirement: '20억+' },
  silver: { index: 2, color: '#9CA3AF', label: 'Silver', requirement: '5억+' },
  bronze: { index: 1, color: '#C2410C', label: 'Bronze', requirement: '신규' },
};

// 피라미드 층 컴포넌트
function PyramidTier({
  tier,
  index,
  isCurrentTier,
  totalTiers,
}: {
  tier: TierType;
  index: number;
  isCurrentTier: boolean;
  totalTiers: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const config = tierConfig[tier];

  // 아래에서부터 쌓이는 위치
  const y = (index - totalTiers / 2) * 0.6;
  const scale = 1 - (index - 1) * 0.15; // 위로 갈수록 작아짐

  useFrame((state) => {
    if (meshRef.current) {
      // 현재 등급 또는 호버 시 글로우 효과
      if (isCurrentTier || hovered) {
        meshRef.current.scale.x = scale * (1 + Math.sin(state.clock.elapsedTime * 3) * 0.03);
        meshRef.current.scale.z = scale * (1 + Math.sin(state.clock.elapsedTime * 3) * 0.03);
      }
    }
  });

  return (
    <group position={[0, y, 0]}>
      {/* 피라미드 층 */}
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={[scale, 0.5, scale]}
      >
        <boxGeometry args={[2, 0.5, 2]} />
        <meshStandardMaterial
          color={config.color}
          emissive={config.color}
          emissiveIntensity={isCurrentTier ? 0.5 : hovered ? 0.3 : 0.1}
          metalness={0.7}
          roughness={0.3}
          transparent
          opacity={isCurrentTier ? 1 : 0.7}
        />
      </mesh>

      {/* 등급 라벨 */}
      <Text
        position={[0, 0, scale + 0.1]}
        fontSize={0.15}
        color={isCurrentTier ? '#ffffff' : '#94a3b8'}
        anchorX="center"
        anchorY="middle"
      >
        {config.label}
      </Text>

      {/* 현재 등급 표시 */}
      {isCurrentTier && (
        <Float speed={2} rotationIntensity={0} floatIntensity={0.5}>
          <mesh position={[scale + 0.3, 0, 0]}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial
              color="#22C55E"
              emissive="#22C55E"
              emissiveIntensity={1}
            />
          </mesh>
        </Float>
      )}
    </group>
  );
}

// 파티클 효과
function TierParticles({ currentTierIndex }: { currentTierIndex: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const particleCount = 50;

  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const col = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      // 피라미드 주변에 파티클 배치
      const angle = Math.random() * Math.PI * 2;
      const radius = 1.5 + Math.random() * 0.5;
      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 2;
      pos[i * 3 + 2] = Math.sin(angle) * radius;

      // 등급에 따른 색상
      const tierColors = [
        [0.76, 0.25, 0.05], // bronze
        [0.61, 0.64, 0.67], // silver
        [0.96, 0.62, 0.04], // gold
        [0.66, 0.33, 0.97], // platinum
      ];
      const color = tierColors[Math.min(currentTierIndex - 1, 3)];
      col[i * 3] = color[0];
      col[i * 3 + 1] = color[1];
      col[i * 3 + 2] = color[2];
    }

    return { positions: pos, colors: col };
  }, [currentTierIndex]);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.1;

      // 파티클 상승 효과
      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 1] += 0.005;
        if (positions[i * 3 + 1] > 1.5) {
          positions[i * 3 + 1] = -1.5;
        }
      }
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particleCount}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

// 메인 씬
function PyramidScene({ currentTier }: { currentTier: TierType }) {
  const tiers: TierType[] = ['bronze', 'silver', 'gold', 'platinum'];
  const currentTierIndex = tierConfig[currentTier].index;

  return (
    <>
      {/* 조명 */}
      <ambientLight intensity={0.4} />
      <pointLight position={[3, 3, 3]} intensity={1} color="#ffffff" />
      <pointLight position={[-3, -3, 3]} intensity={0.5} color={tierConfig[currentTier].color} />

      {/* 피라미드 층들 */}
      <group rotation={[0.2, 0, 0]}>
        {tiers.map((tier, index) => (
          <PyramidTier
            key={tier}
            tier={tier}
            index={index + 1}
            isCurrentTier={tier === currentTier}
            totalTiers={tiers.length}
          />
        ))}

        {/* 파티클 */}
        <TierParticles currentTierIndex={currentTierIndex} />
      </group>

      {/* 포스트 프로세싱 */}
      <EffectComposer>
        <Bloom
          luminanceThreshold={0.4}
          luminanceSmoothing={0.9}
          intensity={0.5}
        />
      </EffectComposer>
    </>
  );
}

// 2D 폴백 컴포넌트
function TierPyramid2D({ currentTier }: { currentTier: TierType }) {
  const tiers: TierType[] = ['platinum', 'gold', 'silver', 'bronze'];

  return (
    <div className="h-[300px] w-full rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 p-4 flex items-center justify-center">
      <div className="relative">
        {tiers.map((tier, index) => {
          const config = tierConfig[tier];
          const isCurrentTier = tier === currentTier;
          const width = 60 + index * 40;

          return (
            <motion.div
              key={tier}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative mx-auto mb-2 rounded-lg flex items-center justify-center ${
                isCurrentTier ? 'ring-2 ring-green-500' : ''
              }`}
              style={{
                width: `${width}px`,
                height: '40px',
                backgroundColor: `${config.color}${isCurrentTier ? '' : '80'}`,
              }}
            >
              <span className="text-white text-sm font-medium">{config.label}</span>
              {isCurrentTier && (
                <span className="absolute -right-2 -top-2 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="w-2 h-2 bg-white rounded-full" />
                </span>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// 메인 export 컴포넌트
export function TierPyramid3D({ currentTier, className = '' }: TierPyramid3DProps) {
  const [use3D, setUse3D] = useState(true);
  const [isClient, setIsClient] = useState(false);

  // 클라이언트 사이드에서만 렌더링
  useState(() => {
    setIsClient(true);
    // 저사양 기기 감지
    if (typeof window !== 'undefined') {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const isLowPerf = navigator.hardwareConcurrency <= 4;
      if (isMobile || isLowPerf) {
        setUse3D(false);
      }
    }
  });

  if (!isClient) {
    return (
      <div className={`h-[300px] w-full rounded-2xl bg-slate-800/50 animate-pulse ${className}`} />
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* 3D/2D 토글 */}
      <div className="absolute top-2 right-2 z-10">
        <button
          onClick={() => setUse3D(!use3D)}
          className={`px-3 py-1 text-xs rounded-full transition-colors ${
            use3D
              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
              : 'bg-slate-700/50 text-slate-400'
          }`}
        >
          {use3D ? '3D' : '2D'}
        </button>
      </div>

      {use3D ? (
        <div className="h-[300px] w-full rounded-2xl overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950">
          <Canvas
            camera={{ position: [0, 0, 4], fov: 50 }}
            gl={{ antialias: true, alpha: true }}
          >
            <PyramidScene currentTier={currentTier} />
          </Canvas>
        </div>
      ) : (
        <TierPyramid2D currentTier={currentTier} />
      )}
    </div>
  );
}

export default TierPyramid3D;
