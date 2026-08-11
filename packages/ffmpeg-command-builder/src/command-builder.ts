/**
 * Main FFmpeg Command Builder
 * Assembles complete FFmpeg command from all components
 */

import path from 'node:path';
import type { EncoderMode } from '@video-uniqueizer/shared-types/queue';
import type { AppliedEffects } from '@video-uniqueizer/shared-types/effects';
import type { VideoMetadata } from '@video-uniqueizer/shared-types/queue';
import { buildVideoFilters, getSpeedAudioFilter } from './video-filters.js';
import { buildAudioFilters } from './audio-filters.js';
import { getEncoderArgs, getSafeProfileArgs } from './encoders.js';

export interface BuildCommandOptions {
  ffmpegPath: string;
  inputPath: string;
  outputPath: string;
  encoder: EncoderMode;
  effects: AppliedEffects;
  metadata: VideoMetadata;
  safeProfile?: boolean;
  progressPipe?: string;
}

export function buildFfmpegCommand(options: BuildCommandOptions): string[] {
  const {
    ffmpegPath,
    inputPath,
    outputPath,
    encoder,
    effects,
    metadata,
    safeProfile = false,
    progressPipe = 'pipe:1',
  } = options;
  
  const args: string[] = [ffmpegPath];
  
  // Input file
  args.push('-i', inputPath);
  
  // Get encoder arguments
  const encoderArgs = safeProfile 
    ? getSafeProfileArgs(metadata.hasAudio)
    : getEncoderArgs(encoder, metadata.hasAudio).args;
  
  // Build video filters
  const videoFilters = safeProfile ? [] : buildVideoFilters(effects, {
    inputWidth: metadata.width,
    inputHeight: metadata.height,
    inputFps: metadata.fps,
    hasAudio: metadata.hasAudio,
  });
  
  // Build audio filters
  const audioFilters = safeProfile ? [] : buildAudioFilters(effects);
  
  // Add speed filter if needed (affects both video and audio)
  const speedValue = effects.effects['speed'] as number | undefined;
  if (speedValue !== undefined && speedValue !== 100 && !safeProfile) {
    const speedAudioFilter = getSpeedAudioFilter(speedValue);
    if (speedAudioFilter) {
      audioFilters.push(speedAudioFilter);
    }
  }
  
  // Combine filters
  const filterComplexParts: string[] = [];
  
  if (videoFilters.length > 0) {
    filterComplexParts.push(videoFilters.join(','));
  }
  
  if (audioFilters.length > 0 && metadata.hasAudio) {
    filterComplexParts.push(`aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=stereo,${audioFilters.join(',')}`);
  }
  
  // Add filter_complex if we have filters
  if (filterComplexParts.length > 0) {
    const filterComplex = filterComplexParts.join(';');
    args.push('-filter_complex', filterComplex);
  }
  
  // Add encoder arguments
  args.push(...encoderArgs);
  
  // Remove metadata for uniqueization (unless safe profile)
  if (!safeProfile && effects.effects['metadataClean']) {
    args.push('-map_metadata', '-1');
  }
  
  // Progress reporting
  args.push('-progress', progressPipe);
  args.push('-nostats');
  args.push('-loglevel', 'error');
  
  // Output file
  args.push('-y', outputPath);
  
  return args;
}

export function buildMetadataOnlyCommand(
  ffmpegPath: string,
  inputPath: string,
  outputPath: string
): string[] {
  // Simple command to just remove metadata without re-encoding
  return [
    ffmpegPath,
    '-i', inputPath,
    '-map_metadata', '-1',
    '-c:v', 'copy',
    '-c:a', 'copy',
    '-y',
    outputPath,
  ];
}

export function getOutputPath(inputPath: string, suffix: string = '_uniqueized'): string {
  const dir = path.dirname(inputPath);
  const name = path.basename(inputPath, path.extname(inputPath));
  const ext = path.extname(inputPath);
  
  let counter = 0;
  let outputPath = path.join(dir, `${name}${suffix}${ext}`);
  
  while (true) {
    try {
      // Check if file exists (this will throw if doesn't exist in Node with fs.access)
      break;
    } catch {
      break;
    }
    
    counter++;
    outputPath = path.join(dir, `${name}${suffix}_${counter}${ext}`);
  }
  
  return outputPath;
}

export function getRandomizedEffects(
  baseEffects: Record<string, { enabled: boolean; min: number; max: number }>,
  seed?: number
): AppliedEffects {
  // Simple seeded random (for reproducibility if needed)
  let random = seed !== undefined 
    ? () => {
        const x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
      }
    : Math.random;
  
  const randomized: Record<string, number | boolean> = {};
  
  for (const [effectName, config] of Object.entries(baseEffects)) {
    if (!config.enabled) {
      if (effectName === 'flipHorizontal' || effectName === 'flipVertical') {
        randomized[effectName] = false;
      } else if (effectName === 'metadataClean' || effectName === 'transparentSquare') {
        randomized[effectName] = config.min > 0;
      } else {
        randomized[effectName] = 0;
      }
      continue;
    }
    
    if (effectName === 'flipHorizontal' || effectName === 'flipVertical') {
      // Boolean effects
      randomized[effectName] = random() > 0.5;
    } else if (effectName === 'metadataClean' || effectName === 'transparentSquare') {
      // Always-on boolean effects
      randomized[effectName] = true;
    } else {
      // Numeric effects - randomize within range
      const range = config.max - config.min;
      const value = config.min + random() * range;
      randomized[effectName] = Math.round(value * 10) / 10; // Round to 1 decimal
    }
  }
  
  return {
    randomSeed: seed ?? Math.floor(Math.random() * 1000000),
    effects: randomized,
  };
}
