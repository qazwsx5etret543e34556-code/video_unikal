import { useSettingsStore } from '@/store/settings.store';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useTranslation } from 'react-i18next';
import { Cpu, Zap, Auto } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ipcRenderer } from 'electron';

export function EncoderSelector() {
  const { t } = useTranslation();
  const { encoderMode, setEncoderMode } = useSettingsStore();
  const [gpuAvailable, setGpuAvailable] = useState(false);

  useEffect(() => {
    ipcRenderer.invoke('gpu:check').then((result: any) => {
      setGpuAvailable(result?.hasNvidia || false);
    });
  }, []);

  const options = [
    { value: 'auto', label: t('settings.encoder.auto'), icon: Auto },
    { value: 'cpu', label: t('settings.encoder.cpu'), icon: Cpu },
    { value: 'nvidia', label: t('settings.encoder.nvidia'), icon: Zap, disabled: !gpuAvailable },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle className="text-base">{t('settings.encoder.title')}</CardTitle>
          <Tooltip>
            <TooltipTrigger asChild>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>{t('settings.encoder.tooltip')}</p>
              {!gpuAvailable && (
                <p className="mt-1 text-xs text-destructive">
                  {t('settings.encoder.nvidiaUnavailable')}
                </p>
              )}
            </TooltipContent>
          </Tooltip>
        </div>
        <CardDescription>{t('settings.encoder.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Select value={encoderMode} onValueChange={(v) => setEncoderMode(v as any)}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                <div className="flex items-center gap-2">
                  <option.icon className="h-4 w-4" />
                  {option.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}
