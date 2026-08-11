import type { ProcessingProgress } from '@video-uniqueizer/shared-types';

export function parseProgressLine(line: string): ProcessingProgress | null {
  try {
    // Parse FFmpeg progress output
    // Format: key=value pairs separated by newlines
    
    if (!line.includes('=')) {
      return null;
    }

    const [key, value] = line.split('=');
    const trimmedKey = key.trim();
    const trimmedValue = value.trim();

    if (trimmedKey === 'out_time_ms') {
      const timeMs = parseInt(trimmedValue, 10);
      if (isNaN(timeMs)) return null;
      
      return {
        timeMs,
        percent: 0, // Will be calculated by comparing with duration
        speed: 0,
        frame: 0,
      };
    }

    if (trimmedKey === 'progress') {
      // Continue or end marker
      return null;
    }

    return null;
  } catch {
    return null;
  }
}

export function calculateProgress(
  currentTimeMs: number,
  durationMs: number
): number {
  if (durationMs <= 0) return 0;
  
  const percent = (currentTimeMs / durationMs) * 100;
  return Math.min(100, Math.max(0, percent));
}

export default parseProgressLine;
