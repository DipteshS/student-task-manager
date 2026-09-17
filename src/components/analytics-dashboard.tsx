"use client";

import { useMemo } from "react";
import { format, subDays, differenceInHours } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Card } from "@/components/ui/card";
import { computeStreak } from "@/lib/streak";
import type { TaskDTO } from "@/lib/types";

const COURSE_FALLBACK_COLOR = "#8a94a6";

export function AnalyticsDashboard({ tasks }: { tasks: TaskDTO[] }) {
  const streak = useMemo(() => computeStreak(tasks), [tasks]);

  const completionsByDay = useMemo(() => {
    const days = Array.from({ length: 30 }, (_, i) => subDays(new Date(), 29 - i));
    const counts = new Map<string, number>();
    tasks.forEach((t) => {
      if (t.status === "COMPLETED" && t.completedAt) {
        const key = format(new Date(t.completedAt), "yyyy-MM-dd");
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
    });
    return days.map((d) => {
      const key = format(d, "yyyy-MM-dd");
      return { date: format(d, "MMM d"), count: counts.get(key) ?? 0 };
    });
  }, [tasks]);

  const byCourse = useMemo(() => {
    const counts = new Map<string, { name: string; color: string; count: number }>();
    tasks.forEach((t) => {
      const key = t.course?.id ?? "none";
      const name = t.course?.name ?? "No course";
      const color = t.course?.color ?? COURSE_FALLBACK_COLOR;
      const existing = counts.get(key);
      if (existing) existing.count += 1;
      else counts.set(key, { name, color, count: 1 });
    });
    return Array.from(counts.values());
  }, [tasks]);

  const avgCompletionHours = useMemo(() => {
    const hours: number[] = [];
    tasks.forEach((t) => {
      if (t.status === "COMPLETED" && t.completedAt) {
        hours.push(differenceInHours(new Date(t.completedAt), new Date(t.createdAt)));
      }
    });
    if (hours.length === 0) return null;
    return Math.round(hours.reduce((a, b) => a + b, 0) / hours.length);
  }, [tasks]);

  const completed = tasks.filter((t) => t.status === "COMPLETED").length;
  const completionRate = tasks.length === 0 ? 0 : Math.round((completed / tasks.length) * 100);

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-2xl font-semibold text-navy-900">Analytics</h1>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="border-t-2 border-t-gold-500 p-4">
          <p className="text-xs font-medium uppercase tracking-widest text-navy-400">
            Current streak
          </p>
          <p className="mt-1 font-sans text-3xl font-semibold tabular-nums text-navy-900">
            {streak} {streak === 1 ? "day" : "days"}
          </p>
        </Card>
        <Card className="border-t-2 border-t-gold-500 p-4">
          <p className="text-xs font-medium uppercase tracking-widest text-navy-400">
            Completion rate
          </p>
          <p className="mt-1 font-sans text-3xl font-semibold tabular-nums text-navy-900">{completionRate}%</p>
        </Card>
        <Card className="border-t-2 border-t-gold-500 p-4">
          <p className="text-xs font-medium uppercase tracking-widest text-navy-400">
            Avg. time to complete
          </p>
          <p className="mt-1 font-sans text-3xl font-semibold tabular-nums text-navy-900">
            {avgCompletionHours === null
              ? "—"
              : avgCompletionHours < 24
                ? `${avgCompletionHours}h`
                : `${Math.round(avgCompletionHours / 24)}d`}
          </p>
        </Card>
        <Card className="border-t-2 border-t-gold-500 p-4">
          <p className="text-xs font-medium uppercase tracking-widest text-navy-400">
            Total tasks
          </p>
          <p className="mt-1 font-sans text-3xl font-semibold tabular-nums text-navy-900">{tasks.length}</p>
        </Card>
      </div>

      <Card className="p-4">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-navy-700">
          Completions — last 30 days
        </h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={completionsByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="#dbe7f3" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#5c85b3" }} interval={4} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#5c85b3" }} />
              <Tooltip contentStyle={{ borderRadius: 8, borderColor: "#dbe7f3", fontSize: 12 }} />
              <Bar dataKey="count" fill="#a9832f" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {byCourse.length > 0 && (
        <Card className="p-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-navy-700">
            Tasks by course
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={byCourse}
                  dataKey="count"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                >
                  {byCourse.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, borderColor: "#dbe7f3", fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex flex-wrap gap-3">
            {byCourse.map((entry) => (
              <span key={entry.name} className="flex items-center gap-1.5 text-xs text-navy-600">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.name} ({entry.count})
              </span>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
