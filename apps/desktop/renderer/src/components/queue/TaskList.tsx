import { Task } from '@video-uniqueizer/shared-types';
import { TaskRow } from './TaskRow';
import { useTranslation } from 'react-i18next';

interface TaskListProps {
  tasks: Task[];
  onCancel: (id: string) => void;
  onRemove: (id: string) => void;
}

export function TaskList({ tasks, onCancel, onRemove }: TaskListProps) {
  const { t } = useTranslation();

  if (tasks.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed bg-muted/50">
        <p className="text-muted-foreground">{t('queue.empty')}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {tasks.map((task) => (
        <TaskRow
          key={task.id}
          task={task}
          onCancel={onCancel}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}
