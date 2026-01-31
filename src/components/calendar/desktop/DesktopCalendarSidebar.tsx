import { useState } from 'react';
import { Search, ChevronDown, ChevronRight, Plus, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dentist } from '@/types/calendar';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { pt } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface DesktopCalendarSidebarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  dentists: Dentist[];
  selectedDentistIds: string[];
  onDentistToggle: (dentistId: string) => void;
  onSelectAllDentists: () => void;
  appointmentDates?: Date[];
}

export function DesktopCalendarSidebar({
  selectedDate,
  onDateSelect,
  dentists,
  selectedDentistIds,
  onDentistToggle,
  onSelectAllDentists,
  appointmentDates = [],
}: DesktopCalendarSidebarProps) {
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
  const weekDays = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];

  return (
    <aside className="h-full w-[200px] bg-[#0D2137] border-l border-[#1E3A5F] flex flex-col overflow-hidden flex-shrink-0">
      {/* Find Slot Button */}
      <div className="p-3 flex-shrink-0">
        <Button className="w-full gap-2 bg-primary hover:bg-primary/90 font-semibold text-xs">
          <Search className="w-4 h-4" />
          ENCONTRAR VAGA
        </Button>
      </div>

      {/* Mini Calendar */}
      <div className="px-3 pb-3 border-b border-[#1E3A5F] flex-shrink-0">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="h-6 w-6 text-muted-foreground hover:text-foreground hover:bg-[#152238]"
          >
            <ChevronLeft className="w-3 h-3" />
          </Button>
          <span className="text-xs font-medium capitalize">
            {format(currentMonth, 'MMMM yyyy', { locale: pt })}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="h-6 w-6 text-muted-foreground hover:text-foreground hover:bg-[#152238]"
          >
            <ChevronRight className="w-3 h-3" />
          </Button>
        </div>

        {/* Week Days Header */}
        <div className="grid grid-cols-7 gap-0.5 mb-1">
          {weekDays.map((d, i) => (
            <div
              key={`${d}-${i}`}
              className="text-center text-[10px] font-medium text-muted-foreground py-0.5"
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
                  'relative flex flex-col items-center justify-center w-6 h-6 rounded text-[10px] transition-all',
                  !isCurrentMonth && 'text-muted-foreground/40',
                  isCurrentMonth && 'text-foreground hover:bg-[#152238]',
                  isToday && 'bg-primary text-primary-foreground font-semibold',
                  isSelected && !isToday && 'bg-primary/20 text-primary ring-1 ring-primary'
                )}
              >
                {format(date, 'd')}
                {hasAppt && !isToday && (
                  <span className="absolute bottom-0 w-1 h-1 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Agendas Section */}
      <div className="p-3 border-b border-[#1E3A5F] flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-muted-foreground">
            Agendas ({selectedDentistIds.length}/{dentists.length})
          </span>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </div>
        <Button
          variant="secondary"
          size="sm"
          className="w-full text-xs font-medium bg-primary/20 hover:bg-primary/30 text-primary"
          onClick={onSelectAllDentists}
        >
          FILTRAR PRESENTES
        </Button>
      </div>

      {/* Search */}
      <div className="px-3 py-2 flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
          <Input
            placeholder="Pesquisar"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-7 h-7 text-xs bg-[#152238] border-[#1E3A5F]"
          />
        </div>
      </div>

      {/* Dentists List */}
      <div className="flex-1 overflow-y-auto px-3 pb-3 scrollbar-hide">
        {/* All checkbox */}
        <div
          className="flex items-center gap-2 py-1.5 cursor-pointer hover:bg-[#152238] rounded px-1.5 -mx-1.5"
          onClick={onSelectAllDentists}
        >
          <Checkbox
            checked={allSelected}
            className="border-muted-foreground h-3.5 w-3.5 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          />
          <span className="text-xs font-medium">Todos</span>
        </div>

        {/* Professionals Group */}
        <Collapsible open={isProfessionalsOpen} onOpenChange={setIsProfessionalsOpen}>
          <CollapsibleTrigger className="flex items-center gap-1.5 py-1.5 w-full text-left">
            <ChevronDown
              className={cn(
                'w-3 h-3 text-muted-foreground transition-transform',
                !isProfessionalsOpen && '-rotate-90'
              )}
            />
            <span className="text-xs text-muted-foreground">Profissionais</span>
          </CollapsibleTrigger>
          <CollapsibleContent className="pl-3">
            {filteredDentists.map((dentist) => {
              const isSelected = selectedDentistIds.includes(dentist.id);
              return (
                <div
                  key={dentist.id}
                  className="flex items-center gap-2 py-1 cursor-pointer hover:bg-[#152238] rounded px-1.5 -mx-1.5"
                  onClick={() => onDentistToggle(dentist.id)}
                >
                  <Checkbox
                    checked={isSelected}
                    className="border-muted-foreground h-3.5 w-3.5 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <span className={cn('text-xs truncate', isSelected && 'font-medium')}>
                    {dentist.name}
                  </span>
                </div>
              );
            })}
          </CollapsibleContent>
        </Collapsible>

        {/* Add Dentist */}
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-1.5 text-primary text-xs mt-1 h-7 hover:bg-[#152238]"
        >
          <Plus className="w-3 h-3" />
          Adicionar
        </Button>
      </div>

      {/* Footer */}
      <div className="border-t border-[#1E3A5F] p-2 text-center flex-shrink-0">
        <p className="text-[9px] text-muted-foreground">SmileCheck © 2026</p>
      </div>
    </aside>
  );
}
