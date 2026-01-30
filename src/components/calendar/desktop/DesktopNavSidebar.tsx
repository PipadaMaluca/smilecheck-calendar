import { Home, Calendar, Users, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import smileIcon from '@/assets/smilecheck-icon.png';
import { Search, ChevronDown, ChevronRight, Plus, ChevronLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dentist } from '@/types/calendar';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { pt } from 'date-fns/locale';
import { useState } from 'react';
interface DesktopNavSidebarProps {
  isExpanded: boolean;
  activeTab: string;
  onTabChange: (tab: string) => void;
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  dentists: Dentist[];
  selectedDentistIds: string[];
  onDentistToggle: (dentistId: string) => void;
  onSelectAllDentists: () => void;
  appointmentDates?: Date[];
}
const NAV_ITEMS = [{
  id: 'home',
  icon: Home,
  label: 'Home'
}, {
  id: 'agenda',
  icon: Calendar,
  label: 'Agenda'
}, {
  id: 'team',
  icon: Users,
  label: 'Equipa'
}, {
  id: 'stats',
  icon: BarChart3,
  label: 'Stats'
}];
export function DesktopNavSidebar({
  isExpanded,
  activeTab,
  onTabChange,
  selectedDate,
  onDateSelect,
  dentists,
  selectedDentistIds,
  onDentistToggle,
  onSelectAllDentists,
  appointmentDates = []
}: DesktopNavSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfessionalsOpen, setIsProfessionalsOpen] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const today = new Date();
  const filteredDentists = dentists.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const allSelected = dentists.every(d => selectedDentistIds.includes(d.id));

  // Generate calendar grid
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, {
    weekStartsOn: 1
  });
  const endDate = endOfWeek(monthEnd, {
    weekStartsOn: 1
  });
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
  const hasAppointment = (date: Date) => appointmentDates.some(d => isSameDay(d, date));
  const weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  return <aside className={cn('h-full bg-card border-r border-border flex flex-col transition-all duration-300 z-30 overflow-hidden', isExpanded ? 'w-[250px]' : 'w-[60px]')}>
      {/* Logo */}
      <div className={cn('flex items-center justify-center border-b border-border flex-shrink-0', isExpanded ? 'p-4' : 'p-2')}>
        <img src={smileIcon} alt="SmileCheck" className={cn('transition-all duration-300', isExpanded ? 'h-16 w-16' : 'h-10 w-10')} />
      </div>

      {/* Navigation Items */}
      <nav className={cn('flex flex-col gap-1 p-2 flex-shrink-0', isExpanded ? 'items-stretch' : 'items-center')}>
        {NAV_ITEMS.map(item => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return <Button key={item.id} variant="ghost" onClick={() => onTabChange(item.id)} className={cn('flex flex-col gap-1 h-auto py-2 transition-all duration-200', isExpanded ? 'w-full px-3' : 'w-12 px-0', isActive ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50')}>
              <Icon className="w-5 h-5 flex-shrink-0" />
              {isExpanded && <span className="text-xs font-medium">{item.label}</span>}
            </Button>;
      })}
      </nav>

      {/* Expanded Content: Calendar + Dentist List */}
      {isExpanded && <div className="flex-1 flex flex-col overflow-hidden border-t border-border mt-2">
          {/* Find Slot Button */}
          <div className="p-3 flex-shrink-0">
            <Button className="w-full gap-2 bg-primary hover:bg-primary/90 font-semibold text-sm">
              <Search className="w-4 h-4" />
              ENCONTRAR VAGA
            </Button>
          </div>

          {/* Mini Calendar */}
          <div className="px-3 pb-3 border-b border-border flex-shrink-0">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-2">
              <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="h-7 w-7 text-muted-foreground hover:text-foreground">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-xs font-medium capitalize">
                {format(currentMonth, 'MMMM yyyy', {
              locale: pt
            })}
              </span>
              <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="h-7 w-7 text-muted-foreground hover:text-foreground">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Week Days Header */}
            <div className="grid grid-cols-7 gap-0.5 mb-1">
              {weekDays.map(d => <div key={d} className="text-center text-[10px] font-medium text-muted-foreground py-0.5">
                  {d}
                </div>)}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-0.5">
              {rows.flat().map((date, idx) => {
            const isCurrentMonth = isSameMonth(date, currentMonth);
            const isToday = isSameDay(date, today);
            const isSelected = isSameDay(date, selectedDate);
            const hasAppt = hasAppointment(date);
            return <button key={idx} onClick={() => onDateSelect(date)} className={cn('relative flex flex-col items-center justify-center w-7 h-7 rounded text-xs transition-all', !isCurrentMonth && 'text-muted-foreground/40', isCurrentMonth && 'text-foreground hover:bg-secondary/50', isToday && 'bg-primary text-primary-foreground font-semibold', isSelected && !isToday && 'bg-primary/20 text-primary ring-1 ring-primary')}>
                    {format(date, 'd')}
                    {hasAppt && !isToday && <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-primary" />}
                  </button>;
          })}
            </div>
          </div>

          {/* Agendas Section */}
          <div className="p-3 border-b border-border flex-shrink-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-muted-foreground">
                Agendas ({selectedDentistIds.length}/{dentists.length})
              </span>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </div>
            <Button variant="secondary" size="sm" className="w-full text-xs font-medium" onClick={onSelectAllDentists}>
              FILTRAR PRESENTES
            </Button>
          </div>

          {/* Search */}
          <div className="px-3 py-2 flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Pesquisar" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-8 h-8 text-xs bg-secondary/50" />
            </div>
          </div>

          {/* Dentists List */}
          <div className="flex-1 overflow-y-auto px-3 pb-3 scrollbar-hide">
            {/* All checkbox */}
            <div className="flex items-center gap-2 py-1.5 cursor-pointer hover:bg-secondary/30 rounded px-1.5 -mx-1.5" onClick={onSelectAllDentists}>
              <Checkbox checked={allSelected} className="border-muted-foreground h-4 w-4 data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
              <span className="text-xs font-medium">Todos</span>
            </div>

            {/* Resources Group */}
            <Collapsible>
              
            </Collapsible>

            {/* Professionals Group */}
            <Collapsible open={isProfessionalsOpen} onOpenChange={setIsProfessionalsOpen}>
              <CollapsibleTrigger className="flex items-center gap-1.5 py-1.5 w-full text-left">
                <ChevronDown className={cn('w-3 h-3 text-muted-foreground transition-transform', !isProfessionalsOpen && '-rotate-90')} />
                <span className="text-xs text-muted-foreground">Profissionais</span>
              </CollapsibleTrigger>
              <CollapsibleContent className="pl-3">
                {filteredDentists.map(dentist => {
              const isSelected = selectedDentistIds.includes(dentist.id);
              return <div key={dentist.id} className="flex items-center gap-2 py-1.5 cursor-pointer hover:bg-secondary/30 rounded px-1.5 -mx-1.5" onClick={() => onDentistToggle(dentist.id)}>
                      <Checkbox checked={isSelected} className="border-muted-foreground h-4 w-4 data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                      <span className={cn('text-xs truncate', isSelected && 'font-medium')}>
                        {dentist.name}
                      </span>
                    </div>;
            })}
              </CollapsibleContent>
            </Collapsible>

            {/* Add Dentist */}
            <Button variant="ghost" size="sm" className="w-full justify-start gap-1.5 text-primary text-xs mt-1 h-8">
              <Plus className="w-3 h-3" />
              Adicionar profissional
            </Button>
          </div>
        </div>}

      {/* Footer - only when expanded */}
      {isExpanded && <div className="border-t border-border p-2 text-center flex-shrink-0">
          <p className="text-[10px] text-muted-foreground">
            SmileCheck © 2026
          </p>
        </div>}
    </aside>;
}