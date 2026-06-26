import { forwardRef, ComponentPropsWithoutRef, ElementRef } from "react";
import { TabsList } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

/**
 * Thin wrapper around Radix/shadcn `TabsList` that enables horizontal scroll
 * with a subtle right-edge fade as an affordance for additional tabs.
 * Use only for real Radix TabsList instances that overflow.
 */
export const ScrollableTabsList = forwardRef<
  ElementRef<typeof TabsList>,
  ComponentPropsWithoutRef<typeof TabsList>
>(({ className, children, ...props }, ref) => (
  <div className="relative">
    <TabsList
      ref={ref}
      className={cn(
        "w-full overflow-x-auto flex-nowrap justify-start scrollbar-thin",
        className,
      )}
      {...props}
    >
      {children}
    </TabsList>
    <div
      aria-hidden
      className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-background to-transparent rounded-r-md"
    />
  </div>
));
ScrollableTabsList.displayName = "ScrollableTabsList";