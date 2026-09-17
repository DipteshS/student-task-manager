"use client";

import { useState } from "react";
import { Trash2, Check, X } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { CourseDTO } from "@/lib/types";

const COLOR_SWATCHES = ["#2c5282", "#a9832f", "#7d3230", "#3f5d43", "#6b4c9a", "#c2410c"];

function ColorSwatchPicker({ value, onChange }: { value: string; onChange: (color: string) => void }) {
  return (
    <div className="flex items-center gap-1">
      {COLOR_SWATCHES.map((swatch) => (
        <button
          key={swatch}
          type="button"
          onClick={() => onChange(swatch)}
          className={`h-5 w-5 rounded-full ${
            value === swatch ? "ring-2 ring-offset-1 ring-brand-900" : ""
          }`}
          style={{ backgroundColor: swatch }}
          aria-label={`Choose color ${swatch}`}
        />
      ))}
    </div>
  );
}

export function CourseManager({ initialCourses }: { initialCourses: CourseDTO[] }) {
  const [courses, setCourses] = useState<CourseDTO[]>(initialCourses);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [draftColor, setDraftColor] = useState(COLOR_SWATCHES[0]);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(COLOR_SWATCHES[0]);
  const [submitting, setSubmitting] = useState(false);

  function startEdit(course: CourseDTO) {
    setEditingId(course.id);
    setDraftName(course.name);
    setDraftColor(course.color);
  }

  async function saveEdit(id: string) {
    if (!draftName.trim()) return;
    setSubmitting(true);
    const res = await fetch(`/api/courses/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: draftName.trim(), color: draftColor }),
    });
    setSubmitting(false);
    if (!res.ok) {
      toast.error("Could not update course");
      return;
    }
    const data = await res.json().catch(() => ({}));
    if (data.course) {
      setCourses((prev) => prev.map((c) => (c.id === id ? data.course : c)));
      setEditingId(null);
      toast.success("Course updated");
    }
  }

  async function deleteCourse(id: string) {
    const previous = courses;
    setCourses((prev) => prev.filter((c) => c.id !== id));
    const res = await fetch(`/api/courses/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setCourses(previous);
      toast.error("Could not delete course");
    } else {
      toast.success("Course deleted");
    }
  }

  async function addCourse() {
    if (!newName.trim()) return;
    setSubmitting(true);
    const res = await fetch("/api/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim(), color: newColor }),
    });
    setSubmitting(false);
    if (!res.ok) {
      toast.error("Could not create course");
      return;
    }
    const data = await res.json().catch(() => ({}));
    if (data.course) {
      setCourses((prev) => [...prev, data.course]);
      setNewName("");
      toast.success("Course added");
    }
  }

  return (
    <Card className="p-4">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-navy-700">Courses</h2>
      <div className="space-y-2">
        {courses.map((course) => (
          <div
            key={course.id}
            className="flex items-center gap-2 rounded-md border border-navy-100 p-2"
          >
            {editingId === course.id ? (
              <>
                <Input
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  className="flex-1"
                />
                <ColorSwatchPicker value={draftColor} onChange={setDraftColor} />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => saveEdit(course.id)}
                  disabled={submitting}
                  aria-label="Save course"
                >
                  <Check className="h-4 w-4 text-forest-600" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setEditingId(null)}
                  aria-label="Cancel edit"
                >
                  <X className="h-4 w-4 text-navy-400" />
                </Button>
              </>
            ) : (
              <>
                <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: course.color }} />
                <button
                  type="button"
                  className="flex-1 text-left text-sm text-navy-900"
                  onClick={() => startEdit(course)}
                >
                  {course.name}
                </button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => deleteCourse(course.id)}
                  aria-label="Delete course"
                >
                  <Trash2 className="h-4 w-4 text-maroon-600" />
                </Button>
              </>
            )}
          </div>
        ))}
        {courses.length === 0 && <p className="text-sm text-navy-400">No courses yet.</p>}
      </div>

      <div className="mt-4 flex items-center gap-2 border-t border-navy-100 pt-4">
        <Input
          placeholder="New course name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="flex-1"
        />
        <ColorSwatchPicker value={newColor} onChange={setNewColor} />
        <Button onClick={addCourse} disabled={submitting}>
          Add
        </Button>
      </div>
    </Card>
  );
}
