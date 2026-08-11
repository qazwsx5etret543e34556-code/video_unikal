import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePresets } from '@/store/presets.store';
import { Preset } from '@video-uniqueizer/shared-types';
import { Plus, Copy, Trash2, Download, Upload, Save } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export function PresetsPage() {
  const { t } = useTranslation();
  const { presets, addPreset, updatePreset, deletePreset, exportPreset, importPreset, loadPreset } = usePresets();
  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetDescription, setNewPresetDescription] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPreset, setEditingPreset] = useState<Preset | null>(null);

  const handleCreatePreset = () => {
    if (!newPresetName.trim()) return;
    
    addPreset({
      name: newPresetName.trim(),
      description: newPresetDescription.trim(),
      effects: {},
      encoderMode: 'auto',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    setNewPresetName('');
    setNewPresetDescription('');
    setIsDialogOpen(false);
  };

  const handleUpdatePreset = () => {
    if (!editingPreset || !newPresetName.trim()) return;
    
    updatePreset(editingPreset.id, {
      name: newPresetName.trim(),
      description: newPresetDescription.trim(),
      updatedAt: new Date(),
    });
    
    setEditingPreset(null);
    setNewPresetName('');
    setNewPresetDescription('');
    setIsDialogOpen(false);
  };

  const handleEditClick = (preset: Preset) => {
    setEditingPreset(preset);
    setNewPresetName(preset.name);
    setNewPresetDescription(preset.description || '');
    setIsDialogOpen(true);
  };

  const handleExport = (preset: Preset) => {
    exportPreset(preset.id);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        importPreset(json);
      } catch (err) {
        console.error('Failed to import preset:', err);
      }
    };
    reader.readAsText(file);
  };

  const handleLoadPreset = (preset: Preset) => {
    loadPreset(preset.id);
  };

  const handleDuplicate = (preset: Preset) => {
    addPreset({
      ...preset,
      id: crypto.randomUUID(),
      name: `${preset.name} (copy)`,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t('presets.title')}</h1>
        <div className="flex gap-2">
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
            <Button variant="outline" asChild>
              <span>
                <Upload className="w-4 h-4 mr-2" />
                {t('presets.import')}
              </span>
            </Button>
          </label>
          
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditingPreset(null);
              setNewPresetName('');
              setNewPresetDescription('');
            }
          }}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingPreset(null)}>
                <Plus className="w-4 h-4 mr-2" />
                {t('presets.create')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingPreset ? t('presets.edit') : t('presets.create')}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('presets.name')}</Label>
                  <Input
                    id="name"
                    placeholder={t('presets.namePlaceholder')}
                    value={newPresetName}
                    onChange={(e) => setNewPresetName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">{t('presets.description')}</Label>
                  <Textarea
                    id="description"
                    placeholder={t('presets.descriptionPlaceholder')}
                    value={newPresetDescription}
                    onChange={(e) => setNewPresetDescription(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  {t('common.cancel')}
                </Button>
                <Button onClick={editingPreset ? handleUpdatePreset : handleCreatePreset}>
                  {editingPreset ? t('common.save') : t('common.create')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {presets.map((preset) => (
          <Card key={preset.id} className="relative">
            <CardHeader>
              <CardTitle className="pr-16">{preset.name}</CardTitle>
              <CardDescription className="line-clamp-2">
                {preset.description || t('presets.noDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleLoadPreset(preset)}
                  title={t('presets.load')}
                >
                  <Save className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport(preset)}
                  title={t('presets.export')}
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditClick(preset)}
                  title={t('presets.edit')}
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDuplicate(preset)}
                  title={t('presets.duplicate')}
                >
                  <Plus className="w-4 h-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deletePreset(preset.id)}
                  title={t('presets.delete')}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="mt-4 text-xs text-muted-foreground">
                <p>{t('presets.updated')}: {new Date(preset.updatedAt).toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {presets.length === 0 && (
          <div className="col-span-full text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <Plus className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">{t('presets.empty')}</h3>
            <p className="text-muted-foreground mb-4">{t('presets.emptyDesc')}</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              {t('presets.createFirst')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
