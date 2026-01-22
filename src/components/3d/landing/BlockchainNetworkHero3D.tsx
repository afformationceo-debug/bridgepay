'use client';

import { useRef, useMemo, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text, Html, Float } from '@react-three/drei';
import * as THREE from 'three';

// Types
interface NodeData {
  id: string;
  position: THREE.Vector3;
  size: number;
  color: THREE.Color;
  connections: string[];
}

interface BlockchainNetworkHero3DProps {
  nodeCount?: number;
  animated?: boolean;
  onNodeClick?: (nodeId: string) => void;
}

// Generate random nodes with positions
function generateNodes(count: number): NodeData[] {
  const nodes: NodeData[] = [];
  const blueColor = new THREE.Color('#3b82f6');
  const purpleColor = new THREE.Color('#8b5cf6');

  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const radius = 8 + Math.random() * 6;

    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta) * 0.6; // Flatten vertically
    const z = radius * Math.cos(phi);

    const t = Math.random();
    const color = new THREE.Color().lerpColors(blueColor, purpleColor, t);

    nodes.push({
      id: `node-${i}`,
      position: new THREE.Vector3(x, y, z),
      size: 0.3 + Math.random() * 0.4,
      color,
      connections: [],
    });
  }

  // Create connections between nearby nodes
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const distance = nodes[i].position.distanceTo(nodes[j].position);
      if (distance < 6 && Math.random() > 0.5) {
        nodes[i].connections.push(nodes[j].id);
      }
    }
  }

  return nodes;
}

// Single blockchain node component
function BlockchainNode({
  node,
  isHovered,
  onHover,
  onClick,
}: {
  node: NodeData;
  isHovered: boolean;
  onHover: (id: string | null) => void;
  onClick?: (id: string) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      // Subtle floating animation
      meshRef.current.position.y =
        node.position.y + Math.sin(state.clock.elapsedTime + node.position.x) * 0.1;

      // Rotation
      meshRef.current.rotation.x += 0.003;
      meshRef.current.rotation.y += 0.005;
    }

    if (glowRef.current) {
      // Pulsing glow
      const pulse = 0.8 + Math.sin(state.clock.elapsedTime * 2 + node.position.x) * 0.2;
      glowRef.current.scale.setScalar(isHovered ? 2 : pulse * 1.3);
    }
  });

  const scale = isHovered ? 1.5 : 1;

  return (
    <group position={node.position}>
      {/* Glow sphere */}
      <mesh ref={glowRef} scale={1.3}>
        <sphereGeometry args={[node.size, 16, 16]} />
        <meshBasicMaterial
          color={node.color}
          transparent
          opacity={0.2}
          depthWrite={false}
        />
      </mesh>

      {/* Main node */}
      <mesh
        ref={meshRef}
        scale={scale}
        onPointerOver={() => onHover(node.id)}
        onPointerOut={() => onHover(null)}
        onClick={() => onClick?.(node.id)}
      >
        <icosahedronGeometry args={[node.size, 1]} />
        <meshStandardMaterial
          color={node.color}
          emissive={node.color}
          emissiveIntensity={isHovered ? 0.8 : 0.4}
          roughness={0.3}
          metalness={0.8}
        />
      </mesh>
    </group>
  );
}

// Connection line between nodes
function ConnectionLine({
  startPos,
  endPos,
  animated = true,
}: {
  startPos: THREE.Vector3;
  endPos: THREE.Vector3;
  animated?: boolean;
}) {
  const lineRef = useRef<THREE.Line>(null);
  const opacityRef = useRef(0.4);

  const lineObject = useMemo(() => {
    const points = [startPos, endPos];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: '#60a5fa',
      transparent: true,
      opacity: 0.4,
      depthWrite: false,
    });
    return new THREE.Line(geometry, material);
  }, [startPos, endPos]);

  useFrame((state) => {
    if (animated && lineRef.current) {
      // Pulsing opacity animation
      opacityRef.current = 0.3 + Math.sin(state.clock.elapsedTime * 2 + startPos.x) * 0.2;
      (lineRef.current.material as THREE.LineBasicMaterial).opacity = opacityRef.current;
    }
  });

  return <primitive ref={lineRef} object={lineObject} />;
}

