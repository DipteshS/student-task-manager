import { describe, it, expect } from "vitest";
import { subDays } from "date-fns";
import { computeStreak } from "@/lib/streak";
import type { TaskDTO } from "@/lib/types";

function makeCompletedTask(daysAgo: number): TaskDTO {
  const completedAt = subDays(new Date(), daysAgo).toISOString();
  return {
    id: Math.random().toString(36).slice(2),
    title: "Task",
    description: null,
    dueDate: null,
    priority: "MEDIUM",
    status: "COMPLETED",
    tags: [],
    recurrence: "NONE",
    order: 0,
    completedAt,
    createdAt: completedAt,
    updatedAt: completedAt,
    userId: "user-1",
    courseId: null,
    course: null,
    subtasks: [],
  };
}

describe("computeStreak", () => {
  it("is 0 with no completed tasks", () => {
    expect(computeStreak([])).toBe(0);
  });

  it("is 0 when the most recent completion was not today", () => {
    expect(computeStreak([makeCompletedTask(1)])).toBe(0);
  });

  it("counts today as a streak of 1", () => {
    expect(computeStreak([makeCompletedTask(0)])).toBe(1);
  });

  it("counts consecutive days back from today", () => {
    const tasks = [makeCompletedTask(0), makeCompletedTask(1), makeCompletedTask(2)];
    expect(computeStreak(tasks)).toBe(3);
  });

  it("stops at the first gap", () => {
    const tasks = [makeCompletedTask(0), makeCompletedTask(1), makeCompletedTask(3)];
    expect(computeStreak(tasks)).toBe(2);
  });

  it("does not double count multiple completions on the same day", () => {
    const tasks = [makeCompletedTask(0), makeCompletedTask(0), makeCompletedTask(1)];
    expect(computeStreak(tasks)).toBe(2);
  });
});
