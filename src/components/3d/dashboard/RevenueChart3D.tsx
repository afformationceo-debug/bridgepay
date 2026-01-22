// src/components/3d/dashboard/RevenueChart3D.tsx
// 3D 매출 바 차트 시각화

'use client';

import { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { RoundedBox, Float } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { motion } from 'framer-motion';

interface RevenueData {
  day: string;
  amount: number;
  label: string;
}

interface RevenueChart3DProps {
  data?: RevenueData[];
  className?: string;
}

// 기본 데이터 (최근 7일)
const defaultData: RevenueData[] = [
  { day: 'Mon', amount: 2500000, label: '월' },
  { day: 'Tue', amount: 3200000, label: '화' },
  { day: 'Wed', amount: 2800000, label: '수' },
  { day: 'Thu', amount: 4100000, label: '목' },
  { day: 'Fri', amount: 3800000, label: '금' },
  { day: 'Sat', amount: 5200000, label: '토' },
  { day: 'Sun', amount: 4500000, label: '일' },
];

// 3D 바 컴포넌트
function Bar3D({
  position,
  height,
  index,
  maxHeight,
  isToday
}: {
  position: [number, number, number];
  height: number;
  index: number;
  maxHeight: number;
  isToday: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [animatedHeight, setAnimatedHeight] = useState(0);

  // 높이 애니메이션
  useEffect(() => {
    const targetHeight = (height / maxHeight) * 2;
    const timer = setTimeout(() => {
      setAnimatedHeight(targetHeight);
    }, index * 100);
    return () => clearTimeout(timer);
  }, [height, maxHeight, index]);

  // 색상 그라데이션 (높이에 따라)
  const color = useMemo(() => {
    const ratio = height / maxHeight;
    if (ratio > 0.8) return '#06D6A0'; // 높은 매출: 초록
    if (ratio > 0.5) return '#3B82F6'; // 중간: 파랑
    return '#8B5CF6'; // 낮음: 보라
  }, [height, maxHeight]);

  useFrame((state) => {
    if (meshRef.current) {
      // 호버 시 약간의 회전
      if (hovered) {
        meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 3) * 0.1;
      } else {
        meshRef.current.rotation.y = THREE.MathUtils.lerp(
          meshRef.current.rotation.y,
          0,
          0.1
        );
      }

      // 높이 애니메이션
      const currentScale = meshRef.current.scale.y;
      const targetScale = animatedHeight || 0.1;
      meshRef.current.scale.y = THREE.MathUtils.lerp(currentScale, targetScale, 0.1);
      meshRef.current.position.y = meshRef.current.scale.y / 2;
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <RoundedBox args={[0.4, 1, 0.4]} radius={0.05} smoothness={4}>
          <meshStandardMaterial
            color={isToday ? '#06D6A0' : color}
            emissive={isToday ? '#06D6A0' : color}
            emissiveIntensity={hovered ? 0.6 : 0.3}
            metalness={0.3}
            roughness={0.4}
          />
        </RoundedBox>
      </mesh>

      {/* 오늘 표시 */}
      {isToday && (
        <Float speed={3} rotationIntensity={0} floatIntensity={0.3}>
          <mesh position={[0, animatedHeight + 0.3, 0]}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial
              color="#06D6A0"
              emissive="#06D6A0"
              emissiveIntensity={1}
            />
          </mesh>
        </Float>
      )}
    </group>
  );
}

// 바닥 그리드와 축
function ChartBase() {
  return (
    <group>
      {/* 바닥 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[5, 3]} />
        <meshStandardMaterial
          color="#1a1a2e"
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* 그리드 라인 */}
      {[0.5, 1, 1.5, 2].map((y, i) => (
        <mesh key={i} position={[0, y, -1.5]}>
          <boxGeometry args={[4.5, 0.01, 0.01]} />
          <meshStandardMaterial
            color="#374151"
            transparent
            opacity={0.5}
          />
        </mesh>
      ))}
    </group>
  );
}

// 메인 차트 씬
function ChartScene({ data }: { data: RevenueData[] }) {
  const groupRef = useRef<THREE.Group>(null);
  const maxAmount = Math.max(...data.map(d => d.amount));

  useFrame((state) => {
    if (groupRef.current) {
      // 부드러운 회전
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  return (
    <>
      {/* 조명 */}
      <ambientLight intensity={0.5} />
      <pointLight position={[5, 5, 5]} intensity={1} color="#3B82F6" />
      <pointLight position={[-5, 3, 3]} intensity={0.5} color="#8B5CF6" />

      <group ref={groupRef} position={[0, -0.5, 0]}>
        {/* 차트 베이스 */}
        <ChartBase />

        {/* 바들 */}
        {data.map((item, index) => (
          <Bar3D
            key={item.day}
            position={[(index - 3) * 0.6, 0, 0]}
            height={item.amount}
            index={index}
            maxHeight={maxAmount}
            isToday={index === data.length - 1}
          />
        ))}
      </group>

      {/* 포스트 프로세싱 */}
      <EffectComposer>
        <Bloom
          luminanceThreshold={0.5}
          luminanceSmoothing={0.9}
          intensity={0.3}
        />
      </EffectComposer>
    </>
  );
}

// 2D 폴백 차트
function RevenueChart2D({ data }: { data: RevenueData[] }) {
  const maxAmount = Math.max(...data.map(d => d.amount));

  return (
    <div className="h-[250px] w-full rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 p-4">
      <div className="flex items-end justify-between h-full gap-2">
        {data.map((item, index) => {
          const heightPercent = (item.amount / maxAmount) * 100;
          const isToday = index === data.length - 1;

          return (
            <div key={item.day} className="flex flex-col items-center flex-1">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${heightPercent}%` }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className={`w-full max-w-[30px] rounded-t-lg ${
                  isToday
                    ? 'bg-gradient-to-t from-green-600 to-green-400'
                    : 'bg-gradient-to-t from-blue-600 to-purple-500'
                }`}
              />
              <div className="mt-2 text-xs text-slate-400">{item.label}</div>
              {isToday && (
                <div className="text-xs text-green-400 mt-1">오늘</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// 메인 export 컴포넌트
export function RevenueChart3D({ data = defaultData, className = '' }: RevenueChart3DProps) {
  const [use3D, setUse3D] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // 저사양 기기 감지
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const isLowPerf = navigator.hardwareConcurrency <= 4;
    if (isMobile || isLowPerf) {
      setUse3D(false);
    }
  }, []);

  if (!isClient) {
    return (
      <div className={`h-[250px] w-full rounded-2xl bg-slate-800/50 animate-pulse ${className}`} />
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
              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              : 'bg-slate-700/50 text-slate-400'
          }`}
        >
          {use3D ? '3D' : '2D'}
        </button>
      </div>

      {use3D ? (
        <div className="h-[250px] w-full rounded-2xl overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950">
          <Canvas
            camera={{ position: [0, 2, 4], fov: 50 }}
            gl={{ antialias: true, alpha: true }}
            style={{ touchAction: 'none' }}
          >
            <ChartScene data={data} />
          </Canvas>
        </div>
      ) : (
        <RevenueChart2D data={data} />
      )}

      {/* 범례 */}
      <div className="mt-3 flex items-center justify-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-gradient-to-r from-blue-500 to-purple-500" />
          <span className="text-slate-400">일별 매출</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-green-500" />
          <span className="text-slate-400">오늘</span>
        </div>
      </div>
    </div>
  );
}

export default RevenueChart3D;
