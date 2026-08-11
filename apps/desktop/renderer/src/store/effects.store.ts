import { create } from 'zustand';
import type { VideoEffects, EncoderMode } from '@video-uniqueizer/shared-types';
import { randomInRange, randomIntInRange } from '../lib/utils';

interface EffectsState {
  effects: VideoEffects;
  encoderMode: EncoderMode;
  
  // Actions
  setEffect: <K extends keyof VideoEffects>(
    key: K,
    value: Partial<VideoEffects[K]>
  ) => void;
  resetEffects: () => void;
  randomizeEffects: () => void;
  setEncoderMode: (mode: EncoderMode) => void;
  loadPreset: (effects: VideoEffects) => void;
}

const defaultEffects: VideoEffects = {
  brightness: { enabled: true, value: 0, min: -255, max: 255 },
  contrast: { enabled: true, value: 0, min: -100, max: 100 },
  sharpness: { enabled: true, value: 0, min: -100, max: 100 },
  saturation: { enabled: true, value: 100, min: 0, max: 200 },
  hue: { enabled: true, value: 0, min: -180, max: 180 },
  colorBalance: { 
    enabled: false, 
    shadows: { r: 0, g: 0, b: 0 },
    midtones: { r: 0, g: 0, b: 0 },
    highlights: { r: 0, g: 0, b: 0 },
  },
  speed: { enabled: true, value: 100, min: 50, max: 200 },
  resolution: { enabled: true, value: 100, min: 50, max: 200 },
  zoom: { enabled: false, value: 100, min: 50, max: 200 },
  rotate: { enabled: false, value: 0, min: -360, max: 360 },
  flipHorizontal: { enabled: false },
  flipVertical: { enabled: false },
  noise: { enabled: false, value: 0, min: 0, max: 100 },
  blur: { enabled: false, value: 0, min: 0, max: 20 },
  sticker: { enabled: false, files: [] },
  backgroundAudio: { enabled: false, file: null, volume: 0.5 },
  startImage: { enabled: false, file: null, duration: 0.2 },
  baitVideo: { enabled: false, file: null },
  transparentSquare: { enabled: false, alpha: 0.05 },
  backgroundReplace: { enabled: false, mode: 'black' },
  multiplier: { enabled: false, count: 1, min: 1, max: 100 },
  metadataClean: { enabled: true },
  audioPitchShift: { enabled: false, value: 0, min: -5, max: 5 },
  audioVolume: { enabled: true, value: 100, min: 50, max: 200 },
};

export const useEffectsStore = create<EffectsState>((set, get) => ({
  effects: defaultEffects,
  encoderMode: 'auto',
  
  setEffect: (key, value) =>
    set((state) => ({
      effects: {
        ...state.effects,
        [key]: { ...state.effects[key], ...value },
      },
    })),
  
  resetEffects: () => set({ effects: defaultEffects }),
  
  randomizeEffects: () => {
    const state = get();
    const randomized: VideoEffects = { ...state.effects };
    
    // Randomize numeric effects within their ranges
    if (randomized.brightness.enabled) {
      randomized.brightness.value = randomIntInRange(-15, 15);
    }
    if (randomized.contrast.enabled) {
      randomized.contrast.value = randomIntInRange(-10, 10);
    }
    if (randomized.saturation.enabled) {
      randomized.saturation.value = randomIntInRange(90, 110);
    }
    if (randomized.hue.enabled) {
      randomized.hue.value = randomIntInRange(-10, 10);
    }
    if (randomized.speed.enabled) {
      randomized.speed.value = randomIntInRange(95, 105);
    }
    if (randomized.audioPitchShift.enabled) {
      randomized.audioPitchShift.value = randomInRange(-2, 2);
    }
    if (randomized.audioVolume.enabled) {
      randomized.audioVolume.value = randomIntInRange(90, 110);
    }
    
    set({ effects: randomized });
  },
  
  setEncoderMode: (mode) => set({ encoderMode: mode }),
  
  loadPreset: (effects) => set({ effects }),
}));

export default useEffectsStore;
