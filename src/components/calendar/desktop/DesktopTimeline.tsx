import { useEffect, useRef, useState, useMemo } from 'react';
import { Video, Flag, AlertTriangle, Check } from 'lucide-react';
import { Consultation, Dentist, TimeSlot, CATEGORY_COLORS, CATEGORY_LABELS, ConsultationCategory } from '@/types/calendar';
import { cn } from '@/lib/utils';

interface DesktopTimelineProps {
  dentists: Dentist[];
  slotsPerDentist: Record<string, TimeSlot[]>;
  onSlotClick: (slot: TimeSlot) => void;
  selectedDate: Date;
  workingHours?: {
    start: number;
    end: number;
  };
}

// Reduced heights - half of previous
const SLOT_HEIGHT = 30; // pixels per 30 min (was 60)
const HOUR_HEIGHT = SLOT_HEIGHT * 2; // 60px per hour (was 120)

function getConsultationStyles(consultation: Consultation) {
  const category = consultation.category || 'restauracao';
  const colors = CATEGORY_COLORS[category] || CATEGORY_COLORS.restauracao;
  return {
    bgClass: colors.bg + '/90',
    textClass: colors.text,
    borderColor: colors.hex
  };
}

function getCategoryLabel(consultation: Consultation): string {
  if (consultation.category) {
    return CATEGORY_LABELS[consultation.category] || 'Consulta';
  }
  if (consultation.type === 'teleconsulta') return 'Teleconsulta';
  return 'Consulta Presencial';
}

