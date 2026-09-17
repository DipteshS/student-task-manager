import { addDays, addMonths, addWeeks, getDay } from "date-fns";
import type { RecurrenceRule } from "@/lib/types";

export function computeNextDueDate(from: Date, rule: RecurrenceRule): Date | null {
  switch (rule) {
    case "DAILY":
      return addDays(from, 1);
    case "WEEKLY":
      return addWeeks(from, 1);
    case "MONTHLY":
      return addMonths(from, 1);
    case "WEEKDAYS": {
      let next = addDays(from, 1);
      while (getDay(next) === 0 || getDay(next) === 6) {
        next = addDays(next, 1);
      }
      return next;
    }
    default:
      return null;
  }
}
