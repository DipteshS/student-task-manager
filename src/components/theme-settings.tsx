"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { key: "light", label: "Light", icon: Sun },
  { key: "dark", label: "Dark", icon: Moon },
  { key: "system", label: "System", icon: Monitor },
] as const;

function noopSubscribe() {
  return () => {};
}

export function ThemeSettings() {
  const { theme, setTheme } = useTheme();
  const isMounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );
  const current = isMounted ? (theme ?? "system") : "system";

  return (
    <Card className="p-4">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-navy-700">
        Appearance
      </h2>
      <div className="flex gap-2">
        {OPTIONS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTheme(key)}
            className={cn(
              "flex flex-1 flex-col items-center gap-1.5 rounded-md border p-3 text-sm font-medium transition-colors",
              current === key
                ? "border-brand-900 bg-navy-50 text-navy-900"
                : "border-navy-200 text-navy-500 hover:bg-navy-50"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>
    </Card>
  );
}
