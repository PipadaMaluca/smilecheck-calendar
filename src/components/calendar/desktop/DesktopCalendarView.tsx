import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Menu, ChevronLeft, ChevronRight, User, Search, Stethoscope, Building2, CalendarClock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { DesktopNavSidebar } from './DesktopNavSidebar';
import { DesktopCalendarSidebar } from './DesktopCalendarSidebar';
import { PatientSidebar } from './PatientSidebar';
import { DesktopTimeline } from './DesktopTimeline';
import { DesktopWeekView } from './DesktopWeekView';
import { DesktopMonthView } from './DesktopMonthView';
import { ListView } from './ListView';
import { PatientAppointmentsList } from '../PatientAppointmentsList';
import { CategoryLegend } from '../CategoryLegend';
import { EditConsultationModal } from '../EditConsultationModal';
import { CopyPasteBanner } from '../CopyPasteBanner';
import { PasteConfirmationModal } from '../PasteConfirmationModal';
import { DentistFeedbackModal } from '../DentistFeedbackModal';
import { PatientFeedbackModal } from '../PatientFeedbackModal';
import { AgendaSettingsModal, DEFAULT_SETTINGS, AgendaSettings } from '../AgendaSettingsModal';
import { TimeBlockModal, TimeBlock, TimeBlockDeleteConfirm } from '../TimeBlockModal';
import { MoveConsultationModal, OverlapWarningModal, DragMoveInfo } from '../MoveConsultationModal';
import { mockScoreHistory, ConsultationScore } from '@/types/scoring';
import { DashboardView } from '@/components/dashboard/DashboardView';
import { SettingsView } from '@/components/settings/SettingsView';
import { InviteView } from '@/components/settings/InviteView';
import { TeamView } from '@/components/team/TeamView';
import { ConversationsView } from '@/components/conversations/ConversationsView';
import { HealthView } from '@/components/health/HealthView';
import { TriageInline } from '@/components/triage/TriageInline';
import { PrescriptionFlow } from '@/components/prescription/PrescriptionFlow';
import { ProfileView } from '@/components/profile/ProfileView';
import { EditProfileView } from '@/components/profile/EditProfileView';
import { RankingsView } from '@/components/rankings/RankingsView';
import { AchievementsView } from '@/components/achievements/AchievementsView';
import { ManagePlanView } from '@/components/plan/ManagePlanView';
import { RewardsStoreView } from '@/components/rewards/RewardsStoreView';
import { UnifiedSearch } from '@/components/search/UnifiedSearch';
import { FavoritesView } from '@/components/favorites/FavoritesView';
import { ReferralLetterFlow } from '@/components/referral/ReferralLetterFlow';
import { ExportReportsView } from '@/components/export/ExportReportsView';
import { SlotCreationScreen } from '../creation/SlotCreationScreen';
import { StatisticsView } from '@/components/statistics/StatisticsView';
import { FullHistoryView } from '@/components/history/FullHistoryView';
import { DentistProfileView } from '@/components/profile/DentistProfileView';
import { ClinicProfileView } from '@/components/profile/ClinicProfileView';
import { ConsultationDetailView } from './ConsultationDetailView';
import { PatientDossierView } from './PatientDossierView';
import { NotificationBell, NotificationDropdown, NotificationsFullView } from '@/components/notifications/NotificationCenter';
import { Consultation, TimeSlot, UserRole, ConsultationStatus, ViewMode } from '@/types/calendar';
import { mockConsultations, mockDentists, mockFamilyMembers, mockPatientConsultations, mockClinics, getDentistsForClinic, dentistWorksOnDemo, generateTimeSlots } from '@/data/mockData';
import { DentistSearchResult, MOCK_DENTIST_RESULTS } from '@/data/mockDentistSearch';
import { ProfileNavigationProvider } from '@/contexts/ProfileNavigationContext';
import { isSameDay, startOfWeek, endOfWeek, addDays, addWeeks, subWeeks, format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import smileIcon from '@/assets/smilecheck-icon.png';
import { toast } from 'sonner';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { TeleconsultaManager } from '@/components/teleconsulta/TeleconsultaManager';

// Build all clinic-dentist combinations as composite keys
const getAllClinicDentistKeys = () => {
  const keys: string[] = [];
  mockClinics.forEach((clinic) => {
    getDentistsForClinic(clinic.id).forEach((dentist) => {
      keys.push(`${clinic.id}-${dentist.id}`);
    });
  });
  return keys;
};

// Get only dentists who work on demo day (Jan 31)
const getPresentDentistKeys = () => {
  const keys: string[] = [];
  mockClinics.forEach((clinic) => {
    getDentistsForClinic(clinic.id).forEach((dentist) => {
      if (dentistWorksOnDemo(clinic.id, dentist.id)) {
        keys.push(`${clinic.id}-${dentist.id}`);
      }
    });
  });
  return keys;
};

export function DesktopCalendarView() {
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 0, 31));
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [isNavExpanded, setIsNavExpanded] = useState(true);
  const [selectedDentistIds, setSelectedDentistIds] = useState<string[]>(getPresentDentistKeys());
  const [selectedFamilyMemberIds, setSelectedFamilyMemberIds] = useState<string[]>(mockFamilyMembers.map((m) => m.id));
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [clipboardConsultation, setClipboardConsultation] = useState<Consultation | null>(null);
  const [pasteTarget, setPasteTarget] = useState<{time: string;dentistKey: string;dentistName: string;} | null>(null);
  const [feedbackConsultation, setFeedbackConsultation] = useState<Consultation | null>(null);
  const urlParams = new URLSearchParams(window.location.search);
  const urlRole = urlParams.get('role');
  const initialRole: UserRole = (urlRole === 'patient' || urlRole === 'dentist' || urlRole === 'clinic') ? urlRole : 'clinic';
  const [activeRole, setActiveRole] = useState<UserRole>(initialRole);
  const [activeNavTab, setActiveNavTab] = useState('home');
  const [showTriage, setShowTriage] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(['1', '2']);
  const [viewDentistProfile, setViewDentistProfile] = useState<DentistSearchResult | null>(null);
  const [viewClinicProfile, setViewClinicProfile] = useState<string | null>(null);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [patientFeedbackScore, setPatientFeedbackScore] = useState<ConsultationScore | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [agendaSettings, setAgendaSettings] = useState<AgendaSettings>({ ...DEFAULT_SETTINGS });
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockInitialDate, setBlockInitialDate] = useState<Date | undefined>();
  const [blockInitialTime, setBlockInitialTime] = useState<string | undefined>();
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [editingBlock, setEditingBlock] = useState<TimeBlock | null>(null);
  const [deletingBlock, setDeletingBlock] = useState<TimeBlock | null>(null);
  const [pendingMove, setPendingMove] = useState<DragMoveInfo | null>(null);
  const [overlapConsultation, setOverlapConsultation] = useState<Consultation | null>(null);
  const [pendingOverlapMove, setPendingOverlapMove] = useState<DragMoveInfo | null>(null);
  const [slotCreation, setSlotCreation] = useState<{date: Date;time: string;dentistKey?: string;dentistName?: string;} | null>(null);
  const [detailConsultation, setDetailConsultation] = useState<Consultation | null>(null);
  const [dossierPatientId, setDossierPatientId] = useState<string | null>(null);
  const appointmentDates = mockConsultations.map((c) => c.date);

  // Onboarding: trigger on first visit per role
  const { hasCompletedOnboarding, startCarousel, showCarousel, showTooltips } = useOnboarding();
  const onboardingTriggeredRef = useRef<Set<UserRole>>(new Set());
  useEffect(() => {
    if (!onboardingTriggeredRef.current.has(activeRole) && !hasCompletedOnboarding(activeRole) && !showCarousel && !showTooltips) {
      onboardingTriggeredRef.current.add(activeRole);
      startCarousel(activeRole);
    }
  }, [activeRole, hasCompletedOnboarding, startCarousel, showCarousel, showTooltips]);

  const handleNotificationFeedback = useCallback((scoreId: string) => {
    const score = mockScoreHistory.find((s) => s.id === scoreId);
    if (score) {
      setPatientFeedbackScore(score);
    }
  }, []);

  // Check if "Todos" is effectively selected
  const presentKeys = getPresentDentistKeys();
  const isTodosSelected = presentKeys.every((key) => selectedDentistIds.includes(key));

  // Build the list of dentists to show based on selections
  const filteredDentists = useMemo(() => {
    if (selectedDentistIds.length === 0) return [];
    const result: {dentist: typeof mockDentists[0];clinicId: string;worksToday: boolean;key: string;}[] = [];
    selectedDentistIds.forEach((key) => {
      const parts = key.split('-');
      if (parts.length !== 2) return;
      const [clinicId, dentistId] = parts;
      const dentist = mockDentists.find((d) => d.id === dentistId);
      const worksToday = dentistWorksOnDemo(clinicId, dentistId);
      if (dentist) result.push({ dentist, clinicId, worksToday, key });
    });
    return result;
  }, [selectedDentistIds]);

  const dentistsForTimeline = useMemo(() => filteredDentists, [filteredDentists]);

  const slotsPerDentist = useMemo(() => {
    const result: Record<string, TimeSlot[]> = {};
    filteredDentists.forEach(({ dentist, clinicId, key }) => {
      const dentistConsultations = mockConsultations.filter((c) => c.dentist.id === dentist.id && c.clinic.id === clinicId);
      result[key] = generateTimeSlots(selectedDate, dentistConsultations);
    });
    return result;
  }, [selectedDate, filteredDentists]);

  const dayConsultations = useMemo(() => {
    if (selectedDentistIds.length === 0) return [];
    return mockConsultations.filter((c) => {
      if (!isSameDay(c.date, selectedDate)) return false;
      const key = `${c.clinic.id}-${c.dentist.id}`;
      return selectedDentistIds.includes(key);
    });
  }, [selectedDate, selectedDentistIds]);

  const patientConsultations = useMemo(() => {
    if (selectedFamilyMemberIds.length === mockFamilyMembers.length) return mockPatientConsultations;
    return mockPatientConsultations.filter((c) => selectedFamilyMemberIds.includes(c.patient.id));
  }, [selectedFamilyMemberIds]);

  const handleDentistToggle = useCallback((dentistId: string, isCheckbox: boolean, clinicId?: string) => {
    if (!clinicId) return;
    const key = `${clinicId}-${dentistId}`;
    if (isCheckbox) {
      setSelectedDentistIds((prev) => prev.includes(key) ? prev.filter((id) => id !== key) : [...prev, key]);
    } else {
      setSelectedDentistIds([key]);
    }
  }, []);

  const handleClinicToggle = useCallback((clinicId: string, isCheckbox: boolean) => {
    const dentistsInClinic = getDentistsForClinic(clinicId);
    const clinicKeys = dentistsInClinic.map((d) => `${clinicId}-${d.id}`);
    if (isCheckbox) {
      setSelectedDentistIds((prev) => {
        const allSelected = clinicKeys.every((key) => prev.includes(key));
        return allSelected ? prev.filter((id) => !clinicKeys.includes(id)) : [...new Set([...prev, ...clinicKeys])];
      });
    } else {
      setSelectedDentistIds(clinicKeys);
    }
  }, []);

  const handleToggleTodos = useCallback(() => {
    const presentKeys = getPresentDentistKeys();
    const allPresent = presentKeys.every((key) => selectedDentistIds.includes(key));
    setSelectedDentistIds(allPresent ? [] : presentKeys);
  }, [selectedDentistIds]);

  const handleSelectPresentDentists = useCallback(() => {
    setSelectedDentistIds(getPresentDentistKeys());
  }, []);

  const handleSelectAllDentists = useCallback(() => {
    setSelectedDentistIds(getPresentDentistKeys());
  }, []);

  const handleFamilyMemberToggle = (memberId: string, isCheckbox: boolean) => {
    if (isCheckbox) {
      // Checkbox click: toggle this member without affecting others
      setSelectedFamilyMemberIds((prev) => {
        if (prev.includes(memberId)) {
          if (prev.length === 1) return prev; // keep at least one
          return prev.filter((id) => id !== memberId);
        }
        return [...prev, memberId];
      });
    } else {
      // Name click: select only this member
      setSelectedFamilyMemberIds([memberId]);
    }
  };

  const handleSelectAllFamilyMembers = () => {
    if (selectedFamilyMemberIds.length === mockFamilyMembers.length) {
      setSelectedFamilyMemberIds([mockFamilyMembers[0].id]);
    } else {
      setSelectedFamilyMemberIds(mockFamilyMembers.map((m) => m.id));
    }
  };

  // Get the first selected dentist key for single-dentist views
  const singleDentistKey = useMemo(() => {
    if (selectedDentistIds.length > 0) return selectedDentistIds[0];
    return '1-1'; // default
  }, [selectedDentistIds]);

  // Drag-and-drop move handler for day view (DesktopTimeline)
  const handleTimelineDragMove = useCallback((
  consultation: Consultation, fromTime: string, fromKey: string, fromName: string,
  toTime: string, toKey: string, toName: string) =>
  {
    // Check for overlap at target
    const [toClinicId, toDentistId] = toKey.split('-');
    const existing = mockConsultations.find((c) =>
    isSameDay(c.date, selectedDate) && c.time === toTime &&
    c.dentist.id === toDentistId && c.clinic.id === toClinicId &&
    c.id !== consultation.id
    );

    const moveInfo: DragMoveInfo = {
      consultation,
      fromDate: selectedDate, fromTime, fromDentistName: fromName,
      toDate: selectedDate, toTime, toDentistName: toName,
      toDentistKey: toKey
    };

    if (existing) {
      setPendingOverlapMove(moveInfo);
      setOverlapConsultation(existing);
    } else {
      setPendingMove(moveInfo);
    }
  }, [selectedDate]);

  // Drag-and-drop for week view
  const handleWeekDragMove = useCallback((
  consultation: Consultation, fromDate: Date, fromTime: string, toDate: Date, toTime: string) =>
  {
    const dentistKey = singleDentistKey;
    const [clinicId, dentistId] = dentistKey.split('-');
    const dentist = mockDentists.find((d) => d.id === dentistId);
    const dentistName = dentist?.name || 'Dentista';

    const existing = mockConsultations.find((c) =>
    isSameDay(c.date, toDate) && c.time === toTime &&
    c.dentist.id === dentistId && c.clinic.id === clinicId &&
    c.id !== consultation.id
    );

    const moveInfo: DragMoveInfo = {
      consultation,
      fromDate, fromTime, fromDentistName: dentistName,
      toDate, toTime, toDentistName: dentistName,
      toDentistKey: dentistKey
    };

    if (existing) {
      setPendingOverlapMove(moveInfo);
      setOverlapConsultation(existing);
    } else {
      setPendingMove(moveInfo);
    }
  }, [singleDentistKey]);

  const confirmMove = useCallback((moveInfo: DragMoveInfo) => {
    toast.success(`Consulta de ${moveInfo.consultation.patient.name} movida para ${moveInfo.toTime}`);
    setPendingMove(null);
  }, []);

  const confirmOverlap = useCallback(() => {
    if (pendingOverlapMove) {
      toast.success(`Consulta agendada com sobreposição às ${pendingOverlapMove.toTime}`);
    }
    setOverlapConsultation(null);
    setPendingOverlapMove(null);
  }, [pendingOverlapMove]);

  const handleSlotClick = (slot: TimeSlot) => {
    if (slot.consultation) {
      if (activeRole === 'dentist' || activeRole === 'clinic') {
        setDetailConsultation(slot.consultation);
      } else {
        setSelectedConsultation(slot.consultation);
      }
    }
  };

  const goToPrevious = () => {
    if (viewMode === 'week') {
      setSelectedDate((d) => subWeeks(d, 1));
    } else if (viewMode === 'month') {
      setSelectedDate((d) => {const nd = new Date(d);nd.setMonth(nd.getMonth() - 1);return nd;});
    } else {
      setSelectedDate((d) => {const nd = new Date(d);nd.setDate(nd.getDate() - 1);return nd;});
    }
  };
  const goToNext = () => {
    if (viewMode === 'week') {
      setSelectedDate((d) => addWeeks(d, 1));
    } else if (viewMode === 'month') {
      setSelectedDate((d) => {const nd = new Date(d);nd.setMonth(nd.getMonth() + 1);return nd;});
    } else {
      setSelectedDate((d) => {const nd = new Date(d);nd.setDate(nd.getDate() + 1);return nd;});
    }
  };
  const goToToday = () => {setSelectedDate(new Date());};

  const getHeaderDateLabel = () => {
    if (viewMode === 'week') {
      const ws = startOfWeek(selectedDate, { weekStartsOn: 1 });
      const we = addDays(ws, 5);
      return `Semana de ${format(ws, 'd', { locale: pt })} - ${format(we, 'd MMM yyyy', { locale: pt })}`;
    }
    if (viewMode === 'month') {
      return format(selectedDate, 'MMMM yyyy', { locale: pt });
    }
    return selectedDate.toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  // Enforce single dentist for week/month
  useEffect(() => {
    if ((viewMode === 'week' || viewMode === 'month') && selectedDentistIds.length > 1) {
      setSelectedDentistIds([selectedDentistIds[0]]);
    }
    if ((viewMode === 'week' || viewMode === 'month') && selectedDentistIds.length === 0) {
      setSelectedDentistIds(['1-1']);
    }
  }, [viewMode]);

  const renderSidebar = () => {
    if (!isNavExpanded) return null;
    if (activeRole === 'patient') {
      return <PatientSidebar selectedDate={selectedDate} onDateSelect={setSelectedDate} familyMembers={mockFamilyMembers} selectedMemberIds={selectedFamilyMemberIds} onMemberToggle={handleFamilyMemberToggle} onSelectAllMembers={handleSelectAllFamilyMembers} appointmentDates={appointmentDates} onNewConsultation={() => {setShowTriage(true);setActiveNavTab('agenda');}} />;
    }
    return <DesktopCalendarSidebar selectedDate={selectedDate} onDateSelect={setSelectedDate} dentists={mockDentists} selectedDentistIds={selectedDentistIds} onDentistToggle={handleDentistToggle} onSelectAllDentists={handleSelectAllDentists} onSelectPresentDentists={handleSelectPresentDentists} onClinicToggle={handleClinicToggle} appointmentDates={appointmentDates} userRole={activeRole} isTodosSelected={isTodosSelected} onToggleTodos={handleToggleTodos} />;
  };

  const renderContent = () => {
    if (showTriage && activeRole === 'patient') {
      return <TriageInline onClose={() => setShowTriage(false)} onGoHome={() => {setShowTriage(false);setActiveNavTab('home');}} />;
    }
    if (activeRole === 'patient') {
      return <PatientAppointmentsList consultations={patientConsultations} selectedDate={selectedDate} onConsultationClick={setSelectedConsultation} />;
    }
    if (viewMode === 'list') {
      return <ListView consultations={dayConsultations} dentists={dentistsForTimeline.map((d) => d.dentist)} onConsultationClick={(c) => {if (activeRole === 'dentist' || activeRole === 'clinic') {setDetailConsultation(c);} else {setSelectedConsultation(c);}}} />;
    }
    if (viewMode === 'week') {
      return <DesktopWeekView
        selectedDate={selectedDate}
        selectedDentistKey={singleDentistKey}
        onSlotClick={handleSlotClick}
        onDateChange={setSelectedDate}
        onViewModeChange={(m) => setViewMode(m)}
        onStatusChange={(c, s) => {if (s === 'visto') {setFeedbackConsultation(c);}toast.success(`Estado de ${c.patient.name} alterado`);}}
        onCopy={(c) => {setClipboardConsultation(c);toast.info('Clique num slot vazio para colar a consulta');}}
        onDragMove={handleWeekDragMove} />;

    }
    if (viewMode === 'month') {
      return <DesktopMonthView
        selectedDate={selectedDate}
        selectedDentistKey={singleDentistKey}
        onDateSelect={setSelectedDate}
        onSwitchToDay={(date) => {setSelectedDate(date);setViewMode('day');}} />;

    }
    return <DesktopTimeline
      dentistColumns={dentistsForTimeline}
      slotsPerDentist={slotsPerDentist}
      onSlotClick={handleSlotClick}
      selectedDate={selectedDate}
      onStatusChange={(c, s) => {if (s === 'visto') {setFeedbackConsultation(c);}toast.success(`Estado de ${c.patient.name} alterado`);}}
      onCopy={(c) => {setClipboardConsultation(c);setActiveNavTab('agenda');toast.info('Clique num slot vazio para colar a consulta');}}
      isPasteMode={!!clipboardConsultation}
      onEmptySlotClick={(time, dKey, dName) => {
        if (clipboardConsultation) {
          setPasteTarget({ time, dentistKey: dKey, dentistName: dName });
        } else {
          setSlotCreation({ date: selectedDate, time, dentistKey: dKey, dentistName: dName });
        }
      }}
      onDragMove={handleTimelineDragMove} />;

  };

  const handleNavTabChange = useCallback((tab: string) => {
    // Map mobile tab names to desktop tab names
    const mapped = tab === 'equipa' ? 'team' : tab;
    setActiveNavTab(mapped);
    // Clear ALL overlay/sub-screen states so navigation is always direct
    setShowTriage(false);
    setViewDentistProfile(null);
    setViewClinicProfile(null);
    setDetailConsultation(null);
    setDossierPatientId(null);
    setSelectedConsultation(null);
    setShowEditProfile(false);
    setShowSettings(false);
    setShowBlockModal(false);
    setSlotCreation(null);
    setClipboardConsultation(null);
    setPasteTarget(null);
    setFeedbackConsultation(null);
    setPatientFeedbackScore(null);
    setShowNotificationDropdown(false);
    setPendingMove(null);
    setOverlapConsultation(null);
    setPendingOverlapMove(null);
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]);
    toast.success(favorites.includes(id) ? 'Removido dos favoritos' : 'Adicionado aos favoritos');
  }, [favorites]);

  useEffect(() => {
    const handler = () => {setActiveNavTab('home');setShowTriage(false);};
    window.addEventListener('smilecheck:go-home', handler);
    return () => window.removeEventListener('smilecheck:go-home', handler);
  }, []);

  // Helper to render standard header (taller, aligned with logo block) for non-agenda screens
  const renderStandardHeader = (title: string) =>
  <header className="h-[104px] bg-card/50 backdrop-blur border-b border-border flex items-center justify-between px-6 flex-shrink-0">
      <span className="text-sm font-medium text-foreground">{title}</span>
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
      <div className="flex items-center gap-2">
        <NotificationBell onClick={() => setShowNotificationDropdown(!showNotificationDropdown)} userRole={activeRole} />
        <button className="flex items-center gap-3 hover:opacity-80 transition-opacity" onClick={() => setActiveNavTab('perfil')}>
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
      </div>
    </header>;


  // Render the main content area based on active nav tab
  const renderMainArea = () => {
    // Consultation Detail View (full screen for dentist/clinic)
    if (detailConsultation && (activeRole === 'dentist' || activeRole === 'clinic')) {
      return (
        <div className="flex-1 flex flex-col overflow-hidden">
          {renderStandardHeader('Detalhes da Consulta')}
          <ConsultationDetailView
            consultation={detailConsultation}
            onClose={() => setDetailConsultation(null)}
            onViewDossier={(patientId) => {setDossierPatientId(patientId);setDetailConsultation(null);}}
            onNavigate={(tab) => {setDetailConsultation(null);handleNavTabChange(tab);}}
            onCopy={(c) => {setClipboardConsultation(c);setDetailConsultation(null);setActiveNavTab('agenda');toast.info('Clique num slot vazio para colar a consulta');}} />

        </div>);

    }

    // Patient Dossier View (full screen for dentist/clinic)
    if (dossierPatientId && (activeRole === 'dentist' || activeRole === 'clinic')) {
      return (
        <div className="flex-1 flex flex-col overflow-hidden">
          {renderStandardHeader('Dossier do Paciente')}
           <PatientDossierView
            patientId={dossierPatientId}
            onClose={() => setDossierPatientId(null)}
            onNavigate={(tab) => {setDossierPatientId(null);handleNavTabChange(tab);}}
            userRole={activeRole} />

        </div>);

    }

    // Viewing a specific dentist profile (inline full-screen)
    if (viewDentistProfile) {
      return (
        <div className="flex-1 flex flex-col overflow-hidden">
          {renderStandardHeader('Perfil do Dentista')}
          <div className="flex-1 overflow-y-auto">
            <DentistProfileView
              dentist={viewDentistProfile}
              isOpen={true}
              onClose={() => setViewDentistProfile(null)}
              isFavorite={favorites.includes(viewDentistProfile.id)}
              onToggleFavorite={() => toggleFavorite(viewDentistProfile.id)}
              onGoHome={() => {setViewDentistProfile(null);setActiveNavTab('home');}}
              onReferralLetter={activeRole === 'dentist' ? () => {setViewDentistProfile(null);setActiveNavTab('referencia');} : undefined}
              inline />
          </div>
        </div>);
    }

    // Viewing a specific clinic profile (inline)
    if (viewClinicProfile) {
      return (
        <div className="flex-1 flex flex-col overflow-hidden">
          {renderStandardHeader('Perfil da Clínica')}
          <div className="flex-1 overflow-y-auto">
            <ClinicProfileView
              clinicId={viewClinicProfile}
              isOpen={true}
              onClose={() => setViewClinicProfile(null)}
              onViewDentistProfile={(id) => {
                const d = MOCK_DENTIST_RESULTS.find((dr) => dr.id === id);
                if (d) {setViewClinicProfile(null);setViewDentistProfile(d);}
              }}
              inline />

          </div>
        </div>);

    }

    switch (activeNavTab) {
      case 'home':
        return (
          <div className="flex-1 flex flex-col overflow-hidden">
            <header className="h-[104px] bg-card/50 backdrop-blur border-b items-center justify-between flex-shrink-0 flex flex-row gap-0 py-[50px] border border-secondary pb-[50px] px-[30px]">
              <span className="text-sm font-medium capitalize text-foreground">
                {selectedDate.toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
              <div className="bg-secondary/50 rounded-lg p-1 flex items-center justify-center gap-[5px]">
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
              <div id="onboarding-level-points" className="flex items-center gap-[10px] border-0">
                <button id="onboarding-points-counter" onClick={() => handleNavTabChange('loja')} className="font-medium text-primary text-sm border border-primary border-dashed mx-0 px-[5px] py-[5px] cursor-pointer transition-all hover:shadow-[0_0_8px_hsl(var(--primary)/0.4)] hover:bg-primary/10 rounded">⭐ {activeRole === 'patient' ? '450' : activeRole === 'dentist' ? '1 250' : '3 800'} pts</button>
                <NotificationBell onClick={() => setShowNotificationDropdown(!showNotificationDropdown)} userRole={activeRole} />
                <button className="flex items-center gap-3 hover:opacity-80 transition-opacity border-0" onClick={() => setActiveNavTab('perfil')}>
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">
                      {activeRole === 'patient' ? mockFamilyMembers[0].name : activeRole === 'dentist' ? mockDentists[0].name : mockClinics[0].name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activeRole === 'patient' ? 'Paciente' : activeRole === 'dentist' ? 'Dentista' : 'Clínica'}
                    </p>
                  </div>
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center border-2 border-secondary">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                </button>
              </div>
            </header>
            <DashboardView userRole={activeRole} onNavigate={handleNavTabChange} onStartTriage={() => {setShowTriage(true);setActiveNavTab('agenda');}} onViewFullHistory={() => handleNavTabChange('historico')} />
          </div>);


      case 'agenda':
        return (
          <>
            {isNavExpanded && <div className="w-px bg-[#1E3A5F] flex-shrink-0" />}
            {renderSidebar()}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Agenda keeps original header height */}
              <header className="h-16 bg-card/50 backdrop-blur border-b border-border flex items-center justify-between px-6 flex-shrink-0 pl-[5px] pr-[15px]">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" onClick={() => setIsNavExpanded(!isNavExpanded)}>
                    <Menu className="w-5 h-5" />
                  </Button>
                  <div className="h-6 w-px bg-border" />
                  <Button variant="secondary" size="sm" onClick={goToToday} className="font-medium">Hoje</Button>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={goToPrevious}><ChevronLeft className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={goToNext}><ChevronRight className="w-4 h-4" /></Button>
                  </div>
                  <span className="text-sm font-medium capitalize text-foreground">
                    {getHeaderDateLabel()}
                  </span>
                </div>
                <div className="items-center gap-4 flex flex-row">
                  <div className="bg-secondary/50 rounded-lg p-1 flex items-center justify-center py-[5px] px-[5px] gap-[5px]">
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
                  {(activeRole === 'clinic' || activeRole === 'dentist') && <>
                    <div className="h-6 w-px bg-border" />
                    <ToggleGroup type="single" value={viewMode} onValueChange={(val) => val && setViewMode(val as ViewMode)} className="bg-secondary/50 rounded-lg p-1">
                      <ToggleGroupItem value="list" className="px-3 py-1 text-xs data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">Lista</ToggleGroupItem>
                      <ToggleGroupItem value="day" className="px-3 py-1 text-xs data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">Dia</ToggleGroupItem>
                      <ToggleGroupItem value="week" className="px-3 py-1 text-xs data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">Semana</ToggleGroupItem>
                      <ToggleGroupItem value="month" className="px-3 py-1 text-xs data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">Mês</ToggleGroupItem>
                    </ToggleGroup>
                    <Button variant="ghost" size="sm" className="text-xs gap-2 text-muted-foreground" onClick={() => setShowSettings(true)}>
                      <CalendarClock className="w-4 h-4" /> Modificar horários
                    </Button>
                    <div className="relative cursor-pointer" onClick={() => setActiveNavTab('pesquisa')}>
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input placeholder="Pesquisar pacientes, dentistas..." className="pl-9 h-9 w-56 text-sm cursor-pointer" readOnly />
                    </div>
                  </>}
                </div>
                <div className="flex items-center gap-2">
                  <NotificationBell onClick={() => setShowNotificationDropdown(!showNotificationDropdown)} userRole={activeRole} />
                  <button className="flex items-center gap-3 hover:opacity-80 transition-opacity" onClick={() => setActiveNavTab('perfil')}>
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
                </div>
              </header>
              {(activeRole === 'clinic' || activeRole === 'dentist') && <CategoryLegend />}
              {clipboardConsultation &&
              <CopyPasteBanner
                consultation={clipboardConsultation}
                onCancel={() => setClipboardConsultation(null)} />

              }
              <div className="flex-1 flex overflow-hidden">{renderContent()}</div>
            </div>
          </>);


      case 'team':
        return (
          <div className="flex-1 flex flex-col overflow-hidden">
            {renderStandardHeader('Equipa')}
            <TeamView userRole={activeRole} onNavigate={handleNavTabChange} />
          </div>);


      case 'conversas':
        return (
          <div className="flex-1 flex flex-col overflow-hidden">
            {renderStandardHeader('Conversas')}
            <ConversationsView userRole={activeRole} onNavigate={handleNavTabChange} />
          </div>);


      case 'saude':
        return (
          <div className="flex-1 flex flex-col overflow-hidden">
            {renderStandardHeader('Saúde')}
            <HealthView userRole="patient" onNavigate={handleNavTabChange} />
          </div>);


      case 'configuracoes':
        return (
          <div className="flex-1 flex flex-col overflow-hidden">
            {renderStandardHeader('Configurações')}
            <SettingsView userRole={activeRole} onNavigate={handleNavTabChange} onInvite={() => setActiveNavTab('convite')} />
          </div>);


      case 'convite':
        return (
          <div className="flex-1 flex flex-col overflow-hidden">
            {renderStandardHeader('Convidar Amigos')}
            <div className="flex-1 overflow-y-auto">
              <InviteView onClose={() => setActiveNavTab('configuracoes')} inline />
            </div>
          </div>);


      case 'perfil':
        if (activeRole === 'dentist') {
          // Show own dentist profile using DentistProfileView
          const ownDentist = MOCK_DENTIST_RESULTS.find((d) => d.id === '1') || MOCK_DENTIST_RESULTS[0];
          return (
            <div className="flex-1 flex flex-col overflow-hidden">
              {renderStandardHeader('Meu Perfil')}
              <div className="flex-1 overflow-y-auto">
                <DentistProfileView
                  dentist={ownDentist}
                  isOpen={true}
                  onClose={() => setActiveNavTab('home')}
                  isOwnProfile
                  onEditProfile={() => setActiveNavTab('editarPerfil')}
                  inline />
              </div>
            </div>);
        }
        return (
          <div className="flex-1 flex flex-col overflow-hidden">
            {renderStandardHeader('Meu Perfil')}
            <div className="flex-1 overflow-y-auto">
              <ProfileView
                userRole={activeRole}
                isOpen={true}
                onClose={() => setActiveNavTab('home')}
                inline
                onViewClinicProfile={(id) => {setViewClinicProfile(id);}}
                onViewDentistProfile={(d) => {setViewDentistProfile(d);}} />
            </div>
          </div>);


      case 'editarPerfil':
        return (
          <div className="flex-1 flex flex-col overflow-hidden">
            {renderStandardHeader('Editar Perfil')}
            <div className="flex-1 overflow-y-auto">
              <EditProfileView userRole={activeRole} isOpen={true} onClose={() => setActiveNavTab('perfil')} onSave={() => setActiveNavTab('perfil')} inline />
            </div>
          </div>);


      case 'classificacoes':
        return (
          <div className="flex-1 flex flex-col overflow-hidden">
            {renderStandardHeader('Classificações')}
            <div className="flex-1 overflow-y-auto"><RankingsView userRole={activeRole} /></div>
          </div>);


      case 'conquistas':
        return (
          <div className="flex-1 flex flex-col overflow-hidden">
            {renderStandardHeader('Conquistas')}
            <div className="flex-1 overflow-y-auto"><AchievementsView userRole={activeRole} /></div>
          </div>);


      case 'plano':
        return (
          <div className="flex-1 flex flex-col overflow-hidden">
            {renderStandardHeader('Gerir Plano')}
            <div className="flex-1 overflow-y-auto"><ManagePlanView userRole={activeRole} /></div>
          </div>);


      case 'loja':
        return (
          <div className="flex-1 flex flex-col overflow-hidden">
            {renderStandardHeader('Loja de Recompensas')}
            <div className="flex-1 overflow-y-auto"><RewardsStoreView userRole={activeRole} /></div>
          </div>);


      case 'favoritos':
        return (
          <div className="flex-1 flex flex-col overflow-hidden">
            {renderStandardHeader('Favoritos')}
            <div className="flex-1 overflow-y-auto">
              <FavoritesView
                favorites={favorites}
                onToggleFavorite={toggleFavorite}
                onViewProfile={(d) => setViewDentistProfile(d)} />

            </div>
          </div>);


      case 'exportar':
        return (
          <div className="flex-1 flex flex-col overflow-hidden">
            {renderStandardHeader('Exportar Relatórios')}
            <div className="flex-1 overflow-y-auto">
              <ExportReportsView userRole={activeRole} />
            </div>
          </div>);


      case 'historico':
        return (
          <div className="flex-1 flex flex-col overflow-hidden">
            {renderStandardHeader('Histórico Completo')}
            <FullHistoryView userRole={activeRole} onBack={() => handleNavTabChange('home')} inline />
          </div>);

      case 'pesquisa':
        return (
          <div className="flex-1 flex flex-col overflow-hidden">
            {renderStandardHeader('Pesquisar')}
            <div className="flex-1 overflow-y-auto">
              <UnifiedSearch
                userRole={activeRole}
                isOpen={true}
                onClose={() => setActiveNavTab('home')}
                favorites={favorites}
                onToggleFavorite={toggleFavorite}
                onViewDentistProfile={(d) => {setViewDentistProfile(d);}}
                onViewClinicProfile={(id) => {setViewClinicProfile(id);}}
                inline />

            </div>
          </div>);


      case 'prescrever':
        return (
          <div className="flex-1 flex flex-col overflow-hidden">
            {renderStandardHeader('Prescrever Receita')}
            <div className="flex-1 overflow-y-auto">
              <PrescriptionFlow
                onClose={() => setActiveNavTab('home')}
                onGoHome={() => setActiveNavTab('home')}
                inline />

            </div>
          </div>);


      case 'referencia':
        return (
          <div className="flex-1 flex flex-col overflow-hidden">
            {renderStandardHeader('Carta de Referência')}
            <div className="flex-1 overflow-y-auto">
              <ReferralLetterFlow
                onClose={() => setActiveNavTab('home')}
                onGoHome={() => setActiveNavTab('home')}
                favorites={favorites}
                onToggleFavorite={toggleFavorite}
                inline />

            </div>
          </div>);


      case 'notificacoes':
        return (
          <div className="flex-1 flex flex-col overflow-hidden">
            {renderStandardHeader('Notificações')}
            <div className="flex-1 overflow-y-auto p-4">
              <NotificationsFullView inline onFeedbackAction={handleNotificationFeedback} />
            </div>
          </div>);


      case 'estatisticas':
        return (
          <div className="flex-1 flex flex-col overflow-hidden">
            {renderStandardHeader('Estatísticas')}
            <StatisticsView userRole={activeRole} />
          </div>);


      default:
        return (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <p className="text-lg">Secção em construção...</p>
          </div>);

    }
  };

  return (
    <ProfileNavigationProvider
      onOpenDentistProfile={(d) => setViewDentistProfile(d)}
      onOpenClinicProfile={(id) => setViewClinicProfile(id)}
      onOpenPatientProfile={(id) => {setDossierPatientId(id);}}>
    <TeleconsultaManager userRole={activeRole}>
    {(startTeleconsulta) => (
    <div className="h-screen flex bg-background relative">
      {/* Background Watermark Logo */}
      <div
          className="fixed inset-0 pointer-events-none flex items-center justify-center opacity-5 z-0"
          style={{
            backgroundImage: `url(${smileIcon})`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundSize: '60%'
          }} />

      {/* Sidebar */}
      <DesktopNavSidebar
          isExpanded={isNavExpanded}
          activeTab={activeNavTab}
          onTabChange={handleNavTabChange}
          userRole={activeRole}
          onPrescribe={() => setActiveNavTab('prescrever')} />


      {renderMainArea()}

      {/* Notification Dropdown - rendered at root level to avoid z-index/stacking context issues from backdrop-blur */}
      {showNotificationDropdown &&
        <NotificationDropdown
          onViewAll={() => {setActiveNavTab('notificacoes');setShowNotificationDropdown(false);}}
          onClose={() => setShowNotificationDropdown(false)}
          onFeedbackAction={handleNotificationFeedback}
          onNavigate={(target) => {handleNavTabChange(target);setShowNotificationDropdown(false);}}
          userRole={activeRole} />

        }

      {/* Edit Consultation Modal - this one stays as modal */}
      <EditConsultationModal consultation={selectedConsultation} isOpen={!!selectedConsultation} onClose={() => setSelectedConsultation(null)} onSave={(updated) => {
          console.log('Saved consultation:', updated);
          setSelectedConsultation(null);
        }} onCancel={(consultation) => {
          console.log('Cancelled consultation:', consultation);
          setSelectedConsultation(null);
        }} />

      {/* Paste Confirmation Modal */}
      <PasteConfirmationModal
          consultation={clipboardConsultation}
          targetDate={selectedDate}
          targetTime={pasteTarget?.time || ''}
          targetDentistName={pasteTarget?.dentistName}
          isOpen={!!pasteTarget && !!clipboardConsultation}
          onClose={() => setPasteTarget(null)}
          onConfirm={(pasted) => {
            console.log('Pasted consultation:', pasted);
            setPasteTarget(null);
            setClipboardConsultation(null);
          }} />


      {/* Dentist Feedback Modal */}
      <DentistFeedbackModal
          consultation={feedbackConsultation}
          isOpen={!!feedbackConsultation}
          onClose={() => setFeedbackConsultation(null)}
          onSubmit={(id, checked, points) => {
            console.log('Feedback submitted:', { id, checked, points });
            setFeedbackConsultation(null);
          }} />


      {/* Patient Feedback Modal (from notifications) */}
      <PatientFeedbackModal
          score={patientFeedbackScore}
          isOpen={!!patientFeedbackScore}
          onClose={() => setPatientFeedbackScore(null)}
          onSubmit={(scoreId, rating, comment) => {
            console.log('Patient feedback:', { scoreId, rating, comment });
            setPatientFeedbackScore(null);
          }} />


      {/* Agenda Settings Modal */}
      <AgendaSettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          settings={agendaSettings}
          onSave={setAgendaSettings}
          userRole={activeRole}
          userPlan="free" />


      {/* Time Block Modal */}
      <TimeBlockModal
          isOpen={showBlockModal}
          onClose={() => {setShowBlockModal(false);setEditingBlock(null);setBlockInitialDate(undefined);setBlockInitialTime(undefined);}}
          onSave={(block) => {
            if (editingBlock) {
              setTimeBlocks((prev) => prev.map((b) => b.id === block.id ? block : b));
            } else {
              setTimeBlocks((prev) => [...prev, block]);
            }
            setEditingBlock(null);
          }}
          userRole={activeRole}
          initialDate={blockInitialDate}
          initialTime={blockInitialTime}
          editingBlock={editingBlock} />


      {/* Time Block Delete Confirm */}
      <TimeBlockDeleteConfirm
          isOpen={!!deletingBlock}
          onClose={() => setDeletingBlock(null)}
          onDeleteSingle={() => {
            if (deletingBlock) {
              setTimeBlocks((prev) => prev.filter((b) => b.id !== deletingBlock.id));
              toast.success('Bloqueio eliminado');
            }
            setDeletingBlock(null);
          }}
          onDeleteAll={() => {
            if (deletingBlock) {
              setTimeBlocks((prev) => prev.filter((b) => b.id !== deletingBlock.id));
              toast.success('Todos os bloqueios eliminados');
            }
            setDeletingBlock(null);
          }}
          isRecurring={!!deletingBlock?.repeat} />


      {/* Move Consultation Modal */}
      <MoveConsultationModal
          moveInfo={pendingMove}
          isOpen={!!pendingMove}
          onClose={() => setPendingMove(null)}
          onConfirm={confirmMove} />


      {/* Overlap Warning Modal */}
      <OverlapWarningModal
          isOpen={!!overlapConsultation}
          existingConsultation={overlapConsultation}
          onClose={() => {setOverlapConsultation(null);setPendingOverlapMove(null);}}
          onConfirm={confirmOverlap} />


      {/* Slot Creation Screen */}
      {slotCreation &&
        <SlotCreationScreen
          isOpen={true}
          onClose={() => setSlotCreation(null)}
          userRole={activeRole}
          initialDate={slotCreation.date}
          initialTime={slotCreation.time}
          dentistKey={slotCreation.dentistKey}
          dentistName={slotCreation.dentistName} />

        }
    </div>
    )}
    </TeleconsultaManager>
    </ProfileNavigationProvider>);

}