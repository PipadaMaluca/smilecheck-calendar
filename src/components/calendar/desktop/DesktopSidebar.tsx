import { useState } from 'react';
import { Search, ChevronDown, ChevronRight, Check, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Calendar } from '@/components/ui/calendar';
import { Dentist } from '@/types/calendar';
import { cn } from '@/lib/utils';

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

  const filteredDentists = dentists.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const allSelected = dentists.every((d) => selectedDentistIds.includes(d.id));

  if (!isOpen) return null;

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col h-full overflow-hidden">
      {/* Find Slot Button */}
      <div className="p-4">
        <Button className="w-full gap-2 bg-primary hover:bg-primary/90 font-semibold">
          <Search className="w-4 h-4" />
          ENCONTRAR VAGA
        </Button>
      </div>

      {/* Mini Calendar */}
      <div className="px-2 pb-4 border-b border-border">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => date && onDateSelect(date)}
          className="w-full"
          modifiers={{
            hasAppointment: appointmentDates,
          }}
          modifiersClassNames={{
            hasAppointment: 'calendar-day-has-appointment',
          }}
        />
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

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <p className="text-[10px] text-muted-foreground text-center">
          SmileCheck © 2026
        </p>
      </div>
    </aside>
  );
}
