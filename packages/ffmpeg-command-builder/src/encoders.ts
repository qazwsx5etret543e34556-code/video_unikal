/**
 * Encoder Arguments Builder
 * Builds FFmpeg encoder arguments for CPU and NVIDIA GPU
 */

import type { EncoderMode } from '@video-uniqueizer/shared-types/queue';

export interface EncoderArgs {
  videoCodec: string;
  audioCodec: string;
  args: string[];
}

export function getEncoderArgs(mode: EncoderMode, hasAudio: boolean = true): EncoderArgs {
  if (mode === 'nvidia') {
    return getNvencArgs(hasAudio);
  }
  
  return getCpuArgs(hasAudio);
}

export function getCpuArgs(hasAudio: boolean = true): EncoderArgs {
  const args: string[] = [
    // Video codec
    '-c:v', 'libx264',
    '-preset', 'medium',
    '-crf', '22',
    '-pix_fmt', 'yuv420p',
    '-profile:v', 'high',
    '-level', '4.1',
  ];
  
  if (hasAudio) {
    args.push(
      '-c:a', 'aac',
      '-b:a', '192k',
      '-ar', '48000',
      '-ac', '2'
    );
  } else {
    args.push('-an');
  }
  
  return {
    videoCodec: 'libx264',
    audioCodec: hasAudio ? 'aac' : 'none',
    args,
  };
}

export function getNvencArgs(hasAudio: boolean = true): EncoderArgs {
  const args: string[] = [
    // NVIDIA NVENC H.264 encoder
    '-c:v', 'h264_nvenc',
    '-preset', 'p5', // Quality preset (P1-P7, P5 is balanced)
    '-rc', 'vbr', // Variable bitrate
    '-cq', '22', // Quality level (lower = better, 15-30 range)
    '-b:v', '0', // No bitrate limit with VBR
    '-pix_fmt', 'yuv420p',
    '-profile:v', 'high',
    '-level', 'auto',
    '-gpu', '0', // Use first GPU
  ];
  
  if (hasAudio) {
    args.push(
      '-c:a', 'aac',
      '-b:a', '192k',
      '-ar', '48000',
      '-ac', '2'
    );
  } else {
    args.push('-an');
  }
  
  return {
    videoCodec: 'h264_nvenc',
    audioCodec: hasAudio ? 'aac' : 'none',
    args,
  };
}

export function getSafeProfileArgs(hasAudio: boolean = true): string[] {
  // Safe profile for fallback when custom encoding fails
  const args: string[] = [
    '-c:v', 'libx264',
    '-preset', 'fast',
    '-crf', '23',
    '-pix_fmt', 'yuv420p',
    '-profile:v', 'main',
    '-level', '4.0',
    '-movflags', '+faststart',
  ];
  
  if (hasAudio) {
    args.push(
      '-c:a', 'aac',
      '-b:a', '128k',
      '-ar', '44100',
      '-ac', '2'
    );
  } else {
    args.push('-an');
  }
  
  return args;
}

export function getMetadataRemovalArgs(): string[] {
  // Remove all metadata for uniqueization
  return [
    '-map_metadata', '-1',
    '-codec:v', 'copy',
    '-codec:a', 'copy',
  ];
}

export function getProgressArgs(pipePath: string = 'pipe:1'): string[] {
  return [
    '-progress', pipePath,
    '-nostats',
    '-loglevel', 'error',
  ];
}
