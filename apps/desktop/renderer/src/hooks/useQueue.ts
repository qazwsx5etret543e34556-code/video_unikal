import { useEffect, useState } from 'react';
import { useQueueStore } from '../store/queue.store';

export function useQueue() {
  const tasks = useQueueStore((state) => state.tasks);
  const addTask = useQueueStore((state) => state.addTask);
  const updateTask = useQueueStore((state) => state.updateTask);
  const removeTask = useQueueStore((state) => state.removeTask);
  const clearFinished = useQueueStore((state) => state.clearFinished);
  
  const [isProcessing, setIsProcessing] = useState(false);

  const startProcessing = async () => {
    setIsProcessing(true);
    // IPC call to start processing will be handled by component
  };

  const cancelTask = async (taskId: string) => {
    // IPC call to cancel task
    updateTask(taskId, { status: 'CANCELED' });
  };

  const retryTask = async (taskId: string) => {
    updateTask(taskId, { 
      status: 'PENDING', 
      progress: 0, 
      error: undefined 
    });
  };

  return {
    tasks,
    addTask,
    updateTask,
    removeTask,
    clearFinished,
    isProcessing,
    startProcessing,
    cancelTask,
    retryTask,
  };
}

export default useQueue;
