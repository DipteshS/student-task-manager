"use client";

import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { LogOut, Plus, Search as SearchIcon } from "lucide-react";
import type { TaskDTO } from "@/lib/types";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tasks: TaskDTO[];
  onNewTask: () => void;
  onOpenTask: (task: TaskDTO) => void;
}

export function CommandPalette({
  open,
  onOpenChange,
  tasks,
  onNewTask,
  onOpenTask,
}: CommandPaletteProps) {
  const router = useRouter();

  function run(action: () => void) {
    onOpenChange(false);
    action();
  }

  return (
    <Command.Dialog
      open={open}
      onOpenChange={onOpenChange}
      label="Command palette"
      className="fixed left-1/2 top-24 z-50 w-full max-w-lg -translate-x-1/2 overflow-hidden rounded-xl border-t-4 border-gold-500 bg-surface shadow-2xl"
      overlayClassName="fixed inset-0 z-50 bg-navy-950/50"
      contentClassName=""
    >
      <div className="flex items-center gap-2 border-b border-navy-100 px-4 py-3">
        <SearchIcon className="h-4 w-4 text-navy-300" />
        <Command.Input
          placeholder="Type a command or search tasks..."
          className="w-full bg-transparent text-sm text-navy-900 outline-none placeholder:text-navy-300"
        />
      </div>
      <Command.List className="max-h-80 overflow-y-auto p-2">
        <Command.Empty className="px-3 py-6 text-center text-sm text-navy-400">
          No results found.
        </Command.Empty>

        <Command.Group heading="Actions" className="px-2 py-1 text-xs font-medium uppercase tracking-wide text-navy-300 [&_[cmdk-group-items]]:mt-1">
          <Command.Item
            onSelect={() => run(onNewTask)}
            className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm text-navy-700 aria-selected:bg-navy-50"
          >
            <Plus className="h-4 w-4" />
            New task
          </Command.Item>
          <Command.Item
            onSelect={() => run(() => router.push("/tasks"))}
            className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm text-navy-700 aria-selected:bg-navy-50"
          >
            Go to Tasks
          </Command.Item>
          <Command.Item
            onSelect={() => run(() => signOut({ callbackUrl: "/login" }))}
            className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm text-navy-700 aria-selected:bg-navy-50"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Command.Item>
        </Command.Group>

        {tasks.length > 0 && (
          <Command.Group heading="Tasks" className="px-2 py-1 text-xs font-medium uppercase tracking-wide text-navy-300 [&_[cmdk-group-items]]:mt-1">
            {tasks.slice(0, 50).map((task) => (
              <Command.Item
                key={task.id}
                value={task.title}
                onSelect={() => run(() => onOpenTask(task))}
                className="flex cursor-pointer items-center justify-between rounded-md px-2 py-2 text-sm text-navy-700 aria-selected:bg-navy-50"
              >
                <span className="truncate">{task.title}</span>
                {task.status === "COMPLETED" && (
                  <span className="text-xs text-navy-300">Done</span>
                )}
              </Command.Item>
            ))}
          </Command.Group>
        )}
      </Command.List>
    </Command.Dialog>
  );
}
