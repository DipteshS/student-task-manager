import { z } from "zod";

export const subtaskInputSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(1, "Subtask title is required").max(200),
  completed: z.boolean(),
});

export const taskSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  dueDate: z.string().optional().or(z.literal("")),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  courseId: z.string().optional().or(z.literal("")).or(z.null()),
  tags: z.array(z.string().trim().min(1).max(30)).max(20),
  recurrence: z.enum(["NONE", "DAILY", "WEEKDAYS", "WEEKLY", "MONTHLY"]),
  subtasks: z.array(subtaskInputSchema).max(50),
});

export type TaskFormValues = z.infer<typeof taskSchema>;

export const courseSchema = z.object({
  name: z.string().trim().min(1, "Course name is required").max(50),
  color: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, "Color must be a hex value like #2c5282"),
});

export type CourseFormValues = z.infer<typeof courseSchema>;

export const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const passwordResetRequestSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
});

export const passwordResetConfirmSchema = z.object({
  token: z.string().min(1, "Missing reset token"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const accountUpdateSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  currentPassword: z.string().optional().or(z.literal("")),
  newPassword: z.string().min(8, "Password must be at least 8 characters").optional().or(z.literal("")),
});

export type AccountFormValues = z.infer<typeof accountUpdateSchema>;
