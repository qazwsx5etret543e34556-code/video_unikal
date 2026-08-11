/**
 * Queue IPC Handlers
 * Handles all queue-related IPC communication
 */

import { ipcMain, IpcMain } from 'electron';
import logger from '../logger.js';
import type { QueueManager } from '../queue/queue-manager.js';
import type { QueueTask, TaskStatus } from '@video-uniqueizer/shared-types/queue';

export function setupQueueIpc(ipc: IpcMain, queueManager: QueueManager) {
  // Add task to queue
  ipc.handle('queue:add', async (_event, data: {
    inputPath: string;
    outputPath: string;
    encoder: 'auto' | 'cpu' | 'nvidia';
    effects: Record<string, number | boolean>;
  }) => {
    try {
      const task = await queueManager.addTask(data);
      logger.info(`Task added to queue: ${task.id}`);
      return { success: true, task };
    } catch (error) {
      logger.error('Failed to add task:', error);
      return { success: false, error: 'Failed to add task to queue' };
    }
  });

  // Remove task from queue
  ipc.handle('queue:remove', async (_event, taskId: string) => {
    try {
      await queueManager.removeTask(taskId);
      logger.info(`Task removed from queue: ${taskId}`);
      return { success: true };
    } catch (error) {
      logger.error('Failed to remove task:', error);
      return { success: false, error: 'Failed to remove task' };
    }
  });

  // Start processing queue
  ipc.handle('queue:start', async () => {
    try {
      queueManager.startProcessing();
      logger.info('Queue processing started');
      return { success: true };
    } catch (error) {
      logger.error('Failed to start queue:', error);
      return { success: false, error: 'Failed to start queue' };
    }
  });

  // Pause processing
  ipc.handle('queue:pause', async () => {
    try {
      queueManager.pauseProcessing();
      logger.info('Queue processing paused');
      return { success: true };
    } catch (error) {
      logger.error('Failed to pause queue:', error);
      return { success: false, error: 'Failed to pause queue' };
    }
  });

  // Clear completed tasks
  ipc.handle('queue:clear', async () => {
    try {
      await queueManager.clearCompleted();
      logger.info('Completed tasks cleared');
      return { success: true };
    } catch (error) {
      logger.error('Failed to clear tasks:', error);
      return { success: false, error: 'Failed to clear tasks' };
    }
  });

  // Get queue stats
  ipc.handle('queue:get-stats', async () => {
    try {
      const stats = queueManager.getStats();
      const tasks = queueManager.getAllTasks();
      return { success: true, stats, tasks };
    } catch (error) {
      logger.error('Failed to get stats:', error);
      return { success: false, error: 'Failed to get stats' };
    }
  });

  // Cancel specific task
  ipc.handle('queue:cancel', async (_event, taskId: string) => {
    try {
      await queueManager.cancelTask(taskId);
      logger.info(`Task cancelled: ${taskId}`);
      return { success: true };
    } catch (error) {
      logger.error('Failed to cancel task:', error);
      return { success: false, error: 'Failed to cancel task' };
    }
  });

  // Retry failed task
  ipc.handle('queue:retry', async (_event, taskId: string) => {
    try {
      await queueManager.retryTask(taskId);
      logger.info(`Task retried: ${taskId}`);
      return { success: true };
    } catch (error) {
      logger.error('Failed to retry task:', error);
      return { success: false, error: 'Failed to retry task' };
    }
  });

  // Get task by ID
  ipc.handle('queue:get-task', async (_event, taskId: string) => {
    try {
      const task = queueManager.getTask(taskId);
      if (!task) {
        return { success: false, error: 'Task not found' };
      }
      return { success: true, task };
    } catch (error) {
      logger.error('Failed to get task:', error);
      return { success: false, error: 'Failed to get task' };
    }
  });

  // Update task output path
  ipc.handle('queue:update-output', async (_event, taskId: string, outputPath: string) => {
    try {
      await queueManager.updateOutputPath(taskId, outputPath);
      return { success: true };
    } catch (error) {
      logger.error('Failed to update output path:', error);
      return { success: false, error: 'Failed to update output path' };
    }
  });
}
