import { useState } from 'react';
import { Plus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CalendarHeader } from './CalendarHeader';
import { MonthlyCalendar } from './MonthlyCalendar';
import { ConsultationCard } from './ConsultationCard';
import { EditConsultationModal } from './EditConsultationModal';
import { BottomNavigation } from './BottomNavigation';
import { Consultation } from '@/types/calendar';
import { mockPatientConsultations, mockFamilyMembers } from '@/data/mockData';
import { format, isSameDay } from 'date-fns';
import { pt } from 'date-fns/locale';
import { useIsMobile } from '@/hooks/use-mobile';
import smileIcon from '@/assets/smilecheck-icon.png';
import { cn } from '@/lib/utils';

export function PatientCalendar() {
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 0, 31)); // Demo day
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [activeTab, setActiveTab] = useState('agenda');
  const [selectedMembers, setSelectedMembers] = useState<string[]>(['all']);
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

  const toggleMember = (memberId: string) => {
    if (memberId === 'all') {
      setSelectedMembers(['all']);
    } else {
      const newSelected = selectedMembers.includes('all')
        ? [memberId]
        : selectedMembers.includes(memberId)
          ? selectedMembers.filter(id => id !== memberId)
          : [...selectedMembers, memberId];
      
      // If all members are selected or none, revert to 'all'
      if (newSelected.length === 0 || newSelected.length === mockFamilyMembers.length) {
        setSelectedMembers(['all']);
      } else {
        setSelectedMembers(newSelected);
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
        <CalendarHeader title="Agenda" />

        <div className="py-4">
          <MonthlyCalendar
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            appointmentDates={appointmentDates}
          />
        </div>

        {/* Family Member Filter */}
        <div className="px-4 mb-4">
          <p className="text-xs font-medium text-muted-foreground mb-2">Filtrar por membro:</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => toggleMember('all')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                selectedMembers.includes('all')
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card border border-border text-muted-foreground hover:border-primary/50'
              )}
            >
              {selectedMembers.includes('all') && <Check className="w-3 h-3" />}
              Todos
            </button>
            {mockFamilyMembers.map(member => (
              <button
                key={member.id}
                onClick={() => toggleMember(member.id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                  selectedMembers.includes(member.id) && !selectedMembers.includes('all')
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card border border-border text-muted-foreground hover:border-primary/50'
                )}
              >
                {selectedMembers.includes(member.id) && !selectedMembers.includes('all') && <Check className="w-3 h-3" />}
                {member.name} ({member.relation})
              </button>
            ))}
          </div>
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