/**
 * Electron Preload Script
 * Secure bridge between renderer and main process
 */

import { contextBridge, ipcRenderer } from 'electron';
import { z } from 'zod';

// Type definitions for IPC channels
const IpcChannels = {
  // Queue
  QUEUE_ADD: 'queue:add',
  QUEUE_REMOVE: 'queue:remove',
  QUEUE_START: 'queue:start',
  QUEUE_PAUSE: 'queue:pause',
  QUEUE_CLEAR: 'queue:clear',
  QUEUE_GET_STATS: 'queue:get-stats',
  QUEUE_PROGRESS: 'queue:progress',
  QUEUE_COMPLETE: 'queue:complete',
  
  // License
  LICENSE_ACTIVATE: 'license:activate',
  LICENSE_VALIDATE: 'license:validate',
  LICENSE_DEACTIVATE: 'license:deactivate',
  LICENSE_GET_STATUS: 'license:get-status',
  LICENSE_CHECK_NOW: 'license:check-now',
  
  // Settings
  SETTINGS_GET: 'settings:get',
  SETTINGS_SET: 'settings:set',
  SETTINGS_RESET: 'settings:reset',
  
  // Files
  FILES_SELECT: 'files:select',
  FILES_GET_METADATA: 'files:get-metadata',
  FILES_CHECK_SPACE: 'files:check-space',
} as const;

// Zod schemas for validation
const AddTaskSchema = z.object({
  inputPath: z.string().min(1),
  outputPath: z.string().min(1),
  encoder: z.enum(['auto', 'cpu', 'nvidia']),
  effects: z.record(z.string(), z.union([z.boolean(), z.number()])),
});

const ActivateLicenseSchema = z.object({
  key: z.string().min(1),
});

const GetSettingsSchema = z.object({
  keys: z.array(z.string()).optional(),
});

const SetSettingsSchema = z.object({
  key: z.string().min(1),
  value: z.unknown(),
});

const SelectFilesSchema = z.object({
  filters: z.array(z.object({
    name: z.string(),
    extensions: z.array(z.string()),
  })).optional(),
  multi: z.boolean().optional(),
});

// Expose protected methods to renderer
contextBridge.exposeInMainWorld('electronAPI', {
  // Queue operations
  queue: {
    add: (data: unknown) => {
      const validated = AddTaskSchema.parse(data);
      return ipcRenderer.invoke(IpcChannels.QUEUE_ADD, validated);
    },
    remove: (taskId: string) => ipcRenderer.invoke(IpcChannels.QUEUE_REMOVE, taskId),
    start: () => ipcRenderer.invoke(IpcChannels.QUEUE_START),
    pause: () => ipcRenderer.invoke(IpcChannels.QUEUE_PAUSE),
    clear: () => ipcRenderer.invoke(IpcChannels.QUEUE_CLEAR),
    getStats: () => ipcRenderer.invoke(IpcChannels.QUEUE_GET_STATS),
  },
  
  // License operations
  license: {
    activate: (data: unknown) => {
      const validated = ActivateLicenseSchema.parse(data);
      return ipcRenderer.invoke(IpcChannels.LICENSE_ACTIVATE, validated);
    },
    validate: () => ipcRenderer.invoke(IpcChannels.LICENSE_VALIDATE),
    deactivate: () => ipcRenderer.invoke(IpcChannels.LICENSE_DEACTIVATE),
    getStatus: () => ipcRenderer.invoke(IpcChannels.LICENSE_GET_STATUS),
    checkNow: () => ipcRenderer.invoke(IpcChannels.LICENSE_CHECK_NOW),
  },
  
  // Settings operations
  settings: {
    get: (data?: unknown) => {
      if (data) {
        const validated = GetSettingsSchema.parse(data);
        return ipcRenderer.invoke(IpcChannels.SETTINGS_GET, validated);
      }
      return ipcRenderer.invoke(IpcChannels.SETTINGS_GET);
    },
    set: (data: unknown) => {
      const validated = SetSettingsSchema.parse(data);
      return ipcRenderer.invoke(IpcChannels.SETTINGS_SET, validated);
    },
    reset: () => ipcRenderer.invoke(IpcChannels.SETTINGS_RESET),
  },
  
  // File operations
  files: {
    select: (data?: unknown) => {
      if (data) {
        const validated = SelectFilesSchema.parse(data);
        return ipcRenderer.invoke(IpcChannels.FILES_SELECT, validated);
      }
      return ipcRenderer.invoke(IpcChannels.FILES_SELECT);
    },
    getMetadata: (filePath: string) => ipcRenderer.invoke(IpcChannels.FILES_GET_METADATA, filePath),
    checkSpace: (requiredBytes: number) => ipcRenderer.invoke(IpcChannels.FILES_CHECK_SPACE, requiredBytes),
  },
  
  // Event listeners
  onQueueProgress: (callback: (data: unknown) => void) => {
    const subscription = (_event: Electron.IpcRendererEvent, data: unknown) => callback(data);
    ipcRenderer.on(IpcChannels.QUEUE_PROGRESS, subscription);
    return () => ipcRenderer.removeListener(IpcChannels.QUEUE_PROGRESS, subscription);
  },
  
  onQueueComplete: (callback: (data: unknown) => void) => {
    const subscription = (_event: Electron.IpcRendererEvent, data: unknown) => callback(data);
    ipcRenderer.on(IpcChannels.QUEUE_COMPLETE, subscription);
    return () => ipcRenderer.removeListener(IpcChannels.QUEUE_COMPLETE, subscription);
  },
  
  onLicenseStatusChanged: (callback: (data: unknown) => void) => {
    const subscription = (_event: Electron.IpcRendererEvent, data: unknown) => callback(data);
    ipcRenderer.on('license:status-changed', subscription);
    return () => ipcRenderer.removeListener('license:status-changed', subscription);
  },
  
  // Platform info
  platform: process.platform,
  isWindows: process.platform === 'win32',
});

// TypeScript declarations for the exposed API
declare global {
  interface Window {
    electronAPI: {
      queue: {
        add: (data: unknown) => Promise<unknown>;
        remove: (taskId: string) => Promise<unknown>;
        start: () => Promise<unknown>;
        pause: () => Promise<unknown>;
        clear: () => Promise<unknown>;
        getStats: () => Promise<unknown>;
      };
      license: {
        activate: (data: unknown) => Promise<unknown>;
        validate: () => Promise<unknown>;
        deactivate: () => Promise<unknown>;
        getStatus: () => Promise<unknown>;
        checkNow: () => Promise<unknown>;
      };
      settings: {
        get: (data?: unknown) => Promise<unknown>;
        set: (data: unknown) => Promise<unknown>;
        reset: () => Promise<unknown>;
      };
      files: {
        select: (data?: unknown) => Promise<unknown>;
        getMetadata: (filePath: string) => Promise<unknown>;
        checkSpace: (requiredBytes: number) => Promise<unknown>;
      };
      onQueueProgress: (callback: (data: unknown) => void) => () => void;
      onQueueComplete: (callback: (data: unknown) => void) => () => void;
      onLicenseStatusChanged: (callback: (data: unknown) => void) => () => void;
      platform: string;
      isWindows: boolean;
    };
  }
}

export type { IpcChannels };
