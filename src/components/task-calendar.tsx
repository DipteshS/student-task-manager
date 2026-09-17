"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  format,
  addMonths,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { TaskDTO } from "@/lib/types";

const PRIORITY_DOT: Record<TaskDTO["priority"], string> = {
  LOW: "bg-forest-600",
  MEDIUM: "bg-gold-600",
  HIGH: "bg-maroon-600",
};

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function TaskCalendar({ tasks }: { tasks: TaskDTO[] }) {
  const [month, setMonth] = useState(() => startOfMonth(new Date()));

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month));
    const end = endOfWeek(endOfMonth(month));
    return eachDayOfInterval({ start, end });
  }, [month]);

  const tasksByDay = useMemo(() => {
    const map = new Map<string, TaskDTO[]>();
    tasks.forEach((task) => {
      if (!task.dueDate) return;
      const key = task.dueDate.slice(0, 10);
      const list = map.get(key) ?? [];
      list.push(task);
      map.set(key, list);
    });
    return map;
  }, [tasks]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl font-semibold text-navy-900">
          {format(month, "MMMM yyyy")}
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setMonth((m) => subMonths(m, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setMonth(startOfMonth(new Date()))}>
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={() => setMonth((m) => addMonths(m, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border border-navy-100 bg-navy-100">
        {WEEKDAY_LABELS.map((d) => (
          <div
            key={d}
            className="bg-navy-50 px-2 py-1.5 text-center text-xs font-medium uppercase tracking-wide text-navy-500"
          >
            {d}
          </div>
        ))}
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const dayTasks = tasksByDay.get(key) ?? [];
          const inMonth = isSameMonth(day, month);
          return (
            <div key={key} className={cn("min-h-[100px] bg-surface p-1.5", !inMonth && "bg-navy-50/40")}>
              <span
                className={cn(
                  "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs",
                  isToday(day) ? "bg-brand-900 font-semibold text-white" : "text-navy-500",
                  !inMonth && "text-navy-300"
                )}
              >
                {format(day, "d")}
              </span>
              <div className="mt-1 space-y-1">
                {dayTasks.slice(0, 3).map((task) => (
                  <Link
                    key={task.id}
                    href={`/tasks?search=${encodeURIComponent(task.title)}`}
                    title={task.title}
                    className={cn(
                      "flex items-center gap-1 truncate rounded px-1 py-0.5 text-xs hover:bg-navy-50",
                      task.status === "COMPLETED" ? "text-navy-300 line-through" : "text-navy-700"
                    )}
                  >
                    <span
                      className={cn("h-1.5 w-1.5 shrink-0 rounded-full", PRIORITY_DOT[task.priority])}
                    />
                    <span className="truncate">{task.title}</span>
                  </Link>
                ))}
                {dayTasks.length > 3 && (
                  <p className="px-1 text-xs text-navy-400">+{dayTasks.length - 3} more</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
