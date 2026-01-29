import { useState } from 'react';
import { Search, ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dentist } from '@/types/calendar';
import { cn } from '@/lib/utils';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from 'date-fns';
import { pt } from 'date-fns/locale';
import smileLogo from '@/assets/smilecheck-logo.png';
import { ChevronLeft } from 'lucide-react';

interface DesktopSidebarProps {
  isOpen: boolean;
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  dentists: Dentist[];
  selectedDentistIds: string[];
  onDentistToggle: (dentistId: string) => void;
  onSelectAllDentists: () => void;
  appointmentDates?: Date[];
}

export function DesktopSidebar({
  isOpen,
  selectedDate,
  onDateSelect,
  dentists,
  selectedDentistIds,
  onDentistToggle,
  onSelectAllDentists,
  appointmentDates = [],
}: DesktopSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfessionalsOpen, setIsProfessionalsOpen] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const today = new Date();

  const filteredDentists = dentists.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const allSelected = dentists.every((d) => selectedDentistIds.includes(d.id));

  // Generate calendar grid
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const rows: Date[][] = [];
  let days: Date[] = [];
  let day = startDate;

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      days.push(day);
      day = addDays(day, 1);
    }
    rows.push(days);
    days = [];
  }

  const hasAppointment = (date: Date) =>
    appointmentDates.some((d) => isSameDay(d, date));

  const weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

  if (!isOpen) return null;

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col h-full overflow-hidden">
      {/* Logo - Larger */}
      <div className="p-4 border-b border-border flex items-center justify-center">
        <img 
          src={smileLogo} 
          alt="SmileCheck" 
          className="w-full max-w-[200px] h-auto"
        />
      </div>

      {/* Find Slot Button */}
      <div className="p-4">
        <Button className="w-full gap-2 bg-primary hover:bg-primary/90 font-semibold">
          <Search className="w-4 h-4" />
          ENCONTRAR VAGA
        </Button>
      </div>

      {/* Mini Calendar - Full month display */}
      <div className="px-3 pb-4 border-b border-border">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium capitalize">
            {format(currentMonth, 'MMMM yyyy', { locale: pt })}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Week Days Header */}
        <div className="grid grid-cols-7 gap-0.5 mb-1">
          {weekDays.map((d) => (
            <div
              key={d}
              className="text-center text-[10px] font-medium text-muted-foreground py-1"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-0.5">
          {rows.flat().map((date, idx) => {
            const isCurrentMonth = isSameMonth(date, currentMonth);
            const isToday = isSameDay(date, today);
            const isSelected = isSameDay(date, selectedDate);
            const hasAppt = hasAppointment(date);

            return (
              <button
                key={idx}
                onClick={() => onDateSelect(date)}
                className={cn(
                  'relative flex flex-col items-center justify-center w-7 h-7 rounded text-xs transition-all',
                  !isCurrentMonth && 'text-muted-foreground/40',
                  isCurrentMonth && 'text-foreground hover:bg-secondary/50',
                  isToday && 'bg-primary text-primary-foreground font-semibold',
                  isSelected && !isToday && 'bg-primary/20 text-primary ring-1 ring-primary'
                )}
              >
                {format(date, 'd')}
                {hasAppt && !isToday && (
                  <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Agendas Section */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-muted-foreground">
            Agendas ({selectedDentistIds.length}/{dentists.length})
          </span>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </div>
        <Button
          variant="secondary"
          size="sm"
          className="w-full text-xs font-medium"
          onClick={onSelectAllDentists}
        >
          FILTRAR PRESENTES
        </Button>
      </div>

      {/* Search */}
      <div className="px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-sm bg-secondary/50"
          />
        </div>
      </div>

      {/* Dentists List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 scrollbar-hide">
        {/* All checkbox */}
        <div
          className="flex items-center gap-3 py-2 cursor-pointer hover:bg-secondary/30 rounded px-2 -mx-2"
          onClick={onSelectAllDentists}
        >
          <Checkbox checked={allSelected} className="border-muted-foreground" />
          <span className="text-sm font-medium">Todos</span>
        </div>

        {/* Resources Group */}
        <Collapsible>
          <CollapsibleTrigger className="flex items-center gap-2 py-2 w-full text-left">
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Recursos</span>
          </CollapsibleTrigger>
        </Collapsible>

        {/* Professionals Group */}
        <Collapsible open={isProfessionalsOpen} onOpenChange={setIsProfessionalsOpen}>
          <CollapsibleTrigger className="flex items-center gap-2 py-2 w-full text-left">
            <ChevronDown
              className={cn(
                'w-4 h-4 text-muted-foreground transition-transform',
                !isProfessionalsOpen && '-rotate-90'
              )}
            />
            <span className="text-sm text-muted-foreground">Profissionais</span>
          </CollapsibleTrigger>
          <CollapsibleContent className="pl-4">
            {filteredDentists.map((dentist) => {
              const isSelected = selectedDentistIds.includes(dentist.id);
              return (
                <div
                  key={dentist.id}
                  className="flex items-center gap-3 py-2 cursor-pointer hover:bg-secondary/30 rounded px-2 -mx-2"
                  onClick={() => onDentistToggle(dentist.id)}
                >
                  <Checkbox
                    checked={isSelected}
                    className="border-muted-foreground data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <span className={cn('text-sm truncate', isSelected && 'font-medium')}>
                    {dentist.name}
                  </span>
                </div>
              );
            })}
          </CollapsibleContent>
        </Collapsible>

        {/* Add Dentist */}
        <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-primary mt-2">
          <Plus className="w-4 h-4" />
          Adicionar profissional
        </Button>
      </div>
    </aside>
  );
}