/**
 * FFmpeg Command Builder
 * Builds FFmpeg command arrays for video uniqueization
 */

export type { EncoderMode } from '@video-uniqueizer/shared-types/queue';
export type { AllEffects, AppliedEffects } from '@video-uniqueizer/shared-types/effects';
export type { VideoMetadata } from '@video-uniqueizer/shared-types/queue';

export { buildVideoFilters } from './video-filters.js';
export { buildAudioFilters } from './audio-filters.js';
export { getEncoderArgs, getSafeProfileArgs } from './encoders.js';
export { buildFfmpegCommand } from './index.js';
