import { forwardRef, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/**
 * Full-screen mobile overlay panel used for profile views, dossiers, search,
 * invite, edit-profile, full history, etc.
 *
 * Encapsulates the repeated `fixed inset-0 bg-background z-[60] flex flex-col pb-[60px]`
 * pattern. Consumers can override the z-index or extend padding via `className`
 * (tailwind-merge picks the last value).
 */
export const FullScreenMobileOverlay = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "fixed inset-0 bg-background z-[60] flex flex-col pb-[60px]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  ),
);
FullScreenMobileOverlay.displayName = "FullScreenMobileOverlay";