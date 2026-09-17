"use client";

import { useSyncExternalStore } from "react";
import { startOfWeek, endOfWeek, format } from "date-fns";
import { X } from "lucide-react";
import type { TaskDTO } from "@/lib/types";

const STORAGE_KEY = "weekly-digest-dismissed";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getServerSnapshot() {
  return true;
}

export function WeeklyDigestBanner({ tasks }: { tasks: TaskDTO[] }) {
  const weekStart = startOfWeek(new Date());
  const weekEnd = endOfWeek(new Date());
  const weekKey = format(weekStart, "yyyy-MM-dd");

  const dismissed = useSyncExternalStore(
    subscribe,
    () => {
      try {
        return localStorage.getItem(STORAGE_KEY) === weekKey;
      } catch {
        return false;
      }
    },
    getServerSnapshot
  );

  const dueThisWeek = tasks.filter((t) => {
    if (!t.dueDate) return false;
    const due = new Date(t.dueDate);
    return due >= weekStart && due <= weekEnd;
  });
  const completed = dueThisWeek.filter((t) => t.status === "COMPLETED").length;

  function handleDismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, weekKey);
      window.dispatchEvent(new StorageEvent("storage"));
    } catch {
      // ignore storage failures (private browsing, etc.)
    }
  }

  if (dismissed || dueThisWeek.length === 0) return null;

  return (
    <div className="flex items-center justify-between rounded-xl border-t-2 border-t-gold-500 bg-surface px-4 py-3 shadow-sm">
      <p className="text-sm text-navy-700">
        You&apos;ve completed{" "}
        <span className="font-semibold text-navy-900">
          {completed}/{dueThisWeek.length}
        </span>{" "}
        tasks due this week.
      </p>
      <button
        onClick={handleDismiss}
        aria-label="Dismiss"
        className="text-navy-300 hover:text-navy-600"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
