"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { taskSchema, type TaskFormValues } from "@/lib/validations";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CourseSelect } from "@/components/course-select";
import { TagInput } from "@/components/tag-input";
import { SubtaskEditor } from "@/components/subtask-editor";
import type { CourseDTO, TaskDTO } from "@/lib/types";

interface TaskFormProps {
  initialTask?: TaskDTO | null;
  courses: CourseDTO[];
  onCourseCreated: (course: CourseDTO) => void;
  onSubmit: (values: TaskFormValues) => Promise<void> | void;
  onCancel: () => void;
  submitting: boolean;
}

function toDateInputValue(dueDate: string | null | undefined): string {
  if (!dueDate) return "";
  return dueDate.slice(0, 10);
}

export function TaskForm({
  initialTask,
  courses,
  onCourseCreated,
  onSubmit,
  onCancel,
  submitting,
}: TaskFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: initialTask?.title ?? "",
      description: initialTask?.description ?? "",
      dueDate: toDateInputValue(initialTask?.dueDate),
      priority: initialTask?.priority ?? "MEDIUM",
      courseId: initialTask?.courseId ?? "",
      tags: initialTask?.tags ?? [],
      recurrence: initialTask?.recurrence ?? "NONE",
      subtasks:
        initialTask?.subtasks.map((s) => ({ id: s.id, title: s.title, completed: s.completed })) ??
        [],
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-h-[75vh] space-y-4 overflow-y-auto pr-1">
      <div>
        <label htmlFor="task-title" className="mb-1 block text-sm font-medium text-navy-700">
          Title
        </label>
        <Input
          id="task-title"
          placeholder="e.g. Finish physics problem set"
          {...register("title")}
        />
        {errors.title && <p className="mt-1 text-xs text-maroon-600">{errors.title.message}</p>}
      </div>
      <div>
        <label htmlFor="task-description" className="mb-1 block text-sm font-medium text-navy-700">
          Description
        </label>
        <Textarea id="task-description" placeholder="Optional details" {...register("description")} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="task-due-date" className="mb-1 block text-sm font-medium text-navy-700">
            Due date
          </label>
          <Input id="task-due-date" type="date" {...register("dueDate")} />
        </div>
        <div>
          <label htmlFor="task-priority" className="mb-1 block text-sm font-medium text-navy-700">
            Priority
          </label>
          <Select id="task-priority" {...register("priority")}>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="task-course" className="mb-1 block text-sm font-medium text-navy-700">
            Course
          </label>
          <Controller
            control={control}
            name="courseId"
            render={({ field }) => (
              <CourseSelect
                id="task-course"
                courses={courses}
                value={field.value ?? ""}
                onChange={field.onChange}
                onCreate={onCourseCreated}
              />
            )}
          />
        </div>
        <div>
          <label htmlFor="task-recurrence" className="mb-1 block text-sm font-medium text-navy-700">
            Repeats
          </label>
          <Select id="task-recurrence" {...register("recurrence")}>
            <option value="NONE">Does not repeat</option>
            <option value="DAILY">Daily</option>
            <option value="WEEKDAYS">Every weekday</option>
            <option value="WEEKLY">Weekly</option>
            <option value="MONTHLY">Monthly</option>
          </Select>
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-navy-700">Tags</label>
        <Controller
          control={control}
          name="tags"
          render={({ field }) => <TagInput value={field.value} onChange={field.onChange} />}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-navy-700">Subtasks</label>
        <Controller
          control={control}
          name="subtasks"
          render={({ field }) => <SubtaskEditor value={field.value} onChange={field.onChange} />}
        />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : initialTask ? "Save changes" : "Create task"}
        </Button>
      </div>
    </form>
  );
}
