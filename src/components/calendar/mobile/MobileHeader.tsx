import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ViewMode, UserRole } from '@/types/calendar';
import { cn } from '@/lib/utils';
interface MobileHeaderProps {
  onMenuClick: () => void;
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
  userRole?: UserRole;
}
export function MobileHeader({
  onMenuClick,
  viewMode = 'day',
  onViewModeChange,
  userRole = 'dentist'
}: MobileHeaderProps) {
  // Patient only has list and day views
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
  return <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border w-full">
      <div className="relative flex items-center w-full max-w-full py-[20px] px-[20px]">
        {/* Menu button - absolute left */}
        <Button variant="ghost" size="icon" onClick={onMenuClick} className="absolute left-4 text-muted-foreground hover:text-foreground flex-shrink-0">
          <Menu className="w-5 h-5" />
        </Button>
        
        {/* View Mode Selector - centered */}
        {onViewModeChange && <div className="flex items-center justify-center gap-1 w-full">
            {modes.map(mode => <button key={mode.id} onClick={() => onViewModeChange(mode.id)} className={cn('px-3 py-1.5 text-xs font-medium rounded-md transition-colors', viewMode === mode.id ? 'bg-primary text-primary-foreground' : 'bg-secondary/30 text-muted-foreground hover:bg-secondary/50')}>
                {mode.label}
              </button>)}
          </div>}
      </div>
    </div>;
}