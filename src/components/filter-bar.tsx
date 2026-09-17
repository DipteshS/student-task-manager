"use client";

import { forwardRef } from "react";
import { Search, Plus, ListChecks } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { TaskFilters } from "@/lib/task-helpers";

interface FilterBarProps {
  filters: TaskFilters;
  onChange: (filters: TaskFilters) => void;
  onNewTask: () => void;
  selectMode: boolean;
  onToggleSelectMode: () => void;
  availableTags: string[];
}

export const FilterBar = forwardRef<HTMLInputElement, FilterBarProps>(function FilterBar(
  { filters, onChange, onNewTask, selectMode, onToggleSelectMode, availableTags },
  searchRef
) {
  function toggleTag(tag: string) {
    const active = filters.tags.includes(tag);
    onChange({
      ...filters,
      tags: active ? filters.tags.filter((t) => t !== tag) : [...filters.tags, tag],
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-300" />
            <Input
              ref={searchRef}
              placeholder="Search tasks..."
              className="pl-9"
              value={filters.search}
              onChange={(e) => onChange({ ...filters, search: e.target.value })}
            />
          </div>
          <Select
            value={filters.status}
            onChange={(e) =>
              onChange({ ...filters, status: e.target.value as TaskFilters["status"] })
            }
            className="sm:w-40"
          >
            <option value="ALL">All statuses</option>
            <option value="PENDING">Pending</option>
            <option value="COMPLETED">Completed</option>
          </Select>
          <Select
            value={filters.priority}
            onChange={(e) =>
              onChange({ ...filters, priority: e.target.value as TaskFilters["priority"] })
            }
            className="sm:w-40"
          >
            <option value="ALL">All priorities</option>
            <option value="HIGH">High priority</option>
            <option value="MEDIUM">Medium priority</option>
            <option value="LOW">Low priority</option>
          </Select>
          <Select
            value={`${filters.sort}:${filters.order}`}
            onChange={(e) => {
              const [sort, order] = e.target.value.split(":") as [
                TaskFilters["sort"],
                TaskFilters["order"],
              ];
              onChange({ ...filters, sort, order });
            }}
            className="sm:w-44"
          >
            <option value="createdAt:desc">Newest first</option>
            <option value="createdAt:asc">Oldest first</option>
            <option value="dueDate:asc">Due date (soonest)</option>
            <option value="dueDate:desc">Due date (latest)</option>
            <option value="priority:desc">Priority (high to low)</option>
            <option value="title:asc">Title (A-Z)</option>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button
            variant={selectMode ? "default" : "outline"}
            onClick={onToggleSelectMode}
            title="Select multiple tasks"
          >
            <ListChecks className="h-4 w-4" />
            {selectMode ? "Done" : "Select"}
          </Button>
          <Button onClick={onNewTask}>
            <Plus className="h-4 w-4" />
            New task
          </Button>
        </div>
      </div>

      {availableTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {availableTags.map((tag) => {
            const active = filters.tags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={cn(
                  "rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
                  active
                    ? "border-gold-500 bg-gold-100 text-gold-600"
                    : "border-navy-100 bg-surface text-navy-500 hover:bg-navy-50"
                )}
              >
                {tag}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
});
