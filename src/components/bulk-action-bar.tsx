"use client";

import { CheckCircle2, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import type { Priority } from "@/lib/types";

interface BulkActionBarProps {
  count: number;
  onComplete: () => void;
  onDelete: () => void;
  onSetPriority: (priority: Priority) => void;
  onCancel: () => void;
}

export function BulkActionBar({
  count,
  onComplete,
  onDelete,
  onSetPriority,
  onCancel,
}: BulkActionBarProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border-t-2 border-t-gold-500 bg-surface p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm font-medium text-navy-900">{count} selected</span>
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" onClick={onComplete}>
          <CheckCircle2 className="h-4 w-4" />
          Complete
        </Button>
        <Select
          defaultValue=""
          onChange={(e) => {
            if (e.target.value) onSetPriority(e.target.value as Priority);
            e.target.value = "";
          }}
          className="h-8 w-36 text-xs"
        >
          <option value="" disabled>
            Set priority...
          </option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </Select>
        <Button variant="destructive" size="sm" onClick={onDelete}>
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="h-4 w-4" />
          Cancel
        </Button>
      </div>
    </div>
  );
}
