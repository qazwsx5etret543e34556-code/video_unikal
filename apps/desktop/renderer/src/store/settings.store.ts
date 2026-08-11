import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { EncoderMode } from '@video-uniqueizer/shared-types';

interface SettingsState {
  encoderMode: EncoderMode;
  outputFolder: string;
  language: 'ru' | 'en';
  maxWorkers: number;
  taskTimeoutMinutes: number;
  setEncoderMode: (mode: EncoderMode) => void;
  setOutputFolder: (folder: string) => void;
  setLanguage: (lang: 'ru' | 'en') => void;
  setMaxWorkers: (workers: number) => void;
  setTaskTimeout: (minutes: number) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      encoderMode: 'auto',
      outputFolder: '',
      language: 'ru',
      maxWorkers: 2,
      taskTimeoutMinutes: 30,

      setEncoderMode: (mode) => set({ encoderMode: mode }),
      setOutputFolder: (folder) => set({ outputFolder: folder }),
      setLanguage: (lang) => set({ language: lang }),
      setMaxWorkers: (workers) => set({ maxWorkers: workers }),
      setTaskTimeout: (minutes) => set({ taskTimeoutMinutes: minutes }),
    }),
    {
      name: 'settings-storage',
    }
  )
);
