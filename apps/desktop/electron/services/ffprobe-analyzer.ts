import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { app } from 'electron';
import logger from '../logger';

export interface VideoInfo {
  duration: number; // seconds
  width: number;
  height: number;
  fps: number;
  codec: string;
  audioCodec?: string;
  bitrate: number; // bits per second
  hasAudio: boolean;
}

export async function analyzeVideo(filePath: string): Promise<VideoInfo | null> {
  try {
    const ffprobePath = getFFprobePath();
    
    return new Promise((resolve) => {
      const args = [
        '-v', 'quiet',
        '-print_format', 'json',
        '-show_format',
        '-show_streams',
        filePath,
      ];

      const process = spawn(ffprobePath, args, {
        windowsHide: true,
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      let stdout = '';
      let stderr = '';

      process.stdout.on('data', (data: Buffer) => {
        stdout += data.toString();
      });

      process.stderr.on('data', (data: Buffer) => {
        stderr += data.toString();
      });

      process.on('close', (code) => {
        if (code !== 0 || !stdout) {
          logger.error(`FFprobe failed: ${stderr}`);
          resolve(null);
          return;
        }

        try {
          const data = JSON.parse(stdout);
          const videoStream = data.streams?.find((s: any) => s.codec_type === 'video');
          const audioStream = data.streams?.find((s: any) => s.codec_type === 'audio');
          const format = data.format;

          if (!videoStream) {
            logger.error('No video stream found');
            resolve(null);
            return;
          }

          const info: VideoInfo = {
            duration: parseFloat(format.duration) || 0,
            width: videoStream.width || 0,
            height: videoStream.height || 0,
            fps: parseFloat(videoStream.r_frame_rate) || 0,
            codec: videoStream.codec_name || 'unknown',
            audioCodec: audioStream?.codec_name,
            bitrate: parseInt(format.bit_rate) || 0,
            hasAudio: !!audioStream,
          };

          resolve(info);
        } catch (err) {
          logger.error(`Failed to parse ffprobe output: ${err instanceof Error ? err.message : String(err)}`);
          resolve(null);
        }
      });

      process.on('error', (err) => {
        logger.error(`FFprobe process error: ${err.message}`);
        resolve(null);
      });
    });
  } catch (error) {
    logger.error(`AnalyzeVideo error: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
}

function getFFprobePath(): string {
  const isProd = !app.isPackaged;
  const resourcesDir = isProd 
    ? path.join(process.resourcesPath, 'ffmpeg')
    : path.join(__dirname, '../../resources/ffmpeg');
  
  const ffprobeExe = path.join(resourcesDir, 'ffprobe.exe');
  
  if (!fs.existsSync(ffprobeExe)) {
    logger.error(`FFprobe not found at ${ffprobeExe}`);
    throw new Error('FFprobe executable not found. Please ensure ffprobe.exe is in resources/ffmpeg/');
  }

  return ffprobeExe;
}

export default analyzeVideo;
