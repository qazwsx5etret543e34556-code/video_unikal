/**
 * License IPC Handlers
 * Handles all license-related IPC communication
 */

import { ipcMain, IpcMain } from 'electron';
import logger from '../logger.js';
import type { LicenseClient } from '../license/license-client.js';

export function setupLicenseIpc(ipc: IpcMain, licenseClient: LicenseClient) {
  // Activate license
  ipc.handle('license:activate', async (_event, data: { key: string }) => {
    try {
      const result = await licenseClient.activate(data.key);
      logger.info(`License activation attempt: ${result.success ? 'success' : 'failed'}`);
      
      if (result.success) {
        ipcMain.emit('license:status-changed', { status: 'active' });
      }
      
      return result;
    } catch (error) {
      logger.error('License activation error:', error);
      return { success: false, error: 'Activation failed' };
    }
  });

  // Validate license
  ipc.handle('license:validate', async () => {
    try {
      const result = await licenseClient.validate();
      return result;
    } catch (error) {
      logger.error('License validation error:', error);
      return { valid: false, error: 'Validation failed' };
    }
  });

  // Deactivate license
  ipc.handle('license:deactivate', async () => {
    try {
      const result = await licenseClient.deactivate();
      
      if (result.success) {
        ipcMain.emit('license:status-changed', { status: 'inactive' });
      }
      
      return result;
    } catch (error) {
      logger.error('License deactivation error:', error);
      return { success: false, error: 'Deactivation failed' };
    }
  });

  // Get license status
  ipc.handle('license:get-status', async () => {
    try {
      const status = licenseClient.getStatus();
      return { success: true, ...status };
    } catch (error) {
      logger.error('Failed to get license status:', error);
      return { success: false, error: 'Failed to get status' };
    }
  });

  // Check license now (manual heartbeat)
  ipc.handle('license:check-now', async () => {
    try {
      const result = await licenseClient.forceHeartbeat();
      return result;
    } catch (error) {
      logger.error('Manual license check error:', error);
      return { success: false, error: 'Check failed' };
    }
  });

  // Get offline grace period info
  ipc.handle('license:offline-info', async () => {
    try {
      const info = licenseClient.getOfflineInfo();
      return { success: true, ...info };
    } catch (error) {
      logger.error('Failed to get offline info:', error);
      return { success: false, error: 'Failed to get info' };
    }
  });
}
