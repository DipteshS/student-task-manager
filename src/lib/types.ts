export type Priority = "LOW" | "MEDIUM" | "HIGH";
export type TaskStatus = "PENDING" | "COMPLETED";
export type RecurrenceRule = "NONE" | "DAILY" | "WEEKDAYS" | "WEEKLY" | "MONTHLY";

export interface CourseDTO {
  id: string;
  name: string;
  color: string;
  userId: string;
  createdAt: string;
}

export interface SubtaskDTO {
  id: string;
  title: string;
  completed: boolean;
  order: number;
}

export interface TaskDTO {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  priority: Priority;
  status: TaskStatus;
  tags: string[];
  recurrence: RecurrenceRule;
  order: number;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
  courseId: string | null;
  course: CourseDTO | null;
  subtasks: SubtaskDTO[];
}
