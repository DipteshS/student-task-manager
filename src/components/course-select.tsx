"use client";

import { useState } from "react";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { CourseDTO } from "@/lib/types";

const COLOR_SWATCHES = ["#2c5282", "#a9832f", "#7d3230", "#3f5d43", "#6b4c9a", "#c2410c"];

interface CourseSelectProps {
  id?: string;
  courses: CourseDTO[];
  value: string;
  onChange: (courseId: string) => void;
  onCreate: (course: CourseDTO) => void;
}

export function CourseSelect({ id, courses, value, onChange, onCreate }: CourseSelectProps) {
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLOR_SWATCHES[0]);
  const [submitting, setSubmitting] = useState(false);

  async function handleCreate() {
    const trimmed = name.trim();
    if (!trimmed) return;
    setSubmitting(true);
    const res = await fetch("/api/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: trimmed, color }),
    });
    setSubmitting(false);
    if (!res.ok) return;
    const data = await res.json().catch(() => ({}));
    if (data.course) {
      onCreate(data.course);
      onChange(data.course.id);
      setCreating(false);
      setName("");
    }
  }

  if (creating) {
    return (
      <div className="space-y-2 rounded-md border border-navy-200 p-3">
        <Input
          autoFocus
          placeholder="Course name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div className="flex items-center gap-1.5">
          {COLOR_SWATCHES.map((swatch) => (
            <button
              key={swatch}
              type="button"
              onClick={() => setColor(swatch)}
              className={`h-5 w-5 rounded-full ${
                color === swatch ? "ring-2 ring-offset-1 ring-brand-900" : ""
              }`}
              style={{ backgroundColor: swatch }}
              aria-label={`Choose color ${swatch}`}
            />
          ))}
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => setCreating(false)}>
            Cancel
          </Button>
          <Button type="button" size="sm" disabled={submitting} onClick={handleCreate}>
            Add course
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Select
      id={id}
      value={value}
      onChange={(e) => {
        if (e.target.value === "__new__") {
          setCreating(true);
          return;
        }
        onChange(e.target.value);
      }}
    >
      <option value="">No course</option>
      {courses.map((course) => (
        <option key={course.id} value={course.id}>
          {course.name}
        </option>
      ))}
      <option value="__new__">+ New course...</option>
    </Select>
  );
}
