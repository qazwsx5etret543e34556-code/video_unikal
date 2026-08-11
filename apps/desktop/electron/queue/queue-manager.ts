import { EventEmitter } from 'events';
import type { QueueTask, TaskStatus } from '@video-uniqueizer/shared-types';
import getDatabase from '../db';
import logger from '../logger';

export class QueueManager extends EventEmitter {
  private processing = false;
  private currentTaskId: string | null = null;

  async addTask(task: QueueTask): Promise<void> {
    const db = getDatabase();
    
    const stmt = db.prepare(`
      INSERT INTO queue_tasks (
        id, input_path, output_path, status, encoder_mode, 
        created_at, applied_params
      ) VALUES (?, ?, ?, 'PENDING', ?, ?, ?)
    `);
    
    stmt.run(
      task.id,
      task.inputPath,
      task.outputPath,
      task.encoderMode || 'auto',
      Date.now(),
      JSON.stringify(task.effects)
    );
    
    logger.info(`Task ${task.id} added to queue`);
    this.emit('task-added', task);
    
    // Try to start processing if not already running
    this.processNext();
  }

  async getQueue(): Promise<QueueTask[]> {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT * FROM queue_tasks 
      ORDER BY created_at ASC
    `);
    
    const rows = stmt.all() as any[];
    return rows.map(this.rowToTask);
  }

  async updateTaskStatus(
    taskId: string,
    status: TaskStatus,
    progress?: number,
    error?: string
  ): Promise<void> {
    const db = getDatabase();
    
    const updates: string[] = ['status = ?'];
    const params: any[] = [status];
    
    if (progress !== undefined) {
      updates.push('progress = ?');
      params.push(progress);
    }
    
    if (error) {
      updates.push('error_message = ?');
      params.push(error);
    }
    
    if (status === 'PROCESSING' && !this.currentTaskId) {
      updates.push('started_at = ?');
      params.push(Date.now());
      this.currentTaskId = taskId;
    }
    
    if (status === 'FINISHED' || status === 'ERROR' || status === 'CANCELED') {
      updates.push('finished_at = ?');
      params.push(Date.now());
      if (this.currentTaskId === taskId) {
        this.currentTaskId = null;
      }
    }
    
    params.push(taskId);
    
    const stmt = db.prepare(`
      UPDATE queue_tasks 
      SET ${updates.join(', ')} 
      WHERE id = ?
    `);
    
    stmt.run(...params);
    
    logger.info(`Task ${taskId} updated to ${status}${progress !== undefined ? ` (${progress}%)` : ''}`);
    this.emit('task-updated', { taskId, status, progress, error });
  }

  async getNextPendingTask(): Promise<QueueTask | null> {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT * FROM queue_tasks 
      WHERE status = 'PENDING' 
      ORDER BY created_at ASC 
      LIMIT 1
    `);
    
    const row = stmt.get() as any;
    if (!row) return null;
    
    return this.rowToTask(row);
  }

  async cancelTask(taskId: string): Promise<void> {
    const db = getDatabase();
    
    const stmt = db.prepare(`
      UPDATE queue_tasks 
      SET status = 'CANCELED', finished_at = ? 
      WHERE id = ? AND status IN ('PENDING', 'PROCESSING')
    `);
    
    const result = stmt.run(Date.now(), taskId);
    
    if (result.changes > 0) {
      logger.info(`Task ${taskId} canceled`);
      this.emit('task-canceled', taskId);
      
      if (this.currentTaskId === taskId) {
        this.currentTaskId = null;
        this.processing = false;
      }
    }
  }

  async clearFinishedTasks(): Promise<number> {
    const db = getDatabase();
    
    const stmt = db.prepare(`
      DELETE FROM queue_tasks 
      WHERE status IN ('FINISHED', 'ERROR', 'CANCELED')
    `);
    
    const result = stmt.run();
    logger.info(`Cleared ${result.changes} finished tasks`);
    this.emit('tasks-cleared', result.changes);
    
    return result.changes;
  }

  private async processNext(): Promise<void> {
    if (this.processing || this.currentTaskId) {
      return;
    }

    const task = await this.getNextPendingTask();
    if (!task) {
      return;
    }

    this.processing = true;
    this.emit('processing-started', task);
  }

  isProcessing(): boolean {
    return this.processing;
  }

  getCurrentTaskId(): string | null {
    return this.currentTaskId;
  }

  private rowToTask(row: any): QueueTask {
    return {
      id: row.id,
      inputPath: row.input_path,
      outputPath: row.output_path,
      status: row.status as TaskStatus,
      progress: row.progress || 0,
      encoderMode: row.encoder_mode as any,
      error: row.error_message,
      createdAt: row.created_at,
      startedAt: row.started_at,
      finishedAt: row.finished_at,
      retryCount: row.retry_count || 0,
      effects: row.applied_params ? JSON.parse(row.applied_params) : undefined,
    };
  }
}

export default QueueManager;
