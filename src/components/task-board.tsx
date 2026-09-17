"use client";

import { useState } from "react";
import {
  DndContext,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { BoardColumn } from "@/components/task-board-column";
import type { TaskDTO, TaskStatus } from "@/lib/types";

interface TaskBoardProps {
  tasks: TaskDTO[];
  onStatusChange: (task: TaskDTO, status: TaskStatus) => void;
  onReorder: (status: TaskStatus, orderedIds: string[]) => void;
}

const COLUMNS: { key: TaskStatus; label: string }[] = [
  { key: "PENDING", label: "Pending" },
  { key: "COMPLETED", label: "Completed" },
];

function splitColumns(tasks: TaskDTO[]): Record<TaskStatus, TaskDTO[]> {
  return {
    PENDING: tasks.filter((t) => t.status === "PENDING").sort((a, b) => a.order - b.order),
    COMPLETED: tasks.filter((t) => t.status === "COMPLETED").sort((a, b) => a.order - b.order),
  };
}

function isStatus(value: unknown): value is TaskStatus {
  return value === "PENDING" || value === "COMPLETED";
}

export function TaskBoard({ tasks, onStatusChange, onReorder }: TaskBoardProps) {
  const [prevTasks, setPrevTasks] = useState(tasks);
  const [columns, setColumns] = useState<Record<TaskStatus, TaskDTO[]>>(() =>
    splitColumns(tasks)
  );

  if (tasks !== prevTasks) {
    setPrevTasks(tasks);
    setColumns(splitColumns(tasks));
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  function findColumnOf(id: string): TaskStatus | null {
    if (columns.PENDING.some((t) => t.id === id)) return "PENDING";
    if (columns.COMPLETED.some((t) => t.id === id)) return "COMPLETED";
    return null;
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeCol = findColumnOf(String(active.id));
    const overCol = isStatus(over.id) ? over.id : findColumnOf(String(over.id));
    if (!activeCol || !overCol || activeCol === overCol) return;

    setColumns((prev) => {
      const activeTask = prev[activeCol].find((t) => t.id === active.id);
      if (!activeTask) return prev;
      return {
        ...prev,
        [activeCol]: prev[activeCol].filter((t) => t.id !== active.id),
        [overCol]: [...prev[overCol], { ...activeTask, status: overCol }],
      };
    });
  }

  function revertToSource() {
    setColumns(splitColumns(tasks));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) {
      revertToSource();
      return;
    }

    const activeCol = findColumnOf(String(active.id));
    const overCol = isStatus(over.id) ? over.id : findColumnOf(String(over.id));
    if (!activeCol || !overCol) {
      revertToSource();
      return;
    }

    if (activeCol === overCol) {
      if (active.id === over.id) return;
      const items = columns[activeCol];
      const oldIndex = items.findIndex((t) => t.id === active.id);
      const newIndex = items.findIndex((t) => t.id === over.id);
      if (oldIndex === -1 || newIndex === -1) {
        revertToSource();
        return;
      }
      const reordered = arrayMove(items, oldIndex, newIndex);
      setColumns((prev) => ({ ...prev, [activeCol]: reordered }));
      onReorder(activeCol, reordered.map((t) => t.id));
    } else {
      const movedTask = tasks.find((t) => t.id === active.id);
      if (movedTask) onStatusChange(movedTask, overCol);
      onReorder(overCol, columns[overCol].map((t) => t.id));
    }
  }

  function handleDragCancel() {
    revertToSource();
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex flex-col gap-4 sm:flex-row">
        {COLUMNS.map(({ key, label }) => (
          <BoardColumn key={key} status={key} label={label} tasks={columns[key]} />
        ))}
      </div>
    </DndContext>
  );
}
