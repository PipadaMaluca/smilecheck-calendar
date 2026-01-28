import { ChevronLeft, Menu, Building2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Clinic } from '@/types/calendar';

interface CalendarHeaderProps {
  title: string;
  showClinicSelector?: boolean;
  selectedClinic?: Clinic;
  onBack?: () => void;
  onMenuClick?: () => void;
  onClinicChange?: () => void;
}

export function CalendarHeader({
  title,
  showClinicSelector = false,
  selectedClinic,
  onBack,
  onMenuClick,
  onClinicChange,
}: CalendarHeaderProps) {
  return (
    <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">{title}</h1>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="text-muted-foreground hover:text-foreground"
        >
          <Menu className="w-5 h-5" />
        </Button>
      </div>

      {showClinicSelector && selectedClinic && (
        <div className="px-4 pb-3">
          <Button
            variant="secondary"
            onClick={onClinicChange}
            className="w-full justify-between bg-secondary/50 hover:bg-secondary"
          >
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">{selectedClinic.name}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <span className="text-xs">Trocar</span>
              <ChevronDown className="w-4 h-4" />
            </div>
          </Button>
        </div>
      )}
    </div>
  );
}
