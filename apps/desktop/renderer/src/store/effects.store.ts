import { create } from 'zustand';
import { EffectValue, EFFECTS_DEFINITIONS, EffectDefinition } from '@video-uniqueizer/shared-types';

interface EffectsState {
  effects: Record<string, EffectValue>;
  updateEffect: (key: string, value: EffectValue) => void;
  enableAll: () => void;
  disableAll: () => void;
  randomizeAll: () => void;
  reset: () => void;
}

const getInitialEffects = (): Record<string, EffectValue> => {
  const effects: Record<string, EffectValue> = {};
  EFFECTS_DEFINITIONS.forEach((effect) => {
    if (effect.type === 'colorBalance') {
      effects[effect.key] = {
        enabled: false,
        shadows: 0,
        midtones: 0,
        highlights: 0,
      };
    } else if (effect.type === 'boolean') {
      effects[effect.key] = {
        enabled: false,
        value: false,
      };
    } else {
      effects[effect.key] = {
        enabled: false,
        value: effect.min,
      };
    }
  });
  return effects;
};

const randomizeValue = (effect: EffectDefinition): number => {
  if (effect.type === 'boolean') {
    return Math.random() > 0.5 ? 1 : 0;
  }
  const range = effect.max - effect.min;
  const step = effect.step || 1;
  const randomSteps = Math.floor(Math.random() * (range / step));
  return effect.min + randomSteps * step;
};

export const useEffectsStore = create<EffectsState>((set, get) => ({
  effects: getInitialEffects(),

  updateEffect: (key, value) => {
    set((state) => ({
      effects: {
        ...state.effects,
        [key]: value,
      },
    }));
  },

  enableAll: () => {
    const newEffects = { ...get().effects };
    Object.keys(newEffects).forEach((key) => {
      newEffects[key] = { ...newEffects[key], enabled: true };
    });
    set({ effects: newEffects });
  },

  disableAll: () => {
    const newEffects = { ...get().effects };
    Object.keys(newEffects).forEach((key) => {
      newEffects[key] = { ...newEffects[key], enabled: false };
    });
    set({ effects: newEffects });
  },

  randomizeAll: () => {
    const newEffects = { ...get().effects };
    EFFECTS_DEFINITIONS.forEach((effect) => {
      if (newEffects[effect.key]?.enabled) {
        if (effect.type === 'colorBalance') {
          newEffects[effect.key] = {
            ...newEffects[effect.key],
            shadows: randomizeValue({ ...effect, min: -100, max: 100 }),
            midtones: randomizeValue({ ...effect, min: -100, max: 100 }),
            highlights: randomizeValue({ ...effect, min: -100, max: 100 }),
          };
        } else if (effect.type !== 'boolean') {
          newEffects[effect.key] = {
            ...newEffects[effect.key],
            value: randomizeValue(effect),
          };
        }
      }
    });
    set({ effects: newEffects });
  },

  reset: () => {
    set({ effects: getInitialEffects() });
  },
}));
