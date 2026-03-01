import { useState, useMemo, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DateNavigator } from './DateNavigator';
import { TimeSlotView } from './TimeSlotView';
import { MultiDentistGrid, DentistColumn } from './MultiDentistGrid';
import { CategoryLegend } from './CategoryLegend';
import { DynamicDaySummary } from './DynamicDaySummary';
import { EditConsultationModal } from './EditConsultationModal';
import { AgendaSettingsModal, DEFAULT_SETTINGS, AgendaSettings } from './AgendaSettingsModal';
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
import { ProfileView } from '@/components/profile/ProfileView';
import { EditProfileView } from '@/components/profile/EditProfileView';
import { RankingsView } from '@/components/rankings/RankingsView';
import { AchievementsView } from '@/components/achievements/AchievementsView';
import { ManagePlanView } from '@/components/plan/ManagePlanView';
import { RewardsStoreView } from '@/components/rewards/RewardsStoreView';
import { UnifiedSearch } from '@/components/search/UnifiedSearch';
import { FavoritesView } from '@/components/favorites/FavoritesView';
import { ReferralLetterFlow } from '@/components/referral/ReferralLetterFlow';
import { DentistProfileView } from '@/components/profile/DentistProfileView';
import { ClinicProfileView } from '@/components/profile/ClinicProfileView';
import { Consultation, TimeSlot, ViewMode, Dentist, Clinic } from '@/types/calendar';
import { mockConsultations, mockClinics, mockDentists, generateTimeSlots, getDentistsForClinic, dentistWorksOnDemo, clinicDentists } from '@/data/mockData';
import { DentistSearchResult, MOCK_DENTIST_RESULTS } from '@/data/mockDentistSearch';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';
import smileIcon from '@/assets/smilecheck-icon.png';
import { SlotCreationScreen } from './creation/SlotCreationScreen';

