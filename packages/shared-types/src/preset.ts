/**
 * Preset Types
 * Saved effect configurations
 */

export type PresetCategory = 'custom' | 'mild' | 'medium' | 'aggressive';

export interface Preset {
  id: string;
  name: string;
  description?: string;
  category: PresetCategory;
  effects: Record<string, { enabled: boolean; min: number; max: number }>;
  createdAt: number; // timestamp
  updatedAt: number; // timestamp
  isDefault: boolean;
}

export const PRESET_CATEGORIES: { value: PresetCategory; label: string }[] = [
  { value: 'custom', label: 'Custom' },
  { value: 'mild', label: 'Mild (5-10% changes)' },
  { value: 'medium', label: 'Medium (10-20% changes)' },
  { value: 'aggressive', label: 'Aggressive (20-40% changes)' },
];

export const DEFAULT_PRESETS: Preset[] = [
  {
    id: 'preset_mild',
    name: 'Mild Uniqueization',
    description: 'Minimal changes for subtle uniqueization',
    category: 'mild',
    effects: {
      brightness: { enabled: true, min: -10, max: 10 },
      contrast: { enabled: true, min: -5, max: 5 },
      saturation: { enabled: true, min: 95, max: 105 },
      hue: { enabled: true, min: -3, max: 3 },
      sharpness: { enabled: true, min: 5, max: 10 },
      noise: { enabled: true, min: 1, max: 3 },
      speed: { enabled: false, min: 98, max: 102 },
      resolution: { enabled: false, min: 98, max: 102 },
      zoom: { enabled: true, min: 102, max: 105 },
      rotate: { enabled: false, min: -0.5, max: 0.5 },
      flipHorizontal: { enabled: false, min: 0, max: 1 },
      flipVertical: { enabled: false, min: 0, max: 1 },
      blur: { enabled: false, min: 0, max: 0.5 },
      audioPitchShift: { enabled: true, min: -1, max: 1 },
      audioVolume: { enabled: true, min: 98, max: 102 },
      metadataClean: { enabled: true, min: 1, max: 1 },
      multiplier: { enabled: false, min: 1, max: 1 },
      colorBalanceShadows: { enabled: false, min: -5, max: 5 },
      colorBalanceMidtones: { enabled: false, min: -5, max: 5 },
      colorBalanceHighlights: { enabled: false, min: -5, max: 5 },
      sticker: { enabled: false, min: 0, max: 0 },
      backgroundAudio: { enabled: false, min: 0, max: 0 },
      startImage: { enabled: false, min: 0, max: 0 },
      baitVideo: { enabled: false, min: 0, max: 0 },
      transparentSquare: { enabled: true, min: 1, max: 1 },
      backgroundReplace: { enabled: false, min: 0, max: 0 },
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isDefault: true,
  },
  {
    id: 'preset_medium',
    name: 'Medium Uniqueization',
    description: 'Balanced changes for good uniqueization',
    category: 'medium',
    effects: {
      brightness: { enabled: true, min: -20, max: 20 },
      contrast: { enabled: true, min: -10, max: 10 },
      saturation: { enabled: true, min: 90, max: 110 },
      hue: { enabled: true, min: -5, max: 5 },
      sharpness: { enabled: true, min: 10, max: 20 },
      noise: { enabled: true, min: 2, max: 5 },
      speed: { enabled: true, min: 95, max: 105 },
      resolution: { enabled: true, min: 95, max: 105 },
      zoom: { enabled: true, min: 105, max: 110 },
      rotate: { enabled: true, min: -1, max: 1 },
      flipHorizontal: { enabled: true, min: 0, max: 1 },
      flipVertical: { enabled: false, min: 0, max: 1 },
      blur: { enabled: true, min: 0.5, max: 1 },
      audioPitchShift: { enabled: true, min: -2, max: 2 },
      audioVolume: { enabled: true, min: 95, max: 105 },
      metadataClean: { enabled: true, min: 1, max: 1 },
      multiplier: { enabled: false, min: 1, max: 1 },
      colorBalanceShadows: { enabled: true, min: -10, max: 10 },
      colorBalanceMidtones: { enabled: true, min: -10, max: 10 },
      colorBalanceHighlights: { enabled: true, min: -10, max: 10 },
      sticker: { enabled: false, min: 0, max: 0 },
      backgroundAudio: { enabled: false, min: 0, max: 0 },
      startImage: { enabled: false, min: 0, max: 0 },
      baitVideo: { enabled: false, min: 0, max: 0 },
      transparentSquare: { enabled: true, min: 1, max: 1 },
      backgroundReplace: { enabled: false, min: 0, max: 0 },
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isDefault: true,
  },
  {
    id: 'preset_aggressive',
    name: 'Aggressive Uniqueization',
    description: 'Maximum changes for heavy uniqueization',
    category: 'aggressive',
    effects: {
      brightness: { enabled: true, min: -40, max: 40 },
      contrast: { enabled: true, min: -20, max: 20 },
      saturation: { enabled: true, min: 80, max: 120 },
      hue: { enabled: true, min: -10, max: 10 },
      sharpness: { enabled: true, min: 15, max: 30 },
      noise: { enabled: true, min: 3, max: 8 },
      speed: { enabled: true, min: 90, max: 110 },
      resolution: { enabled: true, min: 90, max: 110 },
      zoom: { enabled: true, min: 110, max: 120 },
      rotate: { enabled: true, min: -2, max: 2 },
      flipHorizontal: { enabled: true, min: 0, max: 1 },
      flipVertical: { enabled: true, min: 0, max: 1 },
      blur: { enabled: true, min: 1, max: 2 },
      audioPitchShift: { enabled: true, min: -3, max: 3 },
      audioVolume: { enabled: true, min: 90, max: 110 },
      metadataClean: { enabled: true, min: 1, max: 1 },
      multiplier: { enabled: false, min: 1, max: 1 },
      colorBalanceShadows: { enabled: true, min: -20, max: 20 },
      colorBalanceMidtones: { enabled: true, min: -20, max: 20 },
      colorBalanceHighlights: { enabled: true, min: -20, max: 20 },
      sticker: { enabled: false, min: 0, max: 0 },
      backgroundAudio: { enabled: false, min: 0, max: 0 },
      startImage: { enabled: false, min: 0, max: 0 },
      baitVideo: { enabled: false, min: 0, max: 0 },
      transparentSquare: { enabled: true, min: 1, max: 1 },
      backgroundReplace: { enabled: false, min: 0, max: 0 },
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isDefault: true,
  },
];
