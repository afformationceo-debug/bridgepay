'use client';

import { Suspense, ReactNode } from 'react';
import { Canvas, CanvasProps } from '@react-three/fiber';
import { Preload } from '@react-three/drei';
import { use3DCapability, QualitySettings } from '@/lib/hooks/use3DCapability';

interface Canvas3DProviderProps {
  children: ReactNode;
  className?: string;
  fallback?: ReactNode;
  canvasProps?: Partial<CanvasProps>;
}

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        <span className="text-sm text-slate-400">Loading 3D...</span>
      </div>
    </div>
  );
}

// Default 2D fallback when WebGL is not supported
function Default2DFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div className="text-center">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-blue-500/20 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-blue-500/40 animate-pulse" />
        </div>
        <p className="text-slate-400">3D visualization unavailable</p>
      </div>
    </div>
  );
}

export function Canvas3DProvider({
  children,
  className = '',
  fallback,
  canvasProps = {},
}: Canvas3DProviderProps) {
  const { canRender3D, qualitySettings } = use3DCapability();

  // If device can't render 3D, show fallback
  if (!canRender3D || qualitySettings.use2DFallback) {
    return (
      <div className={`relative ${className}`}>
        {fallback || <Default2DFallback />}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <Suspense fallback={<LoadingFallback />}>
        <Canvas
          dpr={qualitySettings.pixelRatio}
          gl={{
            antialias: qualitySettings.antialias,
            alpha: true,
            powerPreference: 'high-performance',
            preserveDrawingBuffer: false,
          }}
          camera={{
            fov: 60,
            near: 0.1,
            far: 1000,
            position: [0, 0, 20],
          }}
          style={{ background: 'transparent' }}
          {...canvasProps}
        >
          {children}
          <Preload all />
        </Canvas>
      </Suspense>
    </div>
  );
}

// Context provider for quality settings throughout the 3D scene
import { createContext, useContext } from 'react';

const QualityContext = createContext<QualitySettings | null>(null);

export function QualityProvider({
  children,
  settings
}: {
  children: ReactNode;
  settings: QualitySettings;
}) {
  return (
    <QualityContext.Provider value={settings}>
      {children}
    </QualityContext.Provider>
  );
}

export function useQualitySettings(): QualitySettings {
  const context = useContext(QualityContext);
  if (!context) {
    // Return default high quality settings if no provider
    return {
      nodeCount: 25,
      particleCount: 200,
      postProcessing: true,
      pixelRatio: 1,
      antialias: true,
      shadows: true,
      use2DFallback: false,
    };
  }
  return context;
}
