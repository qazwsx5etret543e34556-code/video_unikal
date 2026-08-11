import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueue } from '../../hooks/useQueue';
import { FileDropZone } from './FileDropZone';
import { TaskList } from './TaskList';
import { EffectsPanel } from '../effects/EffectsPanel';
import { EncoderSelector } from '../encoder/EncoderSelector';
import { Button } from '../ui/button';
import { toast } from 'sonner';

export function QueuePage() {
  const { t } = useTranslation();
  const { tasks, addTask, clearFinished } = useQueue();

  const handleFilesAdded = useCallback((files: string[]) => {
    files.forEach((filePath) => {
      // Create task and add to queue
      const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const outputPath = filePath.replace(/\.[^/.]+$/, '_uniqueized.mp4');
      
      addTask({
        id: taskId,
        inputPath: filePath,
        outputPath,
        status: 'PENDING',
        progress: 0,
        encoderMode: 'auto',
        createdAt: Date.now(),
      });
      
      toast.success(t('toasts.fileAdded'));
    });
  }, [addTask, t]);

  const handleStartAll = useCallback(() => {
    toast.info(t('toasts.taskStarted'));
    // IPC call to start processing
  }, [t]);

  const handleClearFinished = useCallback(() => {
    clearFinished();
  }, [clearFinished]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t('queue.title')}</h2>
        <div className="flex gap-2">
          <Button onClick={handleStartAll} disabled={tasks.length === 0}>
            {t('queue.actions.startAll')}
          </Button>
          <Button variant="outline" onClick={handleClearFinished}>
            {t('queue.actions.clearFinished')}
          </Button>
        </div>
      </div>

      <FileDropZone onFilesAdded={handleFilesAdded} />

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <TaskList />
        </div>
        <div className="col-span-1">
          <EffectsPanel />
          <div className="mt-4">
            <EncoderSelector />
          </div>
        </div>
      </div>
    </div>
  );
}

export default QueuePage;
