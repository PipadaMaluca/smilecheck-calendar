import { useState } from 'react';
import { Search, ChevronDown, ChevronLeft, ChevronRight, Plus, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { pt } from 'date-fns/locale';
import { cn } from '@/lib/utils';

import { mockFamilyMembers } from '@/data/mockData';

interface FamilyMember {
  id: string;
  name: string;
  age: number;
  relation: string;
}

interface PatientSidebarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  familyMembers: FamilyMember[];
  selectedMemberIds: string[];
  onMemberToggle: (memberId: string, isCheckbox: boolean) => void;
  onSelectAllMembers: () => void;
  appointmentDates?: Date[];
  onNewConsultation?: () => void;
}

export function PatientSidebar({
  selectedDate,
  onDateSelect,
  familyMembers,
  selectedMemberIds,
  onMemberToggle,
  onSelectAllMembers,
  appointmentDates = [],
  onNewConsultation
}: PatientSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFamilyOpen, setIsFamilyOpen] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const today = new Date();

  const filteredMembers = familyMembers.filter((m) =>
  m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const allSelected = familyMembers.every((m) => selectedMemberIds.includes(m.id));

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
    <aside className="h-full w-[400px] bg-[#0D2137] border-l border-[#1E3A5F] flex-col overflow-hidden flex-shrink-0 flex items-center justify-center">
      {/* Find Slot Button */}
      <div className="p-3 flex-shrink-0">
        <Button onClick={onNewConsultation} className="w-full gap-2 bg-primary hover:bg-primary/90 font-semibold text-xs">
          <Plus className="w-4 h-4" />
          NOVA CONSULTA
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
            className="h-6 w-6 text-muted-foreground hover:text-foreground hover:bg-[#152238]">

            <ChevronLeft className="w-3 h-3" />
          </Button>
          <span className="text-xs font-medium capitalize">
            {format(currentMonth, 'MMMM yyyy', { locale: pt })}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="h-6 w-6 text-muted-foreground hover:text-foreground hover:bg-[#152238]">

            <ChevronRight className="w-3 h-3" />
          </Button>
        </div>

        {/* Week Days Header */}
        <div className="grid grid-cols-7 gap-0.5 mb-1">
          {weekDays.map((d, i) =>
          <div
            key={`${d}-${i}`}
            className="text-center text-[10px] font-medium text-muted-foreground py-0.5">

              {d}
            </div>
          )}
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
                )}>

                {format(date, 'd')}
                {hasAppt && !isToday &&
                <span className="absolute bottom-0 w-1 h-1 rounded-full bg-primary" />
                }
              </button>);

          })}
        </div>
      </div>

      {/* Family Section */}
      <div className="p-3 border-b border-[#1E3A5F] flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-muted-foreground">
            Filtrar por membro:
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 py-2 flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
          <Input
            placeholder="Pesquisar"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-7 h-7 text-xs bg-[#152238] border-[#1E3A5F]" />

        </div>
      </div>

      {/* Family Members List */}
      <div className="flex-1 overflow-y-auto px-3 pb-3 scrollbar-hide">
        {/* All checkbox */}
        <div
          className="flex items-center gap-2 py-1.5 cursor-pointer hover:bg-[#152238] rounded px-1.5 -mx-1.5"
          onClick={onSelectAllMembers}>

          <Checkbox
            checked={allSelected}
            className="border-muted-foreground h-5 w-5 rounded-md data-[state=checked]:bg-primary data-[state=checked]:border-primary" />

          <span className="text-xs font-medium">Todos</span>
        </div>

        {/* Family Group */}
        <Collapsible open={isFamilyOpen} onOpenChange={setIsFamilyOpen}>
          <CollapsibleTrigger className="flex items-center gap-1.5 py-1.5 w-full text-left">
            <ChevronDown
              className={cn(
                'w-3 h-3 text-muted-foreground transition-transform',
                !isFamilyOpen && '-rotate-90'
              )} />

            <span className="text-xs text-muted-foreground">Família</span>
          </CollapsibleTrigger>
          <CollapsibleContent className="pl-3">
            {filteredMembers.map((member) => {
              const isSelected = selectedMemberIds.includes(member.id);

              return (
                <div
                  key={member.id}
                  className="flex items-center gap-2 py-1 cursor-pointer hover:bg-[#152238] rounded px-1.5 -mx-1.5"
                  onClick={() => onMemberToggle(member.id, false)}>

                  <Checkbox
                    checked={isSelected}
                    className="border-muted-foreground h-5 w-5 rounded-md data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    onClick={(e) => {e.stopPropagation();onMemberToggle(member.id, true);}} />

                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <User className="w-2.5 h-2.5 text-primary" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className={cn('text-xs truncate', isSelected && 'font-medium')}>
                      {member.name} ({member.age} anos)
                    </span>
                    <span className="text-[9px] text-muted-foreground">{member.relation}</span>
                  </div>
                </div>);

            })}
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Footer */}
      <div className="border-t border-[#1E3A5F] p-2 text-center flex-shrink-0">
        <p className="text-[9px] text-muted-foreground">SmileCheck © 2026</p>
      </div>
    </aside>);

}