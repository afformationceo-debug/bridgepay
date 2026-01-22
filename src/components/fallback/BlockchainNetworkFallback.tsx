'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface NodeProps {
  delay: number;
  size: 'sm' | 'md' | 'lg';
  position: { x: string; y: string };
  color: 'blue' | 'purple' | 'cyan';
}

// Animated node component (CSS version)
function Node({ delay, size, position, color }: NodeProps) {
  const sizeMap = {
    sm: 'w-3 h-3',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
  };

  const colorMap = {
    blue: 'bg-blue-500 shadow-blue-500/50',
    purple: 'bg-purple-500 shadow-purple-500/50',
    cyan: 'bg-cyan-500 shadow-cyan-500/50',
  };

  return (
    <motion.div
      className={`absolute ${sizeMap[size]} rounded-full ${colorMap[color]} shadow-lg`}
      style={{
        left: position.x,
        top: position.y,
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.6, 1, 0.6],
      }}
      transition={{
        duration: 3,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}

// Animated connection line
function ConnectionLine({
  start,
  end,
  delay,
}: {
  start: { x: string; y: string };
  end: { x: string; y: string };
  delay: number;
}) {
  return (
    <motion.div
      className="absolute h-px bg-gradient-to-r from-blue-500/30 via-purple-500/50 to-blue-500/30"
      style={{
        left: start.x,
        top: start.y,
        width: '100px',
        transformOrigin: 'left center',
        transform: `rotate(${Math.atan2(
          parseFloat(end.y) - parseFloat(start.y),
          parseFloat(end.x) - parseFloat(start.x)
        )}rad)`,
      }}
      initial={{ scaleX: 0, opacity: 0 }}
      animate={{ scaleX: 1, opacity: [0.2, 0.5, 0.2] }}
      transition={{
        duration: 2,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}

// Floating particle
function Particle({ delay, x, y }: { delay: number; x: string; y: string }) {
  return (
    <motion.div
      className="absolute w-1 h-1 rounded-full bg-blue-400/60"
      style={{ left: x, top: y }}
      animate={{
        y: [0, -20, 0],
        opacity: [0.3, 0.8, 0.3],
      }}
      transition={{
        duration: 4 + Math.random() * 2,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}

// Central logo component
function CentralLogo() {
  return (
    <motion.div
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      {/* Outer ring */}
      <motion.div
        className="absolute inset-0 w-32 h-32 -m-16 rounded-full border-2 border-blue-500/30"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      />

      {/* Middle ring */}
      <motion.div
        className="absolute inset-0 w-24 h-24 -m-12 rounded-full border border-purple-500/40"
        animate={{ rotate: -360 }}
        transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
      />

      {/* Inner glow */}
      <motion.div
        className="w-16 h-16 -m-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/50"
        animate={{
          scale: [1, 1.1, 1],
          boxShadow: [
            '0 0 20px rgba(59, 130, 246, 0.5)',
            '0 0 40px rgba(139, 92, 246, 0.6)',
            '0 0 20px rgba(59, 130, 246, 0.5)',
          ],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Text label */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 text-center whitespace-nowrap">
        <motion.div
          className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          LINE Unify Pay
        </motion.div>
        <motion.div
          className="text-xs text-slate-400 mt-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          Blockchain Payment Network
        </motion.div>
      </div>
    </motion.div>
  );
}

// Main fallback component
export function BlockchainNetworkFallback() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900" />
    );
  }

  // Generate random nodes
  const nodes: NodeProps[] = [
    { delay: 0, size: 'md', position: { x: '15%', y: '20%' }, color: 'blue' },
    { delay: 0.2, size: 'sm', position: { x: '25%', y: '35%' }, color: 'purple' },
    { delay: 0.4, size: 'lg', position: { x: '10%', y: '55%' }, color: 'cyan' },
    { delay: 0.6, size: 'sm', position: { x: '20%', y: '70%' }, color: 'blue' },
    { delay: 0.8, size: 'md', position: { x: '30%', y: '45%' }, color: 'purple' },
    { delay: 1.0, size: 'sm', position: { x: '75%', y: '25%' }, color: 'cyan' },
    { delay: 1.2, size: 'lg', position: { x: '85%', y: '40%' }, color: 'blue' },
    { delay: 1.4, size: 'md', position: { x: '80%', y: '60%' }, color: 'purple' },
    { delay: 1.6, size: 'sm', position: { x: '70%', y: '75%' }, color: 'cyan' },
    { delay: 1.8, size: 'md', position: { x: '90%', y: '55%' }, color: 'blue' },
  ];

  // Generate floating particles
  const particles = Array.from({ length: 30 }, (_, i) => ({
    delay: i * 0.15,
    x: `${Math.random() * 100}%`,
    y: `${Math.random() * 100}%`,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent" />

      {/* Floating particles */}
      {particles.map((particle, i) => (
        <Particle key={i} {...particle} />
      ))}

      {/* Connection lines (simplified) */}
      <svg className="absolute inset-0 w-full h-full opacity-30">
        <motion.line
          x1="15%" y1="20%" x2="25%" y2="35%"
          stroke="url(#gradient1)"
          strokeWidth="1"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
        />
        <motion.line
          x1="25%" y1="35%" x2="30%" y2="45%"
          stroke="url(#gradient1)"
          strokeWidth="1"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, delay: 0.5, repeat: Infinity, repeatType: 'reverse' }}
        />
        <motion.line
          x1="75%" y1="25%" x2="85%" y2="40%"
          stroke="url(#gradient2)"
          strokeWidth="1"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, delay: 0.3, repeat: Infinity, repeatType: 'reverse' }}
        />
        <motion.line
          x1="85%" y1="40%" x2="80%" y2="60%"
          stroke="url(#gradient2)"
          strokeWidth="1"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, delay: 0.8, repeat: Infinity, repeatType: 'reverse' }}
        />
        <motion.line
          x1="30%" y1="45%" x2="50%" y2="50%"
          stroke="url(#gradient1)"
          strokeWidth="1"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2.5, delay: 0.2, repeat: Infinity, repeatType: 'reverse' }}
        />
        <motion.line
          x1="70%" y1="75%" x2="50%" y2="50%"
          stroke="url(#gradient2)"
          strokeWidth="1"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2.5, delay: 0.7, repeat: Infinity, repeatType: 'reverse' }}
        />
        <defs>
          <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.3" />
          </linearGradient>
        </defs>
      </svg>

      {/* Network nodes */}
      {nodes.map((node, i) => (
        <Node key={i} {...node} />
      ))}

      {/* Central logo */}
      <CentralLogo />

      {/* Animated scan line effect */}
      <motion.div
        className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"
        initial={{ top: '0%' }}
        animate={{ top: '100%' }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}

export default BlockchainNetworkFallback;
