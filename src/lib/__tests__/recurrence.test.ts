import { describe, it, expect } from "vitest";
import { computeNextDueDate } from "@/lib/recurrence";

describe("computeNextDueDate", () => {
  it("returns null for NONE", () => {
    expect(computeNextDueDate(new Date("2026-03-10T00:00:00.000Z"), "NONE")).toBeNull();
  });

  it("adds one day for DAILY", () => {
    const next = computeNextDueDate(new Date("2026-03-10T00:00:00.000Z"), "DAILY");
    expect(next?.toISOString().slice(0, 10)).toBe("2026-03-11");
  });

  it("adds one week for WEEKLY", () => {
    const next = computeNextDueDate(new Date("2026-03-10T00:00:00.000Z"), "WEEKLY");
    expect(next?.toISOString().slice(0, 10)).toBe("2026-03-17");
  });

  it("adds one month for MONTHLY", () => {
    const next = computeNextDueDate(new Date("2026-01-31T00:00:00.000Z"), "MONTHLY");
    // date-fns clamps to the shorter month rather than overflowing
    expect(next?.getUTCMonth()).toBe(1);
  });

  it("skips the weekend for WEEKDAYS when landing on Saturday or Sunday", () => {
    // 2026-03-13 is a Friday
    const fromFriday = new Date("2026-03-13T00:00:00.000Z");
    const next = computeNextDueDate(fromFriday, "WEEKDAYS");
    // should skip Saturday (14th) and Sunday (15th), landing on Monday the 16th
    expect(next?.toISOString().slice(0, 10)).toBe("2026-03-16");
  });

  it("moves to the very next day for WEEKDAYS when that day is a weekday", () => {
    // 2026-03-10 is a Tuesday
    const fromTuesday = new Date("2026-03-10T00:00:00.000Z");
    const next = computeNextDueDate(fromTuesday, "WEEKDAYS");
    expect(next?.toISOString().slice(0, 10)).toBe("2026-03-11");
  });
});
