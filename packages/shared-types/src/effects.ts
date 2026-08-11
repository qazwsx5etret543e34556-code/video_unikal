/**
 * Effect Types and Configurations
 * All 24 effects with their ranges and FFmpeg filter mappings
 */

export type EffectType =
  // Цветокоррекция
  | 'brightness'
  | 'contrast'
  | 'sharpness'
  | 'saturation'
  | 'hue'
  | 'colorBalanceShadows'
  | 'colorBalanceMidtones'
  | 'colorBalanceHighlights'
  // FX эффекты
  | 'speed'
  | 'resolution'
  | 'zoom'
  | 'rotate'
  | 'flipHorizontal'
  | 'flipVertical'
  | 'noise'
  | 'blur'
  // Оверлеи (файлы)
  | 'sticker'
  | 'backgroundAudio'
  | 'startImage'
  | 'baitVideo'
  | 'transparentSquare'
  | 'backgroundReplace'
  // Множители
  | 'multiplier'
  | 'metadataClean'
  // Аудио эффекты
  | 'audioPitchShift'
  | 'audioVolume';

export interface EffectConfig {
  enabled: boolean;
  min: number;
  max: number;
  value?: number; // Текущее значение (рандомизируется при обработке)
  step?: number; // Шаг слайдера
  unit?: string; // Единица измерения (%, °, etc.)
}

export interface FileEffectConfig {
  path: string;
  volume?: number; // Для audio
  position?: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'random';
}

export interface BackgroundReplaceConfig {
  mode: 'black' | 'video';
  videoPath?: string; // Если mode === 'video'
}

export interface AllEffects {
  // Цветокоррекция
  brightness: EffectConfig;
  contrast: EffectConfig;
  sharpness: EffectConfig;
  saturation: EffectConfig;
  hue: EffectConfig;
  colorBalanceShadows: EffectConfig;
  colorBalanceMidtones: EffectConfig;
  colorBalanceHighlights: EffectConfig;
  // FX эффекты
  speed: EffectConfig;
  resolution: EffectConfig;
  zoom: EffectConfig;
  rotate: EffectConfig;
  flipHorizontal: EffectConfig;
  flipVertical: EffectConfig;
  noise: EffectConfig;
  blur: EffectConfig;
  // Оверлеи (файлы)
  sticker: EffectConfig & { files?: FileEffectConfig[] };
  backgroundAudio: EffectConfig & { files?: FileEffectConfig[] };
  startImage: EffectConfig & { files?: FileEffectConfig[] };
  baitVideo: EffectConfig & { files?: FileEffectConfig[] };
  transparentSquare: EffectConfig;
  backgroundReplace: EffectConfig & { config?: BackgroundReplaceConfig };
  // Множители
  multiplier: EffectConfig;
  metadataClean: EffectConfig;
  // Аудио эффекты
  audioPitchShift: EffectConfig;
  audioVolume: EffectConfig;
}

export const DEFAULT_EFFECTS: AllEffects = {
  // Цветокоррекция
  brightness: { enabled: false, min: -255, max: 255, step: 1 },
  contrast: { enabled: false, min: -100, max: 100, step: 1 },
  sharpness: { enabled: false, min: -100, max: 100, step: 1 },
  saturation: { enabled: false, min: 0, max: 200, step: 1, unit: '%' },
  hue: { enabled: false, min: -180, max: 180, step: 1, unit: '°' },
  colorBalanceShadows: { enabled: false, min: -100, max: 100, step: 1 },
  colorBalanceMidtones: { enabled: false, min: -100, max: 100, step: 1 },
  colorBalanceHighlights: { enabled: false, min: -100, max: 100, step: 1 },
  // FX эффекты
  speed: { enabled: false, min: 50, max: 200, step: 1, unit: '%' },
  resolution: { enabled: false, min: 50, max: 200, step: 1, unit: '%' },
  zoom: { enabled: false, min: 50, max: 200, step: 1, unit: '%' },
  rotate: { enabled: false, min: -360, max: 360, step: 0.1, unit: '°' },
  flipHorizontal: { enabled: false, min: 0, max: 1 },
  flipVertical: { enabled: false, min: 0, max: 1 },
  noise: { enabled: false, min: 0, max: 100, step: 1 },
  blur: { enabled: false, min: 0, max: 20, step: 0.1 },
  // Оверлеи (файлы)
  sticker: { enabled: false, min: 0, max: 1, files: [] },
  backgroundAudio: { enabled: false, min: 0, max: 1, files: [] },
  startImage: { enabled: false, min: 0, max: 1, files: [] },
  baitVideo: { enabled: false, min: 0, max: 1, files: [] },
  transparentSquare: { enabled: false, min: 0, max: 1 },
  backgroundReplace: { enabled: false, min: 0, max: 1, config: { mode: 'black' } },
  // Множители
  multiplier: { enabled: false, min: 1, max: 100, step: 1 },
  metadataClean: { enabled: false, min: 0, max: 1 },
  // Аудио эффекты
  audioPitchShift: { enabled: false, min: -5, max: 5, step: 0.1, unit: 'semitones' },
  audioVolume: { enabled: false, min: 50, max: 200, step: 1, unit: '%' },
};

