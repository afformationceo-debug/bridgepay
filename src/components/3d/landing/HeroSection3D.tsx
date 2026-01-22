'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { use3DCapability } from '@/lib/hooks/use3DCapability';
import BlockchainNetworkFallback from '@/components/fallback/BlockchainNetworkFallback';

// Dynamically import 3D components to avoid SSR issues
const Canvas3DProvider = dynamic(
  () => import('@/components/providers/Canvas3DProvider').then((mod) => mod.Canvas3DProvider),
  { ssr: false }
);

const Scene3D = dynamic(
  () => import('@/components/3d/base/Scene3D').then((mod) => mod.Scene3D),
  { ssr: false }
);

const BlockchainNetworkHero3D = dynamic(
  () => import('@/components/3d/landing/BlockchainNetworkHero3D').then((mod) => mod.BlockchainNetworkHero3D),
  { ssr: false }
);

interface HeroSection3DProps {
  className?: string;
  onNodeClick?: (nodeId: string) => void;
}

// Loading placeholder
function LoadingState() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        <span className="text-sm text-slate-400">Loading 3D Experience...</span>
      </div>
    </div>
  );
}

export function HeroSection3D({ className = '', onNodeClick }: HeroSection3DProps) {
  const { canRender3D, qualitySettings, performanceTier } = use3DCapability();

  // Show 2D fallback for low-performance devices or when 3D is not supported
  if (!canRender3D || qualitySettings.use2DFallback) {
    return (
      <div className={`relative ${className}`}>
        <BlockchainNetworkFallback />
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <Suspense fallback={<LoadingState />}>
        <Canvas3DProvider
          className="absolute inset-0"
          fallback={<BlockchainNetworkFallback />}
        >
          <Scene3D
            autoRotate={true}
            autoRotateSpeed={0.2}
            enableControls={false}
            enablePostProcessing={qualitySettings.postProcessing}
            showStars={true}
            ambientIntensity={0.4}
          >
            <BlockchainNetworkHero3D
              nodeCount={qualitySettings.nodeCount}
              animated={true}
              onNodeClick={onNodeClick}
            />
          </Scene3D>
        </Canvas3DProvider>
      </Suspense>

      {/* Gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-900/80 pointer-events-none" />

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-slate-900 to-transparent pointer-events-none" />
    </div>
  );
}

export default HeroSection3D;
