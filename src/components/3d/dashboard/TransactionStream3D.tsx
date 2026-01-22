// src/components/3d/dashboard/TransactionStream3D.tsx
// 실시간 거래 스트림 3D 시각화 - 물리 엔진 기반 거래 블록 애니메이션

'use client';

import { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { RoundedBox, Float } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { motion } from 'framer-motion';

interface Payment {
  id: string;
  amount_krw: number;
  amount_crypto: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed';
  customer_country: string;
  created_at: string;
}

interface TransactionStream3DProps {
  payments: Payment[];
  className?: string;
}

// 거래 블록 컴포넌트
function TransactionBlock({
  payment,
  index,
  totalBlocks
}: {
  payment: Payment;
  index: number;
  totalBlocks: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // 블록 크기는 거래 금액에 비례 (최소 0.3, 최대 0.8)
  const size = useMemo(() => {
    const normalized = Math.min(payment.amount_krw / 1000000, 1);
    return 0.3 + normalized * 0.5;
  }, [payment.amount_krw]);

  // 국가별 색상
  const color = useMemo(() => {
    const colors: Record<string, string> = {
      JP: '#FF5252', // 빨강 (일본)
      TW: '#4CAF50', // 초록 (대만)
      US: '#2196F3', // 파랑 (미국)
    };
    return colors[payment.customer_country] || '#9C27B0';
  }, [payment.customer_country]);

  // 상태별 투명도
  const opacity = useMemo(() => {
    switch (payment.status) {
      case 'completed': return 1;
      case 'pending': return 0.6;
      case 'failed': return 0.3;
      default: return 1;
    }
  }, [payment.status]);

  // 블록 위치 계산 (스택 형태)
  const position = useMemo((): [number, number, number] => {
    const x = (index % 3 - 1) * 1.2;
    const y = Math.floor(index / 3) * 0.8 - 1;
    const z = (index % 2) * 0.5 - 0.25;
    return [x, y, z];
  }, [index]);

  // 애니메이션
  useFrame((state) => {
    if (meshRef.current) {
      // 호버 시 회전
      if (hovered) {
        meshRef.current.rotation.y += 0.02;
      }
      // 미세 플로팅
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + index) * 0.05;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2}>
      <mesh
        ref={meshRef}
        position={position}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={hovered ? 1.1 : 1}
      >
        <RoundedBox args={[size, size, size]} radius={0.05} smoothness={4}>
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={hovered ? 0.5 : 0.2}
            transparent
            opacity={opacity}
            metalness={0.3}
            roughness={0.4}
          />
        </RoundedBox>

        {/* 상태 표시 링 */}
        {payment.status === 'pending' && (
          <mesh position={[0, size / 2 + 0.1, 0]}>
            <ringGeometry args={[0.08, 0.12, 32]} />
            <meshStandardMaterial
              color="#FFC107"
              emissive="#FFC107"
              emissiveIntensity={0.8}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}
      </mesh>
    </Float>
  );
}

// 파티클 배경
function ParticleField() {
  const pointsRef = useRef<THREE.Points>(null);
  const particleCount = 100;

  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 6;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 5;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.02;
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
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#3B82F6"
        transparent
        opacity={0.4}
        sizeAttenuation
      />
    </points>
  );
}

// 연결선 (거래 흐름)
function ConnectionLines({ payments }: { payments: Payment[] }) {
  const linesRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (linesRef.current) {
      linesRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  const lines = useMemo(() => {
    return payments.slice(0, 4).map((_, i) => {
      const startX = -3;
      const endX = (i % 3 - 1) * 1.2;
      const y = Math.floor(i / 3) * 0.8 - 1;

      const points = [
        new THREE.Vector3(startX, y, 0),
        new THREE.Vector3(endX, y, 0),
      ];

      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: '#3B82F6',
        transparent: true,
        opacity: 0.3,
      });

      return new THREE.Line(geometry, material);
    });
  }, [payments]);

  return (
    <group ref={linesRef}>
      {lines.map((lineObj, i) => (
        <primitive key={i} object={lineObj} />
      ))}
    </group>
  );
}

// 메인 씬
function TransactionScene({ payments }: { payments: Payment[] }) {
  return (
    <>
      {/* 조명 */}
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={1} color="#3B82F6" />
      <pointLight position={[-5, -5, 5]} intensity={0.5} color="#8B5CF6" />

      {/* 파티클 배경 */}
      <ParticleField />

      {/* 연결선 */}
      <ConnectionLines payments={payments} />

      {/* 거래 블록들 */}
      <group position={[0, 0.5, 0]}>
        {payments.slice(0, 6).map((payment, index) => (
          <TransactionBlock
            key={payment.id}
            payment={payment}
            index={index}
            totalBlocks={Math.min(payments.length, 6)}
          />
        ))}
      </group>

      {/* 바닥 그리드 */}
      <gridHelper
        args={[10, 20, '#1a1a3e', '#1a1a3e']}
        position={[0, -2, 0]}
      />

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
function TransactionStream2D({ payments }: { payments: Payment[] }) {
  return (
    <div className="h-[300px] w-full rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 p-4 overflow-hidden">
      <div className="grid grid-cols-3 gap-3 h-full">
        {payments.slice(0, 6).map((payment, index) => {
          const colors: Record<string, string> = {
            JP: 'bg-red-500/20 border-red-500/50',
            TW: 'bg-green-500/20 border-green-500/50',
            US: 'bg-blue-500/20 border-blue-500/50',
          };
          const colorClass = colors[payment.customer_country] || 'bg-purple-500/20 border-purple-500/50';

          return (
            <motion.div
              key={payment.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`rounded-xl border ${colorClass} p-3 flex flex-col justify-between`}
            >
              <div className="flex justify-between items-start">
                <span className="text-lg">
                  {payment.customer_country === 'JP' ? '🇯🇵' : payment.customer_country === 'TW' ? '🇹🇼' : '🌍'}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  payment.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                  payment.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {payment.status === 'completed' ? '완료' : payment.status === 'pending' ? '대기' : '실패'}
                </span>
              </div>
              <div>
                <div className="text-white font-medium text-sm">
                  ₩{(payment.amount_krw / 10000).toFixed(0)}만
                </div>
                <div className="text-slate-500 text-xs">
                  {payment.amount_crypto.toFixed(1)} USDT
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// 메인 export 컴포넌트
export function TransactionStream3D({ payments, className = '' }: TransactionStream3DProps) {
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
              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              : 'bg-slate-700/50 text-slate-400'
          }`}
        >
          {use3D ? '3D' : '2D'}
        </button>
      </div>

      {use3D ? (
        <div className="h-[300px] w-full rounded-2xl overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950">
          <Canvas
            camera={{ position: [0, 1, 5], fov: 50 }}
            gl={{ antialias: true, alpha: true }}
            style={{ touchAction: 'none' }}
          >
            <TransactionScene payments={payments} />
          </Canvas>
        </div>
      ) : (
        <TransactionStream2D payments={payments} />
      )}

      {/* 범례 */}
      <div className="mt-3 flex items-center justify-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-red-500/50" />
          <span className="text-slate-400">일본</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-green-500/50" />
          <span className="text-slate-400">대만</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-blue-500/50" />
          <span className="text-slate-400">미국</span>
        </div>
      </div>
    </div>
  );
}

export default TransactionStream3D;
