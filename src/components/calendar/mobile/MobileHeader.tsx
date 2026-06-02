import { useTranslation } from 'react-i18next';
import { Menu, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ViewMode, UserRole } from '@/types/calendar';
import { cn } from '@/lib/utils';

interface MobileHeaderProps {
  onMenuClick: () => void;
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
  userRole?: UserRole;
  showNewConsultation?: boolean;
  onNewConsultation?: () => void;
}

export function MobileHeader({
  onMenuClick,
  viewMode = 'day',
  onViewModeChange,
  userRole = 'dentist',
  showNewConsultation,
  onNewConsultation
}: MobileHeaderProps) {
  const { t } = useTranslation();
  const modes: {
    id: ViewMode;
    label: string;
  }[] = userRole === 'patient' ? [{
    id: 'day',
    label: t('agenda.day')
  }, {
    id: 'list',
    label: t('agenda.list')
  }] : [{
    id: 'day',
    label: t('agenda.day')
  }, {
    id: 'three-day',
    label: t('agenda.threeDays')
  }, {
    id: 'list',
    label: t('agenda.list')
  }];

  return <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border w-full border-slate-700 border-0">
      <div className="relative w-full max-w-full px-[20px] pl-0 pr-0 gap-0 flex-row flex items-center justify-center my-[3px] mx-[7px] py-[10px]">
        {/* Menu button - absolute left */}
        <Button variant="ghost" size="icon" onClick={onMenuClick} className="absolute left-4 text-muted-foreground hover:text-foreground flex-shrink-0 border-slate-700">
          <Menu className="w-5 h-5" />
        </Button>
        
        {/* View Mode Selector - centered (not for patient) */}
        {onViewModeChange && <div className="flex items-center justify-center gap-1 w-full">
            {modes.map((mode) => <button key={mode.id} onClick={() => onViewModeChange(mode.id)} className={cn('px-3 py-1.5 text-xs font-medium rounded-md transition-colors', viewMode === mode.id ? 'bg-primary text-primary-foreground' : 'bg-secondary/30 text-muted-foreground hover:bg-secondary/50')}>
                {mode.label}
              </button>)}
          </div>}

        {/* New Consultation button - centered (patient agenda) */}
        {showNewConsultation && onNewConsultation && !onViewModeChange &&
      <div className="flex items-center justify-center w-full">
            <Button size="sm" onClick={onNewConsultation} className="gap-1.5">
              <Plus className="w-4 h-4" />
              {t('agenda.newAppointment')}
            </Button>
          </div>
      }

        {/* New Consultation button - right side (dentist/clinic agenda with view mode) */}
        {showNewConsultation && onNewConsultation && onViewModeChange &&
          <Button variant="ghost" size="icon" onClick={onNewConsultation} className="absolute right-4 text-primary hover:text-primary/80 flex-shrink-0">
            <Plus className="w-5 h-5" />
          </Button>
        }
      </div>
    </div>;
}