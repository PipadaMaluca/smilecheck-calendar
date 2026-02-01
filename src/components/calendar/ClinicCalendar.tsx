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
import { ThreeDayView } from './mobile/ThreeDayView';
import { Consultation, TimeSlot, ViewMode, Dentist, Clinic } from '@/types/calendar';
import { mockConsultations, mockClinics, mockDentists, generateTimeSlots, getDentistsForClinic, dentistWorksOnDemo } from '@/data/mockData';
import { useIsMobile } from '@/hooks/use-mobile';

interface DentistColumn {
  dentist: Dentist;
  clinic: Clinic;
  worksToday: boolean;
  slots: TimeSlot[];
}

export function ClinicCalendar() {
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 0, 31));
  const [selectedDentistIds, setSelectedDentistIds] = useState<string[]>([]);
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [activeTab, setActiveTab] = useState('agenda');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [selectedClinics, setSelectedClinics] = useState<string[]>(['1']);
  const isMobile = useIsMobile();

  // Build columns based on selected clinics and dentists
  const columns = useMemo<DentistColumn[]>(() => {
    const result: DentistColumn[] = [];
    
    // For each selected clinic, add its dentists
    const clinicsToShow = selectedClinics.length === 0 ? mockClinics : mockClinics.filter(c => selectedClinics.includes(c.id));
    
    clinicsToShow.forEach(clinic => {
      const dentistsInClinic = getDentistsForClinic(clinic.id);
      
      // Filter dentists if specific ones are selected
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

  // For display in filter (only SmileCheck dentists by default)
  const displayDentists = useMemo(() => {
    return getDentistsForClinic('1'); // SmileCheck
  }, []);

  const allDayConsultations = mockConsultations.filter(
    (c) => c.date.toDateString() === selectedDate.toDateString()
  );

  const summary = {
    totalConsultations: allDayConsultations.length,
    teleconsultas: allDayConsultations.filter((c) => c.type === 'teleconsulta').length,
    presenciais: allDayConsultations.filter((c) => c.type === 'presencial').length,
    vagasLivres: columns
      .filter(col => col.worksToday)
      .flatMap(col => col.slots)
      .filter((s) => s.status === 'livre').length,
    totalRevenue: allDayConsultations
      .filter((c) => c.type === 'teleconsulta' && c.isPaid)
      .reduce((sum, c) => sum + c.price, 0),
  };

  const handleSlotClick = (dentistId: string, clinicId: string, slot: TimeSlot) => {
    if (slot.consultation) {
      setSelectedConsultation(slot.consultation);
    }
  };

  const handleDentistToggle = (dentistId: string | null, isCheckbox: boolean, clinicId?: string) => {
    if (dentistId === null) {
      // "Todos" clicked
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
    // For 3-day view, use first dentist or selected dentist
    const dentistId = selectedDentistIds.length === 1 ? selectedDentistIds[0].split('-').pop() || mockDentists[0].id : mockDentists[0].id;
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

      {/* Dentist filters are now in the sidebar - removed from here */}

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
            columns={columns}
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
