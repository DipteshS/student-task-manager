"use client";

import { ReactNode, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  children: ReactNode;
}

export function ContextMenu({ x, y, onClose, children }: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) onClose();
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("scroll", onClose, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("scroll", onClose, true);
    };
  }, [onClose]);

  const left = Math.min(x, window.innerWidth - 180);
  const top = Math.min(y, window.innerHeight - 160);

  return (
    <div
      ref={ref}
      style={{ left, top }}
      className="fixed z-50 min-w-[160px] rounded-md border border-navy-100 bg-surface py-1 shadow-xl"
    >
      {children}
    </div>
  );
}

export function ContextMenuItem({
  onClick,
  children,
  destructive,
}: {
  onClick: () => void;
  children: ReactNode;
  destructive?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-navy-700 hover:bg-navy-50",
        destructive && "text-maroon-600 hover:bg-maroon-100/40"
      )}
    >
      {children}
    </button>
  );
}

export function ContextMenuSeparator() {
  return <div className="my-1 h-px bg-navy-100" />;
}
