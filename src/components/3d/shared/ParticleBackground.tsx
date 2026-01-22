'use client';

import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface ParticleBackgroundProps {
  count?: number;
  size?: number;
  color?: string;
  opacity?: number;
  speed?: number;
  depth?: number;
  mouseInteraction?: boolean;
}

export function ParticleBackground({
  count = 200,
  size = 0.05,
  color = '#60a5fa',
  opacity = 0.5,
  speed = 0.02,
  depth = 50,
  mouseInteraction = true,
}: ParticleBackgroundProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const { viewport } = useThree();

  // Generate particle positions
  const [positions, velocities, originalPositions] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    const origPos = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // Spread particles in a spherical distribution
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = depth * Math.cbrt(Math.random()); // Cube root for even distribution

      pos[i3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.5; // Flatten vertically
      pos[i3 + 2] = radius * Math.cos(phi);

      // Random velocities
      vel[i3] = (Math.random() - 0.5) * 0.01;
      vel[i3 + 1] = (Math.random() - 0.5) * 0.01;
      vel[i3 + 2] = (Math.random() - 0.5) * 0.01;

      // Store original positions for mouse interaction
      origPos[i3] = pos[i3];
      origPos[i3 + 1] = pos[i3 + 1];
      origPos[i3 + 2] = pos[i3 + 2];
    }

    return [pos, vel, origPos];
  }, [count, depth]);

  // Generate particle sizes (varying)
  const sizes = useMemo(() => {
    const s = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      s[i] = size * (0.5 + Math.random());
    }
    return s;
  }, [count, size]);

  // Mouse move handler
  useFrame((state) => {
    if (!pointsRef.current) return;

    const geometry = pointsRef.current.geometry;
    const positionAttr = geometry.attributes.position;
    const positions = positionAttr.array as Float32Array;

    // Update mouse position from pointer
    if (mouseInteraction) {
      mousePos.current.x = (state.pointer.x * viewport.width) / 2;
      mousePos.current.y = (state.pointer.y * viewport.height) / 2;
    }

    // Animate particles
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // Add velocity for organic movement
      positions[i3] += velocities[i3];
      positions[i3 + 1] += velocities[i3 + 1];
      positions[i3 + 2] += velocities[i3 + 2];

      // Gently drift around original position
      const dx = originalPositions[i3] - positions[i3];
      const dy = originalPositions[i3 + 1] - positions[i3 + 1];
      const dz = originalPositions[i3 + 2] - positions[i3 + 2];

      velocities[i3] += dx * 0.0002;
      velocities[i3 + 1] += dy * 0.0002;
      velocities[i3 + 2] += dz * 0.0002;

      // Apply damping
      velocities[i3] *= 0.99;
      velocities[i3 + 1] *= 0.99;
      velocities[i3 + 2] *= 0.99;

      // Mouse interaction - push particles away
      if (mouseInteraction) {
        const mx = positions[i3] - mousePos.current.x;
        const my = positions[i3 + 1] - mousePos.current.y;
        const mouseDist = Math.sqrt(mx * mx + my * my);

        if (mouseDist < 5) {
          const force = (5 - mouseDist) * 0.01;
          velocities[i3] += (mx / mouseDist) * force;
          velocities[i3 + 1] += (my / mouseDist) * force;
        }
      }
    }

    positionAttr.needsUpdate = true;

    // Slow rotation of entire particle system
    pointsRef.current.rotation.y += speed * 0.1;
    pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.05) * 0.1;
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
        size={size}
        color={color}
        transparent
        opacity={opacity}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Animated gradient background particles
export function GradientParticles({
  count = 100,
  colors = ['#3b82f6', '#8b5cf6', '#06b6d4'],
}: {
  count?: number;
  colors?: string[];
}) {
  const pointsRef = useRef<THREE.Points>(null);

  const [positions, colorArray] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const colorObjects = colors.map((c) => new THREE.Color(c));

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      pos[i3] = (Math.random() - 0.5) * 60;
      pos[i3 + 1] = (Math.random() - 0.5) * 40;
      pos[i3 + 2] = (Math.random() - 0.5) * 30;

      // Random color from palette
      const color = colorObjects[Math.floor(Math.random() * colorObjects.length)];
      col[i3] = color.r;
      col[i3 + 1] = color.g;
      col[i3 + 2] = color.b;
    }

    return [pos, col];
  }, [count, colors]);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.01;

      // Update particle positions for floating effect
      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        positions[i3 + 1] += Math.sin(state.clock.elapsedTime + i * 0.1) * 0.002;
      }
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
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
          attach="attributes-color"
          count={count}
          array={colorArray}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        transparent
        opacity={0.6}
        sizeAttenuation
        depthWrite={false}
        vertexColors
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Connecting lines between nearby particles
export function ParticleConnections({
  positions,
  maxDistance = 3,
  color = '#60a5fa',
  opacity = 0.2,
}: {
  positions: Float32Array;
  maxDistance?: number;
  color?: string;
  opacity?: number;
}) {
  const linesRef = useRef<THREE.LineSegments>(null);

  const linePositions = useMemo(() => {
    const lines: number[] = [];
    const particleCount = positions.length / 3;

    for (let i = 0; i < particleCount; i++) {
      for (let j = i + 1; j < particleCount; j++) {
        const dx = positions[i * 3] - positions[j * 3];
        const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
        const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < maxDistance) {
          lines.push(
            positions[i * 3],
            positions[i * 3 + 1],
            positions[i * 3 + 2],
            positions[j * 3],
            positions[j * 3 + 1],
            positions[j * 3 + 2]
          );
        }
      }
    }

    return new Float32Array(lines);
  }, [positions, maxDistance]);

  return (
    <lineSegments ref={linesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={linePositions.length / 3}
          array={linePositions}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color={color} transparent opacity={opacity} />
    </lineSegments>
  );
}

export default ParticleBackground;
