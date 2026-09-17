"use client";

import { useEffect, useRef, useState } from "react";
import { Pencil, Trash2, Copy, Flag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ContextMenu, ContextMenuItem, ContextMenuSeparator } from "@/components/ui/context-menu";
import { cn } from "@/lib/utils";
import { isOverdue, PRIORITY_BADGE_VARIANT, PRIORITY_LABEL } from "@/lib/task-helpers";
import { formatDueLabel } from "@/lib/format-due";
import type { Priority, TaskDTO } from "@/lib/types";

interface TaskItemProps {
  task: TaskDTO;
  onToggle: (task: TaskDTO) => void;
  onEdit: (task: TaskDTO) => void;
  onDelete: (task: TaskDTO) => void;
  onDuplicate: (task: TaskDTO) => void;
  onQuickEdit: (task: TaskDTO, patch: { title?: string; priority?: Priority }) => void;
  selectMode?: boolean;
  selected?: boolean;
  onSelectChange?: (task: TaskDTO, selected: boolean) => void;
}

const DUE_TONE_CLASS: Record<string, string> = {
  overdue: "text-maroon-600 font-medium",
  today: "text-gold-600 font-medium",
  soon: "text-navy-600",
  normal: "text-navy-400",
  none: "text-navy-300",
};

export function TaskItem({
  task,
  onToggle,
  onEdit,
  onDelete,
  onDuplicate,
  onQuickEdit,
  selectMode,
  selected,
  onSelectChange,
}: TaskItemProps) {
  const completed = task.status === "COMPLETED";
  const overdue = isOverdue(task);
  const due = formatDueLabel(task.dueDate, task.status);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(task.title);
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditingTitle) titleInputRef.current?.focus();
  }, [isEditingTitle]);

  function commitTitle() {
    const trimmed = titleDraft.trim();
    setIsEditingTitle(false);
    if (trimmed && trimmed !== task.title) {
      onQuickEdit(task, { title: trimmed });
    } else {
      setTitleDraft(task.title);
    }
  }

  return (
    <div
      onContextMenu={(e) => {
        e.preventDefault();
        setMenuPos({ x: e.clientX, y: e.clientY });
      }}
      className={cn(
        "flex items-start gap-3 border-b border-navy-100 px-4 py-4 last:border-0",
        overdue && "bg-maroon-100/30",
        selected && "bg-navy-50"
      )}
    >
      {selectMode && (
        <input
          type="checkbox"
          checked={Boolean(selected)}
          onChange={(e) => onSelectChange?.(task, e.target.checked)}
          aria-label="Select task"
          className="mt-1 h-4 w-4 rounded border-navy-300 text-gold-600 focus:ring-gold-500"
        />
      )}
      <input
        type="checkbox"
        checked={completed}
        onChange={() => onToggle(task)}
        aria-label={completed ? "Mark as pending" : "Mark as completed"}
        className="mt-1 h-4 w-4 rounded border-navy-300 text-navy-900 focus:ring-navy-700"
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          {isEditingTitle ? (
            <input
              ref={titleInputRef}
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={commitTitle}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitTitle();
                if (e.key === "Escape") {
                  setTitleDraft(task.title);
                  setIsEditingTitle(false);
                }
              }}
              className="rounded border border-navy-300 bg-surface px-1.5 py-0.5 font-serif text-base font-medium text-navy-900 outline-none focus:ring-2 focus:ring-navy-700"
            />
          ) : (
            <p
              onClick={() => setIsEditingTitle(true)}
              title="Click to rename"
              className={cn(
                "cursor-text font-serif text-base font-medium text-navy-900 hover:underline decoration-navy-200",
                completed && "text-navy-300 line-through"
              )}
            >
              {task.title}
            </p>
          )}
          <Badge variant={PRIORITY_BADGE_VARIANT[task.priority]}>
            {PRIORITY_LABEL[task.priority]}
          </Badge>
          {task.course && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-navy-100 bg-navy-50 px-2 py-0.5 text-xs font-medium text-navy-700">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: task.course.color }}
              />
              {task.course.name}
            </span>
          )}
          {task.tags.map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
          {overdue && <Badge variant="overdue">Overdue</Badge>}
        </div>
        {task.description && (
          <p className={cn("mt-1 text-sm text-navy-600", completed && "line-through")}>
            {task.description}
          </p>
        )}
        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs">
          {due.tone !== "none" && (
            <span title={due.exact ?? undefined} className={DUE_TONE_CLASS[due.tone]}>
              {due.label}
            </span>
          )}
          {task.subtasks.length > 0 && (
            <span className="flex items-center gap-1.5 text-navy-400">
              {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length} subtasks
              <span className="h-1.5 w-14 overflow-hidden rounded-full bg-navy-50">
                <span
                  className="block h-full rounded-full bg-gold-500"
                  style={{
                    width: `${
                      (task.subtasks.filter((s) => s.completed).length / task.subtasks.length) * 100
                    }%`,
                  }}
                />
              </span>
            </span>
          )}
        </div>
      </div>
      <div className="flex shrink-0 gap-1">
        <Button variant="ghost" size="icon" onClick={() => onEdit(task)} aria-label="Edit task">
          <Pencil className="h-4 w-4 text-navy-600" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(task)}
          aria-label="Delete task"
        >
          <Trash2 className="h-4 w-4 text-maroon-600" />
        </Button>
      </div>

      {menuPos && (
        <ContextMenu x={menuPos.x} y={menuPos.y} onClose={() => setMenuPos(null)}>
          <ContextMenuItem
            onClick={() => {
              setMenuPos(null);
              onEdit(task);
            }}
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </ContextMenuItem>
          <ContextMenuItem
            onClick={() => {
              setMenuPos(null);
              onDuplicate(task);
            }}
          >
            <Copy className="h-3.5 w-3.5" />
            Duplicate
          </ContextMenuItem>
          <ContextMenuSeparator />
          {(["HIGH", "MEDIUM", "LOW"] as Priority[]).map((priority) => (
            <ContextMenuItem
              key={priority}
              onClick={() => {
                setMenuPos(null);
                onQuickEdit(task, { priority });
              }}
            >
              <Flag className="h-3.5 w-3.5" />
              Set {PRIORITY_LABEL[priority]} priority
            </ContextMenuItem>
          ))}
          <ContextMenuSeparator />
          <ContextMenuItem
            destructive
            onClick={() => {
              setMenuPos(null);
              onDelete(task);
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </ContextMenuItem>
        </ContextMenu>
      )}
    </div>
  );
}
