import type { EncoderMode } from '@video-uniqueizer/shared-types';

/**
 * Safe profile command - used as fallback when custom parameters fail
 * Minimal filters, standard encoding settings
 */
export function getSafeProfileCommand(
  inputPath: string,
  outputPath: string,
  encoderMode: EncoderMode
): string[] {
  const args: string[] = [];

  // Input
  args.push('-i', inputPath);

  // Encoder settings - conservative, reliable settings
  if (encoderMode === 'nvidia') {
    args.push(
      '-c:v', 'h264_nvenc',
      '-preset', 'p3', // Faster, more compatible
      '-rc', 'vbr',
      '-cq', '23', // Slightly higher CRF for compatibility
      '-b:v', '0'
    );
  } else {
    args.push(
      '-c:v', 'libx264',
      '-preset', 'fast', // Faster preset
      '-crf', '23' // Slightly higher CRF
    );
  }

  // Audio encoding - standard AAC
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
  args.push(outputPath);

  return args;
}

export default getSafeProfileCommand;
