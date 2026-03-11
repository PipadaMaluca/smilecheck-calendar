import { useState, useMemo, useEffect } from 'react';
import { StatisticsView } from '@/components/statistics/StatisticsView';
import { DateNavigator } from './DateNavigator';
import { MultiDentistGrid, DentistColumn } from './MultiDentistGrid';
import { TimeSlotView } from './TimeSlotView';
import { CategoryLegend } from './CategoryLegend';
import { DynamicDaySummary } from './DynamicDaySummary';
import { EditConsultationModal } from './EditConsultationModal';
import { MobileConsultationDetail } from './MobileConsultationDetail';
import { BottomNavigation } from './BottomNavigation';
import { MobileHeader } from './mobile/MobileHeader';
import { MobileSidebar } from './mobile/MobileSidebar';
import { ThreeDayView } from './mobile/ThreeDayView';
import { DashboardView } from '@/components/dashboard/DashboardView';
import { SettingsView } from '@/components/settings/SettingsView';
import { InviteView } from '@/components/settings/InviteView';
import { TeamView } from '@/components/team/TeamView';
import { ConversationsView } from '@/components/conversations/ConversationsView';
import { Consultation, TimeSlot, ViewMode, Dentist, Clinic } from '@/types/calendar';
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
import { mockConsultations, mockClinics, mockDentists, generateTimeSlots, getDentistsForClinic, dentistWorksOnDemo, clinicDentists } from '@/data/mockData';
import { DentistSearchResult, MOCK_DENTIST_RESULTS } from '@/data/mockDentistSearch';
import { ProfileNavigationProvider } from '@/contexts/ProfileNavigationContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';
import smileIcon from '@/assets/smilecheck-icon.png';
import { SlotCreationScreen } from './creation/SlotCreationScreen';
import { MobilePatientDossier } from './mobile/MobilePatientDossier';
import { FullHistoryView } from '@/components/history/FullHistoryView';
import { ContestationView } from '@/components/contestation/ContestationView';
import { ClinicAgendaDropdown } from './mobile/ClinicAgendaDropdown';

