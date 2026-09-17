"use client";

import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { LayoutGrid, List } from "lucide-react";
import { StatsCards } from "@/components/stats-cards";
import { FilterBar } from "@/components/filter-bar";
import { BulkActionBar } from "@/components/bulk-action-bar";
import { TaskList } from "@/components/task-list";
import { TaskBoard } from "@/components/task-board";
import { TaskForm } from "@/components/task-form";
import { CommandPalette } from "@/components/command-palette";
import { SmartListSidebar, matchesSmartList, type SmartListKey } from "@/components/smart-list-sidebar";
import { WeeklyDigestBanner } from "@/components/weekly-digest-banner";
import { Dialog } from "@/components/ui/dialog";
import { DEFAULT_FILTERS, filterTasks, type TaskFilters } from "@/lib/task-helpers";
import { useKeyboardShortcuts } from "@/lib/use-keyboard-shortcuts";
import { cn } from "@/lib/utils";
import type { CourseDTO, Priority, TaskDTO, TaskStatus } from "@/lib/types";
import type { TaskFormValues } from "@/lib/validations";

type DialogState =
  | { mode: "closed" }
  | { mode: "create" }
  | { mode: "edit"; task: TaskDTO };

interface PendingDeleteBatch {
  ids: string[];
  timeoutId: ReturnType<typeof setTimeout>;
}

const UNDO_WINDOW_MS = 6000;

