import { describe, it, expect } from "vitest";
import { filterTasks, isOverdue, DEFAULT_FILTERS } from "@/lib/task-helpers";
import type { TaskDTO } from "@/lib/types";

function makeTask(overrides: Partial<TaskDTO> = {}): TaskDTO {
  return {
    id: overrides.id ?? Math.random().toString(36).slice(2),
    title: "Untitled task",
    description: null,
    dueDate: null,
    priority: "MEDIUM",
    status: "PENDING",
    tags: [],
    recurrence: "NONE",
    order: 0,
    completedAt: null,
    createdAt: new Date("2026-01-01T00:00:00.000Z").toISOString(),
    updatedAt: new Date("2026-01-01T00:00:00.000Z").toISOString(),
    userId: "user-1",
    courseId: null,
    course: null,
    subtasks: [],
    ...overrides,
  };
}

describe("isOverdue", () => {
  it("is false for completed tasks even with a past due date", () => {
    const task = makeTask({ status: "COMPLETED", dueDate: "2020-01-01T00:00:00.000Z" });
    expect(isOverdue(task)).toBe(false);
  });

  it("is false when there is no due date", () => {
    const task = makeTask({ status: "PENDING", dueDate: null });
    expect(isOverdue(task)).toBe(false);
  });

  it("is true for a pending task with a due date in the past", () => {
    const task = makeTask({ status: "PENDING", dueDate: "2020-01-01T00:00:00.000Z" });
    expect(isOverdue(task)).toBe(true);
  });

  it("is false for a pending task due later today or in the future", () => {
    const future = new Date();
    future.setFullYear(future.getFullYear() + 1);
    const task = makeTask({ status: "PENDING", dueDate: future.toISOString() });
    expect(isOverdue(task)).toBe(false);
  });
});

describe("filterTasks", () => {
  const tasks = [
    makeTask({ id: "1", title: "Read chapter 1", status: "PENDING", priority: "LOW", tags: ["reading"] }),
    makeTask({ id: "2", title: "Write essay", status: "COMPLETED", priority: "HIGH", tags: ["essay", "writing"] }),
    makeTask({ id: "3", title: "Lab report", status: "PENDING", priority: "MEDIUM", tags: [] }),
  ];

  it("returns all tasks when filters are default", () => {
    expect(filterTasks(tasks, DEFAULT_FILTERS)).toHaveLength(3);
  });

  it("filters by status", () => {
    const result = filterTasks(tasks, { ...DEFAULT_FILTERS, status: "COMPLETED" });
    expect(result.map((t) => t.id)).toEqual(["2"]);
  });

  it("filters by priority", () => {
    const result = filterTasks(tasks, { ...DEFAULT_FILTERS, priority: "HIGH" });
    expect(result.map((t) => t.id)).toEqual(["2"]);
  });

  it("filters by tag (matches any selected tag)", () => {
    const result = filterTasks(tasks, { ...DEFAULT_FILTERS, tags: ["reading"] });
    expect(result.map((t) => t.id)).toEqual(["1"]);
  });

  it("searches title and tags case-insensitively", () => {
    const result = filterTasks(tasks, { ...DEFAULT_FILTERS, search: "ESSAY" });
    expect(result.map((t) => t.id)).toEqual(["2"]);
  });

  it("sorts by priority descending by default weight (high to low) when order is asc", () => {
    const result = filterTasks(tasks, { ...DEFAULT_FILTERS, sort: "priority", order: "asc" });
    expect(result.map((t) => t.id)).toEqual(["1", "3", "2"]);
  });

  it("puts tasks without a due date last regardless of sort order", () => {
    const withDates = [
      makeTask({ id: "a", dueDate: null }),
      makeTask({ id: "b", dueDate: "2026-05-01T00:00:00.000Z" }),
    ];
    const asc = filterTasks(withDates, { ...DEFAULT_FILTERS, sort: "dueDate", order: "asc" });
    const desc = filterTasks(withDates, { ...DEFAULT_FILTERS, sort: "dueDate", order: "desc" });
    expect(asc.map((t) => t.id)).toEqual(["b", "a"]);
    expect(desc.map((t) => t.id)).toEqual(["b", "a"]);
  });

  it("sorts by title alphabetically", () => {
    const result = filterTasks(tasks, { ...DEFAULT_FILTERS, sort: "title", order: "asc" });
    expect(result.map((t) => t.title)).toEqual(["Lab report", "Read chapter 1", "Write essay"]);
  });
});