export function ClinicCalendar() {
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 0, 31));
  const [selectedDentistIds, setSelectedDentistIds] = useState<string[]>([]);
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [activeTab, setActiveTab] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [selectedClinics, setSelectedClinics] = useState<string[]>(['1']);
  const [showProfile, setShowProfile] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showReferral, setShowReferral] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(['1', '2']);
  const [viewDentistProfile, setViewDentistProfile] = useState<DentistSearchResult | null>(null);
  const [viewClinicProfileId, setViewClinicProfileId] = useState<string | null>(null);
  const [slotCreation, setSlotCreation] = useState<{ date: Date; time: string; dentistKey?: string; dentistName?: string } | null>(null);
  const [viewPatientDossier, setViewPatientDossier] = useState<string | null>(null);
  const [showFullHistory, setShowFullHistory] = useState(false);
  const isMobile = useIsMobile();
  const ownClinicId = mockClinics[0]?.id || '1';

  // Build columns based on selected clinics and dentists
  const columns = useMemo<DentistColumn[]>(() => {
    const result: DentistColumn[] = [];
    
    // If no dentists selected or "all", show all clinics with all their dentists who work today
    const showAll = selectedDentistIds.length === 0 || selectedDentistIds.includes('all');
    
    // When showAll, iterate ALL clinics (not just selectedClinics)
    const clinicsToIterate = showAll 
      ? mockClinics // Show all clinics when "Todos" selected
      : mockClinics; // When specific dentists selected, iterate ALL clinics to check composite IDs
    
    clinicsToIterate.forEach(clinic => {
      const dentistsInClinic = getDentistsForClinic(clinic.id);
      
      // Filter dentists based on selection
      let dentistsToShow;
      if (showAll) {
        // Show only dentists who work on demo day (like desktop)
        dentistsToShow = dentistsInClinic.filter(d => dentistWorksOnDemo(clinic.id, d.id));
      } else {
        // Check composite IDs (clinic.id-dentist.id)
        dentistsToShow = dentistsInClinic.filter(d => {
          const compositeKey = `${clinic.id}-${d.id}`;
          return selectedDentistIds.includes(compositeKey);
        });
      }
      
      dentistsToShow.forEach(dentist => {
        const worksToday = dentistWorksOnDemo(clinic.id, dentist.id);
        const dentistConsultations = mockConsultations.filter(
          c => c.dentist.id === dentist.id && c.clinic.id === clinic.id
        );
        const slots = generateTimeSlots(selectedDate, dentistConsultations);
        
        result.push({
          dentist,
          clinic,
          worksToday,
          slots,
        });
      });
    });
    
    return result;
  }, [selectedDate, selectedClinics, selectedDentistIds]);

  // Day consultations for summary
  const allDayConsultations = mockConsultations.filter(
    (c) => c.date.toDateString() === selectedDate.toDateString()
  );

  const handleSlotClick = (dentistId: string, clinicId: string, slot: TimeSlot) => {
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

  const handleDentistToggle = (dentistId: string | null, isCheckbox: boolean, clinicId?: string) => {
    if (dentistId === null) {
      // "Filtrar Presentes" clicked - select all 7 dentists who work on demo day
      const presentDentists = clinicDentists
        .filter(cd => cd.worksOnDemo)
        .map(cd => `${cd.clinicId}-${cd.dentistId}`);
      setSelectedDentistIds(presentDentists);
    } else if (dentistId === 'all') {
      // Clear filter - show all (empty array means show all)
      setSelectedDentistIds([]);
    } else {
      const key = clinicId ? `${clinicId}-${dentistId}` : dentistId;
      
      if (isCheckbox) {
        // Checkbox click: toggle in multi-select
        if (selectedDentistIds.length === 0 || selectedDentistIds.includes('all')) {
          // Was "all", now select just this one
          setSelectedDentistIds([key]);
        } else if (selectedDentistIds.includes(key)) {
          // Remove from selection
          const newSelected = selectedDentistIds.filter(id => id !== key);
          setSelectedDentistIds(newSelected);
        } else {
          // Add to selection
          setSelectedDentistIds([...selectedDentistIds, key]);
        }
      } else {
        // Name click: select ONLY this dentist
        setSelectedDentistIds([key]);
      }
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

  const getSlots = (date: Date) => {
    // For 3-day view or list view, use selected dentist
    if (selectedDentistIds.length === 1 && selectedDentistIds[0] !== 'all') {
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

  const listSlots = useMemo(() => {
    return getSlots(selectedDate);
  }, [selectedDate, selectedDentistIds, selectedClinics]);

  // When view mode changes to 3-day or list, ensure only one dentist is selected
  // If none selected, auto-select first dentist
  useEffect(() => {
    if (viewMode === 'three-day' || viewMode === 'list') {
      if (selectedDentistIds.length === 0 || selectedDentistIds.includes('all')) {
        // Select first dentist from first clinic
        setSelectedDentistIds(['1-1']); // SmileCheck - Dr. Gonçalo Pipo
      } else if (selectedDentistIds.length > 1) {
        // Keep only the first selected
        setSelectedDentistIds([selectedDentistIds[0]]);
      }
    }
  }, [viewMode]);

  // Listen for filter-dentist events from dashboard
  useEffect(() => {
    const filterDentistHandler = (e: Event) => {
      const key = (e as CustomEvent<string>).detail;
      if (key === 'all') {
        setSelectedDentistIds([]);
      } else if (key?.startsWith('clinic-')) {
        // Select all dentists from specified clinic
        const clinicId = key.replace('clinic-', '');
        const clinicDentistKeys = getDentistsForClinic(clinicId).map(d => `${clinicId}-${d.id}`);
        setSelectedDentistIds(clinicDentistKeys);
      } else if (key) {
        setSelectedDentistIds([key]);
      }
    };
    window.addEventListener('smilecheck:filter-dentist', filterDentistHandler);
    return () => window.removeEventListener('smilecheck:filter-dentist', filterDentistHandler);
  }, []);

  // Handler that respects view mode restrictions
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
  };

  // Listen for custom navigation events (e.g. from contestation button)
  useEffect(() => {
    const navHandler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail) handleTabChange(detail);
    };
    window.addEventListener('smilecheck:navigate', navHandler);
    return () => window.removeEventListener('smilecheck:navigate', navHandler);
  }, []);

  const handleTabChange = (tab: string) => {
    // Clear ALL overlay/sub-screen states so navigation is always direct
    setShowReferral(false);
    setShowSearch(false);
    setShowProfile(false);
    setShowEditProfile(false);
    setShowInvite(false);
    setSelectedConsultation(null);
    setViewDentistProfile(null);
    setViewClinicProfileId(null);
    setSlotCreation(null);
    setViewPatientDossier(null);
    setShowFullHistory(false);
    setActiveTab(tab);
  };

  return (
    <ProfileNavigationProvider
      onOpenDentistProfile={(d) => setViewDentistProfile(d)}
      onOpenClinicProfile={(id) => setViewClinicProfileId(id)}
      onOpenPatientProfile={(id) => setViewPatientDossier(id)}
    >
    <div className="min-h-screen bg-background pb-24 overflow-x-hidden relative max-w-[100vw]">
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
      {/* Mobile Header with View Mode Selector - hide filters when viewing consultation detail */}
      <MobileHeader 
        onMenuClick={() => setSidebarOpen(true)}
        {...(activeTab === 'agenda' && !selectedConsultation ? { viewMode, onViewModeChange: handleViewModeChange } : {})}
        userRole="clinic"
      />

      {showFullHistory ? (
        <FullHistoryView userRole="clinic" onBack={() => setShowFullHistory(false)} />
      ) : selectedConsultation ? (
        <MobileConsultationDetail
          consultation={selectedConsultation}
          onClose={() => setSelectedConsultation(null)}
          onNavigate={(tab) => { setSelectedConsultation(null); handleTabChange(tab); }}
          onCopy={(c) => { console.log('Copy:', c); }}
          onViewDossier={(id) => { setSelectedConsultation(null); setViewPatientDossier(id); }}
        />
      ) : activeTab === 'home' ? (
        <DashboardView userRole="clinic" onNavigate={handleTabChange} onViewFullHistory={() => setShowFullHistory(true)} />
      ) : activeTab === 'agenda' ? (
        <>
          {/* Clinic Agenda Dropdown Filter */}
          <ClinicAgendaDropdown
            selectedDentistIds={selectedDentistIds.length === 0 ? ['all'] : selectedDentistIds}
            onDentistToggle={handleDentistToggle}
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
            {viewMode === 'three-day' ? (
              <ThreeDayView 
                selectedDate={selectedDate}
                getSlots={getSlots}
                onSlotClick={(slot) => slot.consultation && setSelectedConsultation(slot.consultation)}
              />
            ) : viewMode === 'list' ? (
              <TimeSlotView 
                slots={listSlots} 
                onSlotClick={(slot) => slot.consultation && setSelectedConsultation(slot.consultation)} 
              />
            ) : (
              <MultiDentistGrid
                columns={columns}
                onSlotClick={handleSlotClick}
                onEmptySlotClick={handleEmptySlotClick}
                showFullName
              />
            )}
          </div>

          {/* Dynamic Day Summary */}
          {viewMode !== 'three-day' && (
            <div className="mt-6">
              <DynamicDaySummary 
                consultations={allDayConsultations}
                selectedDentistIds={selectedDentistIds}
                selectedClinics={selectedClinics}
              />
            </div>
          )}

          {/* Per-dentist summary */}
          <div className="px-4 mt-4 mb-6">
            <div className="bg-card rounded-xl p-4">
              <h4 className="text-xs font-semibold text-muted-foreground mb-3">Por Dentista</h4>
              <div className="space-y-2">
                {columns.filter(col => col.worksToday).map((col, idx) => {
                  const dentistConsults = allDayConsultations.filter(
                    (c) => c.dentist.id === col.dentist.id && c.clinic.id === col.clinic.id
                  );
                  const tele = dentistConsults.filter((c) => c.type === 'teleconsulta').length;
                  const pres = dentistConsults.filter((c) => c.type === 'presencial').length;

                  return (
                    <div key={`${col.clinic.id}-${col.dentist.id}-${idx}`} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {col.dentist.name}
                        <span className="text-xs ml-1 opacity-60">({col.clinic.name.replace('Clínica ', '')})</span>
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-teleconsulta">{tele} tele</span>
                        <span className="text-presencial">{pres} pres</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      ) : activeTab === 'equipa' ? (
        <TeamView userRole="clinic" onNavigate={handleTabChange} />
      ) : activeTab === 'conversas' ? (
        <ConversationsView userRole="clinic" onNavigate={handleTabChange} />
      ) : activeTab === 'configuracoes' ? (
        <SettingsView userRole="clinic" onNavigate={handleTabChange} onInvite={() => setShowInvite(true)} />
      ) : activeTab === 'classificacoes' || activeTab === 'pontuacoes' ? (
        <div className="px-0"><PontuacoesView userRole="clinic" initialTab={activeTab === 'classificacoes' ? 'classificacoes' : 'pontos'} onNavigate={handleTabChange} /></div>
      ) : activeTab === 'conquistas' ? (
        <div className="px-0"><AchievementsView userRole="clinic" /></div>
      ) : activeTab === 'notificacoes' ? (
        <NotificationsFullView onBack={() => setActiveTab('home')} />
      ) : activeTab === 'plano' ? (
        <ManagePlanView userRole="clinic" />
      ) : activeTab === 'loja' ? (
        <RewardsStoreView userRole="clinic" />
      ) : activeTab === 'pesquisa' ? (
        <FavoritesView
          favorites={favorites}
          onToggleFavorite={id => { setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]); }}
          onViewProfile={d => setViewDentistProfile(d)}
          onBookDentist={d => setViewDentistProfile(d)}
          userRole="clinic"
          onViewClinicProfile={id => setViewClinicProfileId(id)}
        />
      ) : activeTab === 'estatisticas' ? (
        <StatisticsView />
      ) : activeTab === 'faturacao' ? (
        <BillingView userRole="clinic" onNavigate={handleTabChange} />
      ) : activeTab === 'contestacao' ? (
        <ContestationView onBack={() => setActiveTab('home')} />
      ) : (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <p className="text-lg">Secção em construção...</p>
        </div>
      )}

      <BottomNavigation userRole="clinic" activeTab={activeTab} onTabChange={handleTabChange} />

      <MobileSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userRole="clinic"
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        selectedDentists={selectedDentistIds.length === 0 ? ['all'] : selectedDentistIds}
        onDentistToggle={handleDentistToggle}
        selectedClinics={selectedClinics}
        onClinicToggle={handleClinicToggle}
        onProfileClick={() => setShowProfile(true)}
        activeTab={activeTab}
        onNavigate={(tab) => {
          if (tab === 'referencia') { handleTabChange(activeTab); setShowReferral(true); return; }
          handleTabChange(tab);
        }}
      />

      {showProfile && (
        <ClinicProfileView
          clinicId={ownClinicId}
          isOpen={true}
          onClose={() => setShowProfile(false)}
          isOwnProfile
          onEditProfile={() => {
            setShowProfile(false);
            setShowEditProfile(true);
          }}
          onViewDentistProfile={(id) => {
            const d = MOCK_DENTIST_RESULTS.find((dr) => dr.id === id);
            if (d) setViewDentistProfile(d);
          }}
        />
      )}

      <EditProfileView
        userRole="clinic"
        isOpen={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        onSave={() => {
          setShowEditProfile(false);
          setShowProfile(true);
        }}
      />
      <UnifiedSearch
        userRole="clinic"
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
        favorites={favorites}
        onToggleFavorite={id => { setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]); }}
        onViewDentistProfile={d => { setShowSearch(false); setViewDentistProfile(d); }}
        onViewClinicProfile={id => { setShowSearch(false); setViewClinicProfileId(id); }}
      />

      {showReferral && (
        <ReferralLetterFlow
          onClose={() => setShowReferral(false)}
          onGoHome={() => { setShowReferral(false); setActiveTab('home'); }}
          favorites={favorites}
          onToggleFavorite={id => { setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]); }}
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

      {viewClinicProfileId && (
        <ClinicProfileView
          clinicId={viewClinicProfileId}
          isOpen={true}
          onClose={() => setViewClinicProfileId(null)}
          onViewDentistProfile={id => {
            const d = MOCK_DENTIST_RESULTS.find(dr => dr.id === id);
            if (d) { setViewClinicProfileId(null); setViewDentistProfile(d); }
          }}
        />
      )}

      {showInvite && <InviteView onClose={() => setShowInvite(false)} />}


      {/* Slot Creation Screen */}
      {slotCreation && (
        <SlotCreationScreen
          isOpen={true}
          onClose={() => setSlotCreation(null)}
          userRole="clinic"
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
        userRole="clinic"
      />
    </div>
    </ProfileNavigationProvider>
  );
}