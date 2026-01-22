// src/components/3d/agency/CommissionFlow3D.tsx
// 수수료 흐름 3D 시각화 - 고객 → 가맹점 → 플랫폼 → 에이전시

'use client';

import { useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, RoundedBox, Float } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { motion } from 'framer-motion';

interface CommissionFlow3DProps {
  commissionRate: number; // 0.0 ~ 1.0
  className?: string;
}

// 노드 컴포넌트 (고객, 가맹점, 플랫폼, 에이전시)
function FlowNode({
  position,
  label,
  color,
  isActive,
  amount,
}: {
  position: [number, number, number];
  label: string;
  color: string;
  isActive: boolean;
  amount?: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current && isActive) {
      meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 3) * 0.05);
    }
  });

  return (
    <group position={position}>
      <Float speed={2} rotationIntensity={0} floatIntensity={isActive ? 0.2 : 0}>
        <mesh
          ref={meshRef}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <RoundedBox args={[0.8, 0.6, 0.3]} radius={0.1} smoothness={4}>
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={isActive || hovered ? 0.5 : 0.1}
              metalness={0.5}
              roughness={0.3}
            />
          </RoundedBox>
        </mesh>
      </Float>

      {/* 라벨 */}
      <Text
        position={[0, -0.5, 0]}
        fontSize={0.12}
        color="#94a3b8"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>

      {/* 금액 표시 */}
      {amount && (
        <Text
          position={[0, 0.5, 0]}
          fontSize={0.1}
          color="#22C55E"
          anchorX="center"
          anchorY="middle"
        >
          {amount}
        </Text>
      )}
    </group>
  );
}

// 화살표/흐름 파티클
function FlowParticles({
  startPos,
  endPos,
  color,
  isActive,
}: {
  startPos: [number, number, number];
  endPos: [number, number, number];
  color: string;
  isActive: boolean;
}) {
  const particlesRef = useRef<THREE.Points>(null);
  const particleCount = 8;

  const { positions, initialPositions } = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const init = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const t = i / particleCount;
      init[i * 3] = startPos[0] + (endPos[0] - startPos[0]) * t;
      init[i * 3 + 1] = startPos[1] + (endPos[1] - startPos[1]) * t;
      init[i * 3 + 2] = startPos[2] + (endPos[2] - startPos[2]) * t;

      pos[i * 3] = init[i * 3];
      pos[i * 3 + 1] = init[i * 3 + 1];
      pos[i * 3 + 2] = init[i * 3 + 2];
    }

    return { positions: pos, initialPositions: init };
  }, [startPos, endPos]);

  useFrame((state) => {
    if (particlesRef.current && isActive) {
      const time = state.clock.elapsedTime;
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        const t = ((i / particleCount) + time * 0.5) % 1;
        positions[i * 3] = startPos[0] + (endPos[0] - startPos[0]) * t;
        positions[i * 3 + 1] = startPos[1] + (endPos[1] - startPos[1]) * t + Math.sin(t * Math.PI) * 0.1;
        positions[i * 3 + 2] = startPos[2] + (endPos[2] - startPos[2]) * t;
      }

      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  const colorObj = new THREE.Color(color);

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        color={colorObj}
        transparent
        opacity={isActive ? 0.8 : 0.3}
        sizeAttenuation
      />
    </points>
  );
}

// 연결선
function ConnectionLine({
  startPos,
  endPos,
  color,
}: {
  startPos: [number, number, number];
  endPos: [number, number, number];
  color: string;
}) {
  const lineRef = useRef<THREE.Line>(null);

  const line = useMemo(() => {
    const points = [
      new THREE.Vector3(...startPos),
      new THREE.Vector3(...endPos),
    ];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity: 0.3,
    });
    return new THREE.Line(geometry, material);
  }, [startPos, endPos, color]);

  return <primitive ref={lineRef} object={line} />;
}

