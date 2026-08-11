/**
 * Settings IPC Handlers
 * Handles application settings persistence
 */

import { ipcMain, IpcMain, app } from 'electron';
import fs from 'node:fs/promises';
import path from 'node:path';
import logger from '../logger.js';

const SETTINGS_FILE = path.join(app.getPath('userData'), 'settings.json');

interface AppSettings {
  encoderMode: 'auto' | 'cpu' | 'nvidia';
  language: 'ru' | 'en';
  outputDirectory?: string;
  maxConcurrentTasks: number;
  safeProfileFallback: boolean;
  deleteOriginalAfterSuccess: boolean;
  notificationsEnabled: boolean;
  theme: 'dark' | 'light' | 'system';
}

const DEFAULT_SETTINGS: AppSettings = {
  encoderMode: 'auto',
  language: 'ru',
  maxConcurrentTasks: 2,
  safeProfileFallback: true,
  deleteOriginalAfterSuccess: false,
  notificationsEnabled: true,
  theme: 'dark',
};

let cachedSettings: AppSettings | null = null;

async function loadSettings(): Promise<AppSettings> {
  if (cachedSettings) {
    return cachedSettings;
  }

  try {
    const data = await fs.readFile(SETTINGS_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    cachedSettings = { ...DEFAULT_SETTINGS, ...parsed };
    return cachedSettings;
  } catch (error) {
    // File doesn't exist or is corrupted - use defaults
    cachedSettings = DEFAULT_SETTINGS;
    await saveSettings(cachedSettings);
    return cachedSettings;
  }
}

async function saveSettings(settings: AppSettings): Promise<void> {
  try {
    cachedSettings = settings;
    await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
    logger.debug('Settings saved');
  } catch (error) {
    logger.error('Failed to save settings:', error);
    throw error;
  }
}

export function setupSettingsIpc(ipc: IpcMain) {
  // Get all settings
  ipc.handle('settings:get', async (_event, data?: { keys?: string[] }) => {
    try {
      const settings = await loadSettings();
      
      if (data?.keys && Array.isArray(data.keys)) {
        const filtered: Partial<AppSettings> = {};
        for (const key of data.keys) {
          if (key in settings) {
            (filtered as Record<string, unknown>)[key] = settings[key as keyof AppSettings];
          }
        }
        return { success: true, settings: filtered };
      }
      
      return { success: true, settings };
    } catch (error) {
      logger.error('Failed to get settings:', error);
      return { success: false, error: 'Failed to load settings' };
    }
  });

  // Set a specific setting
  ipc.handle('settings:set', async (_event, data: { key: string; value: unknown }) => {
    try {
      const settings = await loadSettings();
      const { key, value } = data;
      
      // Validate key exists
      if (!(key in DEFAULT_SETTINGS)) {
        return { success: false, error: 'Invalid setting key' };
      }
      
      // Type validation
      const expectedType = typeof (DEFAULT_SETTINGS as Record<string, unknown>)[key];
      if (typeof value !== expectedType) {
        return { success: false, error: 'Invalid value type' };
      }
      
      (settings as Record<string, unknown>)[key] = value;
      await saveSettings(settings);
      
      logger.info(`Setting updated: ${key}`);
      return { success: true };
    } catch (error) {
      logger.error('Failed to set setting:', error);
      return { success: false, error: 'Failed to save setting' };
    }
  });

  // Reset to defaults
  ipc.handle('settings:reset', async () => {
    try {
      await saveSettings(DEFAULT_SETTINGS);
      logger.info('Settings reset to defaults');
      return { success: true };
    } catch (error) {
      logger.error('Failed to reset settings:', error);
      return { success: false, error: 'Failed to reset settings' };
    }
  });

  // Get settings file path
  ipc.handle('settings:get-path', async () => {
    return { success: true, path: SETTINGS_FILE };
  });
}

export type { AppSettings };
