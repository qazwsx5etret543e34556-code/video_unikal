import { create } from 'zustand';
import type { EffectPreset } from '@video-uniqueizer/shared-types';

interface PresetsState {
  presets: EffectPreset[];
  isLoading: boolean;
  
  // Actions
  setPresets: (presets: EffectPreset[]) => void;
  addPreset: (preset: EffectPreset) => void;
  updatePreset: (id: string, preset: Partial<EffectPreset>) => void;
  deletePreset: (id: string) => void;
  setLoading: (loading: boolean) => void;
}

export const usePresetsStore = create<PresetsState>((set) => ({
  presets: [],
  isLoading: false,
  
  setPresets: (presets) => set({ presets }),
  
  addPreset: (preset) =>
    set((state) => ({ presets: [...state.presets, preset] })),
  
  updatePreset: (id, updates) =>
    set((state) => ({
      presets: state.presets.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    })),
  
  deletePreset: (id) =>
    set((state) => ({
      presets: state.presets.filter((p) => p.id !== id),
    })),
  
  setLoading: (isLoading) => set({ isLoading }),
}));

export default usePresetsStore;
