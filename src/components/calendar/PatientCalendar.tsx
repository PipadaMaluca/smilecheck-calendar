import { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MonthlyCalendar } from './MonthlyCalendar';
import { ConsultationCard } from './ConsultationCard';
import { EditConsultationModal } from './EditConsultationModal';
import { BottomNavigation } from './BottomNavigation';
import { MobileHeader } from './mobile/MobileHeader';
import { MobileSidebar } from './mobile/MobileSidebar';
import { ViewModeSelector } from './mobile/ViewModeSelector';
import { FamilyFilter } from './mobile/FamilyFilter';
import { Consultation, ViewMode } from '@/types/calendar';
import { mockPatientConsultations, mockFamilyMembers } from '@/data/mockData';
import { format, isSameDay } from 'date-fns';
import { pt } from 'date-fns/locale';
import { useIsMobile } from '@/hooks/use-mobile';
import smileIcon from '@/assets/smilecheck-icon.png';

export function PatientCalendar() {
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 0, 31)); // Demo day
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [activeTab, setActiveTab] = useState('agenda');
  const [selectedMembers, setSelectedMembers] = useState<string[]>(['all']);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
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
      // Clicking "all" always selects all
      setSelectedMembers(['all']);
    } else {
      if (isCheckbox) {
        // Checkbox click: toggle in multi-select
        if (selectedMembers.includes('all')) {
          // If "all" was selected, switch to just this member
          setSelectedMembers([memberId]);
        } else if (selectedMembers.includes(memberId)) {
          // Remove from selection
          const newSelected = selectedMembers.filter(id => id !== memberId);
          if (newSelected.length === 0) {
            setSelectedMembers(['all']);
          } else {
            setSelectedMembers(newSelected);
          }
        } else {
          // Add to selection
          const newSelected = [...selectedMembers, memberId];
          // If all members are now selected, switch to 'all'
          if (newSelected.length === mockFamilyMembers.length) {
            setSelectedMembers(['all']);
          } else {
            setSelectedMembers(newSelected);
          }
        }
      } else {
        // Name click: select ONLY this member
        setSelectedMembers([memberId]);
      }
    }
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
        <MobileHeader onMenuClick={() => setSidebarOpen(true)} />

        {/* View Mode Selector */}
        <ViewModeSelector 
          viewMode={viewMode} 
          onViewModeChange={setViewMode} 
          userRole="patient" 
        />

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
                      onClick={() => setSelectedConsultation(consultation)}
                    />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-2">Sem consultas agendadas</p>
              <p className="text-xs text-muted-foreground/60">Toque em + para agendar uma nova consulta</p>
            </div>
          )}
        </div>

        {/* Floating Button */}
        <Button className="floating-button animate-pulse-glow">
          <Plus className="w-6 h-6" />
        </Button>

        {/* Bottom Navigation - Fixed */}
        <BottomNavigation
          userRole="patient"
          activeTab={activeTab}
          onTabChange={setActiveTab}
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
        />

        {/* Edit Modal */}
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
      </div>
    </div>
  );
}
