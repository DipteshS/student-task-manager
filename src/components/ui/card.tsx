import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl border border-navy-100 bg-surface shadow-[0_1px_3px_rgba(14,31,54,0.08)]",
        className
      )}
      {...props}
    />
  );
}