export function TaskManager({
  initialTasks,
  initialCourses,
  initialSearch,
}: {
  initialTasks: TaskDTO[];
  initialCourses: CourseDTO[];
  initialSearch?: string;
}) {
  const [tasks, setTasks] = useState<TaskDTO[]>(initialTasks);
  const [courses, setCourses] = useState<CourseDTO[]>(initialCourses);
  const [filters, setFilters] = useState<TaskFilters>({
    ...DEFAULT_FILTERS,
    search: initialSearch ?? "",
  });
  const [smartList, setSmartList] = useState<SmartListKey>("ALL");
  const [view, setView] = useState<"list" | "board">("list");
  const [dialog, setDialog] = useState<DialogState>({ mode: "closed" });
  const [submitting, setSubmitting] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [paletteOpen, setPaletteOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const pendingBatches = useRef<Map<string, PendingDeleteBatch>>(new Map());
  const removedTasksRef = useRef<Map<string, TaskDTO>>(new Map());

  const visibleTasks = useMemo(
    () => filterTasks(tasks, filters).filter((t) => matchesSmartList(t, smartList)),
    [tasks, filters, smartList]
  );
  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    tasks.forEach((t) => t.tags.forEach((tag) => tags.add(tag)));
    return Array.from(tags).sort();
  }, [tasks]);

  useKeyboardShortcuts({
    onNewTask: () => setDialog({ mode: "create" }),
    onFocusSearch: () => searchInputRef.current?.focus(),
    onOpenPalette: () => setPaletteOpen((open) => !open),
  });

  async function handleCreateOrUpdate(values: TaskFormValues) {
    setSubmitting(true);
    try {
      const editing = dialog.mode === "edit" ? dialog.task : null;
      const res = await fetch(editing ? `/api/tasks/${editing.id}` : "/api/tasks", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(data.error ?? "Something went wrong");
        return;
      }

      if (editing) {
        setTasks((prev) => prev.map((t) => (t.id === editing.id ? data.task : t)));
        toast.success("Task updated");
      } else {
        setTasks((prev) => [data.task, ...prev]);
        toast.success("Task created");
      }
      setDialog({ mode: "closed" });
    } finally {
      setSubmitting(false);
    }
  }

  async function updateStatus(task: TaskDTO, nextStatus: TaskStatus) {
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t)));

    const res = await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });

    if (!res.ok) {
      setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
      toast.error("Could not update task");
      return;
    }

    const data = await res.json().catch(() => ({}));
    if (data.task) {
      setTasks((prev) => prev.map((t) => (t.id === task.id ? data.task : t)));
    }
    if (data.nextTask) {
      setTasks((prev) => [data.nextTask, ...prev]);
      toast.success("Next occurrence created");
    }
  }

  function handleToggle(task: TaskDTO) {
    updateStatus(task, task.status === "COMPLETED" ? "PENDING" : "COMPLETED");
  }

  async function handleQuickEdit(task: TaskDTO, patch: { title?: string; priority?: Priority }) {
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, ...patch } : t)));

    const res = await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });

    if (!res.ok) {
      setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
      toast.error("Could not update task");
      return;
    }

    const data = await res.json().catch(() => ({}));
    if (data.task) {
      setTasks((prev) => prev.map((t) => (t.id === task.id ? data.task : t)));
    }
  }

  async function handleDuplicate(task: TaskDTO) {
    const payload = {
      title: `${task.title} (copy)`,
      description: task.description ?? "",
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : "",
      priority: task.priority,
      courseId: task.courseId ?? "",
      tags: task.tags,
      recurrence: task.recurrence,
      subtasks: task.subtasks.map((s) => ({ title: s.title, completed: false })),
    };

    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      toast.error("Could not duplicate task");
      return;
    }

    const data = await res.json().catch(() => ({}));
    if (data.task) {
      setTasks((prev) => [data.task, ...prev]);
      toast.success("Task duplicated");
    }
  }

  function scheduleDelete(toDelete: TaskDTO[]) {
    if (toDelete.length === 0) return;
    const ids = toDelete.map((t) => t.id);

    toDelete.forEach((t) => removedTasksRef.current.set(t.id, t));
    setTasks((prev) => prev.filter((t) => !ids.includes(t.id)));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.delete(id));
      return next;
    });

    const batchId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const timeoutId = setTimeout(() => {
      pendingBatches.current.delete(batchId);
      ids.forEach((id) => {
        removedTasksRef.current.delete(id);
        fetch(`/api/tasks/${id}`, { method: "DELETE" }).catch(() => {});
      });
    }, UNDO_WINDOW_MS);
    pendingBatches.current.set(batchId, { ids, timeoutId });

    toast(ids.length === 1 ? "Task deleted" : `${ids.length} tasks deleted`, {
      action: {
        label: "Undo",
        onClick: () => {
          const batch = pendingBatches.current.get(batchId);
          if (!batch) return;
          clearTimeout(batch.timeoutId);
          pendingBatches.current.delete(batchId);
          const restored = ids
            .map((id) => removedTasksRef.current.get(id))
            .filter((t): t is TaskDTO => Boolean(t));
          restored.forEach((t) => removedTasksRef.current.delete(t.id));
          setTasks((prev) => [...restored, ...prev]);
        },
      },
    });
  }

  function handleBulkComplete() {
    const selected = tasks.filter((t) => selectedIds.has(t.id) && t.status !== "COMPLETED");
    selected.forEach((t) => updateStatus(t, "COMPLETED"));
    setSelectedIds(new Set());
  }

  function handleBulkDelete() {
    scheduleDelete(tasks.filter((t) => selectedIds.has(t.id)));
  }

  async function handleBulkSetPriority(priority: Priority) {
    const selected = tasks.filter((t) => selectedIds.has(t.id));
    setTasks((prev) => prev.map((t) => (selectedIds.has(t.id) ? { ...t, priority } : t)));

    await Promise.all(
      selected.map((t) =>
        fetch(`/api/tasks/${t.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ priority }),
        })
      )
    );
    toast.success(`Priority updated for ${selected.length} task(s)`);
    setSelectedIds(new Set());
  }

  function handleSelectChange(task: TaskDTO, isSelected: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (isSelected) next.add(task.id);
      else next.delete(task.id);
      return next;
    });
  }

  async function handleReorderColumn(status: TaskStatus, orderedIds: string[]) {
    const orderMap = new Map(orderedIds.map((id, index) => [id, index]));
    setTasks((prev) =>
      prev.map((t) => (orderMap.has(t.id) ? { ...t, order: orderMap.get(t.id)! } : t))
    );

    await Promise.all(
      orderedIds.map((id, index) =>
        fetch(`/api/tasks/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: index }),
        })
      )
    );
  }

  return (
    <div className="space-y-6">
      <WeeklyDigestBanner tasks={tasks} />
      <StatsCards tasks={tasks} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SmartListSidebar tasks={tasks} active={smartList} onChange={setSmartList} />
        <div className="flex shrink-0 gap-1 self-start rounded-md border border-navy-200 bg-surface p-0.5">
          <button
            type="button"
            onClick={() => setView("list")}
            className={cn(
              "flex items-center gap-1.5 rounded px-2.5 py-1 text-sm font-medium transition-colors",
              view === "list" ? "bg-brand-900 text-white" : "text-navy-500 hover:bg-navy-50"
            )}
          >
            <List className="h-4 w-4" />
            List
          </button>
          <button
            type="button"
            onClick={() => setView("board")}
            className={cn(
              "flex items-center gap-1.5 rounded px-2.5 py-1 text-sm font-medium transition-colors",
              view === "board" ? "bg-brand-900 text-white" : "text-navy-500 hover:bg-navy-50"
            )}
          >
            <LayoutGrid className="h-4 w-4" />
            Board
          </button>
        </div>
      </div>

      {selectedIds.size > 0 ? (
        <BulkActionBar
          count={selectedIds.size}
          onComplete={handleBulkComplete}
          onDelete={handleBulkDelete}
          onSetPriority={handleBulkSetPriority}
          onCancel={() => setSelectedIds(new Set())}
        />
      ) : (
        <FilterBar
          ref={searchInputRef}
          filters={filters}
          onChange={setFilters}
          onNewTask={() => setDialog({ mode: "create" })}
          selectMode={selectMode}
          onToggleSelectMode={() => {
            setSelectMode((v) => !v);
            setSelectedIds(new Set());
          }}
          availableTags={availableTags}
        />
      )}

      {view === "list" ? (
        <TaskList
          tasks={visibleTasks}
          onToggle={handleToggle}
          onEdit={(task) => setDialog({ mode: "edit", task })}
          onDelete={(task) => scheduleDelete([task])}
          onDuplicate={handleDuplicate}
          onQuickEdit={handleQuickEdit}
          selectMode={selectMode}
          selectedIds={selectedIds}
          onSelectChange={handleSelectChange}
        />
      ) : (
        <TaskBoard tasks={visibleTasks} onStatusChange={updateStatus} onReorder={handleReorderColumn} />
      )}

      <Dialog
        open={dialog.mode !== "closed"}
        onClose={() => setDialog({ mode: "closed" })}
        title={dialog.mode === "edit" ? "Edit task" : "New task"}
      >
        <TaskForm
          initialTask={dialog.mode === "edit" ? dialog.task : null}
          courses={courses}
          onCourseCreated={(course) => setCourses((prev) => [...prev, course])}
          onSubmit={handleCreateOrUpdate}
          onCancel={() => setDialog({ mode: "closed" })}
          submitting={submitting}
        />
      </Dialog>

      <CommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        tasks={tasks}
        onNewTask={() => setDialog({ mode: "create" })}
        onOpenTask={(task) => setDialog({ mode: "edit", task })}
      />
    </div>
  );
}
