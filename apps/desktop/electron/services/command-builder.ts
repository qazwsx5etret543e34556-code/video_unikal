import type { QueueTask, EncoderMode, VideoEffects } from '@video-uniqueizer/shared-types';
import detectGPU from './gpu-detector';

export function buildFFmpegCommand(task: QueueTask, encoderMode: EncoderMode): string[] {
  const args: string[] = [];

  // Input
  args.push('-i', task.inputPath);

  // Build video filters
  const videoFilters = buildVideoFilters(task.effects);

  // Build audio filters
  const audioFilters = buildAudioFilters(task.effects);

  // Apply filters
  if (videoFilters.length > 0) {
    args.push('-vf', videoFilters.join(','));
  }

  if (audioFilters.length > 0) {
    args.push('-af', audioFilters.join(','));
  }

  // Encoder settings
  if (encoderMode === 'nvidia') {
    args.push(
      '-c:v', 'h264_nvenc',
      '-preset', 'p5',
      '-rc', 'vbr',
      '-cq', '22',
      '-b:v', '0'
    );
  } else {
    args.push(
      '-c:v', 'libx264',
      '-preset', 'medium',
      '-crf', '22'
    );
  }

  // Audio encoding
  args.push(
    '-c:a', 'aac',
    '-b:a', '192k'
  );

  // Output settings
  args.push(
    '-movflags', '+faststart',
    '-y' // Overwrite output
  );

  // Progress reporting
  args.push('-progress', 'pipe:1');

  // Output file
  args.push(task.outputPath);

  return args;
}

function buildVideoFilters(effects: VideoEffects): string[] {
  const filters: string[] = [];

  // Brightness
  if (effects.brightness.enabled && effects.brightness.value !== 0) {
    const brightness = effects.brightness.value / 255;
    filters.push(`eq=brightness=${brightness}`);
  }

  // Contrast
  if (effects.contrast.enabled && effects.contrast.value !== 0) {
    const contrast = 1 + effects.contrast.value / 100;
    filters.push(`eq=contrast=${contrast}`);
  }

  // Saturation
  if (effects.saturation.enabled && effects.saturation.value !== 100) {
    const saturation = effects.saturation.value / 100;
    filters.push(`eq=saturation=${saturation}`);
  }

  // Hue
  if (effects.hue.enabled && effects.hue.value !== 0) {
    filters.push(`hue=h=${effects.hue.value}`);
  }

  // Sharpness
  if (effects.sharpness.enabled && effects.sharpness.value !== 0) {
    const sharpness = effects.sharpness.value / 50;
    filters.push(`unsharp=5:5:${sharpness}:5:5:0`);
  }

  // Speed
  if (effects.speed.enabled && effects.speed.value !== 100) {
    const speedFactor = 100 / effects.speed.value;
    filters.push(`setpts=${speedFactor}*PTS`);
  }

  // Resolution
  if (effects.resolution.enabled && effects.resolution.value !== 100) {
    const scale = effects.resolution.value / 100;
    filters.push(`scale=iw*${scale}:ih*${scale}`);
  }

  // Noise
  if (effects.noise.enabled && effects.noise.value > 0) {
    filters.push(`noise=alls=${effects.noise.value}:allf=t`);
  }

  // Blur
  if (effects.blur.enabled && effects.blur.value > 0) {
    filters.push(`boxblur=${effects.blur.value}`);
  }

  // Flip horizontal
  if (effects.flipHorizontal.enabled) {
    filters.push('hflip');
  }

  // Flip vertical
  if (effects.flipVertical.enabled) {
    filters.push('vflip');
  }

  // Rotate
  if (effects.rotate.enabled && effects.rotate.value !== 0) {
    const radians = (effects.rotate.value * Math.PI) / 180;
    filters.push(`rotate=${radians}`);
  }

  return filters;
}

function buildAudioFilters(effects: VideoEffects): string[] {
  const filters: string[] = [];

  // Audio volume
  if (effects.audioVolume.enabled && effects.audioVolume.value !== 100) {
    const volume = effects.audioVolume.value / 100;
    filters.push(`volume=${volume}`);
  }

  // Audio pitch shift
  if (effects.audioPitchShift.enabled && effects.audioPitchShift.value !== 0) {
    const semitones = effects.audioPitchShift.value;
    filters.push(`asetrate=44100*2^(${semitones}/12)`);
  }

  // Speed affects audio too
  if (effects.speed.enabled && effects.speed.value !== 100) {
    const tempo = effects.speed.value / 100;
    // atempo supports 0.5 to 2.0
    if (tempo >= 0.5 && tempo <= 2.0) {
      filters.push(`atempo=${tempo}`);
    }
  }

  return filters;
}

export default buildFFmpegCommand;
