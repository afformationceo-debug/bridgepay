'use client';

import { useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { RoundedBox, Float } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';

// 결제 플로우 단계 정의 (PRD 섹션 4.1 기반)
type PaymentStep =
  | 'idle'           // 대기
  | 'qr_scan'        // ① QR 스캔
  | 'amount_input'   // ③ 금액 입력
  | 'confirm'        // ④ 결제 확인
  | 'blockchain_tx'  // ⑤ 블록체인 전송
  | 'complete';      // ⑦ 완료

interface PaymentFlowDemo3DProps {
  autoPlay?: boolean;
  className?: string;
  onStepChange?: (step: PaymentStep) => void;
}

// 3D 스마트폰 컴포넌트
function Smartphone3D({
  position,
  rotation = [0, 0, 0],
  screenContent,
  glowColor = '#06D6A0'
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  screenContent?: 'qr' | 'amount' | 'confirm' | 'success';
  glowColor?: string;
}) {
  const phoneRef = useRef<THREE.Group>(null);

  return (
    <group ref={phoneRef} position={position} rotation={rotation}>
      {/* 폰 바디 */}
      <RoundedBox args={[1.2, 2.4, 0.15]} radius={0.1} smoothness={4}>
        <meshStandardMaterial color="#1a1a2e" metalness={0.8} roughness={0.2} />
      </RoundedBox>

      {/* 스크린 */}
      <RoundedBox args={[1.0, 2.1, 0.02]} radius={0.08} position={[0, 0, 0.08]}>
        <meshStandardMaterial
          color={screenContent === 'success' ? '#06D6A0' : '#0f0f23'}
          emissive={glowColor}
          emissiveIntensity={screenContent ? 0.3 : 0.1}
        />
      </RoundedBox>

      {/* 스크린 컨텐츠 */}
      {screenContent === 'qr' && (
        <group position={[0, 0, 0.1]}>
          {/* QR 코드 패턴 */}
          {[...Array(5)].map((_, i) => (
            [...Array(5)].map((_, j) => (
              <mesh
                key={`${i}-${j}`}
                position={[(i - 2) * 0.15, (j - 2) * 0.15, 0]}
              >
                <boxGeometry args={[0.1, 0.1, 0.01]} />
                <meshStandardMaterial
                  color={(i + j) % 2 === 0 ? '#ffffff' : '#0f0f23'}
                />
              </mesh>
            ))
          ))}
        </group>
      )}

      {screenContent === 'amount' && (
        <group position={[0, 0, 0.1]}>
          {/* 금액 표시 - 바 형태로 시각화 */}
          <mesh position={[0, 0.2, 0]}>
            <boxGeometry args={[0.6, 0.08, 0.01]} />
            <meshStandardMaterial color="#3B82F6" emissive="#3B82F6" emissiveIntensity={0.5} />
          </mesh>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.5, 0.08, 0.01]} />
            <meshStandardMaterial color="#8B5CF6" emissive="#8B5CF6" emissiveIntensity={0.5} />
          </mesh>
          <mesh position={[0, -0.2, 0]}>
            <boxGeometry args={[0.4, 0.08, 0.01]} />
            <meshStandardMaterial color="#06D6A0" emissive="#06D6A0" emissiveIntensity={0.5} />
          </mesh>
        </group>
      )}

      {screenContent === 'confirm' && (
        <group position={[0, 0, 0.1]}>
          {/* USDT 코인 아이콘 */}
          <mesh position={[0, 0.3, 0]}>
            <circleGeometry args={[0.15, 32]} />
            <meshStandardMaterial color="#26A17B" emissive="#26A17B" emissiveIntensity={0.5} />
          </mesh>
          {/* 지문 인식 버튼 */}
          <mesh position={[0, -0.3, 0]}>
            <circleGeometry args={[0.25, 32]} />
            <meshStandardMaterial color="#06D6A0" emissive="#06D6A0" emissiveIntensity={0.5} />
          </mesh>
          {/* 지문 패턴 */}
          {[0, 1, 2].map((i) => (
            <mesh key={i} position={[0, -0.3, 0.01]}>
              <ringGeometry args={[0.08 + i * 0.05, 0.1 + i * 0.05, 32]} />
              <meshStandardMaterial color="#ffffff" transparent opacity={0.3} />
            </mesh>
          ))}
        </group>
      )}

      {screenContent === 'success' && (
        <group position={[0, 0, 0.1]}>
          {/* 성공 원형 배경 */}
          <mesh>
            <circleGeometry args={[0.35, 32]} />
            <meshStandardMaterial color="#06D6A0" emissive="#06D6A0" emissiveIntensity={0.8} />
          </mesh>
          {/* 체크마크 - 두 개의 박스로 구성 */}
          <mesh position={[-0.05, -0.02, 0.02]} rotation={[0, 0, -Math.PI / 4]}>
            <boxGeometry args={[0.08, 0.2, 0.02]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          <mesh position={[0.08, 0.05, 0.02]} rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[0.08, 0.12, 0.02]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        </group>
      )}
    </group>
  );
}

