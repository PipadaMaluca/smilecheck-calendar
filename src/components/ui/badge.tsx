import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center shrink-0 whitespace-nowrap border font-semibold leading-tight transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-xs text-center rounded-md",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary-solid text-primary-foreground hover:bg-primary-solid/90",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
      },
      // Same inner padding/height as the consultation-type pills (24px total, border included); `count` = circular number-only counter.
      shape: {
        pill: "px-2 h-6",
        count: "min-w-6 h-6 px-1.5 rounded-full tabular-nums",
      },
    },
    defaultVariants: {
      variant: "default",
      shape: "pill",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(({ className, variant, shape, ...props }, ref) => (
  <div ref={ref} className={cn(badgeVariants({ variant, shape }), className)} {...props} />
));
Badge.displayName = "Badge";

/** Shared pill geometry (padding, height, radius) for hand-rolled pills such as consultation types/states. Never truncates. */
export const PILL_CLASS = "inline-flex items-center justify-center gap-1 shrink-0 whitespace-nowrap rounded-md font-semibold leading-tight px-2 h-6";

export { Badge, badgeVariants };
