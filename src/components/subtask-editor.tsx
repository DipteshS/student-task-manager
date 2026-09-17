"use client";

import { useState, type KeyboardEvent } from "react";
import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export interface SubtaskDraft {
  id?: string;
  title: string;
  completed: boolean;
}

interface SubtaskEditorProps {
  value: SubtaskDraft[];
  onChange: (subtasks: SubtaskDraft[]) => void;
}

export function SubtaskEditor({ value, onChange }: SubtaskEditorProps) {
  const [draft, setDraft] = useState("");

  function addSubtask() {
    const title = draft.trim();
    if (!title) return;
    onChange([...value, { title, completed: false }]);
    setDraft("");
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      addSubtask();
    }
  }

  return (
    <div className="space-y-2">
      {value.map((subtask, index) => (
        <div key={subtask.id ?? `draft-${index}`} className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={subtask.completed}
            onChange={(e) => {
              const next = [...value];
              next[index] = { ...subtask, completed: e.target.checked };
              onChange(next);
            }}
            className="h-4 w-4 shrink-0 rounded border-navy-300 text-navy-900 focus:ring-navy-700"
          />
          <input
            value={subtask.title}
            onChange={(e) => {
              const next = [...value];
              next[index] = { ...subtask, title: e.target.value };
              onChange(next);
            }}
            className="flex-1 rounded border border-navy-200 px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-navy-700"
          />
          <button
            type="button"
            onClick={() => onChange(value.filter((_, i) => i !== index))}
            aria-label="Remove subtask"
            className="shrink-0 text-navy-300 hover:text-maroon-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
      <div className="flex items-center gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Add a subtask..."
          className="flex-1"
        />
        <Button type="button" variant="outline" size="sm" onClick={addSubtask}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