// 블록체인 노드
function BlockchainNode3D({
  position,
  isActive,
  delay = 0
}: {
  position: [number, number, number];
  isActive: boolean;
  delay?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [activated, setActivated] = useState(false);

  useEffect(() => {
    if (isActive) {
      const timer = setTimeout(() => setActivated(true), delay);
      return () => clearTimeout(timer);
    } else {
      setActivated(false);
    }
  }, [isActive, delay]);

  useFrame((state) => {
    if (meshRef.current && activated) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.5;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
      <mesh ref={meshRef} position={position}>
        <icosahedronGeometry args={[0.2, 0]} />
        <meshStandardMaterial
          color={activated ? '#3B82F6' : '#374151'}
          emissive={activated ? '#3B82F6' : '#000000'}
          emissiveIntensity={activated ? 0.8 : 0}
          metalness={0.5}
          roughness={0.3}
        />
      </mesh>
    </Float>
  );
}

// 데이터 전송 파티클
function DataParticle({
  startPos,
  endPos,
  isActive,
  color = '#06D6A0'
}: {
  startPos: [number, number, number];
  endPos: [number, number, number];
  isActive: boolean;
  color?: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const progressRef = useRef(0);

  useFrame((_, delta) => {
    if (!meshRef.current || !isActive) {
      progressRef.current = 0;
      return;
    }

    progressRef.current += delta * 0.8;
    if (progressRef.current > 1) progressRef.current = 0;

    const t = progressRef.current;
    meshRef.current.position.x = THREE.MathUtils.lerp(startPos[0], endPos[0], t);
    meshRef.current.position.y = THREE.MathUtils.lerp(startPos[1], endPos[1], t) + Math.sin(t * Math.PI) * 0.3;
    meshRef.current.position.z = THREE.MathUtils.lerp(startPos[2], endPos[2], t);
    meshRef.current.scale.setScalar(Math.sin(t * Math.PI) * 0.5 + 0.5);
  });

  if (!isActive) return null;

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.08, 16, 16]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={1}
        transparent
        opacity={0.9}
      />
    </mesh>
  );
}

// 연결선
function ConnectionLine({
  start,
  end,
  isActive
}: {
  start: [number, number, number];
  end: [number, number, number];
  isActive: boolean;
}) {
  const lineRef = useRef<THREE.Line>(null);

  const geometry = useMemo(() => {
    const points = [
      new THREE.Vector3(...start),
      new THREE.Vector3(...end),
    ];
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [start, end]);

  const material = useMemo(() => {
    return new THREE.LineBasicMaterial({
      color: isActive ? '#3B82F6' : '#374151',
      opacity: isActive ? 0.8 : 0.3,
      transparent: true,
    });
  }, [isActive]);

  const lineObject = useMemo(() => new THREE.Line(geometry, material), [geometry, material]);

  return <primitive ref={lineRef} object={lineObject} />;
}

// QR 코드 스탠드
function QRStand3D({ position, isScanned }: { position: [number, number, number]; isScanned: boolean }) {
  return (
    <group position={position}>
      {/* 스탠드 베이스 */}
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[0.4, 0.5, 0.1, 32]} />
        <meshStandardMaterial color="#2a2a4e" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* 스탠드 폴 */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 1, 16]} />
        <meshStandardMaterial color="#3a3a5e" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* QR 디스플레이 */}
      <RoundedBox args={[0.8, 0.8, 0.05]} radius={0.05} position={[0, 0.6, 0]}>
        <meshStandardMaterial
          color="#ffffff"
          emissive={isScanned ? '#06D6A0' : '#ffffff'}
          emissiveIntensity={isScanned ? 0.5 : 0.1}
        />
      </RoundedBox>

      {/* QR 패턴 */}
      <group position={[0, 0.6, 0.03]}>
        {[...Array(7)].map((_, i) => (
          [...Array(7)].map((_, j) => (
            <mesh
              key={`qr-${i}-${j}`}
              position={[(i - 3) * 0.1, (j - 3) * 0.1, 0]}
            >
              <boxGeometry args={[0.08, 0.08, 0.01]} />
              <meshStandardMaterial
                color={(i + j) % 2 === 0 || (i === 0 && j < 3) || (j === 0 && i < 3) ? '#000000' : '#ffffff'}
              />
            </mesh>
          ))
        ))}
      </group>
    </group>
  );
}

