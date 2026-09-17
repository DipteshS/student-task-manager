import { format, subDays } from "date-fns";
import type { TaskDTO } from "@/lib/types";

export function computeStreak(tasks: TaskDTO[]): number {
  const completedDays = new Set<string>();
  tasks.forEach((task) => {
    if (task.status === "COMPLETED" && task.completedAt) {
      completedDays.add(format(new Date(task.completedAt), "yyyy-MM-dd"));
    }
  });

  let streak = 0;
  let cursor = new Date();
  while (completedDays.has(format(cursor, "yyyy-MM-dd"))) {
    streak += 1;
    cursor = subDays(cursor, 1);
  }
  return streak;
}
