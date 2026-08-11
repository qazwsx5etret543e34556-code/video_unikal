import { useQueueStore } from '@/store/queue.store';
import { FileDropZone } from '@/components/queue/FileDropZone';
import { TaskList } from '@/components/queue/TaskList';
import { EffectsPanel } from '@/components/effects/EffectsPanel';
import { Button } from '@/components/ui/button';
import { useQueue } from '@/hooks/useQueue';
import { useTranslation } from 'react-i18next';
import { Play, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import { ipcRenderer } from 'electron';

export function QueuePage() {
  const { t } = useTranslation();
  const { tasks } = useQueueStore();
  const { addFilesToQueue, startProcessing, cancelTask, removeTask, clearFinished } = useQueue();

  // Listen for queue updates from main process
  useEffect(() => {
    const handleTaskUpdate = (_event: any, task: any) => {
      // Task update handled by store subscription
    };

    ipcRenderer.on('queue:taskUpdate', handleTaskUpdate);

    return () => {
      ipcRenderer.removeListener('queue:taskUpdate', handleTaskUpdate);
    };
  }, []);

  const hasPendingTasks = tasks.some(
    (t) => t.status === 'PENDING' || t.status === 'ANALYZING'
  );

  const hasFinishedTasks = tasks.some(
    (t) => t.status === 'FINISHED' || t.status === 'ERROR' || t.status === 'CANCELED'
  );

  return (
    <div className="flex h-full gap-6 p-6">
      {/* Left column - Queue */}
      <div className="flex-1 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">{t('queue.title')}</h2>
          <div className="flex gap-2">
            <Button
              onClick={startProcessing}
              disabled={!hasPendingTasks}
            >
              <Play className="mr-2 h-4 w-4" />
              {t('queue.actions.startAll')}
            </Button>
            {hasFinishedTasks && (
              <Button
                variant="outline"
                onClick={clearFinished}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t('queue.actions.clearFinished')}
              </Button>
            )}
          </div>
        </div>

        <FileDropZone onFilesSelected={addFilesToQueue} />

        <TaskList
          tasks={tasks}
          onCancel={cancelTask}
          onRemove={removeTask}
        />
      </div>

      {/* Right column - Effects */}
      <div className="w-[400px] shrink-0">
        <EffectsPanel />
      </div>
    </div>
  );
}
