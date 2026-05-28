import { useState, useMemo, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import { StatisticsView } from '@/components/statistics/StatisticsView';
import { Button } from '@/components/ui/button';
import { DateNavigator } from './DateNavigator';
import { TimeSlotView } from './TimeSlotView';
import { MultiDentistGrid, DentistColumn } from './MultiDentistGrid';
import { CategoryLegend } from './CategoryLegend';
import { DynamicDaySummary } from './DynamicDaySummary';
import { EditConsultationModal } from './EditConsultationModal';
import { MobileConsultationDetail } from './MobileConsultationDetail';
import { AgendaSettingsModal, DEFAULT_SETTINGS, AgendaSettings } from './AgendaSettingsModal';
import { AgendaSettingsStyle } from './AgendaSettingsStyle';
import { useAgendaSettings, agendaSettingsStore } from '@/stores/agendaSettingsStore';
import { TimeBlockModal, TimeBlock } from './TimeBlockModal';
import { BottomNavigation } from './BottomNavigation';
import { MobileHeader } from './mobile/MobileHeader';
import { MobileSidebar } from './mobile/MobileSidebar';
import { ThreeDayView } from './mobile/ThreeDayView';
import { DashboardView } from '@/components/dashboard/DashboardView';
import { SettingsView } from '@/components/settings/SettingsView';
import { InviteView } from '@/components/settings/InviteView';
import { TeamView } from '@/components/team/TeamView';
import { ConversationsView } from '@/components/conversations/ConversationsView';
import { PrescriptionFlow } from '@/components/prescription/PrescriptionFlow';
import { NotificationsFullView } from '@/components/notifications/NotificationCenter';
import { EditProfileView } from '@/components/profile/EditProfileView';
import { RankingsView } from '@/components/rankings/RankingsView';
import { PontuacoesView } from '@/components/pontuacoes/PontuacoesView';
import { AchievementsView } from '@/components/achievements/AchievementsView';
import { ManagePlanView } from '@/components/plan/ManagePlanView';
import { BillingView } from '@/components/billing/BillingView';
import { RewardsStoreView } from '@/components/rewards/RewardsStoreView';
import { UnifiedSearch } from '@/components/search/UnifiedSearch';
import { FavoritesView } from '@/components/favorites/FavoritesView';
import { ReferralLetterFlow } from '@/components/referral/ReferralLetterFlow';
import { DentistProfileView } from '@/components/profile/DentistProfileView';
import { ClinicProfileView } from '@/components/profile/ClinicProfileView';
import { Consultation, TimeSlot, ViewMode, Dentist, Clinic } from '@/types/calendar';
import { mockConsultations, mockClinics, mockDentists, generateTimeSlots, getDentistsForClinic, dentistWorksOnDemo, clinicDentists } from '@/data/mockData';
import { useAgendaFilters, passesAgendaFilters } from '@/stores/agendaFiltersStore';
import { DentistSearchResult, MOCK_DENTIST_RESULTS } from '@/data/mockDentistSearch';
import { ProfileNavigationProvider } from '@/contexts/ProfileNavigationContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';
import { useWatermarkSrc } from '@/hooks/useWatermarkSrc';
import { SlotCreationScreen } from './creation/SlotCreationScreen';
import { MobilePatientDossier } from './mobile/MobilePatientDossier';
import { FullHistoryView } from '@/components/history/FullHistoryView';
import { DentistAgendaDropdown } from './mobile/DentistAgendaDropdown';
import { MobileDentistTabs } from './mobile/MobileDentistTabs';
import { ContestationView } from '@/components/contestation/ContestationView';
import { useConsultationMode, InConsultationBar, ConsultationFAB, EndConsultationDialog, PointsEarnedAnimation, QuickRatingPrompt } from '@/components/consultation-mode/InConsultationMode';

// Helper functions for filter state
const getAllDentistMobileKeys = () => mockClinics.flatMap(c => getDentistsForClinic(c.id).map(d => `${c.id}-${d.id}`));
const getPresentDentistMobileKeys = () => clinicDentists.filter(cd => cd.worksOnDemo).map(cd => `${cd.clinicId}-${cd.dentistId}`);

export function DentistCalendar() {
  const smileIcon = useWatermarkSrc();
  const { t } = useTranslation();
  // Subscribe so changes re-render columns/list
  useAgendaFilters();
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 0, 31));
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [activeTab, setActiveTab] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedDentistIds, setSelectedDentistIds] = useState<string[]>(() => getPresentDentistMobileKeys());
  const [mobileDentistKey, setMobileDentistKey] = useState<string>('1-1');
  const [selectedClinics, setSelectedClinics] = useState<string[]>(['1']);
  const [showPrescription, setShowPrescription] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showReferral, setShowReferral] = useState(false);
  const [referralPreSelectedDentist, setReferralPreSelectedDentist] = useState<DentistSearchResult | null>(null);
  const [quickBookDentist, setQuickBookDentist] = useState<{ dentist: DentistSearchResult; dayLabel: string; slot: string } | null>(null);
  const [favorites, setFavorites] = useState<string[]>(['1', '2']);
  const [viewDentistProfile, setViewDentistProfile] = useState<DentistSearchResult | null>(null);
  const [viewClinicProfile, setViewClinicProfile] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [agendaSettings, setAgendaSettings] = useState<AgendaSettings>({ ...DEFAULT_SETTINGS });
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [slotCreation, setSlotCreation] = useState<{ date: Date; time: string; dentistKey?: string; dentistName?: string } | null>(null);
  const [viewPatientDossier, setViewPatientDossier] = useState<string | null>(null);
  const [showFullHistory, setShowFullHistory] = useState(false);
  const isMobile = useIsMobile();
  // Reset agenda settings to defaults whenever the user leaves the Agenda tab.
  useEffect(() => {
    if (activeTab !== 'agenda') {
      agendaSettingsStore.reset();
    }
  }, [activeTab]);
  useEffect(() => () => { agendaSettingsStore.reset(); }, []);
  const ownDentist = MOCK_DENTIST_RESULTS.find((d) => d.id === mockDentists[0].id) || MOCK_DENTIST_RESULTS[0];

  // Consultation mode
  const dentistConsultations = useMemo(() =>
    mockConsultations.filter((c) => c.dentist.id === mockDentists[0].id), []
  );
  const consultationMode = useConsultationMode(dentistConsultations);

  // Build columns based on selected clinics and dentists (like ClinicCalendar)
  const columns = useMemo<DentistColumn[]>(() => {
    const result: DentistColumn[] = [];
    if (selectedDentistIds.length === 0) return result;
    
    mockClinics.forEach(clinic => {
      const dentistsInClinic = getDentistsForClinic(clinic.id);
      const dentistsToShow = dentistsInClinic.filter(d =>
        selectedDentistIds.includes(`${clinic.id}-${d.id}`)
      );
      
      dentistsToShow.forEach(dentist => {
        const worksToday = dentistWorksOnDemo(clinic.id, dentist.id);
        const dentistConsultations = mockConsultations.filter(
          c => c.dentist.id === dentist.id && c.clinic.id === clinic.id && passesAgendaFilters(c)
        );
        const slots = generateTimeSlots(selectedDate, dentistConsultations);
        result.push({ dentist, clinic, worksToday, slots });
      });
    });
    
    return result;
  }, [selectedDate, selectedDentistIds]);

  // For list view - filter only Dr. Gonçalo Pipo's consultations (current user) or selected dentists
  const myConsultations = useMemo(() => {
    if (selectedDentistIds.length === 0) {
      return mockConsultations.filter(c => c.dentist.id === mockDentists[0].id && passesAgendaFilters(c));
    }
    return mockConsultations.filter(c => {
      const key = `${c.clinic.id}-${c.dentist.id}`;
      return selectedDentistIds.includes(key) && passesAgendaFilters(c);
    });
  }, [selectedDentistIds]);

  const slots = generateTimeSlots(selectedDate, myConsultations);

  // Day consultations for summary
  const dayConsultations = mockConsultations.filter(
    (c) => c.date.toDateString() === selectedDate.toDateString()
  );

  const handleSlotClick = (slot: TimeSlot) => {
    if (slot.consultation) {
      setSelectedConsultation(slot.consultation);
    }
  };

  const handleGridSlotClick = (dentistId: string, clinicId: string, slot: TimeSlot) => {
    if (slot.consultation) {
      setSelectedConsultation(slot.consultation);
    }
  };

  const handleEmptySlotClick = (dentistId: string, clinicId: string, time: string) => {
    const dentist = mockDentists.find(d => d.id === dentistId);
    setSlotCreation({
      date: selectedDate,
      time,
      dentistKey: `${clinicId}-${dentistId}`,
      dentistName: dentist?.name,
    });
  };

  const getSlots = (date: Date) => {
    // For 3-day view, use selected dentist
    if (selectedDentistIds.length === 1) {
      // Parse composite ID (clinicId-dentistId)
      const parts = selectedDentistIds[0].split('-');
      const clinicId = parts[0];
      const dentistId = parts.slice(1).join('-') || parts[0];
      const consultations = mockConsultations.filter(c => c.dentist.id === dentistId && c.clinic.id === clinicId);
      return generateTimeSlots(date, consultations);
    }
    // Default to first dentist
    const consultations = mockConsultations.filter(c => c.dentist.id === mockDentists[0].id && c.clinic.id === '1');
    return generateTimeSlots(date, consultations);
  };

  const handleDentistToggle = (dentistId: string | null, isCheckbox: boolean, clinicId?: string) => {
    if (dentistId === null) {
      // "Filtrar Presentes" - select only working dentists
      setSelectedDentistIds(getPresentDentistMobileKeys());
      return;
    }
    if (dentistId === 'all') {
      // "Todas as Agendas" - select ALL including non-working
      setSelectedDentistIds(getAllDentistMobileKeys());
      return;
    }
    const key = clinicId ? `${clinicId}-${dentistId}` : dentistId;
    if (isCheckbox) {
      setSelectedDentistIds(prev =>
        prev.includes(key) ? prev.filter(id => id !== key) : [...prev, key]
      );
    } else {
      setSelectedDentistIds([key]);
    }
  };

  const handleClinicToggle = (clinicId: string, isCheckbox: boolean) => {
    if (isCheckbox) {
      if (selectedClinics.includes(clinicId)) {
        const newSelected = selectedClinics.filter(id => id !== clinicId);
        if (newSelected.length === 0) {
          setSelectedClinics(['1']);
        } else {
          setSelectedClinics(newSelected);
        }
      } else {
        setSelectedClinics([...selectedClinics, clinicId]);
      }
    } else {
      setSelectedClinics([clinicId]);
    }
  };

  // Clinic-level toggle for mobile dropdown (same logic as desktop)
  const handleMobileClinicToggle = (clinicId: string, isCheckbox: boolean) => {
    const dentistsInClinic = getDentistsForClinic(clinicId);
    const clinicKeys = dentistsInClinic.map(d => `${clinicId}-${d.id}`);
    if (isCheckbox) {
      setSelectedDentistIds(prev => {
        const allSelected = clinicKeys.every(k => prev.includes(k));
        return allSelected
          ? prev.filter(id => !clinicKeys.includes(id))
          : [...new Set([...prev, ...clinicKeys])];
      });
    } else {
      setSelectedDentistIds(clinicKeys);
    }
  };

  const renderContent = () => {
    if (viewMode === 'three-day') {
      return (
        <ThreeDayView 
          selectedDate={selectedDate}
          getSlots={getSlots}
          onSlotClick={handleSlotClick}
        />
      );
    }
    
    if (viewMode === 'list') {
      // List view shows TimeSlotView (old day view format)
      return <TimeSlotView slots={slots} onSlotClick={handleSlotClick} />;
    }
    
    // Day view shows MultiDentistGrid (like Clinic)
    return (
      <MultiDentistGrid
        columns={columns}
        onSlotClick={handleGridSlotClick}
        onEmptySlotClick={handleEmptySlotClick}
        showFullName
      />
    );
  };

  // When view mode changes to 3-day or list, ensure only one dentist is selected
  // If none selected, auto-select first dentist
  useEffect(() => {
    if (viewMode === 'three-day' || viewMode === 'list') {
      if (selectedDentistIds.length === 0) {
        // Select first dentist from first clinic
        setSelectedDentistIds(['1-1']); // SmileCheck - Dr. Gonçalo Pipo
      } else if (selectedDentistIds.length > 1) {
        // Keep only the first selected
        setSelectedDentistIds([selectedDentistIds[0]]);
      }
    }
  }, [viewMode]);

  // Listen for custom navigation events (e.g. from contestation button)
  useEffect(() => {
    const navHandler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail) handleTabChange(detail);
    };
    window.addEventListener('smilecheck:navigate', navHandler);
    return () => window.removeEventListener('smilecheck:navigate', navHandler);
  }, []);

  // Handler that respects view mode restrictions
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
  };

  const handleTabChange = (tab: string) => {
    // Open specific consultation detail by ID
    if (tab.startsWith('consulta-detalhe:')) {
      const consultationId = tab.split(':')[1];
      const consultation = mockConsultations.find(c => c.id === consultationId);
      if (consultation) {
        setSelectedConsultation(consultation);
      }
      return;
    }
    // Card 1: open next consultation detail
    if (tab === 'consulta-detalhe') {
      const DEMO_DATE = new Date(2026, 0, 31);
      const dentistCons = mockConsultations
        .filter(c => c.dentist.id === mockDentists[0].id && c.date.toDateString() === DEMO_DATE.toDateString())
        .sort((a, b) => a.time.localeCompare(b.time));
      const next = dentistCons[0];
      if (next) {
        setSelectedConsultation(next);
      }
      return;
    }
    // Clear ALL overlay/sub-screen states so navigation is always direct
    setShowPrescription(false);
    setShowReferral(false);
    setShowSearch(false);
    setShowProfile(false);
    setShowEditProfile(false);
    setShowInvite(false);
    setSelectedConsultation(null);
    setViewDentistProfile(null);
    setViewClinicProfile(null);
    setSlotCreation(null);
    setViewPatientDossier(null);
    setShowFullHistory(false);
    setShowSettings(false);
    setShowBlockModal(false);
    if (tab === 'perfil') {
      setShowProfile(true);
      return;
    }
    setActiveTab(tab);
  };

  return (
    <ProfileNavigationProvider
      onOpenDentistProfile={(d) => setViewDentistProfile(d)}
      onOpenClinicProfile={(id) => setViewClinicProfile(id)}
      onOpenPatientProfile={(id) => setViewPatientDossier(id)}
    >
    <div className="min-h-screen bg-background pb-24 relative overflow-x-hidden">
      {/* Live preview style overrides driven by AgendaSettings */}
      <AgendaSettingsStyle />
      {/* Consultation Mode Top Bar */}
      {consultationMode.activeConsultation && (
        <InConsultationBar
          consultation={consultationMode.activeConsultation}
          elapsedSeconds={consultationMode.elapsedSeconds}
          onDismiss={consultationMode.dismiss}
          onOpenDossier={(id) => setViewPatientDossier(id)}
        />
      )}

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
      
      <div className="relative z-10 w-full max-w-full">
        {/* Mobile Header with View Mode Selector - hide filters when viewing consultation detail */}
        <MobileHeader 
          onMenuClick={() => setSidebarOpen(true)}
          {...(activeTab === 'agenda' && !selectedConsultation ? { viewMode, onViewModeChange: handleViewModeChange } : {})}
          userRole="dentist"
          showNewConsultation={activeTab === 'agenda' && !selectedConsultation}
          onNewConsultation={() => setSlotCreation({ date: selectedDate, time: '09:00' })}
        />

        {showFullHistory ? (
          <FullHistoryView userRole="dentist" onBack={() => setShowFullHistory(false)} />
        ) : selectedConsultation ? (
          <MobileConsultationDetail
            consultation={selectedConsultation}
            onClose={() => setSelectedConsultation(null)}
            onNavigate={(tab) => { setSelectedConsultation(null); handleTabChange(tab); }}
            onCopy={(c) => { console.log('Copy:', c); }}
            onViewDossier={(id) => { setSelectedConsultation(null); setViewPatientDossier(id); }}
          />
        ) : activeTab === 'home' ? (
          <DashboardView userRole="dentist" onNavigate={(tab) => {
            if (tab === 'pesquisa') { setShowSearch(true); return; }
            handleTabChange(tab);
          }} onViewFullHistory={() => setShowFullHistory(true)} />
        ) : activeTab === 'agenda' ? (
          <>
            {/* Dentist Agenda Dropdown Filter */}
            <DentistAgendaDropdown
              currentDentistId={mockDentists[0].id}
              selectedDentistIds={selectedDentistIds}
              onDentistToggle={handleDentistToggle}
              onClinicToggle={handleMobileClinicToggle}
              viewMode={viewMode}
            />

            <DateNavigator
              date={selectedDate}
              onDateChange={setSelectedDate}
            />

            {/* Category Legend - Centered */}
            <CategoryLegend compact className="mx-4 mb-4 rounded-lg" />

            {/* Content based on view mode */}
            <div className="mt-4 w-full">
              {renderContent()}
            </div>

            {/* Dynamic Day Summary - ONLY show in Day and List views */}
            {viewMode !== 'three-day' && (
              <div className="mt-6">
                <DynamicDaySummary 
                  consultations={dayConsultations}
                  selectedDentistIds={selectedDentistIds}
                  selectedClinics={selectedClinics}
                />
              </div>
            )}

          </>
        ) : activeTab === 'equipa' ? (
          <TeamView userRole="dentist" onNavigate={handleTabChange} />
        ) : activeTab === 'conversas' ? (
          <ConversationsView userRole="dentist" onNavigate={handleTabChange} />
        ) : activeTab === 'configuracoes' ? (
          <SettingsView userRole="dentist" onNavigate={handleTabChange} />
        ) : activeTab === 'convidar' ? (
          <InviteView onClose={() => handleTabChange('home')} />
        ) : activeTab === 'classificacoes' || activeTab === 'pontuacoes' ? (
          <div className="px-0"><PontuacoesView userRole="dentist" initialTab={activeTab === 'classificacoes' ? 'classificacoes' : 'pontos'} onNavigate={handleTabChange} /></div>
        ) : activeTab === 'conquistas' ? (
          <div className="px-0"><AchievementsView userRole="dentist" /></div>
        ) : activeTab === 'notificacoes' ? (
          <NotificationsFullView onBack={() => setActiveTab('home')} />
        ) : activeTab === 'plano' ? (
          <ManagePlanView userRole="dentist" />
        ) : activeTab === 'loja' ? (
          <RewardsStoreView userRole="dentist" />
        ) : activeTab === 'pesquisa' ? (
          <FavoritesView
            favorites={favorites}
            onToggleFavorite={id => {
              setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
            }}
            onViewProfile={d => setViewDentistProfile(d)}
            onBookDentist={d => setViewDentistProfile(d)}
            onRecommendPatient={d => {
              setReferralPreSelectedDentist(d);
              setShowReferral(true);
            }}
            userRole="dentist"
            onViewClinicProfile={id => setViewClinicProfile(id)}
          />
        ) : activeTab === 'estatisticas' ? (
          <StatisticsView />
        ) : activeTab === 'faturacao' ? (
          <BillingView userRole="dentist" onNavigate={handleTabChange} />
        ) : activeTab === 'contestacao' ? (
          <ContestationView onBack={() => setActiveTab('home')} />
        ) : (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <p className="text-lg">{t('agenda.sectionUnderConstruction')}</p>
          </div>
        )}

        {/* Fixed Bottom Navigation */}
        <BottomNavigation
          userRole="dentist"
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />

        {/* Mobile Sidebar */}
        <MobileSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          userRole="dentist"
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          selectedDentists={selectedDentistIds}
          onDentistToggle={handleDentistToggle}
          selectedClinics={selectedClinics}
          onClinicToggle={handleClinicToggle}
          onPrescribe={() => setShowPrescription(true)}
          onProfileClick={() => setShowProfile(true)}
          activeTab={activeTab}
          onNavigate={(tab) => {
            if (tab === 'referencia') { handleTabChange(activeTab); setShowReferral(true); return; }
            handleTabChange(tab);
          }}
        />

        {showPrescription && (
          <PrescriptionFlow
            onClose={() => setShowPrescription(false)}
            onGoHome={() => { setShowPrescription(false); handleTabChange('home'); }}
          />
        )}

        {showProfile && (
          <DentistProfileView
            dentist={ownDentist}
            isOpen={true}
            onClose={() => setShowProfile(false)}
            isOwnProfile
            onEditProfile={() => {
              setShowProfile(false);
              setShowEditProfile(true);
            }}
          />
        )}

        <EditProfileView
          userRole="dentist"
          isOpen={showEditProfile}
          onClose={() => setShowEditProfile(false)}
          onSave={() => {
            setShowEditProfile(false);
            setShowProfile(true);
          }}
        />

        <UnifiedSearch
          userRole="dentist"
          isOpen={showSearch}
          onClose={() => setShowSearch(false)}
          favorites={favorites}
          onToggleFavorite={id => { setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]); }}
          onViewDentistProfile={d => { setShowSearch(false); setViewDentistProfile(d); }}
          onViewClinicProfile={id => { setShowSearch(false); setViewClinicProfile(id); }}
        />

        {showReferral && (
          <ReferralLetterFlow
            onClose={() => { setShowReferral(false); setReferralPreSelectedDentist(null); }}
            onGoHome={() => { setShowReferral(false); setReferralPreSelectedDentist(null); setActiveTab('home'); }}
            favorites={favorites}
            onToggleFavorite={id => { setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]); }}
            preSelectedDentist={referralPreSelectedDentist || undefined}
          />
        )}

        {viewDentistProfile && (
          <DentistProfileView
            dentist={viewDentistProfile}
            isOpen={true}
            onClose={() => setViewDentistProfile(null)}
            isFavorite={favorites.includes(viewDentistProfile.id)}
            onToggleFavorite={() => { setFavorites(prev => prev.includes(viewDentistProfile.id) ? prev.filter(f => f !== viewDentistProfile.id) : [...prev, viewDentistProfile.id]); }}
          />
        )}

        {viewClinicProfile && (
          <ClinicProfileView
            clinicId={viewClinicProfile}
            isOpen={true}
            onClose={() => setViewClinicProfile(null)}
            onViewDentistProfile={id => {
              const d = MOCK_DENTIST_RESULTS.find(dr => dr.id === id);
              if (d) { setViewClinicProfile(null); setViewDentistProfile(d); }
            }}
          />
        )}

        {showInvite && <InviteView onClose={() => setShowInvite(false)} />}


        {/* Agenda Settings Modal */}
        <AgendaSettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          settings={agendaSettings}
          onSave={setAgendaSettings}
          userRole="dentist"
          userPlan="free"
        />

        {/* Time Block Modal */}
        <TimeBlockModal
          isOpen={showBlockModal}
          onClose={() => setShowBlockModal(false)}
          onSave={(block) => {
            setTimeBlocks(prev => [...prev, block]);
          }}
          userRole="dentist"
          initialDate={selectedDate}
        />

        {/* Slot Creation Screen */}
        {slotCreation && (
          <SlotCreationScreen
            isOpen={true}
            onClose={() => setSlotCreation(null)}
            userRole="dentist"
            initialDate={slotCreation.date}
            initialTime={slotCreation.time}
            dentistKey={slotCreation.dentistKey}
            dentistName={slotCreation.dentistName}
          />
        )}

        <MobilePatientDossier
          patientId={viewPatientDossier || ''}
          isOpen={!!viewPatientDossier}
          onClose={() => setViewPatientDossier(null)}
          userRole="dentist"
        />

        {/* Consultation Mode FAB + Dialogs */}
        {consultationMode.activeConsultation && (
          <ConsultationFAB
            consultation={consultationMode.activeConsultation}
            onEndConsultation={consultationMode.requestEnd}
            onOpenDossier={() => setViewPatientDossier(consultationMode.activeConsultation!.patient.id)}
            onPrescribe={() => setActiveTab('prescrever')}
            onReferral={() => setActiveTab('referenciar')}
          />
        )}
        {consultationMode.showEndDialog && consultationMode.activeConsultation && (
          <EndConsultationDialog
            consultation={consultationMode.activeConsultation}
            onConfirm={consultationMode.confirmEnd}
            onCancel={consultationMode.cancelEnd}
          />
        )}
        {consultationMode.showPoints && <PointsEarnedAnimation xp={8} pts={12} />}
        {consultationMode.showRating && consultationMode.endedConsultation && (
          <QuickRatingPrompt
            consultation={consultationMode.endedConsultation}
            onRate={() => consultationMode.finishRating()}
            onSkip={consultationMode.finishRating}
          />
        )}
      </div>
    </div>
    </ProfileNavigationProvider>
  );
}
