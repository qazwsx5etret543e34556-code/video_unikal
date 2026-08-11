import { create } from 'zustand';
import { Task, TaskStatus } from '@video-uniqueizer/shared-types';

interface QueueState {
  tasks: Task[];
  addTasks: (tasks: Omit<Task, 'status' | 'progress'>[]) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  cancelTask: (id: string) => void;
  removeTask: (id: string) => void;
  clearFinished: () => void;
  getPendingTasks: () => Task[];
  getProcessingTasks: () => Task[];
}

export const useQueueStore = create<QueueState>((set, get) => ({
  tasks: [],

  addTasks: (newTasks) => {
    set((state) => ({
      tasks: [
        ...state.tasks,
        ...newTasks.map((task) => ({
          ...task,
          status: 'PENDING' as TaskStatus,
          progress: 0,
        })),
      ],
    }));
  },

  updateTask: (id, updates) => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, ...updates } : task
      ),
    }));
  },

  cancelTask: (id) => {
    get().updateTask(id, { status: 'CANCELED' });
  },

  removeTask: (id) => {
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id),
    }));
  },

  clearFinished: () => {
    set((state) => ({
      tasks: state.tasks.filter(
        (task) => task.status !== 'FINISHED' && task.status !== 'ERROR' && task.status !== 'CANCELED'
      ),
    }));
  },

  getPendingTasks: () => {
    return get().tasks.filter(
      (task) => task.status === 'PENDING' || task.status === 'ANALYZING'
    );
  },

  getProcessingTasks: () => {
    return get().tasks.filter((task) => task.status === 'PROCESSING');
  },
}));
