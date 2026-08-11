import { EffectDefinition, EffectValue } from '@video-uniqueizer/shared-types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useTranslation } from 'react-i18next';
import { Info } from 'lucide-react';

interface EffectCardProps {
  effect: EffectDefinition;
  value: EffectValue;
  onChange: (key: string, value: EffectValue) => void;
}

export function EffectCard({ effect, value, onChange }: EffectCardProps) {
  const { t } = useTranslation();

  const handleEnabledChange = (checked: boolean) => {
    onChange(effect.key, { ...value, enabled: checked });
  };

  const handleSliderChange = (newValue: number[]) => {
    if (effect.type === 'colorBalance') {
      // Handle color balance with 3 sliders
      return;
    }
    onChange(effect.key, { ...value, value: newValue[0] });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numValue = parseFloat(e.target.value);
    if (!isNaN(numValue)) {
      onChange(effect.key, { ...value, value: numValue });
    }
  };

  const tooltipContent = t(`effects.${effect.key}.tooltip`);

  return (
    <Card className="relative">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={value.enabled}
              onCheckedChange={handleEnabledChange}
              id={`effect-${effect.key}`}
            />
            <CardTitle className="text-sm">
              <label htmlFor={`effect-${effect.key}`} className="cursor-pointer">
                {t(`effects.${effect.key}.name`)}
              </label>
            </CardTitle>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>{tooltipContent}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {t(`effects.${effect.key}.range`)}
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
      </CardHeader>
      <CardContent>
        {effect.type !== 'boolean' && (
          <div className="flex items-center gap-4">
            <Slider
              min={effect.min}
              max={effect.max}
              step={effect.step || 1}
              value={[typeof value.value === 'number' ? value.value : effect.min]}
              onValueChange={handleSliderChange}
              disabled={!value.enabled}
              className="flex-1"
            />
            <Input
              type="number"
              min={effect.min}
              max={effect.max}
              step={effect.step || 1}
              value={typeof value.value === 'number' ? value.value : effect.min}
              onChange={handleInputChange}
              disabled={!value.enabled}
              className="w-20"
            />
          </div>
        )}
        {effect.type === 'colorBalance' && (
          <div className="space-y-2">
            {['shadows', 'midtones', 'highlights'].map((channel) => (
              <div key={channel} className="flex items-center gap-4">
                <span className="text-xs capitalize w-20">{t(`effects.${effect.key}.${channel}`)}</span>
                <Slider
                  min={-100}
                  max={100}
                  step={1}
                  value={[(value as any)[channel] || 0]}
                  onValueChange={(vals) => onChange(effect.key, { ...value, [channel]: vals[0] })}
                  disabled={!value.enabled}
                  className="flex-1"
                />
                <span className="w-10 text-right text-xs">
                  {(value as any)[channel] || 0}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
