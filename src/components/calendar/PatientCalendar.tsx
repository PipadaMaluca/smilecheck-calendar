import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MonthlyCalendar } from './MonthlyCalendar';
import { ConsultationCard } from './ConsultationCard';
import { PatientConsultationDetail } from './PatientConsultationDetail';
import { BottomNavigation } from './BottomNavigation';
import { MobileHeader } from './mobile/MobileHeader';
import { MobileSidebar } from './mobile/MobileSidebar';
import { FamilyFilter } from './mobile/FamilyFilter';
import { DashboardView } from '@/components/dashboard/DashboardView';
import { SettingsView } from '@/components/settings/SettingsView';
import { InviteView } from '@/components/settings/InviteView';
import { ConversationsView } from '@/components/conversations/ConversationsView';
import { HealthView } from '@/components/health/HealthView';
import { NotificationsFullView } from '@/components/notifications/NotificationCenter';
import { TriageInline } from '@/components/triage/TriageInline';
import { ProfileView } from '@/components/profile/ProfileView';
import { EditProfileView } from '@/components/profile/EditProfileView';
import { AchievementsView } from '@/components/achievements/AchievementsView';
import { ManagePlanView } from '@/components/plan/ManagePlanView';
import { RewardsStoreView } from '@/components/rewards/RewardsStoreView';
import { Consultation, ViewMode } from '@/types/calendar';
import { mockPatientConsultations, mockFamilyMembers } from '@/data/mockData';
import { format, isSameDay } from 'date-fns';
import { pt } from 'date-fns/locale';
import { useIsMobile } from '@/hooks/use-mobile';
import smileIcon from '@/assets/smilecheck-icon.png';

