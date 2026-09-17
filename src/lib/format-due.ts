import { differenceInCalendarDays, format } from "date-fns";
import type { TaskStatus } from "@/lib/types";

export type DueTone = "overdue" | "today" | "soon" | "normal" | "none";

export interface DueLabel {
  label: string;
  tone: DueTone;
  exact: string | null;
}

export function formatDueLabel(dueDate: string | null, status: TaskStatus): DueLabel {
  if (!dueDate) return { label: "No due date", tone: "none", exact: null };

  const due = new Date(dueDate);
  const exact = format(due, "MMM d, yyyy");

  if (status === "COMPLETED") {
    return { label: `Due ${exact}`, tone: "normal", exact };
  }

  const diffDays = differenceInCalendarDays(due, new Date());

  if (diffDays < 0) {
    const days = Math.abs(diffDays);
    return { label: `Overdue by ${days} day${days === 1 ? "" : "s"}`, tone: "overdue", exact };
  }
  if (diffDays === 0) return { label: "Due today", tone: "today", exact };
  if (diffDays === 1) return { label: "Due tomorrow", tone: "soon", exact };
  if (diffDays <= 6) return { label: `Due in ${diffDays} days`, tone: "soon", exact };
  return { label: `Due ${exact}`, tone: "normal", exact };
}
