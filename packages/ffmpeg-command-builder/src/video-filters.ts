/**
 * Video Filter Builder
 * Constructs FFmpeg video filter chains for all 24 effects
 */

import type { AllEffects, AppliedEffects } from '@video-uniqueizer/shared-types/effects';

interface FilterOptions {
  inputWidth: number;
  inputHeight: number;
  inputFps: number;
  hasAudio: boolean;
}

export function buildVideoFilters(
  effects: AppliedEffects,
  options: FilterOptions
): string[] {
  const filters: string[] = [];
  const { effects: params } = effects;
  
  // Color correction filters (eq filter combines multiple)
  const eqParams: string[] = [];
  
  if (params['brightness'] !== undefined && params['brightness'] !== 0) {
    // brightness: -255..255 -> eq brightness: -1..1
    const brightness = (params['brightness'] as number) / 255;
    eqParams.push(`brightness=${brightness.toFixed(3)}`);
  }
  
  if (params['contrast'] !== undefined && params['contrast'] !== 0) {
    // contrast: -100..100 -> eq contrast: 0..2 (1 = original)
    const contrast = 1 + (params['contrast'] as number) / 100;
    eqParams.push(`contrast=${contrast.toFixed(3)}`);
  }
  
  if (params['saturation'] !== undefined && params['saturation'] !== 100) {
    // saturation: 0..200 -> eq saturation: 0..2 (1 = original)
    const saturation = (params['saturation'] as number) / 100;
    eqParams.push(`saturation=${saturation.toFixed(3)}`);
  }
  
  if (eqParams.length > 0) {
    filters.push(`eq=${eqParams.join(':')}`);
  }
  
  // Sharpness (unsharp filter)
  if (params['sharpness'] !== undefined && params['sharpness'] !== 0) {
    const sharpness = (params['sharpness'] as number) / 50;
    filters.push(`unsharp=5:5:${sharpness.toFixed(2)}:5:5:0`);
  }
  
  // Hue rotation
  if (params['hue'] !== undefined && params['hue'] !== 0) {
    filters.push(`hue=h=${params['hue']}`);
  }
  
  // Color balance (separate filters for shadows, midtones, highlights)
  if (params['colorBalanceShadows'] !== undefined && params['colorBalanceShadows'] !== 0) {
    const val = params['colorBalanceShadows'] as number;
    filters.push(`colorbalance=rs=${val/100}:gs=${val/100}:bs=${val/100}`);
  }
  
  if (params['colorBalanceMidtones'] !== undefined && params['colorBalanceMidtones'] !== 0) {
    const val = params['colorBalanceMidtones'] as number;
    filters.push(`colorbalance=rm=${val/100}:gm=${val/100}:bm=${val/100}`);
  }
  
  if (params['colorBalanceHighlights'] !== undefined && params['colorBalanceHighlights'] !== 0) {
    const val = params['colorBalanceHighlights'] as number;
    filters.push(`colorbalance=rh=${val/100}:gh=${val/100}:bh=${val/100}`);
  }
  
  // Speed change (setpts + atempo for audio)
  if (params['speed'] !== undefined && params['speed'] !== 100) {
    const speedFactor = (params['speed'] as number) / 100;
    const ptsFactor = 1 / speedFactor;
    filters.push(`setpts=${ptsFactor.toFixed(3)}*PTS`);
  }
  
  // Resolution scaling
  if (params['resolution'] !== undefined && params['resolution'] !== 100) {
    const scale = (params['resolution'] as number) / 100;
    const newWidth = Math.round(options.inputWidth * scale);
    const newHeight = Math.round(options.inputHeight * scale);
    filters.push(`scale=${newWidth}:${newHeight}`);
  }
  
  // Zoom (crop + scale)
  if (params['zoom'] !== undefined && params['zoom'] !== 100) {
    const zoomFactor = (params['zoom'] as number) / 100;
    const cropWidth = Math.round(options.inputWidth / zoomFactor);
    const cropHeight = Math.round(options.inputHeight / zoomFactor);
    filters.push(`crop=${cropWidth}:${cropHeight}`);
    filters.push(`scale=${options.inputWidth}:${options.inputHeight}`);
  }
  
  // Rotation
  if (params['rotate'] !== undefined && params['rotate'] !== 0) {
    const radians = ((params['rotate'] as number) * Math.PI) / 180;
    filters.push(`rotate=${radians.toFixed(4)}`);
  }
  
  // Flip horizontal
  if (params['flipHorizontal']) {
    filters.push('hflip');
  }
  
  // Flip vertical
  if (params['flipVertical']) {
    filters.push('vflip');
  }
  
  // Noise
  if (params['noise'] !== undefined && params['noise'] > 0) {
    const noiseAmount = Math.round(params['noise'] as number);
    filters.push(`noise=alls=${noiseAmount}:allf=t`);
  }
  
  // Blur
  if (params['blur'] !== undefined && params['blur'] > 0) {
    const blurRadius = (params['blur'] as number).toFixed(1);
    filters.push(`boxblur=${blurRadius}`);
  }
  
  // Transparent square overlay (for hash breaking)
  if (params['transparentSquare']) {
    // Small transparent square in corner
    const size = 10;
    filters.push(`color=c=black@0.05:s=${size}x${size},format=rgba[tsq];[0][tsq]overlay=x=10:y=10`);
  }
  
  // Background replace (simplified - black background)
  if (params['backgroundReplace'] === true) {
    // Add black background padding if needed
    filters.push('pad=ceil(iw/2)*2:ceil(ih/2)*2');
  }
  
  return filters;
}

export function getSpeedAudioFilter(speed: number): string | null {
  if (speed === 100) return null;
  
  const speedFactor = speed / 100;
  // atempo supports 0.5 to 2.0, chain multiple filters if needed
  if (speedFactor >= 0.5 && speedFactor <= 2.0) {
    return `atempo=${speedFactor.toFixed(3)}`;
  }
  
  // For extreme values, chain multiple atempo filters
  const filters: string[] = [];
  let remaining = speedFactor;
  
  while (remaining < 0.5 || remaining > 2.0) {
    if (remaining > 2.0) {
      filters.push('atempo=2.0');
      remaining /= 2.0;
    } else if (remaining < 0.5) {
      filters.push('atempo=0.5');
      remaining /= 0.5;
    }
  }
  
  if (remaining !== 1.0) {
    filters.push(`atempo=${remaining.toFixed(3)}`);
  }
  
  return filters.join(',');
}
