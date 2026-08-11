import { create } from 'zustand';
import type { QueueTask, TaskStatus } from '@video-uniqueizer/shared-types';

interface QueueState {
  tasks: QueueTask[];
  isProcessing: boolean;
  selectedTaskId: string | null;
  
  // Actions
  setTasks: (tasks: QueueTask[]) => void;
  addTask: (task: QueueTask) => void;
  updateTask: (taskId: string, updates: Partial<QueueTask>) => void;
  removeTask: (taskId: string) => void;
  clearFinished: () => void;
  setSelectedTask: (taskId: string | null) => void;
  setIsProcessing: (processing: boolean) => void;
}

export const useQueueStore = create<QueueState>((set) => ({
  tasks: [],
  isProcessing: false,
  selectedTaskId: null,

  setTasks: (tasks) => set({ tasks }),
  
  addTask: (task) => 
    set((state) => ({ tasks: [...state.tasks, task] })),
  
  updateTask: (taskId, updates) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId ? { ...task, ...updates } : task
      ),
    })),
  
  removeTask: (taskId) =>
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== taskId),
    })),
  
  clearFinished: () =>
    set((state) => ({
      tasks: state.tasks.filter(
        (task) => !['FINISHED', 'ERROR', 'CANCELED'].includes(task.status)
      ),
    })),
  
  setSelectedTask: (taskId) => set({ selectedTaskId: taskId }),
  
  setIsProcessing: (isProcessing) => set({ isProcessing }),
}));

export default useQueueStore;
