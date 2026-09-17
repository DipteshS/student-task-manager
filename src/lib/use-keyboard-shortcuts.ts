import { useEffect } from "react";

interface ShortcutHandlers {
  onNewTask: () => void;
  onFocusSearch: () => void;
  onOpenPalette: () => void;
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable;
}

export function useKeyboardShortcuts({ onNewTask, onFocusSearch, onOpenPalette }: ShortcutHandlers) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const isPaletteCombo = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
      if (isPaletteCombo) {
        event.preventDefault();
        onOpenPalette();
        return;
      }

      if (isTypingTarget(event.target) || event.metaKey || event.ctrlKey || event.altKey) return;

      if (event.key === "n") {
        event.preventDefault();
        onNewTask();
      } else if (event.key === "/") {
        event.preventDefault();
        onFocusSearch();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onNewTask, onFocusSearch, onOpenPalette]);
}
