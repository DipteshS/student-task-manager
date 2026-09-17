import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeTask } from "@/lib/serialize";
import { TaskCalendar } from "@/components/task-calendar";

export const metadata: Metadata = {
  title: "Calendar",
};

export default async function CalendarPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const tasks = await prisma.task.findMany({
    where: { userId: session.user.id },
    include: { course: true, subtasks: true },
  });

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
      <TaskCalendar tasks={tasks.map(serializeTask)} />
    </main>
  );
}
