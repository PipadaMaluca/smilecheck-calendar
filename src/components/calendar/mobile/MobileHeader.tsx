import { Menu, ChevronDown, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Clinic } from '@/types/calendar';

interface MobileHeaderProps {
  onMenuClick: () => void;
  showClinicSelector?: boolean;
  selectedClinic?: Clinic;
  onClinicChange?: () => void;
}

export function MobileHeader({
  onMenuClick,
  showClinicSelector = false,
  selectedClinic,
  onClinicChange,
}: MobileHeaderProps) {
  return (
    <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="flex items-center justify-between px-4 py-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="text-muted-foreground hover:text-foreground"
        >
          <Menu className="w-5 h-5" />
        </Button>

        {showClinicSelector && selectedClinic && (
          <Button
            variant="ghost"
            onClick={onClinicChange}
            className="flex items-center gap-2"
          >
            <Building2 className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium truncate max-w-[180px]">{selectedClinic.name}</span>
            <div className="flex items-center gap-1 text-muted-foreground">
              <span className="text-xs">Trocar</span>
              <ChevronDown className="w-4 h-4" />
            </div>
          </Button>
        )}

        {/* Spacer for balance when no clinic selector */}
        {!showClinicSelector && <div className="w-10" />}
      </div>
    </div>
  );
}
