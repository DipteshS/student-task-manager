import { Card } from "@/components/ui/card";
import { isOverdue } from "@/lib/task-helpers";
import type { TaskDTO } from "@/lib/types";

export function StatsCards({ tasks }: { tasks: TaskDTO[] }) {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "COMPLETED").length;
  const pending = total - completed;
  const overdue = tasks.filter(isOverdue).length;
  const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100);

  const stats = [
    { label: "Total tasks", value: total },
    { label: "Pending", value: pending },
    { label: "Completed", value: completed },
    { label: "Overdue", value: overdue, accent: overdue > 0 },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="border-t-2 border-t-gold-500 p-4">
          <p className="text-xs font-medium uppercase tracking-widest text-navy-400">
            {stat.label}
          </p>
          <p
            className={`mt-1 font-sans text-3xl font-semibold tabular-nums ${
              stat.accent ? "text-maroon-600" : "text-navy-900"
            }`}
          >
            {stat.value}
          </p>
        </Card>
      ))}
      <Card className="col-span-2 p-4 sm:col-span-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-widest text-navy-400">
            Completion rate
          </p>
          <p className="font-sans text-sm font-semibold tabular-nums text-navy-900">
            {completionRate}%
          </p>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-navy-50">
          <div
            className="h-full rounded-full bg-gold-500 transition-all"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </Card>
    </div>
  );
}
