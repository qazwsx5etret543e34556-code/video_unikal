import { useEffectsStore } from '@/store/effects.store';
import { EFFECTS_DEFINITIONS } from '@video-uniqueizer/shared-types';
import { EffectCard } from './EffectCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { RefreshCw, CheckSquare, Square } from 'lucide-react';

export function EffectsPanel() {
  const { t } = useTranslation();
  const { effects, updateEffect, enableAll, disableAll, randomizeAll } = useEffectsStore();

  const effectGroups = {
    color: ['brightness', 'contrast', 'sharpness', 'saturation', 'hue', 'colorBalance'],
    fx: ['speed', 'resolution', 'zoom', 'rotate', 'flipHorizontal', 'flipVertical', 'noise', 'blur'],
    overlay: ['sticker', 'backgroundAudio', 'startImage', 'baitVideo', 'transparentSquare', 'backgroundReplace'],
    multiplier: ['multiplier', 'metadataClean'],
    audio: ['audioPitchShift', 'audioVolume'],
  };

  const renderGroup = (title: string, keys: string[]) => (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-muted-foreground">{t(`effects.groups.${title}`)}</h4>
      {keys.map((key) => {
        const effect = EFFECTS_DEFINITIONS.find(e => e.key === key);
        if (!effect) return null;
        const value = effects[key] || { enabled: false, value: effect.min };
        return (
          <EffectCard
            key={key}
            effect={effect}
            value={value}
            onChange={updateEffect}
          />
        );
      })}
    </div>
  );

  return (
    <Card className="h-full overflow-y-auto">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{t('effects.title')}</CardTitle>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => enableAll()}
              title={t('effects.enableAll')}
            >
              <CheckSquare className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => disableAll()}
              title={t('effects.disableAll')}
            >
              <Square className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => randomizeAll()}
              title={t('effects.randomize')}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {renderGroup('colorCorrection', effectGroups.color)}
        {renderGroup('fx', effectGroups.fx)}
        {renderGroup('overlays', effectGroups.overlay)}
        {renderGroup('multipliers', effectGroups.multiplier)}
        {renderGroup('audio', effectGroups.audio)}
      </CardContent>
    </Card>
  );
}
