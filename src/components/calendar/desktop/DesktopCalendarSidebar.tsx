import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Search, ChevronDown, ChevronRight, Plus, ChevronLeft, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dentist, UserRole } from '@/types/calendar';
import type { Consultation } from '@/types/calendar';
import { mockClinics, getDentistsForClinic, dentistWorksOnDemo } from '@/data/mockData';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { pt } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { AgendaFilterGroups } from '@/components/calendar/AgendaFilterGroups';
import { ConsultationHoverPreview } from './ConsultationHoverPreview';

interface DesktopCalendarSidebarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  dentists: Dentist[];
  selectedDentistIds: string[];
  onDentistToggle: (dentistId: string, isCheckbox: boolean, clinicId?: string) => void;
  onSelectAllDentists: () => void;
  appointmentDates?: Date[];
  userRole?: UserRole;
  selectedClinicIds?: string[];
  onClinicToggle?: (clinicId: string, isCheckbox: boolean) => void;
  onSelectOnlyClinic?: (clinicId: string) => void;
  onSelectPresentDentists?: () => void;
  isTodosSelected?: boolean;
  onToggleTodos?: () => void;
  hoveredConsultation?: Consultation | null;
}

export function DesktopCalendarSidebar({
  selectedDate,
  onDateSelect,
  dentists,
  selectedDentistIds,
  onDentistToggle,
  onSelectAllDentists,
  appointmentDates = [],
  userRole = 'clinic',
  selectedClinicIds = ['1'],
  onClinicToggle,
  onSelectPresentDentists,
  isTodosSelected = false,
  onToggleTodos,
  hoveredConsultation,
}: DesktopCalendarSidebarProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [expandedClinics, setExpandedClinics] = useState<string[]>(['1', '2', '3']);
  const today = new Date();

  const toggleClinicExpanded = (clinicId: string) => {
    setExpandedClinics(prev => 
      prev.includes(clinicId) 
        ? prev.filter(id => id !== clinicId)
        : [...prev, clinicId]
    );
  };

  // Get total dentists count and selected count
  const totalDentists = mockClinics.reduce((acc, clinic) => {
    return acc + getDentistsForClinic(clinic.id).length;
  }, 0);
  
  const selectedCount = selectedDentistIds.length;

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

  // Check if a dentist is selected for a specific clinic using composite key
  const isDentistSelected = (dentistId: string, clinicId: string) => {
    const key = `${clinicId}-${dentistId}`;
    return selectedDentistIds.includes(key);
  };

  // Check if any dentist of a clinic is selected
  const isClinicPartiallySelected = (clinicId: string) => {
    const dentistsInClinic = getDentistsForClinic(clinicId);
    return dentistsInClinic.some(d => {
      const key = `${clinicId}-${d.id}`;
      return selectedDentistIds.includes(key);
    });
  };

  // Check if all dentists of a clinic are selected
  const isClinicFullySelected = (clinicId: string) => {
    const dentistsInClinic = getDentistsForClinic(clinicId);
    return dentistsInClinic.every(d => {
      const key = `${clinicId}-${d.id}`;
      return selectedDentistIds.includes(key);
    });
  };

  if (hoveredConsultation) {
    return (
      <aside className="h-full w-[220px] bg-[#0D2137] border-l border-[#1E3A5F] flex flex-col overflow-hidden flex-shrink-0">
        <div className="flex-1 overflow-y-auto transition-opacity duration-150 ease-in-out opacity-100">
          <ConsultationHoverPreview consultation={hoveredConsultation} />
        </div>
      </aside>
    );
  }

  return (
    <aside className="h-full w-[220px] bg-[#0D2137] border-l border-[#1E3A5F] flex flex-col overflow-hidden flex-shrink-0">
      <div className="contents transition-opacity duration-150 ease-in-out opacity-100">
      {/* Find Slot Button */}
      <div className="p-3 flex-shrink-0">
        <Button className="w-full gap-2 bg-primary hover:bg-primary/90 font-semibold text-xs">
          <Search className="w-4 h-4" />
          Encontrar Vaga
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

      {/* Agendas Section Header */}
      <div className="p-3 border-b border-[#1E3A5F] flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-muted-foreground">
            Agendas ({selectedCount}/{totalDentists})
          </span>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </div>
        <Button
          variant="secondary"
          size="sm"
          className="w-full text-xs font-medium bg-primary/20 hover:bg-primary/30 text-primary"
          onClick={onSelectPresentDentists}
        >
          {t('agenda.filterPresent')}
        </Button>
      </div>

      {/* Search */}
      <div className="px-3 py-2 flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
          <Input
            placeholder={t('common.search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-7 h-7 text-xs bg-[#152238] border-[#1E3A5F]"
          />
        </div>
      </div>

      {/* Clinics + Dentists List - Hierarchical */}
      <div className="flex-1 overflow-y-auto px-3 pb-3 scrollbar-hide">
        {/* Todas as Agendas */}
        <div className="flex items-center gap-2 py-1.5 hover:bg-[#152238] rounded px-1.5 -mx-1.5">
          <Checkbox
            checked={isTodosSelected}
            onCheckedChange={() => onToggleTodos?.()}
            className="border-muted-foreground h-6 w-6 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            onClick={(e) => e.stopPropagation()}
          />
          <button 
            className="text-xs font-medium hover:text-primary"
            onClick={() => onSelectAllDentists()}
          >
            Todas as Agendas
          </button>
        </div>

        {/* Clinics with their dentists */}
        {mockClinics.map(clinic => {
          const isExpanded = expandedClinics.includes(clinic.id);
          const dentistsInClinic = getDentistsForClinic(clinic.id);
          const filteredDentists = searchQuery 
            ? dentistsInClinic.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()))
            : dentistsInClinic;
          const isFullySelected = isClinicFullySelected(clinic.id);
          const hasAnySelected = isClinicPartiallySelected(clinic.id);
          
          if (searchQuery && filteredDentists.length === 0) return null;

          return (
            <Collapsible 
              key={clinic.id} 
              open={isExpanded} 
              onOpenChange={() => toggleClinicExpanded(clinic.id)}
            >
              <div className="flex items-center gap-1.5 py-1.5">
                <Checkbox
                  checked={isFullySelected}
                  onCheckedChange={() => onClinicToggle?.(clinic.id, true)}
                  className={cn(
                    "border-muted-foreground h-6 w-6 data-[state=checked]:bg-primary data-[state=checked]:border-primary",
                    hasAnySelected && !isFullySelected && "data-[state=unchecked]:bg-primary/40"
                  )}
                  onClick={(e) => e.stopPropagation()}
                />
                <button
                  className="flex items-center gap-1.5 flex-1 text-left hover:text-primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClinicToggle?.(clinic.id, false);
                  }}
                >
                  <Building2 className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground flex-1 truncate hover:text-primary">{clinic.name}</span>
                </button>
                <CollapsibleTrigger asChild>
                  <button className="p-0.5 hover:bg-[#152238] rounded" onClick={(e) => e.stopPropagation()}>
                    <ChevronDown
                      className={cn(
                        'w-3 h-3 text-muted-foreground transition-transform',
                        !isExpanded && '-rotate-90'
                      )}
                    />
                  </button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent className="pl-5">
                {filteredDentists.map((dentist) => {
                  const isSelected = isDentistSelected(dentist.id, clinic.id);
                  const worksOnDemo = dentistWorksOnDemo(clinic.id, dentist.id);
                  const isSelfLabel = userRole === 'dentist' && dentist.id === '1' && clinic.id === '1';
                  
                  return (
                    <div
                      key={`${clinic.id}-${dentist.id}`}
                      className={cn(
                        "flex items-center gap-2 py-1 hover:bg-[#152238] rounded px-1.5 -mx-1.5"
                      )}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => onDentistToggle(dentist.id, true, clinic.id)}
                        className="border-muted-foreground h-6 w-6 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <button 
                        className="flex flex-col min-w-0 text-left cursor-pointer hover:text-primary"
                        onClick={() => onDentistToggle(dentist.id, false, clinic.id)}
                      >
                        <span className={cn(
                          'text-xs truncate', 
                          isSelected && 'font-medium',
                          !worksOnDemo && 'text-muted-foreground/60'
                        )}>
                          {dentist.name}{isSelfLabel ? ' (Eu)' : ''}
                          {!worksOnDemo && ' •'}
                        </span>
                        <span className="text-[9px] text-muted-foreground">
                          {dentist.workingHours || '9h-21h'}
                        </span>
                      </button>
                    </div>
                  );
                })}
              </CollapsibleContent>
            </Collapsible>
          );
        })}

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

      {/* New filter groups: Patient Status + Consultation Types */}
      <div className="flex-shrink-0">
        <AgendaFilterGroups compact />
      </div>

      {/* Footer */}
      <div className="border-t border-[#1E3A5F] p-2 text-center flex-shrink-0">
        <p className="text-[9px] text-muted-foreground">SmileCheck © 2026</p>
      </div>
      </div>
    </aside>
  );
}
