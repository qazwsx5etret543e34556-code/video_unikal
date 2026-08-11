import { useCallback } from 'react';
import { useQueueStore } from '@/store/queue.store';
import { useEffectsStore } from '@/store/effects.store';
import { useSettingsStore } from '@/store/settings.store';
import { ipcRenderer } from 'electron';
import { v4 as uuidv4 } from 'uuid';

export function useQueue() {
  const { addTasks, updateTask, cancelTask, removeTask, clearFinished } = useQueueStore();
  const { effects } = useEffectsStore();
  const { encoderMode, outputFolder } = useSettingsStore();

  const addFilesToQueue = useCallback(
    async (filePaths: string[]) => {
      const tasks = filePaths.map((inputPath) => ({
        id: uuidv4(),
        inputPath,
        outputPath: outputFolder
          ? `${outputFolder}/${inputPath.split('\\').pop() || inputPath.split('/').pop()}`
          : `${inputPath}_uniqueized.mp4`,
        createdAt: new Date().toISOString(),
        appliedParams: {
          effects,
          encoderMode,
        },
      }));

      addTasks(tasks);
      
      // Notify main process
      await ipcRenderer.invoke('queue:add', tasks);
      
      return tasks.length;
    },
    [addTasks, effects, encoderMode, outputFolder]
  );

  const startProcessing = useCallback(async () => {
    await ipcRenderer.invoke('queue:start');
  }, []);

  const handleCancelTask = useCallback(
    async (id: string) => {
      cancelTask(id);
      await ipcRenderer.invoke('queue:cancel', id);
    },
    [cancelTask]
  );

  const handleRemoveTask = useCallback(
    async (id: string) => {
      removeTask(id);
      await ipcRenderer.invoke('queue:remove', id);
    },
    [removeTask]
  );

  const handleClearFinished = useCallback(async () => {
    clearFinished();
    await ipcRenderer.invoke('queue:clearFinished');
  }, [clearFinished]);

  return {
    addFilesToQueue,
    startProcessing,
    cancelTask: handleCancelTask,
    removeTask: handleRemoveTask,
    clearFinished: handleClearFinished,
  };
}
