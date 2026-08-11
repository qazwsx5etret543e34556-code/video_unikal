/**
 * Electron Logger Configuration
 * Uses electron-log with rotation and file output
 */

import log from 'electron-log';
import path from 'node:path';
import { app } from 'electron';

export function setupLogger() {
  // Configure log levels
  log.transports.file.level = 'debug';
  log.transports.console.level = process.env.NODE_ENV === 'development' ? 'debug' : 'warn';
  
  // Set log file location
  const logPath = path.join(app.getPath('userData'), 'logs');
  log.transports.file.resolvePathFn = () => path.join(logPath, 'app.log');
  
  // Enable rotation (10 MB max, keep last 5 files)
  log.transports.file.maxSize = 10 * 1024 * 1024;
  log.transports.file.maxFiles = 5;
  
  // Format log messages
  log.transports.file.format = '{y}-{m}-{d} {h}:{i}:{s}.{ms} [{level}] {text}';
  log.transports.console.format = '[{level}] {text}';
  
  // Catch unhandled errors
  log.errorHandler.startCatching({
    showDialog: false,
    onError: (error, processName, errorType) => {
      log.error(`Unhandled ${errorType} in ${processName}:`, error);
    },
  });
  
  return log;
}

export const logger = setupLogger();

export default logger;
