import React from 'react';
import { useQueue } from '../../hooks/useQueue';
import { TaskRow } from './TaskRow';

export function TaskList() {
  const { tasks } = useQueue();

  if (tasks.length === 0) {
    return (
      <div className="border rounded-lg p-8 text-center text-muted-foreground">
        No tasks in queue. Add video files to start.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <TaskRow key={task.id} task={task} />
      ))}
    </div>
  );
}

export default TaskList;
