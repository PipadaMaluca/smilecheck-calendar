import { Menu, ChevronLeft, ChevronRight, Settings, CalendarClock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import smileLogo from '@/assets/smilecheck-logo.png';
import { mockDentists } from '@/data/mockData';

type ViewMode = 'list' | 'day' | 'week' | 'month';

interface DesktopHeaderProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onToggleSidebar: () => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export function DesktopHeader({
  currentDate,
  onDateChange,
  onToggleSidebar,
  viewMode,
  onViewModeChange,
}: DesktopHeaderProps) {
  const goToPreviousDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    onDateChange(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    onDateChange(newDate);
  };

  const goToToday = () => {
    onDateChange(new Date());
  };

  return (
    <header className="h-14 bg-card border-b border-border flex items-center justify-between px-4 sticky top-0 z-50">
      {/* Left Section */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground"
          onClick={onToggleSidebar}
        >
          <Menu className="w-5 h-5" />
        </Button>

        <img src={smileLogo} alt="SmileCheck" className="h-8 w-auto" />

        <div className="h-6 w-px bg-border mx-2" />

        <Button
          variant="secondary"
          size="sm"
          onClick={goToToday}
          className="font-medium"
        >
          Hoje
        </Button>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={goToPreviousDay}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={goToNextDay}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <span className="text-sm font-medium capitalize">
          {format(currentDate, "EEEE d MMMM yyyy", { locale: pt })}
        </span>
      </div>

      {/* Center Section - View Toggle */}
      <div className="flex items-center gap-4">
        <ToggleGroup
          type="single"
          value={viewMode}
          onValueChange={(val) => val && onViewModeChange(val as ViewMode)}
          className="bg-secondary/50 rounded-lg p-1"
        >
          <ToggleGroupItem
            value="list"
            className="px-3 py-1 text-xs data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
          >
            Lista
          </ToggleGroupItem>
          <ToggleGroupItem
            value="day"
            className="px-3 py-1 text-xs data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
          >
            Dia
          </ToggleGroupItem>
          <ToggleGroupItem
            value="week"
            className="px-3 py-1 text-xs data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
          >
            Semana
          </ToggleGroupItem>
          <ToggleGroupItem
            value="month"
            className="px-3 py-1 text-xs data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
          >
            Mês
          </ToggleGroupItem>
        </ToggleGroup>

        <Button variant="ghost" size="sm" className="text-xs gap-2 text-muted-foreground">
          <CalendarClock className="w-4 h-4" />
          Modificar horários
        </Button>

        <Button variant="ghost" size="sm" className="text-xs gap-2 text-muted-foreground">
          <Settings className="w-4 h-4" />
          Configurações
        </Button>
      </div>

      {/* Right Section - User Profile */}
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-bold text-foreground">{mockDentists[0].name}</p>
          <p className="text-xs text-muted-foreground">Dentista</p>
        </div>
        <Avatar className="h-9 w-9">
          <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
            {mockDentists[0].name.charAt(0)}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
