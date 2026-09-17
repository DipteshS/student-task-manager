import { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "border-navy-100 bg-navy-50 text-navy-700",
        low: "border-forest-100 bg-forest-100 text-forest-600",
        medium: "border-gold-100 bg-gold-100 text-gold-600",
        high: "border-maroon-100 bg-maroon-100 text-maroon-600",
        success: "border-forest-100 bg-forest-100 text-forest-600",
        overdue: "border-maroon-100 bg-maroon-100 text-maroon-600",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