// 메인 씬
function PaymentScene({
  currentStep,
  onStepChange
}: {
  currentStep: PaymentStep;
  onStepChange: (step: PaymentStep) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);

  // 자동 회전
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.2;
    }
  });

  const isBlockchainActive = currentStep === 'blockchain_tx';

  // 블록체인 노드 위치
  const nodePositions: [number, number, number][] = [
    [2, 1.5, 0],
    [2.5, 0.5, 0.5],
    [2, -0.5, 0],
    [2.8, 0, -0.3],
    [2.3, 1, -0.5],
  ];

  return (
    <group ref={groupRef}>
      {/* 고객 스마트폰 */}
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
        <Smartphone3D
          position={[-2, 0, 0]}
          rotation={[0, 0.3, 0]}
          screenContent={
            currentStep === 'qr_scan' ? 'qr' :
            currentStep === 'amount_input' ? 'amount' :
            currentStep === 'confirm' ? 'confirm' :
            currentStep === 'complete' ? 'success' : undefined
          }
          glowColor={currentStep === 'complete' ? '#06D6A0' : '#3B82F6'}
        />
      </Float>

      {/* 가맹점 QR 스탠드 */}
      <QRStand3D
        position={[0, -0.3, 0]}
        isScanned={currentStep !== 'idle'}
      />

      {/* 블록체인 네트워크 */}
      <group position={[0, 0, 0]}>
        {nodePositions.map((pos, i) => (
          <BlockchainNode3D
            key={i}
            position={pos}
            isActive={isBlockchainActive}
            delay={i * 100}
          />
        ))}

        {/* 노드 연결선 */}
        {nodePositions.slice(1).map((pos, i) => (
          <ConnectionLine
            key={`line-${i}`}
            start={nodePositions[i]}
            end={pos}
            isActive={isBlockchainActive}
          />
        ))}

        {/* 데이터 전송 파티클 */}
        <DataParticle
          startPos={[-1.5, 0, 0]}
          endPos={[2, 0.5, 0]}
          isActive={isBlockchainActive}
          color="#06D6A0"
        />
        <DataParticle
          startPos={[2, 0.5, 0]}
          endPos={[0, 0, 0]}
          isActive={currentStep === 'complete'}
          color="#3B82F6"
        />
      </group>

      {/* 바닥 그리드 */}
      <gridHelper args={[10, 20, '#1a1a3e', '#1a1a3e']} rotation={[0, 0, 0]} position={[0, -1.5, 0]} />

      {/* 조명 */}
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={1} color="#3B82F6" />
      <pointLight position={[-5, 5, 5]} intensity={0.8} color="#8B5CF6" />
      <pointLight position={[0, -3, 3]} intensity={0.5} color="#06D6A0" />
    </group>
  );
}

