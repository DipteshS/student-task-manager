"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PRIORITY_BADGE_VARIANT, PRIORITY_LABEL } from "@/lib/task-helpers";
import type { TaskDTO, TaskStatus } from "@/lib/types";

function BoardCard({ task }: { task: TaskDTO }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      className={cn(
        "cursor-grab space-y-1.5 rounded-lg border border-navy-100 bg-surface p-3 shadow-sm active:cursor-grabbing",
        isDragging && "opacity-40"
      )}
    >
      <p
        className={cn(
          "font-serif text-sm font-medium text-navy-900",
          task.status === "COMPLETED" && "text-navy-300 line-through"
        )}
      >
        {task.title}
      </p>
      <div className="flex flex-wrap items-center gap-1">
        <Badge variant={PRIORITY_BADGE_VARIANT[task.priority]}>
          {PRIORITY_LABEL[task.priority]}
        </Badge>
        {task.course && (
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: task.course.color }}
            title={task.course.name}
          />
        )}
      </div>
    </div>
  );
}

export function BoardColumn({
  status,
  label,
  tasks,
}: {
  status: TaskStatus;
  label: string;
  tasks: TaskDTO[];
}) {
  const { setNodeRef } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className="flex-1 rounded-xl border-t-2 border-t-gold-500 bg-navy-50/40 p-3"
    >
      <div className="mb-2 flex items-center justify-between px-1">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-navy-700">{label}</h3>
        <span className="text-xs text-navy-400">{tasks.length}</span>
      </div>
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="min-h-[80px] space-y-2">
          {tasks.map((task) => (
            <BoardCard key={task.id} task={task} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
