'use client';

import { useState, useEffect } from 'react';

export type PerformanceTier = 'high' | 'medium' | 'low';

export interface DeviceCapability {
  canRender3D: boolean;
  performanceTier: PerformanceTier;
  isMobile: boolean;
  isTablet: boolean;
  hasWebGL2: boolean;
  gpuInfo: string | null;
}

export interface QualitySettings {
  nodeCount: number;
  particleCount: number;
  postProcessing: boolean;
  pixelRatio: number;
  antialias: boolean;
  shadows: boolean;
  use2DFallback: boolean;
}

const HIGH_PERFORMANCE_GPUS = [
  'nvidia',
  'geforce',
  'rtx',
  'gtx',
  'radeon',
  'rx ',
  'apple m1',
  'apple m2',
  'apple m3',
  'apple m4',
];

const LOW_PERFORMANCE_GPUS = [
  'intel',
  'mali',
  'adreno',
  'powervr',
  'sgx',
  'tegra',
];

function detectGPUPerformance(renderer: string | null): PerformanceTier {
  if (!renderer) return 'medium';

  const lowerRenderer = renderer.toLowerCase();

  // Check for high performance GPUs
  for (const gpu of HIGH_PERFORMANCE_GPUS) {
    if (lowerRenderer.includes(gpu)) {
      return 'high';
    }
  }

  // Check for low performance GPUs
  for (const gpu of LOW_PERFORMANCE_GPUS) {
    if (lowerRenderer.includes(gpu)) {
      return 'low';
    }
  }

  return 'medium';
}

function detectMobile(): boolean {
  if (typeof window === 'undefined') return false;
  return /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

function detectTablet(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent.toLowerCase();
  return /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/.test(ua);
}

function checkWebGL(): { hasWebGL: boolean; hasWebGL2: boolean; gpuInfo: string | null } {
  if (typeof window === 'undefined') {
    return { hasWebGL: false, hasWebGL2: false, gpuInfo: null };
  }

  const canvas = document.createElement('canvas');
  let gpuInfo: string | null = null;
  let hasWebGL = false;
  let hasWebGL2 = false;

  try {
    const gl2 = canvas.getContext('webgl2');
    if (gl2) {
      hasWebGL2 = true;
      hasWebGL = true;
      const debugInfo = gl2.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        gpuInfo = gl2.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      }
    } else {
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (gl) {
        hasWebGL = true;
        const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          gpuInfo = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        }
      }
    }
  } catch (e) {
    console.warn('WebGL detection failed:', e);
  }

  return { hasWebGL, hasWebGL2, gpuInfo };
}

export function getQualitySettings(tier: PerformanceTier): QualitySettings {
  switch (tier) {
    case 'high':
      return {
        nodeCount: 25,
        particleCount: 200,
        postProcessing: true,
        pixelRatio: typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1,
        antialias: true,
        shadows: true,
        use2DFallback: false,
      };
    case 'medium':
      return {
        nodeCount: 15,
        particleCount: 80,
        postProcessing: false,
        pixelRatio: 1,
        antialias: true,
        shadows: false,
        use2DFallback: false,
      };
    case 'low':
    default:
      return {
        nodeCount: 0,
        particleCount: 0,
        postProcessing: false,
        pixelRatio: 1,
        antialias: false,
        shadows: false,
        use2DFallback: true,
      };
  }
}

export function use3DCapability(): DeviceCapability & { qualitySettings: QualitySettings } {
  const [capability, setCapability] = useState<DeviceCapability>({
    canRender3D: true,
    performanceTier: 'high',
    isMobile: false,
    isTablet: false,
    hasWebGL2: true,
    gpuInfo: null,
  });

  useEffect(() => {
    const isMobile = detectMobile();
    const isTablet = detectTablet();
    const { hasWebGL, hasWebGL2, gpuInfo } = checkWebGL();

    let performanceTier: PerformanceTier = detectGPUPerformance(gpuInfo);

    // Downgrade tier for mobile devices
    if (isMobile) {
      performanceTier = performanceTier === 'high' ? 'medium' : 'low';
    } else if (isTablet) {
      performanceTier = performanceTier === 'high' ? 'medium' : performanceTier;
    }

    // If no WebGL, force low tier
    if (!hasWebGL) {
      performanceTier = 'low';
    }

    setCapability({
      canRender3D: hasWebGL,
      performanceTier,
      isMobile,
      isTablet,
      hasWebGL2,
      gpuInfo,
    });
  }, []);

  return {
    ...capability,
    qualitySettings: getQualitySettings(capability.performanceTier),
  };
}

// Hook for adaptive quality based on FPS monitoring
export function useAdaptiveQuality(initialTier: PerformanceTier = 'high') {
  const [tier, setTier] = useState<PerformanceTier>(initialTier);
  const [fpsHistory, setFpsHistory] = useState<number[]>([]);

  const recordFPS = (fps: number) => {
    setFpsHistory((prev) => {
      const newHistory = [...prev, fps].slice(-60); // Keep last 60 samples

      // Check if we need to adjust quality
      if (newHistory.length >= 30) {
        const avgFps = newHistory.reduce((a, b) => a + b, 0) / newHistory.length;

        if (avgFps < 25 && tier === 'high') {
          setTier('medium');
        } else if (avgFps < 20 && tier === 'medium') {
          setTier('low');
        } else if (avgFps > 55 && tier === 'medium') {
          setTier('high');
        }
      }

      return newHistory;
    });
  };

  return {
    tier,
    setTier,
    recordFPS,
    qualitySettings: getQualitySettings(tier),
  };
}
