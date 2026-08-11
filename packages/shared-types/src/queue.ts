/**
 * Queue System Types
 * Task management and worker pool types
 */

export type TaskStatus =
  | 'PENDING'
  | 'ANALYZING'
  | 'WAITING'
  | 'PROCESSING'
  | 'FINISHED'
  | 'ERROR'
  | 'CANCELED';

export type EncoderMode = 'auto' | 'cpu' | 'nvidia';

export interface TaskProgress {
  percent: number; // 0-100
  frame: number;
  fps: number;
  speed: number; // x value (e.g., 2.5 means 2.5x realtime)
  time?: string; // ffmpeg time string
  eta?: number; // estimated seconds remaining
}

export interface VideoMetadata {
  duration: number; // seconds
  width: number;
  height: number;
  fps: number;
  codec: string;
  audioCodec?: string;
  bitrate: number; // bits per second
  hasAudio: boolean;
}

export interface AppliedEffects {
  randomSeed: number;
  effects: Record<string, number | boolean>;
}

export interface QueueTask {
  id: string;
  inputPath: string;
  outputPath: string;
  status: TaskStatus;
  progress: TaskProgress;
  encoder: EncoderMode;
  error?: string;
  errorMessage?: string;
  createdAt: number; // timestamp
  startedAt?: number; // timestamp
  finishedAt?: number; // timestamp
  appliedParams?: AppliedEffects;
  retryCount: number;
  metadata?: VideoMetadata;
  outputSize?: number; // bytes
  outputDuration?: number; // seconds
}

export interface WorkerStats {
  activeWorkers: number;
  idleWorkers: number;
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  averageProcessingTime: number; // seconds
}

export interface QueueStats {
  pending: number;
  analyzing: number;
  processing: number;
  finished: number;
  error: number;
  canceled: number;
  total: number;
}

export interface WorkerPoolConfig {
  maxConcurrentWorkers: number;
  taskTimeoutMinutes: number;
  progressTimeoutSeconds: number;
  retryAttempts: number;
}

export const DEFAULT_WORKER_CONFIG: WorkerPoolConfig = {
  maxConcurrentWorkers: 2, // NVENC limit for GeForce
  taskTimeoutMinutes: 30,
  progressTimeoutSeconds: 60,
  retryAttempts: 1,
};

export interface ProcessTaskOptions {
  taskId: string;
  inputPath: string;
  outputPath: string;
  encoder: EncoderMode;
  effects: AppliedEffects;
  safeProfileFallback: boolean;
}

export interface FfmpegProgressEvent {
  taskId: string;
  progress: TaskProgress;
}

export interface TaskCompleteEvent {
  taskId: string;
  success: boolean;
  error?: string;
  outputSize?: number;
  outputDuration?: number;
}