export function PatientCalendar() {
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 0, 31));
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [activeTab, setActiveTab] = useState('home');
  const [selectedMembers, setSelectedMembers] = useState<string[]>(['all']);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [showTriage, setShowTriage] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const isMobile = useIsMobile();

  // Filter consultations by selected family members
  const filteredConsultations = selectedMembers.includes('all')
    ? mockPatientConsultations
    : mockPatientConsultations.filter(c => selectedMembers.includes(c.patient.id));

  const appointmentDates = filteredConsultations.map((c) => c.date);
  const dayConsultations = filteredConsultations.filter((c) =>
    isSameDay(c.date, selectedDate)
  );

  // All upcoming consultations sorted by date
  const upcomingConsultations = [...filteredConsultations]
    .filter(c => c.date >= new Date())
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  const handleMemberToggle = (memberId: string, isCheckbox: boolean) => {
    if (memberId === 'all') {
      setSelectedMembers(['all']);
    } else {
      if (isCheckbox) {
        if (selectedMembers.includes('all')) {
          setSelectedMembers([memberId]);
        } else if (selectedMembers.includes(memberId)) {
          const newSelected = selectedMembers.filter(id => id !== memberId);
          if (newSelected.length === 0) {
            setSelectedMembers(['all']);
          } else {
            setSelectedMembers(newSelected);
          }
        } else {
          const newSelected = [...selectedMembers, memberId];
          if (newSelected.length === mockFamilyMembers.length) {
            setSelectedMembers(['all']);
          } else {
            setSelectedMembers(newSelected);
          }
        }
      } else {
        setSelectedMembers([memberId]);
      }
    }
  };

  const handleTabChange = (tab: string) => {
    setShowTriage(false);
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-background pb-24 relative">
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
      
      <div className="relative z-10">
        {/* Mobile Header */}
        <MobileHeader 
          onMenuClick={() => setSidebarOpen(true)}
          userRole="patient"
          showNewConsultation={activeTab === 'consultas'}
          onNewConsultation={() => { setShowTriage(true); setActiveTab('consultas'); }}
        />

        {showTriage ? (
          <TriageInline onClose={() => setShowTriage(false)} onGoHome={() => { setShowTriage(false); setActiveTab('home'); }} />
        ) : activeTab === 'home' ? (
          <DashboardView userRole="patient" onNavigate={handleTabChange} onStartTriage={() => setShowTriage(true)} />
        ) : activeTab === 'consultas' ? (
          <>
            {/* Calendar */}
            <div className="py-2">
              <MonthlyCalendar
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
                appointmentDates={appointmentDates}
              />
            </div>

            {/* Family Filter */}
            <FamilyFilter 
              selectedMembers={selectedMembers}
              onMemberToggle={handleMemberToggle}
            />

            {/* Consultations List */}
            <div className="px-4 mt-4">
              {dayConsultations.length > 0 ? (
                <>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                    {format(selectedDate, "d 'de' MMMM", { locale: pt })} • {dayConsultations.length} consulta{dayConsultations.length > 1 ? 's' : ''}
                  </h3>
                  <div className="space-y-3">
                    {dayConsultations.map((consultation) => (
                      <ConsultationCard
                        key={consultation.id}
                        consultation={consultation}
                        userRole="patient"
                        showFamilyMember={selectedMembers.includes('all') || selectedMembers.length > 1}
                        onClick={() => setSelectedConsultation(consultation)}
                      />
                    ))}
                  </div>
                </>
              ) : upcomingConsultations.length > 0 ? (
                <>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                    Próximas consultas
                  </h3>
                  <div className="space-y-3">
                    {upcomingConsultations.slice(0, 5).map((consultation) => (
                      <div key={consultation.id}>
                        <p className="text-xs text-muted-foreground mb-1 capitalize">
                          {format(consultation.date, "EEEE, d 'de' MMMM", { locale: pt })}
                        </p>
                        <ConsultationCard
                          consultation={consultation}
                          userRole="patient"
                          showFamilyMember={selectedMembers.includes('all') || selectedMembers.length > 1}
                          onClick={() => setSelectedConsultation(consultation)}
                        />
                      </div>
                    ))}
                  </div>
                </>
              ) : (
              <div className="text-center py-12">
                  <p className="text-muted-foreground mb-2">Sem consultas para este dia</p>
                </div>
              )}
            </div>
          </>
        ) : activeTab === 'saude' ? (
          <HealthView userRole="patient" onNavigate={handleTabChange} />
        ) : activeTab === 'conversas' ? (
          <ConversationsView userRole="patient" onNavigate={handleTabChange} />
        ) : activeTab === 'configuracoes' ? (
          <SettingsView userRole="patient" onNavigate={handleTabChange} onInvite={() => setShowInvite(true)} />
        ) : activeTab === 'conquistas' ? (
          <div className="px-0"><AchievementsView userRole="patient" /></div>
        ) : activeTab === 'notificacoes' ? (
          <NotificationsFullView onBack={() => handleTabChange('home')} />
        ) : activeTab === 'plano' ? (
          <ManagePlanView userRole="patient" />
        ) : activeTab === 'loja' ? (
          <RewardsStoreView userRole="patient" />
        ) : (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <p className="text-lg">Secção em construção...</p>
          </div>
        )}

        {/* Bottom Navigation - Fixed - Always on top */}
        <BottomNavigation
          userRole="patient"
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />

        {/* Mobile Sidebar */}
        <MobileSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          userRole="patient"
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          selectedMembers={selectedMembers}
          onMemberToggle={handleMemberToggle}
          onProfileClick={() => setShowProfile(true)}
          onNavigate={handleTabChange}
          activeTab={activeTab}
        />

        {/* Patient Consultation Detail */}
        {selectedConsultation && (
          <PatientConsultationDetail
            consultation={selectedConsultation}
            isOpen={!!selectedConsultation}
            onClose={() => setSelectedConsultation(null)}
          />
        )}

        <ProfileView userRole="patient" isOpen={showProfile} onClose={() => setShowProfile(false)} />
        <EditProfileView userRole="patient" isOpen={showEditProfile} onClose={() => setShowEditProfile(false)} onSave={() => setShowEditProfile(false)} />
        {showInvite && <InviteView onClose={() => setShowInvite(false)} />}
      </div>
    </div>
  );
}
