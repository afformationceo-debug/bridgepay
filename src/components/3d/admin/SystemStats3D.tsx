// src/components/3d/admin/SystemStats3D.tsx
// 시스템 통계 3D 시각화 - 마스터 어드민용

'use client';

import { useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, RoundedBox, Float } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { motion } from 'framer-motion';

interface SystemStats {
  totalGMV: number;
  todayGMV: number;
  totalMerchants: number;
  activeMerchants: number;
  pendingMerchants: number;
  totalAgencies: number;
  activeAgencies: number;
  totalPayments: number;
  todayPayments: number;
  pendingSettlements: number;
}

interface SystemStats3DProps {
  stats: SystemStats;
  className?: string;
}

// 3D 바 컴포넌트
function StatBar({
  position,
  height,
  color,
  label,
  value,
  maxHeight = 2,
}: {
  position: [number, number, number];
  height: number;
  color: string;
  label: string;
  value: string;
  maxHeight?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [currentHeight, setCurrentHeight] = useState(0);

  // 애니메이션으로 높이 증가
  useEffect(() => {
    const targetHeight = Math.min(height, maxHeight);
    let animationFrame: number;
    const animate = () => {
      setCurrentHeight((prev) => {
        const diff = targetHeight - prev;
        if (Math.abs(diff) < 0.01) return targetHeight;
        return prev + diff * 0.05;
      });
      animationFrame = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationFrame);
  }, [height, maxHeight]);

  useFrame((state) => {
    if (meshRef.current && hovered) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  return (
    <group position={position}>
      {/* 바 */}
      <mesh
        ref={meshRef}
        position={[0, currentHeight / 2, 0]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <RoundedBox args={[0.4, currentHeight || 0.01, 0.4]} radius={0.05} smoothness={4}>
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={hovered ? 0.5 : 0.2}
            metalness={0.6}
            roughness={0.3}
          />
        </RoundedBox>
      </mesh>

      {/* 라벨 */}
      <Text
        position={[0, -0.3, 0]}
        fontSize={0.12}
        color="#94a3b8"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>

      {/* 값 표시 */}
      {hovered && (
        <Float speed={2} rotationIntensity={0} floatIntensity={0.3}>
          <Text
            position={[0, currentHeight + 0.3, 0]}
            fontSize={0.15}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
          >
            {value}
          </Text>
        </Float>
      )}
    </group>
  );
}

// 연결 네트워크 노드
function NetworkNode({
  position,
  color,
  size = 0.15,
  label,
  isActive,
}: {
  position: [number, number, number];
  color: string;
  size?: number;
  label: string;
  isActive: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      if (isActive) {
        meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 3) * 0.1);
      }
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[size, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isActive ? 0.8 : 0.3}
        />
      </mesh>
      <Text
        position={[0, -size - 0.15, 0]}
        fontSize={0.08}
        color="#64748b"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  );
}

// 연결선
function ConnectionLines() {
  const linesRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (linesRef.current) {
      linesRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  const lines = useMemo(() => {
    const connections = [
      { start: [-1, 0.5, 0], end: [0, 0.8, 0] },
      { start: [1, 0.5, 0], end: [0, 0.8, 0] },
      { start: [0, 0.8, 0], end: [0, 1.2, 0] },
    ];

    return connections.map((conn, i) => {
      const points = [
        new THREE.Vector3(...(conn.start as [number, number, number])),
        new THREE.Vector3(...(conn.end as [number, number, number])),
      ];
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: '#3B82F6',
        transparent: true,
        opacity: 0.3,
      });
      return new THREE.Line(geometry, material);
    });
  }, []);

  return (
    <group ref={linesRef}>
      {lines.map((line, i) => (
        <primitive key={i} object={line} />
      ))}
    </group>
  );
}

// 메인 씬
function StatsScene({ stats }: { stats: SystemStats }) {
  // 통계를 바 높이로 변환 (정규화)
  const maxGMV = 150000000000; // 1500억 기준
  const maxMerchants = 1000;
  const maxPayments = 500;

  return (
    <>
      {/* 조명 */}
      <ambientLight intensity={0.4} />
      <pointLight position={[3, 3, 3]} intensity={1} color="#EF4444" />
      <pointLight position={[-3, 3, 3]} intensity={0.5} color="#3B82F6" />

      {/* 통계 바들 */}
      <group position={[0, -0.5, 0]}>
        <StatBar
          position={[-1.5, 0, 0]}
          height={(stats.totalGMV / maxGMV) * 2}
          color="#EF4444"
          label="GMV"
          value={`${(stats.totalGMV / 100000000).toFixed(0)}억`}
        />
        <StatBar
          position={[-0.5, 0, 0]}
          height={(stats.totalMerchants / maxMerchants) * 2}
          color="#3B82F6"
          label="가맹점"
          value={`${stats.totalMerchants}개`}
        />
        <StatBar
          position={[0.5, 0, 0]}
          height={(stats.totalAgencies / 100) * 2}
          color="#8B5CF6"
          label="에이전시"
          value={`${stats.totalAgencies}개`}
        />
        <StatBar
          position={[1.5, 0, 0]}
          height={(stats.todayPayments / maxPayments) * 2}
          color="#22C55E"
          label="오늘결제"
          value={`${stats.todayPayments}건`}
        />
      </group>

      {/* 네트워크 노드 (하단) */}
      <group position={[0, -1.5, 0.5]}>
        <NetworkNode
          position={[-1, 0, 0]}
          color="#3B82F6"
          label="가맹점"
          isActive={true}
        />
        <NetworkNode
          position={[0, 0.3, 0]}
          color="#EF4444"
          label="플랫폼"
          size={0.2}
          isActive={true}
        />
        <NetworkNode
          position={[1, 0, 0]}
          color="#8B5CF6"
          label="에이전시"
          isActive={true}
        />
        <ConnectionLines />
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

// 2D 폴백 컴포넌트
function SystemStats2D({ stats }: { stats: SystemStats }) {
  const items = [
    { label: 'GMV', value: `${(stats.totalGMV / 100000000).toFixed(0)}억`, color: 'bg-red-500' },
    { label: '가맹점', value: `${stats.totalMerchants}개`, color: 'bg-blue-500' },
    { label: '에이전시', value: `${stats.totalAgencies}개`, color: 'bg-purple-500' },
    { label: '오늘결제', value: `${stats.todayPayments}건`, color: 'bg-green-500' },
  ];

  return (
    <div className="h-[200px] w-full rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 p-4">
      <div className="h-full flex items-end justify-around">
        {items.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ height: 0 }}
            animate={{ height: `${30 + Math.random() * 60}%` }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="flex flex-col items-center"
          >
            <div className={`w-12 ${item.color} rounded-t-lg`} style={{ height: '100%' }} />
            <div className="mt-2 text-center">
              <div className="text-white font-medium text-sm">{item.value}</div>
              <div className="text-slate-500 text-xs">{item.label}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// 메인 export 컴포넌트
export function SystemStats3D({ stats, className = '' }: SystemStats3DProps) {
  const [use3D, setUse3D] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const isLowPerf = navigator.hardwareConcurrency <= 4;
    if (isMobile || isLowPerf) {
      setUse3D(false);
    }
  }, []);

  if (!isClient) {
    return (
      <div className={`h-[200px] w-full rounded-2xl bg-slate-800/50 animate-pulse ${className}`} />
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
              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
              : 'bg-slate-700/50 text-slate-400'
          }`}
        >
          {use3D ? '3D' : '2D'}
        </button>
      </div>

      {use3D ? (
        <div className="h-[200px] w-full rounded-2xl overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950">
          <Canvas
            camera={{ position: [0, 1, 4], fov: 45 }}
            gl={{ antialias: true, alpha: true }}
          >
            <StatsScene stats={stats} />
          </Canvas>
        </div>
      ) : (
        <SystemStats2D stats={stats} />
      )}
    </div>
  );
}

export default SystemStats3D;
