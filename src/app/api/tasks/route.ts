import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { taskSchema } from "@/lib/validations";
import { serializeTask } from "@/lib/serialize";
import { withErrorHandling } from "@/lib/api-handler";

const taskInclude = { course: true, subtasks: true } as const;

export const GET = withErrorHandling(async (request: Request) => {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const priority = searchParams.get("priority");
  const courseId = searchParams.get("courseId");
  const search = searchParams.get("search");
  const sort = searchParams.get("sort") ?? "createdAt";
  const order: Prisma.SortOrder = searchParams.get("order") === "asc" ? "asc" : "desc";

  const where: Prisma.TaskWhereInput = {
    userId: session.user.id,
    ...(status === "PENDING" || status === "COMPLETED" ? { status } : {}),
    ...(priority === "LOW" || priority === "MEDIUM" || priority === "HIGH" ? { priority } : {}),
    ...(courseId ? { courseId } : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const orderBy: Prisma.TaskOrderByWithRelationInput =
    sort === "dueDate"
      ? { dueDate: order }
      : sort === "priority"
        ? { priority: order }
        : sort === "title"
          ? { title: order }
          : { createdAt: order };

  const tasks = await prisma.task.findMany({ where, orderBy, include: taskInclude });
  return NextResponse.json({ tasks: tasks.map(serializeTask) });
});

export const POST = withErrorHandling(async (request: Request) => {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = taskSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { title, description, dueDate, priority, courseId, tags, recurrence, subtasks } =
    parsed.data;

  if (courseId) {
    const course = await prisma.course.findFirst({
      where: { id: courseId, userId: session.user.id },
    });
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 400 });
    }
  }

  const task = await prisma.task.create({
    data: {
      title,
      description: description || null,
      dueDate: dueDate ? new Date(dueDate) : null,
      priority,
      courseId: courseId || null,
      tags,
      recurrence,
      userId: session.user.id,
      subtasks: {
        create: subtasks.map((subtask, index) => ({
          title: subtask.title,
          completed: subtask.completed,
          order: index,
        })),
      },
    },
    include: taskInclude,
  });

  return NextResponse.json({ task: serializeTask(task) }, { status: 201 });
});
