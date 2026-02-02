import { useState, useMemo } from 'react';
import { Plus, PauseCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DateNavigator } from './DateNavigator';
import { TimeSlotView } from './TimeSlotView';
import { MultiDentistGrid, DentistColumn } from './MultiDentistGrid';
import { CategoryLegend } from './CategoryLegend';
import { DynamicDaySummary } from './DynamicDaySummary';
import { EditConsultationModal } from './EditConsultationModal';
import { BottomNavigation } from './BottomNavigation';
import { MobileHeader } from './mobile/MobileHeader';
import { MobileSidebar } from './mobile/MobileSidebar';
import { ViewModeSelector } from './mobile/ViewModeSelector';
import { ThreeDayView } from './mobile/ThreeDayView';
import { Consultation, TimeSlot, ViewMode, Dentist, Clinic } from '@/types/calendar';
import { mockConsultations, mockClinics, mockDentists, generateTimeSlots, getDentistsForClinic, dentistWorksOnDemo } from '@/data/mockData';
import { useIsMobile } from '@/hooks/use-mobile';
import smileIcon from '@/assets/smilecheck-icon.png';

export function DentistCalendar() {
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 0, 31));
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [activeTab, setActiveTab] = useState('agenda');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedDentistIds, setSelectedDentistIds] = useState<string[]>([]);
  const [selectedClinics, setSelectedClinics] = useState<string[]>(['1']);
  const isMobile = useIsMobile();

  // Build columns based on selected clinics and dentists (like ClinicCalendar)
  const columns = useMemo<DentistColumn[]>(() => {
    const result: DentistColumn[] = [];
    
    const clinicsToShow = selectedClinics.length === 0 ? mockClinics : mockClinics.filter(c => selectedClinics.includes(c.id));
    
    clinicsToShow.forEach(clinic => {
      const dentistsInClinic = getDentistsForClinic(clinic.id);
      
      const dentistsToShow = selectedDentistIds.length === 0 || selectedDentistIds.includes('all')
        ? dentistsInClinic
        : dentistsInClinic.filter(d => selectedDentistIds.includes(d.id) || selectedDentistIds.includes(`${clinic.id}-${d.id}`));
      
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

  const getSlots = (date: Date) => {
    const consultations = mockConsultations.filter(c => c.dentist.id === mockDentists[0].id);
    return generateTimeSlots(date, consultations);
  };

  const handleDentistToggle = (dentistId: string | null, isCheckbox: boolean, clinicId?: string) => {
    if (dentistId === null) {
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
        showFullName
      />
    );
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
        {/* Mobile Header */}
        <MobileHeader 
          onMenuClick={() => setSidebarOpen(true)}
        />

        {/* View Mode Selector */}
        <ViewModeSelector 
          viewMode={viewMode} 
          onViewModeChange={setViewMode} 
          userRole="dentist" 
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

        {/* Action Buttons */}
        <div className="fixed bottom-24 right-4 flex flex-col gap-3 z-20">
          <Button
            variant="secondary"
            size="icon"
            className="w-12 h-12 rounded-full shadow-lg"
          >
            <PauseCircle className="w-5 h-5" />
          </Button>
          <Button className="floating-button animate-pulse-glow" style={{ position: 'relative', bottom: 0, right: 0 }}>
            <Plus className="w-6 h-6" />
          </Button>
        </div>

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
        />

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
