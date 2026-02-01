import { CATEGORY_COLORS, CATEGORY_LABELS, LEGEND_ORDER } from '@/types/calendar';

export function SlotLegend() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 px-4 py-3 bg-card/50 rounded-xl mx-4 border border-border">
      {LEGEND_ORDER.map((category) => {
        const colors = CATEGORY_COLORS[category];
        const label = CATEGORY_LABELS[category];
        
        return (
          <div key={category} className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded"
              style={{ backgroundColor: colors.hex }}
            />
            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