export const EFFECT_TOOLTIPS: Record<keyof AllEffects, string> = {
  // Цветокоррекция
  brightness: 'Изменяет яркость видео. 0 = оригинал. Диапазон: -255..255. Для уникализации: -15..15',
  contrast: 'Изменяет контрастность. 0 = оригинал. Диапазон: -100..100. Для уникализации: -10..10',
  sharpness: 'Чёткость изображения. 0 = оригинал. Диапазон: -100..100. Для уникализации: 5..15',
  saturation: 'Насыщенность цветов. 100% = оригинал. Диапазон: 0..200%. Для уникализации: 90..110%',
  hue: 'Оттенок цвета. 0° = оригинал. Диапазон: -180..180°. Для уникализации: -5..5°',
  colorBalanceShadows: 'Баланс цвета в тенях. 0 = оригинал. Диапазон: -100..100',
  colorBalanceMidtones: 'Баланс цвета в средних тонах. 0 = оригинал. Диапазон: -100..100',
  colorBalanceHighlights: 'Баланс цвета в светлых участках. 0 = оригинал. Диапазон: -100..100',
  // FX эффекты
  speed: 'Скорость воспроизведения. 100% = оригинал. 105% = +5% быстрее. Диапазон: 50..200%',
  resolution: 'Изменение разрешения. 100% = оригинал. Диапазон: 50..200%. Для уникализации: 95..105%',
  zoom: 'Увеличение кадра. 100% = оригинал. Диапазон: 50..200%. Для уникализации: 105..115%',
  rotate: 'Поворот видео. Можно дробные значения через точку. Отрицательные = влево. Диапазон: -360..360°',
  flipHorizontal: 'Отражение по горизонтали. Включить/выключить.',
  flipVertical: 'Отражение по вертикали. Включить/выключить.',
  noise: 'Добавление шума. 0 = без шума. Диапазон: 0..100. Для уникализации: 1..5',
  blur: 'Размытие изображения. 0 = без размытия. Диапазон: 0..20. Для уникализации: 0.5..2',
  // Оверлеи (файлы)
  sticker: 'PNG стикеры с прозрачностью. Позиция выбирается случайно. Добавьте PNG файлы.',
  backgroundAudio: 'Фоновая музыка (MP3). Объединяется с оригинальным аудио. Укажите громкость 0.1..0.9',
  startImage: 'Картинка в начале видео на 0.2 секунды. Добавьте изображение (PNG/JPG).',
  baitVideo: 'Видео-байт в конце. Добавьте видеофайл для добавления в конец.',
  transparentSquare: 'Прозрачный квадрат (alpha 5%). Для сброса хэша видео.',
  backgroundReplace: 'Подмена фона: чёрный или заменённое видео.',
  // Множители
  multiplier: 'Создаёт N уникальных копий с разными параметрами. Диапазон: 1..100',
  metadataClean: 'Очистка всех метаданных (кодек, дата создания, и т.д.). Включить/выключить.',
  // Аудио эффекты
  audioPitchShift: 'Сдвиг тона аудио. 0 = оригинал. Диапазон: -5..5 полутонов. Для уникализации: -2..2',
  audioVolume: 'Громкость аудио. 100% = оригинал. Диапазон: 50..200%. Для уникализации: 95..105%',
};

export const EFFECT_CATEGORIES = {
  colorCorrection: ['brightness', 'contrast', 'sharpness', 'saturation', 'hue', 'colorBalanceShadows', 'colorBalanceMidtones', 'colorBalanceHighlights'] as EffectType[],
  fx: ['speed', 'resolution', 'zoom', 'rotate', 'flipHorizontal', 'flipVertical', 'noise', 'blur'] as EffectType[],
  overlays: ['sticker', 'backgroundAudio', 'startImage', 'baitVideo', 'transparentSquare', 'backgroundReplace'] as EffectType[],
  multipliers: ['multiplier', 'metadataClean'] as EffectType[],
  audio: ['audioPitchShift', 'audioVolume'] as EffectType[],
};
