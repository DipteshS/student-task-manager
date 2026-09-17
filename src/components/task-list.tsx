import { NotebookText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { TaskItem } from "@/components/task-item";
import type { Priority, TaskDTO } from "@/lib/types";

interface TaskListProps {
  tasks: TaskDTO[];
  onToggle: (task: TaskDTO) => void;
  onEdit: (task: TaskDTO) => void;
  onDelete: (task: TaskDTO) => void;
  onDuplicate: (task: TaskDTO) => void;
  onQuickEdit: (task: TaskDTO, patch: { title?: string; priority?: Priority }) => void;
  selectMode?: boolean;
  selectedIds?: Set<string>;
  onSelectChange?: (task: TaskDTO, selected: boolean) => void;
}

export function TaskList({
  tasks,
  onToggle,
  onEdit,
  onDelete,
  onDuplicate,
  onQuickEdit,
  selectMode,
  selectedIds,
  onSelectChange,
}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
        <NotebookText className="h-8 w-8 text-navy-200" />
        <p className="font-serif text-lg font-medium text-navy-900">No tasks found</p>
        <p className="text-sm text-navy-400">Try adjusting your filters or create a new task.</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
          onQuickEdit={onQuickEdit}
          selectMode={selectMode}
          selected={selectedIds?.has(task.id)}
          onSelectChange={onSelectChange}
        />
      ))}
    </Card>
  );
}
