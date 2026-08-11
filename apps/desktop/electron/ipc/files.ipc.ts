/**
 * Files IPC Handlers
 * Handles file selection and metadata operations
 */

import { ipcMain, IpcMain, dialog } from 'electron';
import fs from 'node:fs/promises';
import path from 'node:path';
import logger from '../logger.js';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

export function setupFilesIpc(ipc: IpcMain) {
  // Select files (video, audio, images)
  ipc.handle('files:select', async (_event, data?: {
    filters?: Array<{ name: string; extensions: string[] }>;
    multi?: boolean;
  }) => {
    try {
      const result = await dialog.showOpenDialog({
        properties: ['openFile', 'multiSelections'],
        filters: data?.filters || [
          { name: 'Video Files', extensions: ['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv'] },
          { name: 'All Files', extensions: ['*'] },
        ],
      });

      if (result.canceled || result.filePaths.length === 0) {
        return { success: false, canceled: true };
      }

      return { 
        success: true, 
        paths: result.filePaths,
      };
    } catch (error) {
      logger.error('File selection error:', error);
      return { success: false, error: 'Failed to select files' };
    }
  });

  // Get video metadata using ffprobe
  ipc.handle('files:get-metadata', async (_event, filePath: string) => {
    try {
      // Check file exists
      await fs.access(filePath);
      
      // Get ffprobe path
      const ffprobePath = getFfprobePath();
      
      // Run ffprobe
      const { stdout } = await execAsync(`"${ffprobePath}" -v quiet -print_format json -show_format -show_streams "${filePath}"`);
      const probeData = JSON.parse(stdout);
      
      const format = probeData.format;
      const videoStream = probeData.streams?.find((s: { codec_type: string }) => s.codec_type === 'video');
      const audioStream = probeData.streams?.find((s: { codec_type: string }) => s.codec_type === 'audio');
      
      return {
        success: true,
        metadata: {
          duration: parseFloat(format.duration) || 0,
          width: videoStream?.width || 0,
          height: videoStream?.height || 0,
          fps: videoStream?.r_frame_rate 
            ? parseFps(videoStream.r_frame_rate) 
            : 0,
          codec: videoStream?.codec_name || 'unknown',
          audioCodec: audioStream?.codec_name,
          bitrate: parseInt(format.bit_rate) || 0,
          hasAudio: !!audioStream,
          fileSize: parseInt(format.size) || 0,
        },
      };
    } catch (error) {
      logger.error('Failed to get metadata:', error);
      return { success: false, error: 'Failed to read file metadata' };
    }
  });

  // Check available disk space
  ipc.handle('files:check-space', async (_event, requiredBytes: number) => {
    try {
      const userDataPath = process.env.APPDATA || process.env.HOME || '/tmp';
      
      // Get free space (Windows-specific, fallback for other platforms)
      if (process.platform === 'win32') {
        const { stdout } = await execAsync(`wmic logicaldisk where "DeviceID='${userDataPath[0]}:'" get FreeSpace`);
        const lines = stdout.trim().split('\n');
        const freeBytes = parseInt(lines[1] || '0');
        
        const hasSpace = freeBytes >= requiredBytes;
        const requiredGB = (requiredBytes / (1024 ** 3)).toFixed(2);
        const availableGB = (freeBytes / (1024 ** 3)).toFixed(2);
        
        return {
          success: hasSpace,
          hasSpace,
          requiredGB,
          availableGB,
          freeBytes,
        };
      }
      
      // Non-Windows fallback
      return {
        success: true,
        hasSpace: true,
        message: 'Space check not implemented for this platform',
      };
    } catch (error) {
      logger.error('Failed to check space:', error);
      return { success: false, error: 'Failed to check disk space' };
    }
  });

  // Get default output directory
  ipc.handle('files:get-default-output', async () => {
    try {
      const videosPath = getPath('videos');
      return { success: true, path: videosPath };
    } catch (error) {
      logger.error('Failed to get default output:', error);
      return { success: false, error: 'Failed to get default path' };
    }
  });

  // Show in folder
  ipc.handle('files:show-in-folder', async (_event, filePath: string) => {
    try {
      const dir = path.dirname(filePath);
      await fs.access(dir);
      
      if (process.platform === 'win32') {
        execAsync(`explorer.exe "/select,"${filePath}"`);
      } else {
        execAsync(`xdg-open "${dir}"`);
      }
      
      return { success: true };
    } catch (error) {
      logger.error('Failed to show in folder:', error);
      return { success: false, error: 'Failed to open folder' };
    }
  });
}

function getFfprobePath(): string {
  if (process.env.NODE_ENV === 'development') {
    // In development, use system ffprobe or bundled one
    return process.env.FFPROBE_PATH || 'ffprobe';
  }
  
  // In production, use bundled ffprobe
  const exePath = process.resourcesPath || process.execPath;
  return path.join(exePath, 'ffmpeg', 'ffprobe.exe');
}

function getPath(name: string): string {
  const { app } = require('electron');
  switch (name) {
    case 'videos':
      return app.getPath('videos') || app.getPath('home');
    default:
      return app.getPath('home');
  }
}

function parseFps(fpsStr: string): number {
  const [num, den] = fpsStr.split('/').map(Number);
  if (!num || !den || den === 0) return 0;
  return Math.round((num / den) * 100) / 100;
}
