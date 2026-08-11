import { useEffect, useState } from 'react';
import type { EncoderMode } from '@video-uniqueizer/shared-types';

export function useFfmpeg() {
  const [gpuAvailable, setGpuAvailable] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Check GPU availability on mount
    checkGPU();
  }, []);

  const checkGPU = async () => {
    try {
      const result = await (window as any).electron.checkGPU();
      setGpuAvailable(result.hasNvidia && result.nvencAvailable);
    } catch {
      setGpuAvailable(false);
    }
  };

  const getRecommendedEncoder = (): EncoderMode => {
    return gpuAvailable ? 'auto' : 'cpu';
  };

  return {
    gpuAvailable,
    isProcessing,
    getRecommendedEncoder,
    refreshGPU: checkGPU,
  };
}

export default useFfmpeg;
