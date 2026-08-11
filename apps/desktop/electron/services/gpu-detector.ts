import { exec } from 'child_process';
import { promisify } from 'util';
import logger from '../logger';

const execAsync = promisify(exec);

export interface GpuInfo {
  hasNvidia: boolean;
  nvencAvailable: boolean;
  gpuName?: string;
  driverVersion?: string;
}

export async function detectGPU(): Promise<GpuInfo> {
  try {
    // Check for NVIDIA GPU using nvidia-smi
    const result = await execAsync('nvidia-smi --query-gpu=name,driver_version --format=csv,noheader');
    
    if (result.stdout) {
      const lines = result.stdout.trim().split('\n');
      const firstLine = lines[0]?.split(', ');
      
      return {
        hasNvidia: true,
        nvencAvailable: true, // If nvidia-smi works, NVENC is available
        gpuName: firstLine?.[0]?.trim(),
        driverVersion: firstLine?.[1]?.trim(),
      };
    }
  } catch (error) {
    logger.info('No NVIDIA GPU detected or nvidia-smi not available');
  }

  return {
    hasNvidia: false,
    nvencAvailable: false,
  };
}

export default detectGPU;
