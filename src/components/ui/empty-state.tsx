import { cn } from "@/lib/utils";
import { Button } from "./button";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: string;
  lucideIcon?: LucideIcon;
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon,
  lucideIcon: LucideIconComp,
  title,
  subtitle,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 px-4 text-center", className)}>
      {icon && (
        <span className="text-5xl mb-4 opacity-80">{icon}</span>
      )}
      {LucideIconComp && !icon && (
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <LucideIconComp className="w-7 h-7 text-muted-foreground/60" />
        </div>
      )}
      <h3 className="text-lg font-bold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-xs">{subtitle}</p>
      {actionLabel && onAction && (
        <Button variant="outline" size="sm" className="mt-4 min-h-[44px]" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
