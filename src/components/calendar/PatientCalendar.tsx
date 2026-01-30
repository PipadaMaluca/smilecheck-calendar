import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CalendarHeader } from './CalendarHeader';
import { MonthlyCalendar } from './MonthlyCalendar';
import { ConsultationCard } from './ConsultationCard';
import { EditConsultationModal } from './EditConsultationModal';
import { BottomNavigation } from './BottomNavigation';
import { Consultation } from '@/types/calendar';
import { mockConsultations } from '@/data/mockData';
import { format, isSameDay } from 'date-fns';
import { pt } from 'date-fns/locale';
import { useIsMobile } from '@/hooks/use-mobile';
import smileIcon from '@/assets/smilecheck-icon.png';

export function PatientCalendar() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [activeTab, setActiveTab] = useState('agenda');
  const isMobile = useIsMobile();

  const appointmentDates = mockConsultations.map((c) => c.date);
  const dayConsultations = mockConsultations.filter((c) =>
    isSameDay(c.date, selectedDate)
  );

  return (
    <div className="min-h-screen bg-background pb-20 relative">
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
        <CalendarHeader title="Agenda" />

        <div className="py-4">
          <MonthlyCalendar
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            appointmentDates={appointmentDates}
          />
        </div>

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
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-2">Sem consultas para este dia</p>
              <p className="text-xs text-muted-foreground/60">Toque em + para agendar uma nova consulta</p>
            </div>
          )}
        </div>

        {/* Floating Button */}
        <Button className="floating-button animate-pulse-glow">
          <Plus className="w-6 h-6" />
        </Button>

        {/* Bottom Navigation */}
        <BottomNavigation
          userRole="patient"
          activeTab={activeTab}
          onTabChange={setActiveTab}
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