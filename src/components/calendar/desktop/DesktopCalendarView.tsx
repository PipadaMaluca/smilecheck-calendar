import { useState, useMemo } from 'react';
import { DesktopHeader } from './DesktopHeader';
import { DesktopSidebar } from './DesktopSidebar';
import { DesktopTimeline } from './DesktopTimeline';
import { DesktopConsultationDetail } from './DesktopConsultationDetail';
import { Consultation, TimeSlot } from '@/types/calendar';
import { mockConsultations, mockDentists, generateTimeSlots } from '@/data/mockData';

type ViewMode = 'list' | 'day' | 'week' | 'month';

export function DesktopCalendarView() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedDentistIds, setSelectedDentistIds] = useState<string[]>(
    mockDentists.map((d) => d.id)
  );
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);

  const appointmentDates = mockConsultations.map((c) => c.date);

  const filteredDentists = useMemo(
    () => mockDentists.filter((d) => selectedDentistIds.includes(d.id)),
    [selectedDentistIds]
  );

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

  const handleDentistToggle = (dentistId: string) => {
    setSelectedDentistIds((prev) => {
      if (prev.includes(dentistId)) {
        // Don't allow deselecting all dentists
        if (prev.length === 1) return prev;
        return prev.filter((id) => id !== dentistId);
      }
      return [...prev, dentistId];
    });
  };

  const handleSelectAllDentists = () => {
    if (selectedDentistIds.length === mockDentists.length) {
      // If all selected, select only the first one
      setSelectedDentistIds([mockDentists[0].id]);
    } else {
      // Select all
      setSelectedDentistIds(mockDentists.map((d) => d.id));
    }
  };

  const handleSlotClick = (slot: TimeSlot) => {
    if (slot.consultation) {
      setSelectedConsultation(slot.consultation);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <DesktopHeader
        currentDate={selectedDate}
        onDateChange={setSelectedDate}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <div className="flex-1 flex overflow-hidden">
        <DesktopSidebar
          isOpen={isSidebarOpen}
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          dentists={mockDentists}
          selectedDentistIds={selectedDentistIds}
          onDentistToggle={handleDentistToggle}
          onSelectAllDentists={handleSelectAllDentists}
          appointmentDates={appointmentDates}
        />

        <DesktopTimeline
          dentists={filteredDentists}
          slotsPerDentist={slotsPerDentist}
          onSlotClick={handleSlotClick}
        />
      </div>

      <DesktopConsultationDetail
        consultation={selectedConsultation}
        isOpen={!!selectedConsultation}
        onClose={() => setSelectedConsultation(null)}
      />
    </div>
  );
}
