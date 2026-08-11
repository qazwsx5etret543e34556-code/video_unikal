/**
 * Video Uniqueizer Pro - Shared Types
 * Common TypeScript types used across all packages
 */

export type { EffectType, EffectConfig, AllEffects } from './effects.js';
export type {
  LicenseType,
  LicenseStatus,
  LicenseKey,
  LicenseActivation,
  SignedToken,
  TokenPayload,
  ValidateResponse,
  ActivateResponse,
} from './license.js';
export type {
  QueueTask,
  TaskStatus,
  TaskProgress,
  EncoderMode,
  WorkerStats,
} from './queue.js';
export type { Preset, PresetCategory } from './preset.js';
export type {
  ApiError,
  ApiResponse,
  HealthResponse,
  AdminLoginRequest,
  AdminLoginResponse,
} from './api.js';
