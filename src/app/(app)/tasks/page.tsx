import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeCourse, serializeTask } from "@/lib/serialize";
import { TaskManager } from "@/components/task-manager";

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { search } = await searchParams;

  const [tasks, courses] = await Promise.all([
    prisma.task.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: { course: true, subtasks: true },
    }),
    prisma.course.findMany({
      where: { userId: session.user.id },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
      <TaskManager
        initialTasks={tasks.map(serializeTask)}
        initialCourses={courses.map(serializeCourse)}
        initialSearch={search ?? ""}
      />
    </main>
  );
}
