import { cn } from '@/lib/utils';
import { ViewMode, UserRole } from '@/types/calendar';

interface ViewModeSelectorProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  userRole: UserRole;
}

export function ViewModeSelector({
  viewMode,
  onViewModeChange,
  userRole
}: ViewModeSelectorProps) {
  // Patient only has list and day views
  // Order: Day, 3 Days (if not patient), List
  const modes: {
    id: ViewMode;
    label: string;
  }[] = userRole === 'patient' ? [{
    id: 'day',
    label: 'Dia'
  }, {
    id: 'list',
    label: 'Lista'
  }] : [{
    id: 'day',
    label: 'Dia'
  }, {
    id: 'three-day',
    label: '3 Dias'
  }, {
    id: 'list',
    label: 'Lista'
  }];

  return (
    <div className="px-4 py-2 w-full">
      <div className="flex items-center justify-center gap-2 w-full">
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => onViewModeChange(mode.id)}
            className={cn(
              'px-4 py-2 text-xs font-medium rounded-lg transition-colors flex-1 max-w-[100px] text-center',
              viewMode === mode.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary/30 text-muted-foreground hover:bg-secondary/50'
            )}
          >
            {mode.label}
          </button>
        ))}
      </div>
    </div>
  );
}