// Central logo node
function CentralNode() {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.2;
      // Floating effect
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
      <group
        ref={groupRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={hovered ? 1.2 : 1}
      >
        {/* Outer ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2, 0.08, 16, 100]} />
          <meshStandardMaterial
            color="#3b82f6"
            emissive="#3b82f6"
            emissiveIntensity={0.5}
            metalness={1}
            roughness={0.2}
          />
        </mesh>

        {/* Inner ring */}
        <mesh rotation={[Math.PI / 2, 0, Math.PI / 4]}>
          <torusGeometry args={[1.5, 0.06, 16, 100]} />
          <meshStandardMaterial
            color="#8b5cf6"
            emissive="#8b5cf6"
            emissiveIntensity={0.5}
            metalness={1}
            roughness={0.2}
          />
        </mesh>

        {/* Core sphere */}
        <mesh>
          <sphereGeometry args={[0.8, 32, 32]} />
          <meshStandardMaterial
            color="#60a5fa"
            emissive="#60a5fa"
            emissiveIntensity={0.6}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>

        {/* Glow effect */}
        <mesh scale={3}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshBasicMaterial
            color="#3b82f6"
            transparent
            opacity={0.1}
            depthWrite={false}
          />
        </mesh>

        {/* Text label */}
        <Html
          center
          distanceFactor={10}
          transform
          sprite
          style={{
            transition: 'all 0.2s',
            opacity: hovered ? 1 : 0.8,
            transform: `scale(${hovered ? 1.1 : 1})`,
          }}
        >
          <div className="text-center pointer-events-none">
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent whitespace-nowrap">
              LINE Unify Pay
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Blockchain Payment Network
            </div>
          </div>
        </Html>
      </group>
    </Float>
  );
}

// Floating particles in the background
function Particles({ count = 100 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);

  const [positions, sizes] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const size = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 40;
      size[i] = Math.random() * 0.05 + 0.02;
    }

    return [pos, size];
  }, [count]);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.02;
      pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.05) * 0.1;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={count}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        color="#60a5fa"
        transparent
        opacity={0.6}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

// Data flow animation - packets moving along connections
function DataFlowParticle({
  startPos,
  endPos,
}: {
  startPos: THREE.Vector3;
  endPos: THREE.Vector3;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const progress = useRef(Math.random()); // Start at random position

  useFrame((_, delta) => {
    if (meshRef.current) {
      progress.current += delta * 0.3;
      if (progress.current > 1) progress.current = 0;

      const pos = new THREE.Vector3().lerpVectors(
        startPos,
        endPos,
        progress.current
      );
      meshRef.current.position.copy(pos);

      // Fade in/out at ends
      const opacity = Math.sin(progress.current * Math.PI);
      (meshRef.current.material as THREE.MeshBasicMaterial).opacity = opacity * 0.8;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.08, 8, 8]} />
      <meshBasicMaterial
        color="#22d3ee"
        transparent
        opacity={0.8}
        depthWrite={false}
      />
    </mesh>
  );
}

// Main component
export function BlockchainNetworkHero3D({
  nodeCount = 20,
  animated = true,
  onNodeClick,
}: BlockchainNetworkHero3DProps) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const nodes = useMemo(() => generateNodes(nodeCount), [nodeCount]);

  const nodeMap = useMemo(() => {
    return new Map(nodes.map((n) => [n.id, n]));
  }, [nodes]);

  // Create connection pairs for lines
  const connections = useMemo(() => {
    const conns: Array<{ start: THREE.Vector3; end: THREE.Vector3 }> = [];
    nodes.forEach((node) => {
      node.connections.forEach((targetId) => {
        const target = nodeMap.get(targetId);
        if (target) {
          conns.push({ start: node.position, end: target.position });
        }
      });
    });
    return conns;
  }, [nodes, nodeMap]);

  // Select a few connections for data flow animation
  const dataFlowConnections = useMemo(() => {
    return connections.slice(0, Math.min(5, connections.length));
  }, [connections]);

  return (
    <group>
      {/* Background particles */}
      <Particles count={150} />

      {/* Connection lines */}
      {connections.map((conn, i) => (
        <ConnectionLine
          key={`conn-${i}`}
          startPos={conn.start}
          endPos={conn.end}
          animated={animated}
        />
      ))}

      {/* Data flow particles */}
      {animated &&
        dataFlowConnections.map((conn, i) => (
          <DataFlowParticle
            key={`flow-${i}`}
            startPos={conn.start}
            endPos={conn.end}
          />
        ))}

      {/* Blockchain nodes */}
      {nodes.map((node) => (
        <BlockchainNode
          key={node.id}
          node={node}
          isHovered={hoveredNode === node.id}
          onHover={setHoveredNode}
          onClick={onNodeClick}
        />
      ))}

      {/* Central branded node */}
      <CentralNode />
    </group>
  );
}

export default BlockchainNetworkHero3D;
