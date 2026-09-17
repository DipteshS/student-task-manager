import { describe, it, expect } from "vitest";
import {
  taskSchema,
  courseSchema,
  registerSchema,
  loginSchema,
  passwordResetConfirmSchema,
  accountUpdateSchema,
} from "@/lib/validations";

const baseTask = {
  title: "Finish reading",
  description: "",
  dueDate: "",
  priority: "MEDIUM" as const,
  courseId: "",
  tags: [],
  recurrence: "NONE" as const,
  subtasks: [],
};

describe("taskSchema", () => {
  it("accepts a minimal valid task", () => {
    expect(taskSchema.safeParse(baseTask).success).toBe(true);
  });

  it("rejects an empty title", () => {
    const result = taskSchema.safeParse({ ...baseTask, title: "  " });
    expect(result.success).toBe(false);
  });

  it("rejects a title over 200 characters", () => {
    const result = taskSchema.safeParse({ ...baseTask, title: "a".repeat(201) });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid priority", () => {
    const result = taskSchema.safeParse({ ...baseTask, priority: "URGENT" });
    expect(result.success).toBe(false);
  });

  it("rejects more than 20 tags", () => {
    const tags = Array.from({ length: 21 }, (_, i) => `tag-${i}`);
    const result = taskSchema.safeParse({ ...baseTask, tags });
    expect(result.success).toBe(false);
  });

  it("rejects a subtask with an empty title", () => {
    const result = taskSchema.safeParse({
      ...baseTask,
      subtasks: [{ title: "  ", completed: false }],
    });
    expect(result.success).toBe(false);
  });
});

describe("courseSchema", () => {
  it("accepts a valid hex color", () => {
    expect(courseSchema.safeParse({ name: "Biology", color: "#2c5282" }).success).toBe(true);
  });

  it("rejects a non-hex color", () => {
    expect(courseSchema.safeParse({ name: "Biology", color: "blue" }).success).toBe(false);
  });

  it("rejects an empty course name", () => {
    expect(courseSchema.safeParse({ name: "", color: "#2c5282" }).success).toBe(false);
  });
});

describe("registerSchema", () => {
  it("rejects a password shorter than 8 characters", () => {
    const result = registerSchema.safeParse({
      name: "Jane",
      email: "jane@school.edu",
      password: "short",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const result = registerSchema.safeParse({
      name: "Jane",
      email: "not-an-email",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("accepts valid registration details", () => {
    const result = registerSchema.safeParse({
      name: "Jane",
      email: "jane@school.edu",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });
});

describe("loginSchema", () => {
  it("rejects an empty password", () => {
    expect(loginSchema.safeParse({ email: "a@b.com", password: "" }).success).toBe(false);
  });
});

describe("passwordResetConfirmSchema", () => {
  it("rejects a missing token", () => {
    const result = passwordResetConfirmSchema.safeParse({ token: "", password: "password123" });
    expect(result.success).toBe(false);
  });

  it("accepts a valid token and password", () => {
    const result = passwordResetConfirmSchema.safeParse({
      token: "abc123",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });
});

describe("accountUpdateSchema", () => {
  it("allows updating just the name with blank password fields", () => {
    const result = accountUpdateSchema.safeParse({
      name: "New Name",
      currentPassword: "",
      newPassword: "",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a new password shorter than 8 characters", () => {
    const result = accountUpdateSchema.safeParse({
      name: "New Name",
      currentPassword: "oldpassword",
      newPassword: "short",
    });
    expect(result.success).toBe(false);
  });
});
