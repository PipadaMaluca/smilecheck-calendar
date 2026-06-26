import { CATEGORY_COLORS, CATEGORY_LABELS, LEGEND_ORDER , getCategoryLabel} from '@/types/calendar';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface CategoryLegendProps {
  className?: string;
  compact?: boolean;
}

export function CategoryLegend({
  className,
  compact = false
}: CategoryLegendProps) {
  const { t } = useTranslation();
  return (
    <div className={cn(
      "flex items-center gap-x-3 gap-y-1.5 px-4 py-2 border border-border bg-card/50 w-full overflow-x-auto whitespace-nowrap flex-nowrap scrollbar-thin",
      compact && 'gap-x-2 py-1.5',
      className
    )}>
      {LEGEND_ORDER.map(category => {
        const colors = CATEGORY_COLORS[category];
        const label = getCategoryLabel(t, category);
        return (
          <div key={category} className="flex items-center gap-1.5 flex-shrink-0">
            <div
              className={cn('rounded-full flex-shrink-0', compact ? 'w-1.5 h-1.5' : 'w-2 h-2')}
              style={{ backgroundColor: colors.hex }}
            />
            <span className={cn(
              'text-muted-foreground whitespace-nowrap',
              compact ? 'text-[11px]' : 'text-[11px]'
            )}>
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
