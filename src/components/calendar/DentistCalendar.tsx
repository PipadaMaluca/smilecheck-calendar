import { useState } from 'react';
import { Plus, PauseCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CalendarHeader } from './CalendarHeader';
import { DateNavigator } from './DateNavigator';
import { TimeSlotView } from './TimeSlotView';
import { CategoryLegend } from './CategoryLegend';
import { DaySummary } from './DaySummary';
import { EditConsultationModal } from './EditConsultationModal';
import { BottomNavigation } from './BottomNavigation';
import { Consultation, TimeSlot } from '@/types/calendar';
import { mockConsultations, mockClinics, mockDentists, generateTimeSlots } from '@/data/mockData';
import { useIsMobile } from '@/hooks/use-mobile';
import smileIcon from '@/assets/smilecheck-icon.png';

export function DentistCalendar() {
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 0, 31));
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day');
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [activeTab, setActiveTab] = useState('agenda');
  const isMobile = useIsMobile();

  // Filter only Dr. Gonçalo Pipo's consultations
  const myConsultations = mockConsultations.filter(c => c.dentist.id === mockDentists[0].id);
  const slots = generateTimeSlots(selectedDate, myConsultations);
  const dayConsultations = myConsultations.filter(
    (c) => c.date.toDateString() === selectedDate.toDateString()
  );

  const summary = {
    totalConsultations: dayConsultations.length,
    teleconsultas: dayConsultations.filter((c) => c.type === 'teleconsulta').length,
    presenciais: dayConsultations.filter((c) => c.type === 'presencial').length,
    vagasLivres: slots.filter((s) => s.status === 'livre').length,
    totalRevenue: dayConsultations
      .filter((c) => c.type === 'teleconsulta' && c.isPaid)
      .reduce((sum, c) => sum + c.price, 0),
  };

  const handleSlotClick = (slot: TimeSlot) => {
    if (slot.consultation) {
      setSelectedConsultation(slot.consultation);
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
        <CalendarHeader
          title="Agenda"
          showClinicSelector
          selectedClinic={mockClinics[0]}
        />

        <DateNavigator
          date={selectedDate}
          onDateChange={setSelectedDate}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          showViewToggle
        />

        {/* Category Legend */}
        <CategoryLegend compact className="mx-4 mb-4 rounded-lg" />

        <TimeSlotView slots={slots} onSlotClick={handleSlotClick} />

        <div className="mt-6">
          <DaySummary summary={summary} />
        </div>

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