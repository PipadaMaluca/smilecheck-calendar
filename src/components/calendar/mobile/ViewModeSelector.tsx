import { cn } from '@/lib/utils';
import { ViewMode, UserRole } from '@/types/calendar';

interface ViewModeSelectorProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  userRole: UserRole;
}

export function ViewModeSelector({ viewMode, onViewModeChange, userRole }: ViewModeSelectorProps) {
  // Patient only has list and day views
  const modes: { id: ViewMode; label: string }[] = userRole === 'patient'
    ? [
        { id: 'list', label: 'Lista' },
        { id: 'day', label: 'Dia' },
      ]
    : [
        { id: 'list', label: 'Lista' },
        { id: 'day', label: 'Dia' },
        { id: 'three-day', label: '3 Dias' },
      ];

  return (
    <div className="px-4 py-2">
      <div className="flex items-center justify-center gap-2 p-1 bg-card rounded-lg border border-border">
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => onViewModeChange(mode.id)}
            className={cn(
              'flex-1 px-4 py-1.5 text-xs font-medium rounded-md transition-all',
              viewMode === mode.id
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            )}
          >
            {mode.label}
          </button>
        ))}
      </div>
    </div>
  );
}
