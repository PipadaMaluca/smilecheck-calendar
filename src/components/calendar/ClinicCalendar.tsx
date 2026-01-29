import { useState, useMemo } from 'react';
import { CalendarHeader } from './CalendarHeader';
import { DateNavigator } from './DateNavigator';
import { DentistFilter } from './DentistFilter';
import { MultiDentistGrid } from './MultiDentistGrid';
import { DaySummary } from './DaySummary';
import { EditConsultationModal } from './EditConsultationModal';
import { BottomNavigation } from './BottomNavigation';
import { Consultation, TimeSlot, Dentist } from '@/types/calendar';
import { mockConsultations, mockClinics, mockDentists, generateTimeSlots } from '@/data/mockData';
import { useIsMobile } from '@/hooks/use-mobile';

export function ClinicCalendar() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDentistId, setSelectedDentistId] = useState<string | null>(null);
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [activeTab, setActiveTab] = useState('agenda');
  const isMobile = useIsMobile();

  const filteredDentists = selectedDentistId
    ? mockDentists.filter((d) => d.id === selectedDentistId)
    : mockDentists;

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

  return (
    <div className="min-h-screen bg-background pb-20">
      <CalendarHeader
        title="Agenda da Clínica"
        showClinicSelector
        selectedClinic={mockClinics[0]}
      />

      <DateNavigator
        date={selectedDate}
        onDateChange={setSelectedDate}
      />

      <DentistFilter
        dentists={mockDentists}
        selectedDentistId={selectedDentistId}
        onSelect={setSelectedDentistId}
      />

      <div className="mt-4">
        <MultiDentistGrid
          dentists={filteredDentists}
          slotsPerDentist={slotsPerDentist}
          onSlotClick={handleSlotClick}
        />
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

      <BottomNavigation
        userRole="clinic"
        activeTab={activeTab}
        onTabChange={setActiveTab}
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