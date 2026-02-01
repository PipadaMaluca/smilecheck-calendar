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
  return <div className="px-4 py-2">
      
    </div>;
}