// 메인 씬
function CommissionScene({ commissionRate }: { commissionRate: number }) {
  const [activeFlow, setActiveFlow] = useState(0);

  // 자동 애니메이션
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFlow((prev) => (prev + 1) % 4);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  // 노드 위치
  const nodePositions: { [key: string]: [number, number, number] } = {
    customer: [-2.5, 0, 0],
    merchant: [-0.8, 0, 0],
    platform: [0.8, 0, 0],
    agency: [2.5, 0, 0],
  };

  // 금액 계산 (예시: 100만원 결제)
  const paymentAmount = 1000000;
  const merchantFee = paymentAmount * 0.005; // 0.5%
  const agencyCommission = merchantFee * commissionRate;
  const platformShare = merchantFee - agencyCommission;

  return (
    <>
      {/* 조명 */}
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 3, 3]} intensity={1} />

      {/* 노드들 */}
      <FlowNode
        position={nodePositions.customer}
        label="고객"
        color="#3B82F6"
        isActive={activeFlow === 0}
        amount="₩100만"
      />
      <FlowNode
        position={nodePositions.merchant}
        label="가맹점"
        color="#8B5CF6"
        isActive={activeFlow === 1}
        amount={`-${(merchantFee / 10000).toFixed(0)}만 (0.5%)`}
      />
      <FlowNode
        position={nodePositions.platform}
        label="플랫폼"
        color="#06B6D4"
        isActive={activeFlow === 2}
        amount={`₩${(platformShare / 10000).toFixed(1)}만`}
      />
      <FlowNode
        position={nodePositions.agency}
        label="에이전시"
        color="#22C55E"
        isActive={activeFlow === 3}
        amount={`₩${(agencyCommission / 10000).toFixed(1)}만 (${(commissionRate * 100).toFixed(0)}%)`}
      />

      {/* 연결선 */}
      <ConnectionLine startPos={nodePositions.customer} endPos={nodePositions.merchant} color="#3B82F6" />
      <ConnectionLine startPos={nodePositions.merchant} endPos={nodePositions.platform} color="#8B5CF6" />
      <ConnectionLine startPos={nodePositions.platform} endPos={nodePositions.agency} color="#06B6D4" />

      {/* 흐름 파티클 */}
      <FlowParticles
        startPos={nodePositions.customer}
        endPos={nodePositions.merchant}
        color="#3B82F6"
        isActive={activeFlow === 0}
      />
      <FlowParticles
        startPos={nodePositions.merchant}
        endPos={nodePositions.platform}
        color="#8B5CF6"
        isActive={activeFlow === 1}
      />
      <FlowParticles
        startPos={nodePositions.platform}
        endPos={nodePositions.agency}
        color="#22C55E"
        isActive={activeFlow >= 2}
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
function CommissionFlow2D({ commissionRate }: { commissionRate: number }) {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 4);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const steps = [
    { label: '고객', color: 'bg-blue-500', amount: '₩100만' },
    { label: '가맹점', color: 'bg-purple-500', amount: '-0.5%' },
    { label: '플랫폼', color: 'bg-cyan-500', amount: `${((1 - commissionRate) * 100).toFixed(0)}%` },
    { label: '에이전시', color: 'bg-green-500', amount: `${(commissionRate * 100).toFixed(0)}%` },
  ];

  return (
    <div className="h-[250px] w-full rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 p-4">
      <div className="h-full flex items-center justify-between px-4">
        {steps.map((step, index) => (
          <div key={step.label} className="flex items-center">
            <motion.div
              initial={false}
              animate={{
                scale: activeStep === index ? 1.1 : 1,
                opacity: activeStep >= index ? 1 : 0.5,
              }}
              className="flex flex-col items-center"
            >
              <div
                className={`w-12 h-12 ${step.color} rounded-xl flex items-center justify-center mb-2 ${
                  activeStep === index ? 'ring-2 ring-white/50' : ''
                }`}
              >
                <span className="text-white text-xs font-bold">{step.amount}</span>
              </div>
              <span className="text-slate-400 text-xs">{step.label}</span>
            </motion.div>

            {index < steps.length - 1 && (
              <div className="flex-1 mx-2 relative">
                <div className="h-0.5 bg-slate-700 w-full" />
                <motion.div
                  initial={false}
                  animate={{
                    width: activeStep > index ? '100%' : '0%',
                    opacity: activeStep > index ? 1 : 0.3,
                  }}
                  transition={{ duration: 0.5 }}
                  className={`absolute top-0 left-0 h-0.5 ${steps[index].color}`}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 설명 */}
      <div className="mt-4 text-center">
        <p className="text-xs text-slate-500">
          결제 금액의 0.5%가 수수료로 발생하고, 그 중 {(commissionRate * 100).toFixed(0)}%가 에이전시 수익
        </p>
      </div>
    </div>
  );
}

// 메인 export 컴포넌트
export function CommissionFlow3D({ commissionRate, className = '' }: CommissionFlow3DProps) {
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
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
              : 'bg-slate-700/50 text-slate-400'
          }`}
        >
          {use3D ? '3D' : '2D'}
        </button>
      </div>

      {use3D ? (
        <div className="h-[250px] w-full rounded-2xl overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950">
          <Canvas
            camera={{ position: [0, 0, 5], fov: 50 }}
            gl={{ antialias: true, alpha: true }}
          >
            <CommissionScene commissionRate={commissionRate} />
          </Canvas>
        </div>
      ) : (
        <CommissionFlow2D commissionRate={commissionRate} />
      )}
    </div>
  );
}

export default CommissionFlow3D;