// 단계 설명 UI
const stepDescriptions: Record<PaymentStep, { title: string; description: string }> = {
  idle: {
    title: '결제 대기',
    description: '고객이 LINE 앱을 실행합니다'
  },
  qr_scan: {
    title: 'QR 스캔',
    description: '가맹점 QR 코드를 스캔합니다'
  },
  amount_input: {
    title: '금액 입력',
    description: '원화 금액을 입력하고 환산 금액을 확인합니다'
  },
  confirm: {
    title: '결제 확인',
    description: '지문/Face ID로 결제를 승인합니다'
  },
  blockchain_tx: {
    title: '블록체인 전송',
    description: 'Kaia Network에서 1-2초 내 트랜잭션 확정'
  },
  complete: {
    title: '결제 완료',
    description: '고객과 가맹점 모두에게 완료 알림 전송'
  },
};

// 메인 컴포넌트
export function PaymentFlowDemo3D({
  autoPlay = true,
  className = '',
  onStepChange
}: PaymentFlowDemo3DProps) {
  const [currentStep, setCurrentStep] = useState<PaymentStep>('idle');
  const [isPlaying, setIsPlaying] = useState(autoPlay);

  const steps: PaymentStep[] = ['idle', 'qr_scan', 'amount_input', 'confirm', 'blockchain_tx', 'complete'];

  // 자동 재생
  useEffect(() => {
    if (!isPlaying) return;

    const stepDurations: Record<PaymentStep, number> = {
      idle: 2000,
      qr_scan: 2500,
      amount_input: 3000,
      confirm: 2500,
      blockchain_tx: 3000,
      complete: 3000,
    };

    const timer = setTimeout(() => {
      const currentIndex = steps.indexOf(currentStep);
      const nextIndex = (currentIndex + 1) % steps.length;
      setCurrentStep(steps[nextIndex]);
      onStepChange?.(steps[nextIndex]);
    }, stepDurations[currentStep]);

    return () => clearTimeout(timer);
  }, [currentStep, isPlaying, onStepChange, steps]);

  const currentStepIndex = steps.indexOf(currentStep);

  return (
    <div className={`relative w-full ${className}`}>
      {/* 3D Canvas */}
      <div className="h-[350px] sm:h-[450px] md:h-[500px] w-full rounded-2xl overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950">
        <Canvas
          camera={{ position: [0, 0, 7], fov: 45 }}
          gl={{ antialias: true, alpha: true }}
          style={{ touchAction: 'none' }}
        >
          <PaymentScene
            currentStep={currentStep}
            onStepChange={setCurrentStep}
          />
          <EffectComposer>
            <Bloom
              luminanceThreshold={0.4}
              luminanceSmoothing={0.9}
              intensity={0.5}
            />
          </EffectComposer>
        </Canvas>
      </div>

      {/* 단계 표시 UI */}
      <div className="mt-4 sm:mt-6 px-2">
        {/* 진행 바 */}
        <div className="flex items-center justify-center sm:justify-between mb-4 overflow-x-auto">
          {steps.map((step, index) => (
            <div key={step} className="flex items-center flex-shrink-0">
              <motion.div
                className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all ${
                  index <= currentStepIndex
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                    : 'bg-slate-700 text-slate-400'
                }`}
                animate={{ scale: index === currentStepIndex ? 1.2 : 1 }}
              >
                {index + 1}
              </motion.div>
              {index < steps.length - 1 && (
                <div
                  className={`w-4 sm:w-8 md:w-12 h-0.5 sm:h-1 mx-0.5 sm:mx-1 transition-all ${
                    index < currentStepIndex
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                      : 'bg-slate-700'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* 단계 설명 */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center px-2"
          >
            <h3 className="text-base sm:text-lg md:text-xl font-bold text-white mb-1 sm:mb-2">
              {stepDescriptions[currentStep].title}
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm md:text-base">
              {stepDescriptions[currentStep].description}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* 컨트롤 버튼 */}
        <div className="flex justify-center mt-4 sm:mt-6 gap-2 sm:gap-4">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-4 sm:px-6 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition-colors text-sm sm:text-base"
          >
            {isPlaying ? '일시정지' : '재생'}
          </button>
          <button
            onClick={() => {
              const nextIndex = (currentStepIndex + 1) % steps.length;
              setCurrentStep(steps[nextIndex]);
            }}
            className="px-4 sm:px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors text-sm sm:text-base"
          >
            다음 단계
          </button>
        </div>
      </div>
    </div>
  );
}

// 2D 폴백 컴포넌트
export function PaymentFlowDemo2D({
  autoPlay = true,
  className = ''
}: PaymentFlowDemo3DProps) {
  const [currentStep, setCurrentStep] = useState<PaymentStep>('idle');
  const [isPlaying, setIsPlaying] = useState(autoPlay);

  const steps: PaymentStep[] = ['idle', 'qr_scan', 'amount_input', 'confirm', 'blockchain_tx', 'complete'];

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      const currentIndex = steps.indexOf(currentStep);
      const nextIndex = (currentIndex + 1) % steps.length;
      setCurrentStep(steps[nextIndex]);
    }, 2500);

    return () => clearTimeout(timer);
  }, [currentStep, isPlaying, steps]);

  const currentStepIndex = steps.indexOf(currentStep);

  const stepIcons: Record<PaymentStep, string> = {
    idle: '📱',
    qr_scan: '📷',
    amount_input: '💰',
    confirm: '👆',
    blockchain_tx: '⛓️',
    complete: '✅',
  };

  return (
    <div className={`relative w-full ${className}`}>
      {/* 애니메이션 영역 */}
      <div className="h-[280px] sm:h-[350px] md:h-[400px] w-full rounded-2xl overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950 flex items-center justify-center">
        <div className="relative w-full max-w-md px-4">
          {/* 플로우 시각화 */}
          <div className="flex items-center justify-between px-8">
            {/* 고객 */}
            <motion.div
              className="flex flex-col items-center"
              animate={{ scale: ['qr_scan', 'amount_input', 'confirm'].includes(currentStep) ? 1.1 : 1 }}
            >
              <div className="w-20 h-36 bg-slate-800 rounded-2xl border-2 border-slate-600 flex items-center justify-center">
                <motion.span
                  className="text-4xl"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  {stepIcons[currentStep]}
                </motion.span>
              </div>
              <span className="text-slate-400 mt-2 text-sm">고객</span>
            </motion.div>

            {/* 전송 애니메이션 */}
            <div className="flex-1 mx-4 relative h-2">
              <div className="absolute inset-0 bg-slate-700 rounded-full" />
              <motion.div
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                animate={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
              {currentStep === 'blockchain_tx' && (
                <motion.div
                  className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-green-500 rounded-full"
                  animate={{ x: ['0%', '100%'] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                />
              )}
            </div>

            {/* 가맹점 */}
            <motion.div
              className="flex flex-col items-center"
              animate={{ scale: currentStep === 'complete' ? 1.1 : 1 }}
            >
              <div className="w-20 h-20 bg-slate-800 rounded-xl border-2 border-slate-600 flex items-center justify-center">
                <span className="text-3xl">🏪</span>
              </div>
              <span className="text-slate-400 mt-2 text-sm">가맹점</span>
            </motion.div>
          </div>

          {/* 블록체인 노드 표시 */}
          {currentStep === 'blockchain_tx' && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-8 flex gap-2">
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  className="w-3 h-3 bg-blue-500 rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.8,
                    delay: i * 0.15
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 단계 표시 */}
      <div className="mt-4 sm:mt-6 px-2">
        <div className="flex items-center justify-center sm:justify-between mb-4 overflow-x-auto">
          {steps.map((step, index) => (
            <div key={step} className="flex items-center flex-shrink-0">
              <motion.div
                className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold ${
                  index <= currentStepIndex
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                    : 'bg-slate-700 text-slate-400'
                }`}
                animate={{ scale: index === currentStepIndex ? 1.2 : 1 }}
              >
                {index + 1}
              </motion.div>
              {index < steps.length - 1 && (
                <div
                  className={`w-4 sm:w-8 md:w-12 h-0.5 sm:h-1 mx-0.5 sm:mx-1 ${
                    index < currentStepIndex
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                      : 'bg-slate-700'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center px-2"
          >
            <h3 className="text-base sm:text-lg md:text-xl font-bold text-white mb-1 sm:mb-2">
              {stepDescriptions[currentStep].title}
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm md:text-base">
              {stepDescriptions[currentStep].description}
            </p>
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-center mt-4 sm:mt-6 gap-2 sm:gap-4">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-4 sm:px-6 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition-colors text-sm sm:text-base"
          >
            {isPlaying ? '일시정지' : '재생'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentFlowDemo3D;
