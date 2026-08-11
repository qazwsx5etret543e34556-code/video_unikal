/**
 * Electron Main Process Entry Point
 * Video Uniqueizer Pro - Production Ready Desktop App
 */

import { app, BrowserWindow, ipcMain, session } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import logger from './logger.js';
import { setupQueueIpc } from './ipc/queue.ipc.js';
import { setupLicenseIpc } from './ipc/license.ipc.js';
import { setupSettingsIpc } from './ipc/settings.ipc.js';
import { setupFilesIpc } from './ipc/files.ipc.js';
import { initDatabase } from './db/index.js';
import { LicenseClient } from './license/license-client.js';
import { QueueManager } from './queue/queue-manager.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let mainWindow: BrowserWindow | null = null;
let queueManager: QueueManager | null = null;
let licenseClient: LicenseClient | null = null;

const isDev = process.env.NODE_ENV === 'development' || process.env.ENABLE_DEVTOOLS === 'true';

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    title: 'Video Uniqueizer Pro',
    icon: path.join(__dirname, '../../resources/icons/icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      webSecurity: !isDev,
    },
    show: false,
    backgroundColor: '#18181b',
    titleBarStyle: 'default',
  });

  // Load app
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173/renderer/index.html');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
    mainWindow?.focus();
  });

  // Handle close
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Prevent navigation to external URLs
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith('http://localhost') && !url.startsWith('file://')) {
      event.preventDefault();
      logger.warn(`Blocked navigation to: ${url}`);
    }
  });
}

async function initializeServices() {
  try {
    // Initialize database
    await initDatabase();
    logger.info('Database initialized');

    // Initialize license client
    licenseClient = new LicenseClient();
    await licenseClient.initialize();
    logger.info('License client initialized');

    // Initialize queue manager
    queueManager = new QueueManager(licenseClient);
    logger.info('Queue manager initialized');

    // Setup IPC handlers
    setupQueueIpc(ipcMain, queueManager);
    setupLicenseIpc(ipcMain, licenseClient);
    setupSettingsIpc(ipcMain);
    setupFilesIpc(ipcMain);

    logger.info('All services initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize services:', error);
    throw error;
  }
}

// App lifecycle
app.whenReady().then(async () => {
  // Request single instance lock
  const gotLock = app.requestSingleInstanceLock();
  if (!gotLock) {
    logger.warn('Another instance is running, exiting...');
    app.quit();
    return;
  }

  await initializeServices();
  createWindow();

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': ["default-src 'self'"],
      },
    });
  });
});

// Handle second instance
app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }
    mainWindow.focus();
  }
});

app.on('window-all-closed', () => {
  // Cleanup
  if (queueManager) {
    queueManager.destroy();
  }
  
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Unhandled errors
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Export for testing
export { mainWindow, queueManager, licenseClient };
