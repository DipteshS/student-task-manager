"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";

const ORDER = ["light", "dark", "system"] as const;
type ThemeChoice = (typeof ORDER)[number];

function noopSubscribe() {
  return () => {};
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isMounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );

  if (!isMounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="text-brand-100"
        aria-label="Toggle color theme"
        disabled
      >
        <Monitor className="h-4 w-4" />
      </Button>
    );
  }

  const current = (theme as ThemeChoice) ?? "system";
  const next = ORDER[(ORDER.indexOf(current) + 1) % ORDER.length];
  const Icon = current === "light" ? Sun : current === "dark" ? Moon : Monitor;

  return (
    <Button
      variant="ghost"
      size="icon"
      className="text-brand-100 hover:bg-brand-900 hover:text-white"
      onClick={() => setTheme(next)}
      title={`Theme: ${current} (click for ${next})`}
      aria-label="Toggle color theme"
    >
      <Icon className="h-4 w-4" />
    </Button>
  );
}
