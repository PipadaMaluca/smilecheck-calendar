import { CATEGORY_COLORS, CATEGORY_LABELS, LEGEND_ORDER } from '@/types/calendar';
import { cn } from '@/lib/utils';

interface CategoryLegendProps {
  className?: string;
  compact?: boolean;
}

export function CategoryLegend({
  className,
  compact = false
}: CategoryLegendProps) {
  return (
    <div className={cn(
      "flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 px-4 py-2 border border-border bg-card/50",
      compact && 'gap-x-2 gap-y-1 py-1.5',
      className
    )}>
      {LEGEND_ORDER.map(category => {
        const colors = CATEGORY_COLORS[category];
        const label = CATEGORY_LABELS[category];
        return (
          <div key={category} className="flex items-center gap-1.5">
            <div
              className={cn('rounded flex-shrink-0', compact ? 'w-2.5 h-2.5' : 'w-3 h-3')}
              style={{ backgroundColor: colors.hex }}
            />
            <span className={cn(
              'text-muted-foreground whitespace-nowrap',
              compact ? 'text-[9px]' : 'text-[10px]'
            )}>
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
