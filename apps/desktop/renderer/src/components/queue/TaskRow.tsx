import { Task, TaskStatus } from '@video-uniqueizer/shared-types';
import { formatDuration } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Clock, Loader2, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface TaskRowProps {
  task: Task;
  onCancel: (id: string) => void;
  onRemove: (id: string) => void;
}

const statusConfig: Record<TaskStatus, { icon: any; color: string; label: string }> = {
  PENDING: { icon: Clock, color: 'text-yellow-500', label: 'queue.status.pending' },
  ANALYZING: { icon: Loader2, color: 'text-blue-500', label: 'queue.status.analyzing' },
  PROCESSING: { icon: Loader2, color: 'text-blue-500', label: 'queue.status.processing' },
  FINISHED: { icon: CheckCircle2, color: 'text-green-500', label: 'queue.status.finished' },
  ERROR: { icon: XCircle, color: 'text-red-500', label: 'queue.status.error' },
  CANCELED: { icon: XCircle, color: 'text-gray-500', label: 'queue.status.canceled' },
};

export function TaskRow({ task, onCancel, onRemove }: TaskRowProps) {
  const { t } = useTranslation();
  const StatusIcon = statusConfig[task.status].icon;
  const statusColor = statusConfig[task.status].color;
  const statusLabel = t(statusConfig[task.status].label);

  const getStatusText = () => {
    if (task.status === 'PROCESSING' && task.progress !== undefined) {
      return `${statusLabel} — ${task.progress}%`;
    }
    return statusLabel;
  };

  return (
    <div className="flex items-center gap-4 rounded-lg border bg-card p-4">
      <div className={`shrink-0 ${statusColor}`}>
        <StatusIcon className={`h-5 w-5 ${task.status === 'PROCESSING' || task.status === 'ANALYZING' ? 'animate-spin' : ''}`} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <p className="truncate text-sm font-medium">{task.inputPath.split('\\').pop() || task.inputPath.split('/').pop()}</p>
          <span className={`text-xs ${statusColor}`}>{getStatusText()}</span>
        </div>

        <div className="mt-2 flex items-center gap-4">
          <Progress value={task.progress || 0} className="h-2 flex-1" />
          {task.eta && (
            <span className="text-xs text-muted-foreground">
              ETA: {formatDuration(task.eta)}
            </span>
          )}
          {task.speed && (
            <span className="text-xs text-muted-foreground">
              {task.speed.toFixed(1)}x
            </span>
          )}
        </div>

        {task.error && (
          <p className="mt-1 text-xs text-destructive">{task.error}</p>
        )}
      </div>

      <div className="flex shrink-0 gap-2">
        {(task.status === 'PENDING' || task.status === 'PROCESSING' || task.status === 'ANALYZING') && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onCancel(task.id)}
            disabled={task.status === 'CANCELED'}
          >
            {t('common.cancel')}
          </Button>
        )}
        {(task.status === 'FINISHED' || task.status === 'ERROR' || task.status === 'CANCELED') && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(task.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
