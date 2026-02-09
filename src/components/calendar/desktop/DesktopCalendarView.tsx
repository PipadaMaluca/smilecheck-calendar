import { useState, useMemo, useCallback } from 'react';
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
import { mockConsultations, mockDentists, mockFamilyMembers, mockPatientConsultations, mockClinics, getDentistsForClinic, dentistWorksOnDemo, generateTimeSlots } from '@/data/mockData';
import { format, isSameDay } from 'date-fns';
import { pt } from 'date-fns/locale';
import { cn } from '@/lib/utils';
type ViewMode = 'list' | 'day' | 'week' | 'month';

// Build all clinic-dentist combinations as composite keys
const getAllClinicDentistKeys = () => {
  const keys: string[] = [];
  mockClinics.forEach(clinic => {
    getDentistsForClinic(clinic.id).forEach(dentist => {
      keys.push(`${clinic.id}-${dentist.id}`);
    });
  });
  return keys;
};

// Get only dentists who work on demo day (Jan 31)
const getPresentDentistKeys = () => {
  const keys: string[] = [];
  mockClinics.forEach(clinic => {
    getDentistsForClinic(clinic.id).forEach(dentist => {
      if (dentistWorksOnDemo(clinic.id, dentist.id)) {
        keys.push(`${clinic.id}-${dentist.id}`);
      }
    });
  });
  return keys;
};
export function DesktopCalendarView() {
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 0, 31)); // Default to Jan 31 to show the example
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [isNavExpanded, setIsNavExpanded] = useState(true);
  // Start with all present dentists selected (7 who work that day)
  const [selectedDentistIds, setSelectedDentistIds] = useState<string[]>(getPresentDentistKeys());
  const [selectedFamilyMemberIds, setSelectedFamilyMemberIds] = useState<string[]>(mockFamilyMembers.map(m => m.id));
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [activeRole, setActiveRole] = useState<UserRole>('clinic');
  const [activeNavTab, setActiveNavTab] = useState('agenda');
  const appointmentDates = mockConsultations.map(c => c.date);

  // Check if "Todos" is effectively selected (all present dentists)
  const presentKeys = getPresentDentistKeys();
  const isTodosSelected = presentKeys.every(key => selectedDentistIds.includes(key));

  // Build the list of dentists to show based on selections (with their clinic context)
  const filteredDentists = useMemo(() => {
    if (selectedDentistIds.length === 0) {
      return [];
    }
    const result: {
      dentist: typeof mockDentists[0];
      clinicId: string;
      worksToday: boolean;
      key: string;
    }[] = [];
    selectedDentistIds.forEach(key => {
      const parts = key.split('-');
      if (parts.length !== 2) return;
      const [clinicId, dentistId] = parts;
      const dentist = mockDentists.find(d => d.id === dentistId);
      const worksToday = dentistWorksOnDemo(clinicId, dentistId);
      if (dentist) {
        result.push({
          dentist,
          clinicId,
          worksToday,
          key
        });
      }
    });
    return result;
  }, [selectedDentistIds]);

  // Get unique dentists for timeline (avoiding duplicates for same dentist different clinics)
  const dentistsForTimeline = useMemo(() => {
    // For timeline, we need to show each dentist-clinic combo as a separate column
    return filteredDentists;
  }, [filteredDentists]);
  const slotsPerDentist = useMemo(() => {
    const result: Record<string, TimeSlot[]> = {};
    filteredDentists.forEach(({
      dentist,
      clinicId,
      key
    }) => {
      const dentistConsultations = mockConsultations.filter(c => c.dentist.id === dentist.id && c.clinic.id === clinicId);
      // Use composite key for slot lookup
      result[key] = generateTimeSlots(selectedDate, dentistConsultations);
    });
    return result;
  }, [selectedDate, filteredDentists]);

  // Day consultations for list view
  const dayConsultations = useMemo(() => {
    if (selectedDentistIds.length === 0) return [];
    return mockConsultations.filter(c => {
      if (!isSameDay(c.date, selectedDate)) return false;
      const key = `${c.clinic.id}-${c.dentist.id}`;
      return selectedDentistIds.includes(key);
    });
  }, [selectedDate, selectedDentistIds]);

  // Patient consultations - use the dedicated mock data
  const patientConsultations = useMemo(() => {
    // Filter by selected family members
    if (selectedFamilyMemberIds.length === mockFamilyMembers.length) {
      return mockPatientConsultations; // All selected
    }
    return mockPatientConsultations.filter(c => selectedFamilyMemberIds.includes(c.patient.id));
  }, [selectedFamilyMemberIds]);

  // FIXED: Toggle individual dentist (checkbox click adds/removes, name click is exclusive)
  const handleDentistToggle = useCallback((dentistId: string, isCheckbox: boolean, clinicId?: string) => {
    if (!clinicId) return;
    const key = `${clinicId}-${dentistId}`;
    if (isCheckbox) {
      // Checkbox click: toggle this dentist in multi-select mode
      setSelectedDentistIds(prev => {
        if (prev.includes(key)) {
          // Remove this dentist
          return prev.filter(id => id !== key);
        } else {
          // Add this dentist
          return [...prev, key];
        }
      });
    } else {
      // Name click: select ONLY this dentist (exclusive selection)
      setSelectedDentistIds([key]);
    }
  }, []);

  // FIXED: Toggle clinic (checkbox toggles all, name is exclusive)
  const handleClinicToggle = useCallback((clinicId: string, isCheckbox: boolean) => {
    const dentistsInClinic = getDentistsForClinic(clinicId);
    const clinicKeys = dentistsInClinic.map(d => `${clinicId}-${d.id}`);
    if (isCheckbox) {
      // Checkbox click: toggle all dentists in this clinic
      setSelectedDentistIds(prev => {
        const allSelected = clinicKeys.every(key => prev.includes(key));
        if (allSelected) {
          // Remove all from this clinic
          return prev.filter(id => !clinicKeys.includes(id));
        } else {
          // Add all from this clinic (merge with existing)
          return [...new Set([...prev, ...clinicKeys])];
        }
      });
    } else {
      // Name click: select ONLY this clinic's dentists (exclusive selection)
      setSelectedDentistIds(clinicKeys);
    }
  }, []);

  // FIXED: "Todos" toggle - toggles between present dentists and none
  const handleToggleTodos = useCallback(() => {
    const presentKeys = getPresentDentistKeys();
    const allPresent = presentKeys.every(key => selectedDentistIds.includes(key));
    if (allPresent) {
      // Currently all present are selected -> deselect all
      setSelectedDentistIds([]);
    } else {
      // Not all present are selected -> select all present
      setSelectedDentistIds(presentKeys);
    }
  }, [selectedDentistIds]);

  // FIXED: Select all dentists who are present (Filtrar Presentes button)
  const handleSelectPresentDentists = useCallback(() => {
    setSelectedDentistIds(getPresentDentistKeys());
  }, []);

  // Select all dentists (click on "Todos" text)
  const handleSelectAllDentists = useCallback(() => {
    // When clicking on "Todos" text, select all present dentists
    setSelectedDentistIds(getPresentDentistKeys());
  }, []);
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
    return <DesktopCalendarSidebar selectedDate={selectedDate} onDateSelect={setSelectedDate} dentists={mockDentists} selectedDentistIds={selectedDentistIds} onDentistToggle={handleDentistToggle} onSelectAllDentists={handleSelectAllDentists} onSelectPresentDentists={handleSelectPresentDentists} onClinicToggle={handleClinicToggle} appointmentDates={appointmentDates} userRole={activeRole} isTodosSelected={isTodosSelected} onToggleTodos={handleToggleTodos} />;
  };
  const renderContent = () => {
    if (activeRole === 'patient') {
      return <PatientAppointmentsList consultations={patientConsultations} selectedDate={selectedDate} onConsultationClick={setSelectedConsultation} />;
    }
    if (viewMode === 'list') {
      return <ListView consultations={dayConsultations} dentists={dentistsForTimeline.map(d => d.dentist)} onConsultationClick={setSelectedConsultation} />;
    }
    return <DesktopTimeline dentistColumns={dentistsForTimeline} slotsPerDentist={slotsPerDentist} onSlotClick={handleSlotClick} selectedDate={selectedDate} />;
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
          <div className="items-center gap-4 flex flex-row pr-[200px]">
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