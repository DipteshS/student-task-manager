import type { Course, Prisma, Subtask } from "@prisma/client";
import type { CourseDTO, SubtaskDTO, TaskDTO } from "@/lib/types";

export type TaskWithRelations = Prisma.TaskGetPayload<{
  include: { course: true; subtasks: true };
}>;

export function serializeCourse(course: Course): CourseDTO {
  return {
    id: course.id,
    name: course.name,
    color: course.color,
    userId: course.userId,
    createdAt: course.createdAt.toISOString(),
  };
}

export function serializeSubtask(subtask: Subtask): SubtaskDTO {
  return {
    id: subtask.id,
    title: subtask.title,
    completed: subtask.completed,
    order: subtask.order,
  };
}

export function serializeTask(task: TaskWithRelations): TaskDTO {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    dueDate: task.dueDate ? task.dueDate.toISOString() : null,
    priority: task.priority,
    status: task.status,
    tags: task.tags,
    recurrence: task.recurrence,
    order: task.order,
    completedAt: task.completedAt ? task.completedAt.toISOString() : null,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
    userId: task.userId,
    courseId: task.courseId,
    course: task.course ? serializeCourse(task.course) : null,
    subtasks: task.subtasks
      .slice()
      .sort((a, b) => a.order - b.order)
      .map(serializeSubtask),
  };
}
