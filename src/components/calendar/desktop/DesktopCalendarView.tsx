import { useState, useMemo } from 'react';
import { Menu, ChevronLeft, ChevronRight, HelpCircle, Bell, User, Settings, CalendarClock, Stethoscope, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { DesktopNavSidebar } from './DesktopNavSidebar';
import { DesktopCalendarSidebar } from './DesktopCalendarSidebar';
import { PatientSidebar } from './PatientSidebar';
import { DesktopTimeline } from './DesktopTimeline';
import { ListView } from './ListView';
import { PatientAppointmentsList } from '../PatientAppointmentsList';
import { CategoryLegend } from '../CategoryLegend';
import { EditConsultationModal } from '../EditConsultationModal';
import { Consultation, TimeSlot, UserRole } from '@/types/calendar';
import { mockConsultations, mockDentists, mockFamilyMembers, mockPatientConsultations, generateTimeSlots } from '@/data/mockData';
import { format, isSameDay } from 'date-fns';
import { pt } from 'date-fns/locale';
import { cn } from '@/lib/utils';
type ViewMode = 'list' | 'day' | 'week' | 'month';

export function DesktopCalendarView() {
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 0, 31)); // Default to Jan 31 to show the example
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [isNavExpanded, setIsNavExpanded] = useState(true);
  const [selectedDentistIds, setSelectedDentistIds] = useState<string[]>([mockDentists[0].id]); // Dentist view: only self selected
  const [selectedFamilyMemberIds, setSelectedFamilyMemberIds] = useState<string[]>(mockFamilyMembers.map(m => m.id));
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [activeRole, setActiveRole] = useState<UserRole>('clinic');
  const [activeNavTab, setActiveNavTab] = useState('agenda');
  const appointmentDates = mockConsultations.map(c => c.date);

  // For clinic view: all selected dentists, for dentist view: self + optionally others
  const filteredDentists = useMemo(() => {
    if (activeRole === 'dentist') {
      // Always include self (first dentist), plus any others selected
      const selfId = mockDentists[0].id;
      const selectedOthers = selectedDentistIds.filter(id => id !== selfId);
      const result = [mockDentists[0]];
      selectedOthers.forEach(id => {
        const dentist = mockDentists.find(d => d.id === id);
        if (dentist) result.push(dentist);
      });
      return result;
    }
    return mockDentists.filter(d => selectedDentistIds.includes(d.id));
  }, [selectedDentistIds, activeRole]);
  const slotsPerDentist = useMemo(() => {
    const result: Record<string, TimeSlot[]> = {};
    filteredDentists.forEach(dentist => {
      const dentistConsultations = mockConsultations.filter(c => c.dentist.id === dentist.id);
      result[dentist.id] = generateTimeSlots(selectedDate, dentistConsultations);
    });
    return result;
  }, [selectedDate, filteredDentists]);

  // Day consultations for list view
  const dayConsultations = useMemo(() => {
    return mockConsultations.filter(c => isSameDay(c.date, selectedDate) && (activeRole === 'clinic' || c.dentist.id === mockDentists[0].id || selectedDentistIds.includes(c.dentist.id)));
  }, [selectedDate, activeRole, selectedDentistIds]);

  // Patient consultations - use the dedicated mock data
  const patientConsultations = useMemo(() => {
    // Filter by selected family members
    if (selectedFamilyMemberIds.length === mockFamilyMembers.length) {
      return mockPatientConsultations; // All selected
    }
    return mockPatientConsultations.filter(c => 
      selectedFamilyMemberIds.includes(c.patient.id)
    );
  }, [selectedFamilyMemberIds]);
  const handleDentistToggle = (dentistId: string, isCheckbox: boolean, clinicId?: string) => {
    if (activeRole === 'dentist') {
      // For dentist view, self is always selected, toggle others as columns
      const selfId = mockDentists[0].id;
      if (dentistId === selfId && clinicId === '1') return; // Can't deselect self at primary clinic

      const key = clinicId ? `${clinicId}-${dentistId}` : dentistId;
      
      if (isCheckbox) {
        // Checkbox click: toggle this dentist
        setSelectedDentistIds(prev => {
          if (prev.includes(key) || prev.includes(dentistId)) {
            return prev.filter(id => id !== key && id !== dentistId);
          }
          return [...prev, key];
        });
      } else {
        // Name click: select ONLY this dentist
        setSelectedDentistIds([key]);
      }
    } else {
      const key = clinicId ? `${clinicId}-${dentistId}` : dentistId;
      
      if (isCheckbox) {
        // Checkbox click: toggle this dentist
        setSelectedDentistIds(prev => {
          if (prev.includes(key) || prev.includes(dentistId)) {
            if (prev.length === 1) return prev;
            return prev.filter(id => id !== key && id !== dentistId);
          }
          return [...prev, key];
        });
      } else {
        // Name click: select ONLY this dentist
        setSelectedDentistIds([key]);
      }
    }
  };
  const handleSelectAllDentists = () => {
    if (activeRole === 'dentist') {
      // Toggle between just self and all
      if (selectedDentistIds.length === mockDentists.length) {
        setSelectedDentistIds([mockDentists[0].id]);
      } else {
        setSelectedDentistIds(mockDentists.map(d => d.id));
      }
    } else {
      if (selectedDentistIds.length === mockDentists.length) {
        setSelectedDentistIds([mockDentists[0].id]);
      } else {
        setSelectedDentistIds(mockDentists.map(d => d.id));
      }
    }
  };
  const handleFamilyMemberToggle = (memberId: string) => {
    setSelectedFamilyMemberIds(prev => {
      if (prev.includes(memberId)) {
        if (prev.length === 1) return prev;
        return prev.filter(id => id !== memberId);
      }
      return [...prev, memberId];
    });
  };
  const handleSelectAllFamilyMembers = () => {
    if (selectedFamilyMemberIds.length === mockFamilyMembers.length) {
      setSelectedFamilyMemberIds([mockFamilyMembers[0].id]);
    } else {
      setSelectedFamilyMemberIds(mockFamilyMembers.map(m => m.id));
    }
  };
  const handleSlotClick = (slot: TimeSlot) => {
    if (slot.consultation) {
      setSelectedConsultation(slot.consultation);
    }
  };
  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };
  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };
  const goToToday = () => {
    setSelectedDate(new Date());
  };
  const renderSidebar = () => {
    if (!isNavExpanded) return null;
    if (activeRole === 'patient') {
      return <PatientSidebar selectedDate={selectedDate} onDateSelect={setSelectedDate} familyMembers={mockFamilyMembers} selectedMemberIds={selectedFamilyMemberIds} onMemberToggle={handleFamilyMemberToggle} onSelectAllMembers={handleSelectAllFamilyMembers} appointmentDates={appointmentDates} />;
    }
    return <DesktopCalendarSidebar selectedDate={selectedDate} onDateSelect={setSelectedDate} dentists={mockDentists} selectedDentistIds={selectedDentistIds} onDentistToggle={handleDentistToggle} onSelectAllDentists={handleSelectAllDentists} appointmentDates={appointmentDates} userRole={activeRole} />;
  };
  const renderContent = () => {
    if (activeRole === 'patient') {
      return <PatientAppointmentsList consultations={patientConsultations} selectedDate={selectedDate} onConsultationClick={setSelectedConsultation} />;
    }
    if (viewMode === 'list') {
      return <ListView consultations={dayConsultations} dentists={filteredDentists} onConsultationClick={setSelectedConsultation} />;
    }
    return <DesktopTimeline dentists={filteredDentists} slotsPerDentist={slotsPerDentist} onSlotClick={handleSlotClick} selectedDate={selectedDate} />;
  };
  return <div className="h-screen flex bg-background">
      {/* Sidebar 1 - Navigation (dark blue #0A1929) */}
      <DesktopNavSidebar isExpanded={isNavExpanded} activeTab={activeNavTab} onTabChange={setActiveNavTab} userRole={activeRole} />

      {/* Vertical separator line */}
      {isNavExpanded && <div className="w-px bg-[#1E3A5F] flex-shrink-0" />}

      {/* Sidebar 2 - Calendar + Dentists/Family (lighter blue #0D2137) - Only visible when expanded */}
      {renderSidebar()}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-14 border-b border-border flex items-center justify-between px-4 flex-shrink-0 bg-sidebar">
          {/* Left Section */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" onClick={() => setIsNavExpanded(!isNavExpanded)}>
              <Menu className="w-5 h-5" />
            </Button>

            <div className="h-6 w-px bg-border" />

            <Button variant="secondary" size="sm" onClick={goToToday} className="font-medium">
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
              {format(selectedDate, "EEEE d MMMM yyyy", {
              locale: pt
            })}
            </span>
          </div>

          {/* Center Section - Role Selector + View Toggle */}
          <div className="flex items-center gap-4">
            {/* Role Selector */}
            <div className="flex items-center gap-1 bg-secondary/50 rounded-lg p-1">
              <Button variant="ghost" size="sm" onClick={() => setActiveRole('patient')} className={cn('gap-2 px-3 py-1 text-xs transition-all', activeRole === 'patient' ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'text-muted-foreground hover:text-foreground')}>
                <User className="w-4 h-4" />
                Paciente
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setActiveRole('dentist')} className={cn('gap-2 px-3 py-1 text-xs transition-all', activeRole === 'dentist' ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'text-muted-foreground hover:text-foreground')}>
                <Stethoscope className="w-4 h-4" />
                Dentista
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setActiveRole('clinic')} className={cn('gap-2 px-3 py-1 text-xs transition-all', activeRole === 'clinic' ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'text-muted-foreground hover:text-foreground')}>
                <Building2 className="w-4 h-4" />
                Clínica
              </Button>
            </div>

            {(activeRole === 'clinic' || activeRole === 'dentist') && <>
                <div className="h-6 w-px bg-border" />

                {/* View Mode Toggle */}
                <ToggleGroup type="single" value={viewMode} onValueChange={val => val && setViewMode(val as ViewMode)} className="bg-secondary/50 rounded-lg p-1">
                  <ToggleGroupItem value="list" className="px-3 py-1 text-xs data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                    Lista
                  </ToggleGroupItem>
                  <ToggleGroupItem value="day" className="px-3 py-1 text-xs data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                    Dia
                  </ToggleGroupItem>
                  <ToggleGroupItem value="week" className="px-3 py-1 text-xs data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                    Semana
                  </ToggleGroupItem>
                  <ToggleGroupItem value="month" className="px-3 py-1 text-xs data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                    Mês
                  </ToggleGroupItem>
                </ToggleGroup>

                <Button variant="ghost" size="sm" className="text-xs gap-2 text-muted-foreground">
                  <CalendarClock className="w-4 h-4" />
                  Modificar horários
                </Button>
              </>}
          </div>

          {/* Right Section - Help, Settings, Notifications, Profile */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <HelpCircle className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <Settings className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <User className="w-5 h-5" />
            </Button>
          </div>
        </header>

        {/* Category Legend - visible for dentist and clinic */}
        {(activeRole === 'clinic' || activeRole === 'dentist') && <CategoryLegend />}

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {renderContent()}
        </div>
      </div>

      {/* Edit Consultation Modal */}
      <EditConsultationModal consultation={selectedConsultation} isOpen={!!selectedConsultation} onClose={() => setSelectedConsultation(null)} onSave={updated => {
      console.log('Saved consultation:', updated);
      setSelectedConsultation(null);
    }} onCancel={consultation => {
      console.log('Cancelled consultation:', consultation);
      setSelectedConsultation(null);
    }} />
    </div>;
}