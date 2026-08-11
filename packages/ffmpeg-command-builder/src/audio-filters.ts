/**
 * Audio Filter Builder
 * Constructs FFmpeg audio filters for uniqueization
 */

import type { AppliedEffects } from '@video-uniqueizer/shared-types/effects';

export function buildAudioFilters(effects: AppliedEffects): string[] {
  const filters: string[] = [];
  const { effects: params } = effects;
  
  // Volume adjustment
  if (params['audioVolume'] !== undefined && params['audioVolume'] !== 100) {
    const volume = (params['audioVolume'] as number) / 100;
    filters.push(`volume=${volume.toFixed(3)}`);
  }
  
  // Pitch shift (using rubberband or pitch filter)
  if (params['audioPitchShift'] !== undefined && params['audioPitchShift'] !== 0) {
    const semitones = params['audioPitchShift'] as number;
    // pitch filter: shift in semitones
    filters.push(`pitch=${semitones.toFixed(2)}`);
  }
  
  return filters;
}

export function buildAudioFilterString(filters: string[]): string | null {
  if (filters.length === 0) return null;
  return filters.join(',');
}

export function getBackgroundAudioArgs(
  backgroundAudioPath?: string,
  volume: number = 0.5
): string[] {
  if (!backgroundAudioPath) return [];
  
  const args: string[] = [];
  
  // Add background audio input
  args.push('-i', backgroundAudioPath);
  
  // Mix audio streams with specified volume
  args.push('-filter_complex', `[1:a]volume=${volume.toFixed(2)}[bg];[0:a][bg]amix=inputs=2:duration=first:dropout_transition=2[aout]`);
  args.push('-map', '[aout]');
  
  return args;
}

export function getAudioPitchShiftArgs(semitones: number): string[] {
  if (semitones === 0) return [];
  
  return ['-af', `pitch=${semitones.toFixed(2)}`];
}

export function getVolumeArgs(volumePercent: number): string[] {
  if (volumePercent === 100) return [];
  
  const volume = volumePercent / 100;
  return ['-af', `volume=${volume.toFixed(3)}`];
}
