import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { taskSchema } from "@/lib/validations";
import { serializeTask, type TaskWithRelations } from "@/lib/serialize";
import { computeNextDueDate } from "@/lib/recurrence";

const taskInclude = { course: true, subtasks: true } as const;

async function getOwnedTask(id: string, userId: string): Promise<TaskWithRelations | null> {
  const task = await prisma.task.findUnique({ where: { id }, include: taskInclude });
  if (!task || task.userId !== userId) return null;
  return task;
}

const QUICK_UPDATE_KEYS = new Set(["status", "order", "title", "priority"]);

function isQuickUpdate(
  body: unknown
): body is { status?: string; order?: number; title?: string; priority?: string } {
  if (!body || typeof body !== "object") return false;
  const keys = Object.keys(body);
  return keys.length > 0 && keys.every((key) => QUICK_UPDATE_KEYS.has(key));
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await getOwnedTask(id, session.user.id);
  if (!existing) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);

  if (isQuickUpdate(body)) {
    const data: {
      status?: "PENDING" | "COMPLETED";
      order?: number;
      completedAt?: Date | null;
      title?: string;
      priority?: "LOW" | "MEDIUM" | "HIGH";
    } = {};

    if (body.status !== undefined) {
      const nextStatus = body.status === "COMPLETED" ? "COMPLETED" : "PENDING";
      data.status = nextStatus;
      data.completedAt = nextStatus === "COMPLETED" ? new Date() : null;
    }
    if (typeof body.order === "number") {
      data.order = body.order;
    }
    if (typeof body.title === "string") {
      const trimmed = body.title.trim();
      if (!trimmed) {
        return NextResponse.json({ error: "Title is required" }, { status: 400 });
      }
      data.title = trimmed.slice(0, 200);
    }
    if (body.priority === "LOW" || body.priority === "MEDIUM" || body.priority === "HIGH") {
      data.priority = body.priority;
    }

    const task = await prisma.task.update({ where: { id }, data, include: taskInclude });

    let nextTask: TaskWithRelations | null = null;
    const justCompleted = data.status === "COMPLETED" && existing.status !== "COMPLETED";
    if (justCompleted && existing.recurrence !== "NONE" && existing.dueDate) {
      const nextDueDate = computeNextDueDate(existing.dueDate, existing.recurrence);
      if (nextDueDate) {
        nextTask = await prisma.task.create({
          data: {
            title: existing.title,
            description: existing.description,
            dueDate: nextDueDate,
            priority: existing.priority,
            courseId: existing.courseId,
            tags: existing.tags,
            recurrence: existing.recurrence,
            userId: existing.userId,
            subtasks: {
              create: existing.subtasks.map((subtask, index) => ({
                title: subtask.title,
                completed: false,
                order: index,
              })),
            },
          },
          include: taskInclude,
        });
      }
    }

    return NextResponse.json({
      task: serializeTask(task),
      ...(nextTask ? { nextTask: serializeTask(nextTask) } : {}),
    });
  }

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

  const [, task] = await prisma.$transaction([
    prisma.subtask.deleteMany({ where: { taskId: id } }),
    prisma.task.update({
      where: { id },
      data: {
        title,
        description: description || null,
        dueDate: dueDate ? new Date(dueDate) : null,
        priority,
        courseId: courseId || null,
        tags,
        recurrence,
        subtasks: {
          create: subtasks.map((subtask, index) => ({
            title: subtask.title,
            completed: subtask.completed,
            order: index,
          })),
        },
      },
      include: taskInclude,
    }),
  ]);

  return NextResponse.json({ task: serializeTask(task) });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await getOwnedTask(id, session.user.id);
  if (!existing) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  await prisma.task.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
