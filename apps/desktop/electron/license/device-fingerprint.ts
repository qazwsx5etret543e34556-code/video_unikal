import crypto from 'crypto';
import os from 'os';
import { machineId } from 'node-machine-id';
import logger from '../logger';

export interface DeviceFingerprint {
  hwid: string;
  osInfo: string;
  timestamp: number;
}

/**
 * Generate a unique hardware fingerprint for this device
 * Used for license activation tracking
 */
export async function generateDeviceFingerprint(): Promise<DeviceFingerprint> {
  try {
    // Get machine ID (most reliable hardware identifier)
    const machineIdValue = await machineId();
    
    // Combine with other hardware info for additional uniqueness
    const cpuModel = os.cpus()[0]?.model || 'unknown';
    const totalMemory = os.totalmem();
    const hostname = os.hostname();
    
    // Create composite string
    const composite = `${machineIdValue}|${cpuModel}|${totalMemory}|${hostname}`;
    
    // Generate SHA256 hash
    const hwid = crypto.createHash('sha256').update(composite).digest('hex');
    
    const fingerprint: DeviceFingerprint = {
      hwid,
      osInfo: `${os.platform()} ${os.arch()} ${os.release()}`,
      timestamp: Date.now(),
    };
    
    logger.info(`Generated device fingerprint: ${hwid.substring(0, 16)}...`);
    return fingerprint;
  } catch (error) {
    logger.error(`Failed to generate device fingerprint: ${error instanceof Error ? error.message : String(error)}`);
    
    // Fallback: use simpler method
    const fallbackHwid = crypto
      .createHash('sha256')
      .update(os.hostname() + os.userInfo().username)
      .digest('hex');
    
    return {
      hwid: fallbackHwid,
      osInfo: `${os.platform()} ${os.arch()} ${os.release()}`,
      timestamp: Date.now(),
    };
  }
}

/**
 * Get OS info for license tracking
 */
export function getOSInfo(): string {
  return `${os.platform()} ${os.arch()} ${os.release()}`;
}

/**
 * Get app version and user agent
 */
export function getUserAgent(appVersion: string): string {
  return `VideoUniqueizer/${appVersion} (${getOSInfo()})`;
}

export default generateDeviceFingerprint;
