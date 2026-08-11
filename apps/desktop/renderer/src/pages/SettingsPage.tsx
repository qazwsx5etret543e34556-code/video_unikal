import { useSettingsStore } from '@/store/settings.store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { EncoderSelector } from '@/components/encoder/EncoderSelector';
import { useTranslation } from 'react-i18next';
import { FolderOpen } from 'lucide-react';
import { ipcRenderer } from 'electron';
import { useState } from 'react';

export function SettingsPage() {
  const { t, i18n } = useTranslation();
  const { outputFolder, language, maxWorkers, taskTimeoutMinutes, setOutputFolder, setLanguage, setMaxWorkers, setTaskTimeout } = useSettingsStore();
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);

  const handleBrowseFolder = async () => {
    setFolderDialogOpen(true);
    const result = await ipcRenderer.invoke('dialog:selectFolder');
    setFolderDialogOpen(false);
    if (result) {
      setOutputFolder(result);
    }
  };

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang as 'ru' | 'en');
    i18n.changeLanguage(lang);
  };

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <h2 className="text-2xl font-bold">{t('settings.title')}</h2>

      <EncoderSelector />

      <Card>
        <CardHeader>
          <CardTitle>{t('settings.outputFolder.title')}</CardTitle>
          <CardDescription>{t('settings.outputFolder.description')}</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Input value={outputFolder} readOnly placeholder="C:\Videos\Output" />
          <Button onClick={handleBrowseFolder} disabled={folderDialogOpen}>
            <FolderOpen className="mr-2 h-4 w-4" />
            {t('settings.outputFolder.browse')}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('settings.language.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ru">{t('settings.language.russian')}</SelectItem>
              <SelectItem value="en">{t('settings.language.english')}</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('settings.workers.title')}</CardTitle>
          <CardDescription>{t('settings.workers.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Slider
            min={1}
            max={8}
            step={1}
            value={[maxWorkers]}
            onValueChange={(v) => setMaxWorkers(v[0])}
          />
          <div className="text-center text-sm">{maxWorkers}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('settings.timeout.title')}</CardTitle>
          <CardDescription>{t('settings.timeout.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Slider
            min={5}
            max={120}
            step={5}
            value={[taskTimeoutMinutes]}
            onValueChange={(v) => setTaskTimeout(v[0])}
          />
          <div className="text-center text-sm">{taskTimeoutMinutes} {t('common.minutes')}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('settings.gracePeriod.title')}</CardTitle>
          <CardDescription>{t('settings.gracePeriod.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {t('settings.gracePeriod.tooltip')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
