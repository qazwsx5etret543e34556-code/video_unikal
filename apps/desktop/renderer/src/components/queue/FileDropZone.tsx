import React from 'react';
import { useTranslation } from 'react-i18next';
import { Upload } from 'lucide-react';
import { Button } from '../ui/button';

interface FileDropZoneProps {
  onFilesAdded: (files: string[]) => void;
}

export function FileDropZone({ onFilesAdded }: FileDropZoneProps) {
  const { t } = useTranslation();

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files)
      .filter(f => f.name.match(/\.(mp4|avi|mov|mkv|wmv)$/i))
      .map(f => f.path);
    
    if (files.length > 0) {
      onFilesAdded(files);
    }
  };

  const handleClick = () => {
    // Open file dialog via IPC
    (window as any).electron?.openFileDialog?.().then((files: string[]) => {
      if (files && files.length > 0) {
        onFilesAdded(files);
      }
    });
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onClick={handleClick}
      className="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer hover:border-primary transition-colors"
    >
      <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold">{t('queue.dropzone.title')}</h3>
      <p className="text-muted-foreground mt-2">{t('queue.dropzone.subtitle')}</p>
      <p className="text-xs text-muted-foreground mt-4">
        {t('queue.dropzone.supportedFormats')}
      </p>
    </div>
  );
}

export default FileDropZone;