export function DesktopTimeline({
  dentists,
  slotsPerDentist,
  onSlotClick,
  selectedDate,
  workingHours: defaultWorkingHours
}: DesktopTimelineProps) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [currentTimePosition, setCurrentTimePosition] = useState<number | null>(null);

  // Fixed hours 8h-22h (always show full range)
  const workingHours = useMemo(() => {
    return defaultWorkingHours || {
      start: 8,
      end: 22
    };
  }, [defaultWorkingHours]);

  // Generate hours array
  const hours: number[] = [];
  for (let h = workingHours.start; h <= workingHours.end; h++) {
    hours.push(h);
  }

  // Calculate current time line position
  useEffect(() => {
    const updateCurrentTime = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      if (currentHour >= workingHours.start && currentHour < workingHours.end) {
        const hoursFromStart = currentHour - workingHours.start;
        const minutesFraction = currentMinute / 60;
        const position = (hoursFromStart + minutesFraction) * HOUR_HEIGHT;
        setCurrentTimePosition(position);
      } else {
        setCurrentTimePosition(null);
      }
    };
    updateCurrentTime();
    const interval = setInterval(updateCurrentTime, 60000);
    return () => clearInterval(interval);
  }, [workingHours]);

  // Auto-scroll to current time on mount
  useEffect(() => {
    if (timelineRef.current && currentTimePosition !== null) {
      timelineRef.current.scrollTop = Math.max(0, currentTimePosition - 100);
    }
  }, []);

  const getSlotPosition = (time: string) => {
    const [hour, minute] = time.split(':').map(Number);
    const hoursFromStart = hour - workingHours.start;
    const minutesFraction = minute / 60;
    return (hoursFromStart + minutesFraction) * HOUR_HEIGHT;
  };

  const getSlotHeight = (duration: number) => {
    return (duration / 60) * HOUR_HEIGHT;
  };

  return (
    <div className="flex-1 flex flex-col bg-[#1A2F3D] overflow-hidden">
      {/* Dentist Headers */}
      <div className="flex border-b border-border bg-card/50 sticky top-0 z-10">
        <div className="w-16 flex-shrink-0 border-r border-[#1E3A5F]" />
        {dentists.map(dentist => (
          <div key={dentist.id} className="flex-1 px-3 py-2 border-l border-border first:border-l-0">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-[10px] font-bold text-primary">
                  {dentist.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </span>
              </div>
              <div>
                <p className="text-xs font-medium truncate">{dentist.name}</p>
                <p className="text-[9px] text-muted-foreground">
                  {dentist.workingHours || '9h-21h'}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Timeline Grid */}
      <div ref={timelineRef} className="flex-1 overflow-y-auto overflow-x-auto scrollbar-hide">
        <div className="relative flex" style={{ minHeight: `${hours.length * HOUR_HEIGHT}px` }}>
          {/* Hours Column */}
          <div className="w-16 flex-shrink-0 relative border-r border-[#1E3A5F]">
            {hours.map((hour, idx) => (
              <div
                key={hour}
                className="absolute left-0 right-0 flex items-start justify-end pr-2 pt-0.5"
                style={{ top: `${idx * HOUR_HEIGHT}px`, height: `${HOUR_HEIGHT}px` }}
              >
                <span className="text-[11px] font-mono text-muted-foreground">
                  {hour.toString().padStart(2, '0')}:00
                </span>
              </div>
            ))}
          </div>

          {/* Dentist Columns */}
          <div className="flex-1 flex relative">
            {/* Hour Lines */}
            <div className="absolute inset-0 pointer-events-none">
              {hours.map((hour, idx) => (
                <div
                  key={hour}
                  className="absolute left-0 right-0 border-t border-border/50"
                  style={{ top: `${idx * HOUR_HEIGHT}px` }}
                />
              ))}
              {/* Half-hour lines */}
              {hours.slice(0, -1).map((hour, idx) => (
                <div
                  key={`half-${hour}`}
                  className="absolute left-0 right-0 border-t border-border/20"
                  style={{ top: `${idx * HOUR_HEIGHT + SLOT_HEIGHT}px` }}
                />
              ))}
            </div>

            {/* Current Time Line */}
            {currentTimePosition !== null && (
              <div
                className="absolute left-0 right-0 z-20 flex items-center pointer-events-none"
                style={{ top: `${currentTimePosition}px` }}
              >
                <div className="w-2 h-2 rounded-full bg-destructive" />
                <div className="flex-1 h-0.5 bg-destructive" />
              </div>
            )}

            {/* Dentist Columns with Consultations */}
            {dentists.map((dentist, colIdx) => {
              const slots = slotsPerDentist[dentist.id] || [];
              const occupiedSlots = slots.filter(s => s.status === 'ocupado' && s.consultation);
              const blockedSlots = slots.filter(s => s.status === 'bloqueado');

              return (
                <div
                  key={dentist.id}
                  className={cn(
                    'flex-1 relative',
                    colIdx > 0 && 'border-l border-border'
                  )}
                  style={{ minHeight: `${hours.length * HOUR_HEIGHT}px` }}
                >
                  {/* Blocked Slots */}
                  {blockedSlots.map((slot, slotIdx) => (
                    <div
                      key={`blocked-${slotIdx}`}
                      className="absolute left-0.5 right-0.5 bg-[#9E9E9E]/30 rounded flex items-center justify-center border-l-2 border-l-[#9E9E9E]"
                      style={{
                        top: `${getSlotPosition(slot.time)}px`,
                        height: `${SLOT_HEIGHT - 2}px`
                      }}
                    >
                      <span className="text-[8px] font-medium text-muted-foreground">
                        {slot.blockReason}
                      </span>
                    </div>
                  ))}

                  {/* Consultation Blocks */}
                  {occupiedSlots.map(slot => {
                    const consultation = slot.consultation!;
                    const styles = getConsultationStyles(consultation);
                    const isTeleconsulta = consultation.type === 'teleconsulta';
                    const isTeleconsultaUrgente = consultation.category === 'teleconsulta_urgente';
                    const isUrgent = consultation.category === 'urgencia' || isTeleconsultaUrgente;
                    const slotHeight = getSlotHeight(consultation.duration);

                    return (
                      <div
                        key={consultation.id}
                        onClick={() => onSlotClick(slot)}
                        className={cn(
                          'absolute left-0.5 right-0.5 rounded cursor-pointer transition-all',
                          'hover:scale-[1.02] hover:shadow-lg border-l-3'
                        )}
                        style={{
                          top: `${getSlotPosition(slot.time)}px`,
                          height: `${slotHeight - 2}px`,
                          minHeight: '24px',
                          borderLeftWidth: '3px',
                          borderLeftColor: styles.borderColor,
                          backgroundColor: `${styles.borderColor}30`
                        }}
                      >
                        <div className="flex items-start justify-between gap-0.5 p-1 h-full overflow-hidden">
                          <div className="flex-1 min-w-0 overflow-hidden">
                            {/* First line: time + type */}
                            <div className="flex items-center gap-1 flex-wrap">
                              <span className="text-[8px] font-mono text-muted-foreground">
                                {slot.time}
                              </span>
                              <span 
                                className="text-[8px] font-bold truncate"
                                style={{ color: styles.borderColor }}
                              >
                                {getCategoryLabel(consultation)}
                              </span>
                              {(isTeleconsulta || isTeleconsultaUrgente) && (
                                <Video className="w-2.5 h-2.5" style={{ color: styles.borderColor }} />
                              )}
                              {isUrgent && (
                                <AlertTriangle className="w-2.5 h-2.5 text-[#F44336]" />
                              )}
                            </div>
                            {/* Second line: patient name + notes */}
                            <div className="flex items-center gap-1.5">
                              <p className="text-[9px] font-bold uppercase truncate text-white leading-tight">
                                {consultation.patient.name}
                              </p>
                              {consultation.notes && (
                                <span className="text-[8px] text-muted-foreground truncate">
                                  {consultation.notes}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Status indicator */}
                          <div className="flex-shrink-0">
                            {consultation.isPaid ? (
                              <Check className="w-2.5 h-2.5 text-primary" />
                            ) : (
                              <Flag className="w-2.5 h-2.5 text-[#FDD835]" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
