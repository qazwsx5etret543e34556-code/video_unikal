import { EventEmitter } from 'events';
import os from 'os';
import type { QueueTask, EncoderMode } from '@video-uniqueizer/shared-types';
import { FfmpegRunner } from '../services/ffmpeg-runner';
import detectGPU from '../services/gpu-detector';
import logger from '../logger';

interface Worker {
  id: number;
  busy: boolean;
  task: QueueTask | null;
  runner: FfmpegRunner | null;
}

export class WorkerPool extends EventEmitter {
  private workers: Worker[] = [];
  private maxWorkers: number;
  private gpuAvailable: boolean = false;
  private initialized: boolean = false;

  constructor() {
    super();
    const cpuCores = os.cpus().length;
    this.maxWorkers = Math.max(1, Math.floor(cpuCores / 2));
    logger.info(`WorkerPool initialized with max ${this.maxWorkers} workers`);
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Check GPU availability
    const gpuInfo = await detectGPU();
    this.gpuAvailable = gpuInfo.hasNvidia && gpuInfo.nvencAvailable;
    
    if (this.gpuAvailable) {
      // Limit to 2 concurrent NVENC sessions for GeForce cards
      this.maxWorkers = Math.min(this.maxWorkers, 2);
      logger.info(`NVIDIA GPU detected: ${gpuInfo.gpuName}, limiting to ${this.maxWorkers} workers`);
    } else {
      logger.info('No NVIDIA GPU available, using CPU encoding');
    }

    // Initialize workers
    for (let i = 0; i < this.maxWorkers; i++) {
      this.workers.push({
        id: i,
        busy: false,
        task: null,
        runner: null,
      });
    }

    this.initialized = true;
    logger.info(`WorkerPool ready with ${this.maxWorkers} workers`);
  }

  async processTask(task: QueueTask, encoderMode: EncoderMode): Promise<boolean> {
    const worker = this.getAvailableWorker();
    if (!worker) {
      logger.warn('No available workers in pool');
      return false;
    }

    worker.busy = true;
    worker.task = task;
    worker.runner = new FfmpegRunner();

    const workingDir = require('path').dirname(task.inputPath);

    // Setup progress listener
    worker.runner.on('progress', (progress) => {
      this.emit('task-progress', {
        taskId: task.id,
        workerId: worker.id,
        progress,
      });
    });

    worker.runner.on('fallback', (data) => {
      this.emit('task-fallback', {
        taskId: task.id,
        workerId: worker.id,
        ...data,
      });
    });

    logger.info(`Worker ${worker.id} starting task ${task.id}`);

    try {
      const result = await worker.runner.run({
        task,
        encoderMode,
        workingDir,
      });

      this.releaseWorker(worker);

      if (result.success) {
        logger.info(`Worker ${worker.id} completed task ${task.id}`);
        this.emit('task-complete', { taskId: task.id, workerId: worker.id });
        return true;
      } else {
        logger.error(`Worker ${worker.id} failed task ${task.id}: ${result.error}`);
        this.emit('task-error', { 
          taskId: task.id, 
          workerId: worker.id, 
          error: result.error 
        });
        return false;
      }
    } catch (error) {
      this.releaseWorker(worker);
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Worker ${worker.id} error: ${errorMessage}`);
      this.emit('task-error', { 
        taskId: task.id, 
        workerId: worker.id, 
        error: errorMessage 
      });
      return false;
    }
  }

  cancelTask(taskId: string): void {
    const worker = this.workers.find(w => w.task?.id === taskId);
    if (worker && worker.runner) {
      logger.info(`Canceling task ${taskId} on worker ${worker.id}`);
      worker.runner.cancel();
      this.releaseWorker(worker);
      this.emit('task-canceled', { taskId, workerId: worker.id });
    }
  }

  getAvailableWorker(): Worker | null {
    return this.workers.find(w => !w.busy) || null;
  }

  releaseWorker(worker: Worker): void {
    worker.busy = false;
    worker.task = null;
    worker.runner = null;
    this.emit('worker-released', { workerId: worker.id });
  }

  getStatus() {
    return {
      totalWorkers: this.maxWorkers,
      busyWorkers: this.workers.filter(w => w.busy).length,
      availableWorkers: this.workers.filter(w => !w.busy).length,
      gpuAvailable: this.gpuAvailable,
    };
  }

  shutdown(): void {
    logger.info('Shutting down worker pool');
    
    for (const worker of this.workers) {
      if (worker.runner) {
        worker.runner.cancel();
      }
    }

    this.workers = [];
    this.initialized = false;
  }
}

export default WorkerPool;
