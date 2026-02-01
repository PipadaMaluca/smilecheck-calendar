import { useState, useMemo } from 'react';
import { DateNavigator } from './DateNavigator';
import { MultiDentistGrid } from './MultiDentistGrid';
import { CategoryLegend } from './CategoryLegend';
import { DaySummary } from './DaySummary';
import { EditConsultationModal } from './EditConsultationModal';
import { BottomNavigation } from './BottomNavigation';
import { MobileHeader } from './mobile/MobileHeader';
import { MobileSidebar } from './mobile/MobileSidebar';
import { ViewModeSelector } from './mobile/ViewModeSelector';
import { DentistFilterMobile } from './mobile/DentistFilterMobile';
import { ThreeDayView } from './mobile/ThreeDayView';
import { Consultation, TimeSlot, ViewMode } from '@/types/calendar';
import { mockConsultations, mockClinics, mockDentists, generateTimeSlots } from '@/data/mockData';
import { useIsMobile } from '@/hooks/use-mobile';

export function ClinicCalendar() {
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 0, 31));
  const [selectedDentistIds, setSelectedDentistIds] = useState<string[]>([]);
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [activeTab, setActiveTab] = useState('agenda');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [selectedClinics, setSelectedClinics] = useState<string[]>(['1']);
  const isMobile = useIsMobile();

  const filteredDentists = selectedDentistIds.length === 0 || selectedDentistIds.includes('all')
    ? mockDentists
    : mockDentists.filter((d) => selectedDentistIds.includes(d.id));

  const slotsPerDentist = useMemo(() => {
    const result: Record<string, TimeSlot[]> = {};
    filteredDentists.forEach((dentist) => {
      const dentistConsultations = mockConsultations.filter(
        (c) => c.dentist.id === dentist.id
      );
      result[dentist.id] = generateTimeSlots(selectedDate, dentistConsultations);
    });
    return result;
  }, [selectedDate, filteredDentists]);

  const allDayConsultations = mockConsultations.filter(
    (c) => c.date.toDateString() === selectedDate.toDateString()
  );

  const summary = {
    totalConsultations: allDayConsultations.length,
    teleconsultas: allDayConsultations.filter((c) => c.type === 'teleconsulta').length,
    presenciais: allDayConsultations.filter((c) => c.type === 'presencial').length,
    vagasLivres: Object.values(slotsPerDentist)
      .flat()
      .filter((s) => s.status === 'livre').length,
    totalRevenue: allDayConsultations
      .filter((c) => c.type === 'teleconsulta' && c.isPaid)
      .reduce((sum, c) => sum + c.price, 0),
  };

  const handleSlotClick = (dentistId: string, slot: TimeSlot) => {
    if (slot.consultation) {
      setSelectedConsultation(slot.consultation);
    }
  };

  const handleDentistToggle = (dentistId: string | null, isCheckbox: boolean) => {
    if (dentistId === null) {
      // "Todos" clicked
      setSelectedDentistIds([]);
    } else {
      if (isCheckbox) {
        // Checkbox click: toggle in multi-select
        if (selectedDentistIds.length === 0) {
          // Was "all", now select just this one
          setSelectedDentistIds([dentistId]);
        } else if (selectedDentistIds.includes(dentistId)) {
          // Remove from selection
          const newSelected = selectedDentistIds.filter(id => id !== dentistId);
          setSelectedDentistIds(newSelected);
        } else {
          // Add to selection
          const newSelected = [...selectedDentistIds, dentistId];
          // If all dentists selected, switch to empty (all)
          if (newSelected.length === mockDentists.length) {
            setSelectedDentistIds([]);
          } else {
            setSelectedDentistIds(newSelected);
          }
        }
      } else {
        // Name click: select ONLY this dentist
        setSelectedDentistIds([dentistId]);
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
    // For 3-day view, use first dentist or selected dentist
    const dentistId = selectedDentistIds.length === 1 ? selectedDentistIds[0] : mockDentists[0].id;
    const consultations = mockConsultations.filter(c => c.dentist.id === dentistId);
    return generateTimeSlots(date, consultations);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Mobile Header */}
      <MobileHeader 
        onMenuClick={() => setSidebarOpen(true)}
        showClinicSelector
        selectedClinic={mockClinics[0]}
      />

      {/* View Mode Selector */}
      <ViewModeSelector 
        viewMode={viewMode} 
        onViewModeChange={setViewMode} 
        userRole="clinic" 
      />

      <DateNavigator
        date={selectedDate}
        onDateChange={setSelectedDate}
      />

      {/* Category Legend */}
      <CategoryLegend compact className="mx-4 mb-4 rounded-lg" />

      {/* Dentist Filter - centered */}
      <DentistFilterMobile
        dentists={mockDentists}
        selectedDentistIds={selectedDentistIds}
        onToggle={handleDentistToggle}
        centered
      />

      {/* Content based on view mode */}
      <div className="mt-4">
        {viewMode === 'three-day' ? (
          <ThreeDayView 
            selectedDate={selectedDate}
            getSlots={getSlots}
            onSlotClick={(slot) => slot.consultation && setSelectedConsultation(slot.consultation)}
          />
        ) : (
          <MultiDentistGrid
            dentists={filteredDentists}
            slotsPerDentist={slotsPerDentist}
            onSlotClick={handleSlotClick}
            showFullName
          />
        )}
      </div>

      <div className="mt-6">
        <DaySummary summary={summary} />
      </div>

      {/* Per-dentist summary */}
      <div className="px-4 mt-4 mb-6">
        <div className="bg-card rounded-xl p-4">
          <h4 className="text-xs font-semibold text-muted-foreground mb-3">Por Dentista</h4>
          <div className="space-y-2">
            {mockDentists.map((dentist) => {
              const dentistConsults = allDayConsultations.filter(
                (c) => c.dentist.id === dentist.id
              );
              const tele = dentistConsults.filter((c) => c.type === 'teleconsulta').length;
              const pres = dentistConsults.filter((c) => c.type === 'presencial').length;

              return (
                <div key={dentist.id} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{dentist.name}</span>
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

      {/* Fixed Bottom Navigation */}
      <BottomNavigation
        userRole="clinic"
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Mobile Sidebar */}
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
  );
}
