'use client';

import { useRef, useState, ReactNode } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface FeatureCard3DProps {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
  scale?: number;
  glareOpacity?: number;
  perspective?: number;
}

export function FeatureCard3D({
  children,
  className = '',
  maxTilt = 15,
  scale = 1.02,
  glareOpacity = 0.2,
  perspective = 1000,
}: FeatureCard3DProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Motion values for smooth animation
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Spring config for smooth movement
  const springConfig = { stiffness: 300, damping: 30 };
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [maxTilt, -maxTilt]), springConfig);
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-maxTilt, maxTilt]), springConfig);

  // Glare effect position
  const glareX = useSpring(useTransform(x, [-0.5, 0.5], [0, 100]), springConfig);
  const glareY = useSpring(useTransform(y, [-0.5, 0.5], [0, 100]), springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const mouseX = (e.clientX - centerX) / rect.width;
    const mouseY = (e.clientY - centerY) / rect.height;

    x.set(mouseX);
    y.set(mouseY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setIsHovered(false);
  };

  return (
    <motion.div
      ref={cardRef}
      className={`relative ${className}`}
      style={{
        perspective,
        transformStyle: 'preserve-3d',
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        animate={{
          scale: isHovered ? scale : 1,
        }}
        transition={{ duration: 0.2 }}
        className="relative"
      >
        {/* Card content */}
        {children}

        {/* Glare effect */}
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden"
          style={{
            opacity: isHovered ? glareOpacity : 0,
            background: `radial-gradient(circle at ${glareX.get()}% ${glareY.get()}%, rgba(255,255,255,0.3) 0%, transparent 60%)`,
          }}
        />

        {/* Border glow on hover */}
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          animate={{
            boxShadow: isHovered
              ? '0 0 20px rgba(59, 130, 246, 0.3), 0 0 40px rgba(139, 92, 246, 0.2)'
              : '0 0 0px rgba(59, 130, 246, 0)',
          }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>
    </motion.div>
  );
}

// Icon that floats and glows on hover
interface FloatingIconProps {
  icon: ReactNode;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'cyan';
  className?: string;
}

export function FloatingIcon({ icon, color = 'blue', className = '' }: FloatingIconProps) {
  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/30 shadow-blue-500/20',
    green: 'bg-green-500/10 text-green-400 border-green-500/30 shadow-green-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/30 shadow-purple-500/20',
    orange: 'bg-orange-500/10 text-orange-400 border-orange-500/30 shadow-orange-500/20',
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 shadow-cyan-500/20',
  };

  return (
    <motion.div
      className={`w-12 h-12 rounded-xl flex items-center justify-center border ${colorClasses[color]} ${className}`}
      whileHover={{
        y: -4,
        boxShadow: `0 8px 20px var(--tw-shadow-color)`,
      }}
      transition={{ duration: 0.2 }}
    >
      {icon}
    </motion.div>
  );
}

// Animated counter for stats
interface AnimatedCounterProps {
  value: string;
  label: string;
  delay?: number;
}

export function AnimatedCounter({ value, label, delay = 0 }: AnimatedCounterProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
      className="text-center"
    >
      <motion.div
        initial={{ scale: 0.5 }}
        whileInView={{ scale: 1 }}
        transition={{ duration: 0.4, delay: delay + 0.1, type: 'spring' }}
        viewport={{ once: true }}
        className="text-3xl font-bold text-white"
      >
        {value}
      </motion.div>
      <div className="text-slate-400 text-sm">{label}</div>
    </motion.div>
  );
}

export default FeatureCard3D;