export function DentistCalendar() {
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 0, 31));
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [activeTab, setActiveTab] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedDentistIds, setSelectedDentistIds] = useState<string[]>([]);
  const [selectedClinics, setSelectedClinics] = useState<string[]>(['1']);
  const [showPrescription, setShowPrescription] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showReferral, setShowReferral] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(['1', '2']);
  const [viewDentistProfile, setViewDentistProfile] = useState<DentistSearchResult | null>(null);
  const [viewClinicProfile, setViewClinicProfile] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [agendaSettings, setAgendaSettings] = useState<AgendaSettings>({ ...DEFAULT_SETTINGS });
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [slotCreation, setSlotCreation] = useState<{ date: Date; time: string; dentistKey?: string; dentistName?: string } | null>(null);
  const isMobile = useIsMobile();

  // Build columns based on selected clinics and dentists (like ClinicCalendar)
  const columns = useMemo<DentistColumn[]>(() => {
    const result: DentistColumn[] = [];
    
    // If no dentists selected or "all", show all clinics with all their dentists
    const showAll = selectedDentistIds.length === 0 || selectedDentistIds.includes('all');
    
    // Determine which clinics to iterate
    const clinicsToIterate = showAll 
      ? (selectedClinics.length === 0 ? mockClinics : mockClinics.filter(c => selectedClinics.includes(c.id)))
      : mockClinics; // When specific dentists selected, iterate ALL clinics to check composite IDs
    
    clinicsToIterate.forEach(clinic => {
      const dentistsInClinic = getDentistsForClinic(clinic.id);
      
      // Filter dentists based on selection
      let dentistsToShow;
      if (showAll) {
        // Show all dentists from selected clinics
        if (selectedClinics.length === 0 || selectedClinics.includes(clinic.id)) {
          dentistsToShow = dentistsInClinic;
        } else {
          dentistsToShow = [];
        }
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

  // For list view - filter only Dr. Gonçalo Pipo's consultations (current user) or selected dentists
  const myConsultations = useMemo(() => {
    if (selectedDentistIds.length === 0 || selectedDentistIds.includes('all')) {
      return mockConsultations.filter(c => c.dentist.id === mockDentists[0].id);
    }
    return mockConsultations.filter(c => {
      const key = `${c.clinic.id}-${c.dentist.id}`;
      return selectedDentistIds.includes(key) || selectedDentistIds.includes(c.dentist.id);
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
        if (selectedDentistIds.length === 0 || selectedDentistIds.includes('all')) {
          setSelectedDentistIds([key]);
        } else if (selectedDentistIds.includes(key)) {
          const newSelected = selectedDentistIds.filter(id => id !== key);
          setSelectedDentistIds(newSelected);
        } else {
          setSelectedDentistIds([...selectedDentistIds, key]);
        }
      } else {
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
      if (selectedDentistIds.length === 0 || selectedDentistIds.includes('all')) {
        // Select first dentist from first clinic
        setSelectedDentistIds(['1-1']); // SmileCheck - Dr. Gonçalo Pipo
      } else if (selectedDentistIds.length > 1) {
        // Keep only the first selected
        setSelectedDentistIds([selectedDentistIds[0]]);
      }
    }
  }, [viewMode]);

  // Handler that respects view mode restrictions
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
  };

  return (
    <div className="min-h-screen bg-background pb-24 relative overflow-x-hidden">
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
        {/* Mobile Header with View Mode Selector */}
        <MobileHeader 
          onMenuClick={() => setSidebarOpen(true)}
          {...(activeTab === 'agenda' ? { viewMode, onViewModeChange: handleViewModeChange } : {})}
          userRole="dentist"
          showNewConsultation={activeTab === 'agenda'}
          onNewConsultation={() => setSlotCreation({ date: selectedDate, time: '09:00' })}
        />

        {activeTab === 'home' ? (
          <DashboardView userRole="dentist" onNavigate={(tab) => {
            if (tab === 'pesquisa') { setShowSearch(true); return; }
            setActiveTab(tab);
          }} />
        ) : activeTab === 'agenda' ? (
          <>
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
          <TeamView userRole="dentist" onNavigate={setActiveTab} />
        ) : activeTab === 'conversas' ? (
          <ConversationsView userRole="dentist" onNavigate={setActiveTab} />
        ) : activeTab === 'configuracoes' ? (
          <SettingsView userRole="dentist" onNavigate={setActiveTab} onInvite={() => setShowInvite(true)} />
        ) : activeTab === 'classificacoes' ? (
          <div className="px-0"><RankingsView userRole="dentist" /></div>
        ) : activeTab === 'conquistas' ? (
          <div className="px-0"><AchievementsView userRole="dentist" /></div>
        ) : activeTab === 'notificacoes' ? (
          <NotificationsFullView onBack={() => setActiveTab('home')} />
        ) : activeTab === 'plano' ? (
          <ManagePlanView userRole="dentist" />
        ) : activeTab === 'loja' ? (
          <RewardsStoreView userRole="dentist" />
        ) : activeTab === 'favoritos' ? (
          <FavoritesView
            favorites={favorites}
            onToggleFavorite={id => {
              setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
              toast.success(favorites.includes(id) ? 'Removido dos favoritos' : 'Adicionado aos favoritos');
            }}
            onViewProfile={d => setViewDentistProfile(d)}
          />
        ) : (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <p className="text-lg">Secção em construção...</p>
          </div>
        )}

        {/* Fixed Bottom Navigation */}
        <BottomNavigation
          userRole="dentist"
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Mobile Sidebar */}
        <MobileSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          userRole="dentist"
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          selectedDentists={selectedDentistIds.length === 0 ? ['all'] : selectedDentistIds}
          onDentistToggle={handleDentistToggle}
          selectedClinics={selectedClinics}
          onClinicToggle={handleClinicToggle}
          onPrescribe={() => setShowPrescription(true)}
          onProfileClick={() => setShowProfile(true)}
          activeTab={activeTab}
          onNavigate={(tab) => {
            if (tab === 'pesquisa') { setShowSearch(true); return; }
            if (tab === 'referencia') { setShowReferral(true); return; }
            setActiveTab(tab);
          }}
        />

        {showPrescription && (
          <PrescriptionFlow
            onClose={() => setShowPrescription(false)}
            onGoHome={() => { setShowPrescription(false); setActiveTab('home'); }}
          />
        )}

        <ProfileView userRole="dentist" isOpen={showProfile} onClose={() => setShowProfile(false)} />
        <EditProfileView userRole="dentist" isOpen={showEditProfile} onClose={() => setShowEditProfile(false)} onSave={() => setShowEditProfile(false)} />

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

        <EditConsultationModal
          consultation={selectedConsultation}
          isOpen={!!selectedConsultation}
          onClose={() => setSelectedConsultation(null)}
          isMobile={isMobile}
          onSave={(updated) => {
            console.log('Saved consultation:', updated);
            setSelectedConsultation(null);
          }}
          onCancel={(consultation) => {
            console.log('Cancelled consultation:', consultation);
            setSelectedConsultation(null);
          }}
        />

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
      </div>
    </div>
  );
}
