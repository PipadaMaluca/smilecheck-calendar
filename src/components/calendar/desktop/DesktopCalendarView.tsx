import { useState, useMemo, useCallback, useEffect } from 'react';
import { Menu, ChevronLeft, ChevronRight, User, Search, Stethoscope, Building2, CalendarClock } from 'lucide-react';
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
import { DashboardView } from '@/components/dashboard/DashboardView';
import { AccountView } from '@/components/account/AccountView';
import { TeamView } from '@/components/team/TeamView';
import { ConversationsView } from '@/components/conversations/ConversationsView';
import { HealthView } from '@/components/health/HealthView';
import { TriageInline } from '@/components/triage/TriageInline';
import { PrescriptionFlow } from '@/components/prescription/PrescriptionFlow';
import { ProfileView } from '@/components/profile/ProfileView';
import { EditProfileView } from '@/components/profile/EditProfileView';
import { RankingsView } from '@/components/rankings/RankingsView';
import { AchievementsView } from '@/components/achievements/AchievementsView';
import { Consultation, TimeSlot, UserRole } from '@/types/calendar';
import { mockConsultations, mockDentists, mockFamilyMembers, mockPatientConsultations, mockClinics, getDentistsForClinic, dentistWorksOnDemo, generateTimeSlots } from '@/data/mockData';
import { isSameDay } from 'date-fns';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import smileIcon from '@/assets/smilecheck-icon.png';
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
  const [activeNavTab, setActiveNavTab] = useState('home');
  const [showTriage, setShowTriage] = useState(false);
  const [showPrescription, setShowPrescription] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
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
      return <PatientSidebar selectedDate={selectedDate} onDateSelect={setSelectedDate} familyMembers={mockFamilyMembers} selectedMemberIds={selectedFamilyMemberIds} onMemberToggle={handleFamilyMemberToggle} onSelectAllMembers={handleSelectAllFamilyMembers} appointmentDates={appointmentDates} onNewConsultation={() => { setShowTriage(true); setActiveNavTab('agenda'); }} />;
    }
    return <DesktopCalendarSidebar selectedDate={selectedDate} onDateSelect={setSelectedDate} dentists={mockDentists} selectedDentistIds={selectedDentistIds} onDentistToggle={handleDentistToggle} onSelectAllDentists={handleSelectAllDentists} onSelectPresentDentists={handleSelectPresentDentists} onClinicToggle={handleClinicToggle} appointmentDates={appointmentDates} userRole={activeRole} isTodosSelected={isTodosSelected} onToggleTodos={handleToggleTodos} />;
  };
  const renderContent = () => {
    if (showTriage && activeRole === 'patient') {
      return <TriageInline onClose={() => setShowTriage(false)} onGoHome={() => { setShowTriage(false); setActiveNavTab('home'); }} />;
    }
    if (activeRole === 'patient') {
      return <PatientAppointmentsList consultations={patientConsultations} selectedDate={selectedDate} onConsultationClick={setSelectedConsultation} />;
    }
    if (viewMode === 'list') {
      return <ListView consultations={dayConsultations} dentists={dentistsForTimeline.map(d => d.dentist)} onConsultationClick={setSelectedConsultation} />;
    }
    return <DesktopTimeline dentistColumns={dentistsForTimeline} slotsPerDentist={slotsPerDentist} onSlotClick={handleSlotClick} selectedDate={selectedDate} />;
  };
  const handleNavTabChange = useCallback((tab: string) => {
    setActiveNavTab(tab);
    setShowTriage(false);
  }, []);

  // Listen for global "go home" events from booking flows opened via ClickableDentistName
  useEffect(() => {
    const handler = () => {
      setActiveNavTab('home');
      setShowTriage(false);
    };
    window.addEventListener('smilecheck:go-home', handler);
    return () => window.removeEventListener('smilecheck:go-home', handler);
  }, []);

  return <div className="h-screen flex bg-background relative">
      {/* Background Watermark Logo */}
      <div 
        className="fixed inset-0 pointer-events-none flex items-center justify-center opacity-5 z-0"
        style={{
          backgroundImage: `url(${smileIcon})`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundSize: '60%',
        }}
      />
      {/* Sidebar 1 - Navigation (dark blue #0A1929) */}
      <DesktopNavSidebar isExpanded={isNavExpanded} activeTab={activeNavTab} onTabChange={handleNavTabChange} userRole={activeRole} onPrescribe={() => setShowPrescription(true)} />

      {activeNavTab === 'home' ? (
        /* Dashboard View */
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="h-16 bg-card/50 backdrop-blur border-b border-border flex items-center justify-between px-6 flex-shrink-0">
            <span className="text-sm font-medium capitalize text-foreground">
              {selectedDate.toLocaleDateString('pt-PT', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>

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

            <button className="flex items-center gap-3 hover:opacity-80 transition-opacity" onClick={() => setShowProfile(true)}>
              <div className="text-right">
                <p className="text-sm font-bold text-foreground">
                  {activeRole === 'patient' ? mockFamilyMembers[0].name : activeRole === 'dentist' ? mockDentists[0].name : mockClinics[0].name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {activeRole === 'patient' ? 'Paciente' : activeRole === 'dentist' ? 'Dentista' : 'Clínica'}
                </p>
              </div>
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
            </button>
          </header>

          <DashboardView userRole={activeRole} onNavigate={handleNavTabChange} onStartTriage={() => { setShowTriage(true); setActiveNavTab('agenda'); }} />
        </div>
      ) : activeNavTab === 'agenda' ? (
        /* Calendar View */
        <>
          {/* Vertical separator line */}
          {isNavExpanded && <div className="w-px bg-[#1E3A5F] flex-shrink-0" />}

          {/* Sidebar 2 - Calendar + Dentists/Family */}
          {renderSidebar()}

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <header className="h-16 bg-card/50 backdrop-blur border-b border-border flex items-center justify-between px-6 flex-shrink-0">
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
                <span className="text-sm font-medium capitalize text-foreground">
                  {selectedDate.toLocaleDateString('pt-PT', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>

              <div className="items-center gap-4 flex flex-row">
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
                    <ToggleGroup type="single" value={viewMode} onValueChange={val => val && setViewMode(val as ViewMode)} className="bg-secondary/50 rounded-lg p-1">
                      <ToggleGroupItem value="list" className="px-3 py-1 text-xs data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">Lista</ToggleGroupItem>
                      <ToggleGroupItem value="day" className="px-3 py-1 text-xs data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">Dia</ToggleGroupItem>
                      <ToggleGroupItem value="week" className="px-3 py-1 text-xs data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">Semana</ToggleGroupItem>
                      <ToggleGroupItem value="month" className="px-3 py-1 text-xs data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">Mês</ToggleGroupItem>
                    </ToggleGroup>
                    <Button variant="ghost" size="sm" className="text-xs gap-2 text-muted-foreground">
                      <CalendarClock className="w-4 h-4" />
                      Modificar horários
                    </Button>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input placeholder="Pesquisar pacientes..." className="pl-9 h-9 w-56 text-sm" />
                    </div>
                  </>}
              </div>

              <button className="flex items-center gap-3 hover:opacity-80 transition-opacity" onClick={() => setShowProfile(true)}>
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground">
                    {activeRole === 'patient' ? mockFamilyMembers[0].name : activeRole === 'dentist' ? mockDentists[0].name : mockClinics[0].name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {activeRole === 'patient' ? 'Paciente' : activeRole === 'dentist' ? 'Dentista' : 'Clínica'}
                  </p>
                </div>
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
              </button>
            </header>

            {(activeRole === 'clinic' || activeRole === 'dentist') && <CategoryLegend />}

            <div className="flex-1 flex overflow-hidden">
              {renderContent()}
            </div>
          </div>
        </>
      ) : activeNavTab === 'team' ? (
        /* Team View */
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="h-16 bg-card/50 backdrop-blur border-b border-border flex items-center justify-between px-6 flex-shrink-0">
            <span className="text-sm font-medium text-foreground">Equipa</span>
            <div className="flex items-center gap-1 bg-secondary/50 rounded-lg p-1">
              <Button variant="ghost" size="sm" onClick={() => setActiveRole('patient')} className={cn('gap-2 px-3 py-1 text-xs transition-all', activeRole === 'patient' ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'text-muted-foreground hover:text-foreground')}>
                <User className="w-4 h-4" /> Paciente
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setActiveRole('dentist')} className={cn('gap-2 px-3 py-1 text-xs transition-all', activeRole === 'dentist' ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'text-muted-foreground hover:text-foreground')}>
                <Stethoscope className="w-4 h-4" /> Dentista
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setActiveRole('clinic')} className={cn('gap-2 px-3 py-1 text-xs transition-all', activeRole === 'clinic' ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'text-muted-foreground hover:text-foreground')}>
                <Building2 className="w-4 h-4" /> Clínica
              </Button>
            </div>
            <button className="flex items-center gap-3 hover:opacity-80 transition-opacity" onClick={() => setShowProfile(true)}>
              <div className="text-right">
                <p className="text-sm font-bold text-foreground">
                  {activeRole === 'patient' ? mockFamilyMembers[0].name : activeRole === 'dentist' ? mockDentists[0].name : mockClinics[0].name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {activeRole === 'patient' ? 'Paciente' : activeRole === 'dentist' ? 'Dentista' : 'Clínica'}
                </p>
              </div>
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
            </button>
          </header>
          <TeamView userRole={activeRole} onNavigate={handleNavTabChange} />
        </div>
      ) : activeNavTab === 'conta' ? (
        /* Account View */
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="h-16 bg-card/50 backdrop-blur border-b border-border flex items-center justify-between px-6 flex-shrink-0">
            <span className="text-sm font-medium text-foreground">Conta</span>
            <div className="flex items-center gap-1 bg-secondary/50 rounded-lg p-1">
              <Button variant="ghost" size="sm" onClick={() => setActiveRole('patient')} className={cn('gap-2 px-3 py-1 text-xs transition-all', activeRole === 'patient' ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'text-muted-foreground hover:text-foreground')}>
                <User className="w-4 h-4" /> Paciente
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setActiveRole('dentist')} className={cn('gap-2 px-3 py-1 text-xs transition-all', activeRole === 'dentist' ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'text-muted-foreground hover:text-foreground')}>
                <Stethoscope className="w-4 h-4" /> Dentista
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setActiveRole('clinic')} className={cn('gap-2 px-3 py-1 text-xs transition-all', activeRole === 'clinic' ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'text-muted-foreground hover:text-foreground')}>
                <Building2 className="w-4 h-4" /> Clínica
              </Button>
            </div>
            <button className="flex items-center gap-3 hover:opacity-80 transition-opacity" onClick={() => setShowProfile(true)}>
              <div className="text-right">
                <p className="text-sm font-bold text-foreground">
                  {activeRole === 'patient' ? mockFamilyMembers[0].name : activeRole === 'dentist' ? mockDentists[0].name : mockClinics[0].name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {activeRole === 'patient' ? 'Paciente' : activeRole === 'dentist' ? 'Dentista' : 'Clínica'}
                </p>
              </div>
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
            </button>
          </header>
          <AccountView userRole={activeRole} onNavigate={handleNavTabChange} onEditProfile={() => setShowEditProfile(true)} />
        </div>
      ) : activeNavTab === 'conversas' ? (
        /* Conversations View */
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="h-16 bg-card/50 backdrop-blur border-b border-border flex items-center justify-between px-6 flex-shrink-0">
            <span className="text-sm font-medium text-foreground">Conversas</span>
            <div className="flex items-center gap-1 bg-secondary/50 rounded-lg p-1">
              <Button variant="ghost" size="sm" onClick={() => setActiveRole('patient')} className={cn('gap-2 px-3 py-1 text-xs transition-all', activeRole === 'patient' ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'text-muted-foreground hover:text-foreground')}>
                <User className="w-4 h-4" /> Paciente
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setActiveRole('dentist')} className={cn('gap-2 px-3 py-1 text-xs transition-all', activeRole === 'dentist' ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'text-muted-foreground hover:text-foreground')}>
                <Stethoscope className="w-4 h-4" /> Dentista
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setActiveRole('clinic')} className={cn('gap-2 px-3 py-1 text-xs transition-all', activeRole === 'clinic' ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'text-muted-foreground hover:text-foreground')}>
                <Building2 className="w-4 h-4" /> Clínica
              </Button>
            </div>
            <button className="flex items-center gap-3 hover:opacity-80 transition-opacity" onClick={() => setShowProfile(true)}>
              <div className="text-right">
                <p className="text-sm font-bold text-foreground">
                  {activeRole === 'patient' ? mockFamilyMembers[0].name : activeRole === 'dentist' ? mockDentists[0].name : mockClinics[0].name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {activeRole === 'patient' ? 'Paciente' : activeRole === 'dentist' ? 'Dentista' : 'Clínica'}
                </p>
              </div>
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
            </button>
          </header>
          <ConversationsView userRole={activeRole} onNavigate={handleNavTabChange} />
        </div>
      ) : activeNavTab === 'saude' && activeRole === 'patient' ? (
        /* Health View - Patient only */
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="h-16 bg-card/50 backdrop-blur border-b border-border flex items-center justify-between px-6 flex-shrink-0">
            <span className="text-sm font-medium text-foreground">Saúde</span>
            <div className="flex items-center gap-1 bg-secondary/50 rounded-lg p-1">
              <Button variant="ghost" size="sm" onClick={() => setActiveRole('patient')} className={cn('gap-2 px-3 py-1 text-xs transition-all bg-primary text-primary-foreground hover:bg-primary/90')}>
                <User className="w-4 h-4" /> Paciente
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setActiveRole('dentist')} className={cn('gap-2 px-3 py-1 text-xs transition-all text-muted-foreground hover:text-foreground')}>
                <Stethoscope className="w-4 h-4" /> Dentista
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setActiveRole('clinic')} className={cn('gap-2 px-3 py-1 text-xs transition-all text-muted-foreground hover:text-foreground')}>
                <Building2 className="w-4 h-4" /> Clínica
              </Button>
            </div>
            <button className="flex items-center gap-3 hover:opacity-80 transition-opacity" onClick={() => setShowProfile(true)}>
              <div className="text-right">
                <p className="text-sm font-bold text-foreground">{mockFamilyMembers[0].name}</p>
                <p className="text-xs text-muted-foreground">Paciente</p>
              </div>
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
            </button>
          </header>
          <HealthView userRole="patient" onNavigate={handleNavTabChange} />
        </div>
      ) : activeNavTab === 'classificacoes' && activeRole !== 'patient' ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          <RankingsView userRole={activeRole} />
        </div>
      ) : activeNavTab === 'conquistas' ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          <AchievementsView userRole={activeRole} />
        </div>
      ) : (
        /* Placeholder for other tabs */
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <p className="text-lg">Secção em construção...</p>
        </div>
      )}

      {/* Edit Consultation Modal */}
      <EditConsultationModal consultation={selectedConsultation} isOpen={!!selectedConsultation} onClose={() => setSelectedConsultation(null)} onSave={updated => {
      console.log('Saved consultation:', updated);
      setSelectedConsultation(null);
    }} onCancel={consultation => {
      console.log('Cancelled consultation:', consultation);
      setSelectedConsultation(null);
    }} />

      {/* Prescription Flow */}
      {showPrescription && (
        <PrescriptionFlow
          onClose={() => setShowPrescription(false)}
          onGoHome={() => { setShowPrescription(false); setActiveNavTab('home'); }}
        />
      )}

      {/* Profile View */}
      <ProfileView userRole={activeRole} isOpen={showProfile} onClose={() => setShowProfile(false)} />

      {/* Edit Profile View (from Account) */}
      <EditProfileView userRole={activeRole} isOpen={showEditProfile} onClose={() => setShowEditProfile(false)} onSave={() => setShowEditProfile(false)} />
    </div>;
}