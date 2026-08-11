import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UploadCloud } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileDropZoneProps {
  onFilesSelected: (files: string[]) => void;
  disabled?: boolean;
}

export function FileDropZone({ onFilesSelected, disabled = false }: FileDropZoneProps) {
  const { t } = useTranslation();
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;

    const files = Array.from(e.dataTransfer.files)
      .filter(file => file.name.match(/\.(mp4|avi|mkv|mov|wmv|flv|webm)$/i))
      .map(file => file.path);

    if (files.length > 0) {
      onFilesSelected(files);
    }
  }, [onFilesSelected, disabled]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
      .map(file => (file as any).path)
      .filter(Boolean);

    if (files.length > 0) {
      onFilesSelected(files);
    }
  }, [onFilesSelected]);

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors',
        isDragOver 
          ? 'border-primary bg-primary/5' 
          : 'border-muted-foreground/25 hover:border-primary/50',
        disabled && 'opacity-50 pointer-events-none'
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <UploadCloud className="mb-4 h-12 w-12 text-muted-foreground" />
      <h3 className="mb-2 text-lg font-semibold">{t('queue.dropzone.title')}</h3>
      <p className="mb-4 text-sm text-muted-foreground">
        {t('queue.dropzone.description')}
      </p>
      <label className="cursor-pointer">
        <input
          type="file"
          multiple
          accept=".mp4,.avi,.mkv,.mov,.wmv,.flv,.webm"
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled}
        />
        <span className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          {t('queue.dropzone.browse')}
        </span>
      </label>
    </div>
  );
}
