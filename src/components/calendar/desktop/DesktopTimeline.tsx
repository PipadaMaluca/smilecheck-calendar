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
const SLOT_HEIGHT = 60; // pixels per 30 min
const HOUR_HEIGHT = SLOT_HEIGHT * 2; // 120px per hour

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

  // Calculate working hours based on the date (Jan 31 has extended hours)
  const workingHours = useMemo(() => {
    const isJan31 = selectedDate.getDate() === 31 && selectedDate.getMonth() === 0;
    return defaultWorkingHours || {
      start: 9,
      end: isJan31 ? 22 : 19
    };
  }, [selectedDate, defaultWorkingHours]);

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
      timelineRef.current.scrollTop = Math.max(0, currentTimePosition - 200);
    }
  }, []);
  const getSlotPosition = (time: string) => {
    const [hour, minute] = time.split(':').map(Number);
    const hoursFromStart = hour - workingHours.start;
    const minutesFraction = minute / 60;
    return (hoursFromStart + minutesFraction) * HOUR_HEIGHT;
  };
  const getSlotHeight = (duration: number) => {
    return duration / 60 * HOUR_HEIGHT;
  };
  return <div className="flex-1 flex flex-col bg-background overflow-hidden">
      {/* Dentist Headers */}
      <div className="flex border-b border-border bg-card/50 sticky top-0 z-10">
        <div className="w-16 flex-shrink-0" />
        {dentists.map(dentist => <div key={dentist.id} className="flex-1 px-4 py-3 border-l border-border first:border-l-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">
                  {dentist.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium truncate">{dentist.name}</p>
                <p className="text-[10px] text-muted-foreground">
                  {workingHours.start}h-{workingHours.end}h
                </p>
              </div>
            </div>
          </div>)}
      </div>

      {/* Timeline Grid */}
      <div ref={timelineRef} className="flex-1 overflow-y-auto overflow-x-auto scrollbar-hide">
        <div className="relative" style={{
        height: `${hours.length * HOUR_HEIGHT}px`
      }}>
          {/* Hour Lines */}
          {hours.map((hour, idx) => <div key={hour} className="absolute left-0 right-0 flex items-start" style={{
          top: `${idx * HOUR_HEIGHT}px`
        }}>
              <div className="w-16 flex-shrink-0 pr-2 text-right">
                <span className="text-xs font-mono text-muted-foreground">
                  {hour.toString().padStart(2, '0')}:00
                </span>
              </div>
              <div className="flex-1 border-t border-border/50" />
            </div>)}

          {/* Half-hour lines */}
          {hours.slice(0, -1).map((hour, idx) => <div key={`half-${hour}`} className="absolute left-16 right-0 border-t border-border/20" style={{
          top: `${idx * HOUR_HEIGHT + SLOT_HEIGHT}px`
        }} />)}

          {/* Current Time Line */}
          {currentTimePosition !== null && <div className="absolute left-14 right-0 z-20 flex items-center pointer-events-none" style={{
          top: `${currentTimePosition}px`
        }}>
              <div className="w-3 h-3 rounded-full bg-destructive" />
              <div className="flex-1 h-0.5 bg-destructive" />
            </div>}

          {/* Dentist Columns */}
          <div className="absolute top-0 left-16 right-0 flex h-full">
            {dentists.map((dentist, colIdx) => {
            const slots = slotsPerDentist[dentist.id] || [];
            const occupiedSlots = slots.filter(s => s.status === 'ocupado' && s.consultation);
            const blockedSlots = slots.filter(s => s.status === 'bloqueado');
            return <div key={dentist.id} className={cn("flex-1 relative border-l border-border border", colIdx === 0 && 'border-l-0')}>
                  {/* Blocked Slots */}
                  {blockedSlots.map((slot, slotIdx) => <div key={`blocked-${slotIdx}`} className="absolute left-1 right-1 bg-[#9E9E9E]/30 rounded flex items-center justify-center border-l-4 border-l-[#9E9E9E]" style={{
                top: `${getSlotPosition(slot.time)}px`,
                height: `${SLOT_HEIGHT}px`
              }}>
                      <span className="text-[10px] font-medium text-muted-foreground">
                        {slot.blockReason}
                      </span>
                    </div>)}

                  {/* Consultation Blocks */}
                  {occupiedSlots.map(slot => {
                const consultation = slot.consultation!;
                const styles = getConsultationStyles(consultation);
                const isTeleconsulta = consultation.type === 'teleconsulta';
                const isTeleconsultaUrgente = consultation.category === 'teleconsulta_urgente';
                const isUrgent = consultation.category === 'urgencia' || isTeleconsultaUrgente;
                return <div key={consultation.id} onClick={() => onSlotClick(slot)} className={cn('absolute left-1 right-1 rounded-md p-2 cursor-pointer transition-all', 'hover:scale-[1.02] hover:shadow-lg border-l-4', styles.bgClass)} style={{
                  top: `${getSlotPosition(slot.time)}px`,
                  height: `${getSlotHeight(consultation.duration)}px`,
                  minHeight: '50px',
                  borderLeftColor: styles.borderColor,
                  backgroundColor: `${styles.borderColor}30`
                }}>
                        <div className="flex items-start justify-between gap-1">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-mono text-muted-foreground">
                                {slot.time}
                              </span>
                              {(isTeleconsulta || isTeleconsultaUrgente) && <Video className="w-3 h-3" style={{
                          color: styles.borderColor
                        }} />}
                              {isUrgent && <AlertTriangle className="w-3 h-3 text-[#F44336]" />}
                            </div>
                            <p className="text-xs font-bold uppercase truncate mt-0.5 text-white">
                              {consultation.patient.name}
                            </p>
                            <p className="text-[10px] truncate" style={{
                        color: styles.borderColor
                      }}>
                              {getCategoryLabel(consultation)}
                            </p>
                          </div>

                          {/* Status indicator */}
                          <div className="flex-shrink-0">
                            {consultation.isPaid ? <Check className="w-3 h-3 text-primary" /> : <Flag className="w-3 h-3 text-[#FDD835]" />}
                          </div>
                        </div>
                      </div>;
              })}
                </div>;
          })}
          </div>
        </div>
      </div>
    </div>;
}