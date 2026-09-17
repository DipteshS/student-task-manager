import type { Priority, TaskDTO } from "@/lib/types";

export const PRIORITY_LABEL: Record<Priority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};

export const PRIORITY_BADGE_VARIANT: Record<Priority, "low" | "medium" | "high"> = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
};

const PRIORITY_WEIGHT: Record<Priority, number> = { LOW: 0, MEDIUM: 1, HIGH: 2 };

export function isOverdue(task: TaskDTO): boolean {
  if (task.status !== "PENDING" || !task.dueDate) return false;
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  return new Date(task.dueDate) < startOfToday;
}

export interface TaskFilters {
  status: "ALL" | "PENDING" | "COMPLETED";
  priority: "ALL" | Priority;
  search: string;
  tags: string[];
  sort: "createdAt" | "dueDate" | "priority" | "title";
  order: "asc" | "desc";
}

export const DEFAULT_FILTERS: TaskFilters = {
  status: "ALL",
  priority: "ALL",
  search: "",
  tags: [],
  sort: "createdAt",
  order: "desc",
};

export function filterTasks(tasks: TaskDTO[], filters: TaskFilters): TaskDTO[] {
  const search = filters.search.trim().toLowerCase();

  const filtered = tasks.filter((task) => {
    if (filters.status !== "ALL" && task.status !== filters.status) return false;
    if (filters.priority !== "ALL" && task.priority !== filters.priority) return false;
    if (filters.tags.length > 0 && !filters.tags.some((tag) => task.tags.includes(tag))) {
      return false;
    }
    if (search) {
      const haystack = `${task.title} ${task.description ?? ""} ${task.tags.join(" ")}`.toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    return true;
  });

  const direction = filters.order === "asc" ? 1 : -1;

  return [...filtered].sort((a, b) => {
    switch (filters.sort) {
      case "dueDate": {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return direction * (new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
      }
      case "priority":
        return direction * (PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority]);
      case "title":
        return direction * a.title.localeCompare(b.title);
      default:
        return direction * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }
  });
}
