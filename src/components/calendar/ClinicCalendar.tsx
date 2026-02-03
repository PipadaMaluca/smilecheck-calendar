import { useState, useMemo, useEffect } from 'react';
import { DateNavigator } from './DateNavigator';
import { MultiDentistGrid, DentistColumn } from './MultiDentistGrid';
import { TimeSlotView } from './TimeSlotView';
import { CategoryLegend } from './CategoryLegend';
import { DynamicDaySummary } from './DynamicDaySummary';
import { EditConsultationModal } from './EditConsultationModal';
import { BottomNavigation } from './BottomNavigation';
import { MobileHeader } from './mobile/MobileHeader';
import { MobileSidebar } from './mobile/MobileSidebar';
import { ThreeDayView } from './mobile/ThreeDayView';
import { Consultation, TimeSlot, ViewMode, Dentist, Clinic } from '@/types/calendar';
import { mockConsultations, mockClinics, mockDentists, generateTimeSlots, getDentistsForClinic, dentistWorksOnDemo } from '@/data/mockData';
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

  // Build columns based on selected clinics and dentists
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

  // Day consultations for summary
  const allDayConsultations = mockConsultations.filter(
    (c) => c.date.toDateString() === selectedDate.toDateString()
  );

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

  // Handler that respects view mode restrictions
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
  };

  return (
    <div className="min-h-screen bg-background pb-24 overflow-x-hidden">
      {/* Mobile Header with View Mode Selector */}
      <MobileHeader 
        onMenuClick={() => setSidebarOpen(true)}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        userRole="clinic"
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
            showFullName
          />
        )}
      </div>

      {/* Dynamic Day Summary - ONLY show in Day and List views */}
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
