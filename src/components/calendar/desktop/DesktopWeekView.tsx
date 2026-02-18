import { useMemo, useState } from 'react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Consultation, TimeSlot, CATEGORY_COLORS, CATEGORY_LABELS, ConsultationStatus } from '@/types/calendar';
import { mockConsultations, generateTimeSlots } from '@/data/mockData';
import { ConsultationContextMenu } from '../ConsultationContextMenu';
import { cn } from '@/lib/utils';

interface DesktopWeekViewProps {
  selectedDate: Date;
  selectedDentistKey: string;
  onSlotClick: (slot: TimeSlot) => void;
  onDateChange: (date: Date) => void;
  onViewModeChange: (mode: 'day') => void;
  onStatusChange?: (consultation: Consultation, status: ConsultationStatus) => void;
  onCopy?: (consultation: Consultation) => void;
}

const SLOT_HEIGHT = 40;
const HOURS = Array.from({ length: 14 }, (_, i) => i + 8);
const TOTAL_SLOTS = 28;

export function DesktopWeekView({
  selectedDate,
  selectedDentistKey,
  onSlotClick,
  onDateChange,
  onViewModeChange,
  onStatusChange,
  onCopy,
}: DesktopWeekViewProps) {
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 6 }, (_, i) => addDays(weekStart, i));

  const [contextMenu, setContextMenu] = useState<{ consultation: Consultation; position: { x: number; y: number } } | null>(null);

  const [clinicId, dentistId] = useMemo(() => {
    const parts = selectedDentistKey.split('-');
    return [parts[0], parts.slice(1).join('-') || parts[0]];
  }, [selectedDentistKey]);

  const weekSlots = useMemo(() => {
    const result: Record<string, TimeSlot[]> = {};
    weekDays.forEach(day => {
      const dayKey = format(day, 'yyyy-MM-dd');
      const dayConsultations = mockConsultations.filter(
        c => isSameDay(c.date, day) && c.dentist.id === dentistId && c.clinic.id === clinicId
      );
      result[dayKey] = generateTimeSlots(day, dayConsultations);
    });
    return result;
  }, [selectedDate, selectedDentistKey]);

  const today = new Date();

  const handleDayClick = (day: Date) => {
    onDateChange(day);
    onViewModeChange('day');
  };

  const handleContextMenu = (e: React.MouseEvent, consultation: Consultation) => {
    e.preventDefault();
    setContextMenu({ consultation, position: { x: e.clientX, y: e.clientY } });
  };

  return (
    <div className="flex-1 overflow-auto" onClick={() => setContextMenu(null)}>
      <div className="min-w-[700px]">
        {/* Day headers */}
        <div className="flex border-b border-border sticky top-0 bg-card/95 backdrop-blur z-10">
          <div className="w-16 flex-shrink-0" />
          {weekDays.map(day => {
            const isToday = isSameDay(day, today);
            const isSelected = isSameDay(day, selectedDate);
            return (
              <div
                key={day.toISOString()}
                className={cn(
                  'flex-1 text-center py-2 border-l border-border cursor-pointer hover:bg-secondary/30 transition-colors',
                  isToday && 'bg-primary/10',
                  isSelected && 'bg-primary/5'
                )}
                onClick={() => handleDayClick(day)}
              >
                <div className="text-[10px] text-muted-foreground uppercase">
                  {format(day, 'EEE', { locale: pt })}
                </div>
                <div className={cn(
                  'text-sm font-semibold',
                  isToday && 'text-primary'
                )}>
                  {format(day, 'd')}
                </div>
              </div>
            );
          })}
        </div>

        {/* Time grid */}
        <div className="relative flex">
          {/* Time labels */}
          <div className="w-16 flex-shrink-0">
            {HOURS.map(hour => (
              <div key={hour} className="flex items-start justify-end pr-2" style={{ height: SLOT_HEIGHT * 2 }}>
                <span className="text-[10px] text-muted-foreground -mt-1.5">
                  {String(hour).padStart(2, '0')}:00
                </span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {weekDays.map(day => {
            const dayKey = format(day, 'yyyy-MM-dd');
            const slots = weekSlots[dayKey] || [];
            const isToday = isSameDay(day, today);

            return (
              <div
                key={dayKey}
                className={cn(
                  'flex-1 relative border-l border-border',
                  isToday && 'bg-primary/5'
                )}
                style={{ height: TOTAL_SLOTS * SLOT_HEIGHT }}
              >
                {/* Grid lines */}
                {HOURS.map(hour => (
                  <div
                    key={hour}
                    className="absolute w-full border-t border-border/30"
                    style={{ top: (hour - 8) * 2 * SLOT_HEIGHT }}
                  />
                ))}

                {/* Consultation blocks */}
                {slots.map((slot) => {
                  if (!slot.consultation) return null;
                  const c = slot.consultation;
                  const [h, m] = slot.time.split(':').map(Number);
                  const slotIndex = (h - 8) * 2 + (m >= 30 ? 1 : 0);
                  const spanSlots = Math.ceil(c.duration / 30);
                  const category = c.category || 'restauracao';
                  const colors = CATEGORY_COLORS[category] || CATEGORY_COLORS.restauracao;

                  return (
                    <div
                      key={c.id}
                      className={cn(
                        'absolute left-0.5 right-0.5 rounded cursor-pointer overflow-hidden transition-opacity hover:opacity-90',
                        colors.bg, colors.text
                      )}
                      style={{
                        top: slotIndex * SLOT_HEIGHT + 1,
                        height: spanSlots * SLOT_HEIGHT - 2,
                      }}
                      onClick={() => onSlotClick(slot)}
                      onContextMenu={(e) => handleContextMenu(e, c)}
                    >
                      <div className="px-1.5 py-0.5 text-[10px] leading-tight truncate">
                        <div className="font-semibold truncate">{c.time} {c.patient.name.split(' ')[0]}</div>
                        {spanSlots > 1 && (
                          <div className="truncate opacity-80">{CATEGORY_LABELS[category]}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <ConsultationContextMenu
          consultation={contextMenu.consultation}
          position={contextMenu.position}
          onClose={() => setContextMenu(null)}
          onStatusChange={(c, s) => { onStatusChange?.(c, s); setContextMenu(null); }}
          onCopy={(c) => { onCopy?.(c); setContextMenu(null); }}
          onViewProfile={() => setContextMenu(null)}
          onSendMessage={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}
