"use client";

import { differenceInCalendarDays } from "date-fns";
import { cn } from "@/lib/utils";
import type { TaskDTO } from "@/lib/types";

export type SmartListKey = "ALL" | "TODAY" | "UPCOMING" | "OVERDUE" | "NO_DATE";

export function matchesSmartList(task: TaskDTO, key: SmartListKey): boolean {
  if (key === "ALL") return true;
  if (key === "NO_DATE") return !task.dueDate;
  if (!task.dueDate) return false;

  const diff = differenceInCalendarDays(new Date(task.dueDate), new Date());
  if (key === "TODAY") return diff === 0 && task.status === "PENDING";
  if (key === "UPCOMING") return diff >= 1 && diff <= 7 && task.status === "PENDING";
  if (key === "OVERDUE") return diff < 0 && task.status === "PENDING";
  return true;
}

const SMART_LISTS: { key: SmartListKey; label: string }[] = [
  { key: "ALL", label: "All tasks" },
  { key: "TODAY", label: "Today" },
  { key: "UPCOMING", label: "Upcoming" },
  { key: "OVERDUE", label: "Overdue" },
  { key: "NO_DATE", label: "No due date" },
];

interface SmartListSidebarProps {
  tasks: TaskDTO[];
  active: SmartListKey;
  onChange: (key: SmartListKey) => void;
}

export function SmartListSidebar({ tasks, active, onChange }: SmartListSidebarProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {SMART_LISTS.map(({ key, label }) => {
        const count = tasks.filter((t) => matchesSmartList(t, key)).length;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium transition-colors",
              active === key
                ? "border-brand-900 bg-brand-900 text-white"
                : "border-navy-200 bg-surface text-navy-700 hover:bg-navy-50"
            )}
          >
            {label}
            <span className={cn("text-xs", active === key ? "text-brand-100" : "text-navy-400")}>
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
