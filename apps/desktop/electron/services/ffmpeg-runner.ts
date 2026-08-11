import { spawn, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';
import path from 'path';
import fs from 'fs';
import { app } from 'electron';
import type { QueueTask, EncoderMode, ProcessingProgress } from '@video-uniqueizer/shared-types';
import { buildFFmpegCommand } from './command-builder';
import { parseProgressLine } from './progress-parser';
import { getSafeProfileCommand } from './safe-profile';
import logger from '../logger';

interface FfmpegRunnerOptions {
  task: QueueTask;
  encoderMode: EncoderMode;
  workingDir: string;
}

export class FfmpegRunner extends EventEmitter {
  private process: ChildProcess | null = null;
  private timeoutId: NodeJS.Timeout | null = null;
  private progressTimeoutId: NodeJS.Timeout | null = null;
  private readonly PROCESS_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  private readonly PROGRESS_TIMEOUT = 60 * 1000; // 60 seconds

  async run(options: FfmpegRunnerOptions): Promise<{ success: boolean; error?: string }> {
    const { task, encoderMode, workingDir } = options;

    try {
      // Pre-flight checks
      const preflightCheck = await this.preflightCheck(task);
      if (!preflightCheck.ok) {
        logger.error(`Pre-flight check failed: ${preflightCheck.error}`);
        return { success: false, error: preflightCheck.error };
      }

      // Build command
      const ffmpegPath = this.getFFmpegPath();
      const commandArgs = buildFFmpegCommand(task, encoderMode);

      logger.info(`Starting FFmpeg process: ${ffmpegPath} ${commandArgs.slice(0, 5).join('')}...`);

      // Spawn process (NEVER use shell strings!)
      this.process = spawn(ffmpegPath, commandArgs, {
        cwd: workingDir,
        windowsHide: true,
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      // Set process timeout
      this.timeoutId = setTimeout(() => {
        logger.error(`Process timeout after ${this.PROCESS_TIMEOUT}ms`);
        this.killProcess();
      }, this.PROCESS_TIMEOUT);

      // Monitor progress
      let lastProgressTime = Date.now();
      this.progressTimeoutId = setInterval(() => {
        if (Date.now() - lastProgressTime > this.PROGRESS_TIMEOUT) {
          logger.error('No progress update for 60 seconds, killing process');
          this.killProcess();
        }
      }, 10000);

      const stderrChunks: Buffer[] = [];

      this.process.stderr?.on('data', (data: Buffer) => {
        stderrChunks.push(data);
        const lines = data.toString().split('\n');
        for (const line of lines) {
          if (line.includes('out_time_ms') || line.includes('progress=')) {
            const progress = parseProgressLine(line);
            if (progress) {
              lastProgressTime = Date.now();
              this.emit('progress', progress);
            }
          }
        }
      });

      return new Promise((resolve) => {
        this.process?.on('exit', async (code, signal) => {
          this.cleanup();

          if (code === 0 || code === null) {
            // Validate output
            const validation = await this.validateOutput(task.outputPath);
            if (validation.ok) {
              logger.info(`Processing completed successfully: ${task.outputPath}`);
              resolve({ success: true });
            } else {
              logger.error(`Output validation failed: ${validation.error}`);
              // Try fallback
              const fallbackResult = await this.runFallback(task, encoderMode, workingDir);
              resolve(fallbackResult);
            }
          } else {
            logger.error(`FFmpeg exited with code ${code}, signal ${signal}`);
            // Try safe profile fallback
            const fallbackResult = await this.runFallback(task, encoderMode, workingDir);
            resolve(fallbackResult);
          }
        });

        this.process?.on('error', (err) => {
          this.cleanup();
          logger.error(`FFmpeg process error: ${err.message}`);
          resolve({ success: false, error: err.message });
        });
      });
    } catch (error) {
      logger.error(`FfmpegRunner error: ${error instanceof Error ? error.message : String(error)}`);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  }

  private async runFallback(
    task: QueueTask,
    encoderMode: EncoderMode,
    workingDir: string
  ): Promise<{ success: boolean; error?: string }> {
    logger.warn(`Attempting safe profile fallback for task ${task.id}`);
    this.emit('fallback', { reason: 'primary_failed' });

    const ffmpegPath = this.getFFmpegPath();
    const safeArgs = getSafeProfileCommand(task.inputPath, task.outputPath, encoderMode);

    return new Promise((resolve) => {
      const fallbackProcess = spawn(ffmpegPath, safeArgs, {
        cwd: workingDir,
        windowsHide: true,
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      const fallbackTimeout = setTimeout(() => {
        fallbackProcess.kill('SIGKILL');
        resolve({ success: false, error: 'Fallback timeout' });
      }, this.PROCESS_TIMEOUT);

      fallbackProcess.on('exit', async (code) => {
        clearTimeout(fallbackTimeout);
        if (code === 0) {
          const validation = await this.validateOutput(task.outputPath);
          if (validation.ok) {
            logger.info(`Safe profile fallback succeeded`);
            this.emit('fallback', { reason: 'success' });
            resolve({ success: true });
          } else {
            resolve({ success: false, error: 'Fallback output invalid' });
          }
        } else {
          resolve({ success: false, error: `Fallback failed with code ${code}` });
        }
      });

      fallbackProcess.on('error', (err) => {
        clearTimeout(fallbackTimeout);
        resolve({ success: false, error: err.message });
      });
    });
  }

  private async preflightCheck(task: QueueTask): Promise<{ ok: boolean; error?: string }> {
    // Check input file exists
    if (!fs.existsSync(task.inputPath)) {
      return { ok: false, error: 'Input file not found' };
    }

    // Check output directory writable
    const outputDir = path.dirname(task.outputPath);
    try {
      fs.accessSync(outputDir, fs.constants.W_OK);
    } catch {
      return { ok: false, error: 'Output directory not writable' };
    }

    // Check free space (at least 2x input size)
    try {
      const stats = fs.statSync(task.inputPath);
      const inputSize = stats.size;
      const freeSpace = await this.getFreeSpace(outputDir);
      if (freeSpace < inputSize * 2) {
        return { ok: false, error: 'Insufficient disk space' };
      }
    } catch (err) {
      logger.warn(`Could not check free space: ${err instanceof Error ? err.message : String(err)}`);
    }

    return { ok: true };
  }

  private async getFreeSpace(dirPath: string): Promise<number> {
    return new Promise((resolve) => {
      // Simple implementation - in production use systeminformation package
      resolve(10 * 1024 * 1024 * 1024); // Assume 10GB free
    });
  }

  private async validateOutput(outputPath: string): Promise<{ ok: boolean; error?: string }> {
    return new Promise((resolve) => {
      if (!fs.existsSync(outputPath)) {
        resolve({ ok: false, error: 'Output file not created' });
        return;
      }

      const stats = fs.statSync(outputPath);
      if (stats.size === 0) {
        resolve({ ok: false, error: 'Output file is empty' });
        return;
      }

      // Basic validation - file exists and has size
      resolve({ ok: true });
    });
  }

  private getFFmpegPath(): string {
    const isProd = !app.isPackaged;
    const resourcesDir = isProd 
      ? path.join(process.resourcesPath, 'ffmpeg')
      : path.join(__dirname, '../../resources/ffmpeg');
    
    const ffmpegExe = path.join(resourcesDir, 'ffmpeg.exe');
    
    if (!fs.existsSync(ffmpegExe)) {
      logger.error(`FFmpeg not found at ${ffmpegExe}`);
      throw new Error('FFmpeg executable not found. Please ensure ffmpeg.exe is in resources/ffmpeg/');
    }

    return ffmpegExe;
  }

  killProcess(): void {
    if (this.process) {
      logger.info('Sending SIGTERM to FFmpeg process');
      this.process.kill('SIGTERM');

      setTimeout(() => {
        if (this.process && !this.process.killed) {
          logger.info('Force killing FFmpeg process');
          this.process.kill('SIGKILL');
        }
      }, 5000);
    }
  }

  cancel(): void {
    logger.info('Canceling FFmpeg process');
    this.killProcess();
    this.cleanup();
    
    // Remove partial output
    if (this.process) {
      const task = (this as any)._task;
      if (task?.outputPath && fs.existsSync(task.outputPath)) {
        try {
          fs.unlinkSync(task.outputPath);
          logger.info('Removed partial output file');
        } catch (err) {
          logger.warn(`Could not remove partial file: ${err instanceof Error ? err.message : String(err)}`);
        }
      }
    }
  }

  private cleanup(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    if (this.progressTimeoutId) {
      clearInterval(this.progressTimeoutId);
      this.progressTimeoutId = null;
    }
    this.process = null;
  }
}

export default FfmpegRunner;
