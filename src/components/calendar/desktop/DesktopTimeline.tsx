import { useEffect, useRef, useState } from 'react';
import { Video, MapPin, Flag, Clock, AlertTriangle, Baby, Check } from 'lucide-react';
import { Consultation, ConsultationCategory, Dentist, TimeSlot } from '@/types/calendar';
import { cn } from '@/lib/utils';

interface DesktopTimelineProps {
  dentists: Dentist[];
  slotsPerDentist: Record<string, TimeSlot[]>;
  onSlotClick: (slot: TimeSlot) => void;
  workingHours?: { start: number; end: number };
}

const SLOT_HEIGHT = 60; // pixels per 30 min
const HOUR_HEIGHT = SLOT_HEIGHT * 2; // 120px per hour

// Consultation type colors - matching the new palette
const CONSULTATION_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  restauracao: { 
    bg: 'bg-[hsl(207,90%,54%)]/20', 
    border: 'border-l-[hsl(207,90%,54%)]', 
    text: 'text-[hsl(207,90%,54%)]' 
  },
  primeira_consulta: { 
    bg: 'bg-[hsl(49,98%,60%)]/20', 
    border: 'border-l-[hsl(49,98%,60%)]', 
    text: 'text-[hsl(49,98%,60%)]' 
  },
  protese: { 
    bg: 'bg-[hsl(122,39%,49%)]/20', 
    border: 'border-l-[hsl(122,39%,49%)]', 
    text: 'text-[hsl(122,39%,49%)]' 
  },
  urgencia: { 
    bg: 'bg-[hsl(4,90%,58%)]/20', 
    border: 'border-l-[hsl(4,90%,58%)]', 
    text: 'text-[hsl(4,90%,58%)]' 
  },
  teleconsulta: { 
    bg: 'bg-[hsl(36,100%,50%)]/20', 
    border: 'border-l-[hsl(36,100%,50%)]', 
    text: 'text-[hsl(36,100%,50%)]' 
  },
  bloqueado: { 
    bg: 'bg-[hsl(0,0%,62%)]/30', 
    border: 'border-l-[hsl(0,0%,62%)]', 
    text: 'text-[hsl(0,0%,62%)]' 
  },
  default: { 
    bg: 'bg-[hsl(207,90%,54%)]/20', 
    border: 'border-l-[hsl(207,90%,54%)]', 
    text: 'text-[hsl(207,90%,54%)]' 
  },
};

function getConsultationColor(consultation: Consultation) {
  // Check for category first
  if (consultation.category && CONSULTATION_COLORS[consultation.category]) {
    return CONSULTATION_COLORS[consultation.category];
  }
  
  // Then check type
  if (consultation.type === 'teleconsulta') {
    return CONSULTATION_COLORS.teleconsulta;
  }
  
  // Check for urgency in triage
  if (consultation.triage?.urgency === 'urgente') {
    return CONSULTATION_COLORS.urgencia;
  }
  
  // Default to normal consultation color
  return CONSULTATION_COLORS.default;
}

function getCategoryLabel(consultation: Consultation): string {
  if (consultation.type === 'teleconsulta') return 'Teleconsulta';
  
  switch (consultation.category) {
    case 'restauracao': return 'Restauração';
    case 'primeira_consulta': return 'Primeira Consulta';
    case 'protese': return 'Prótese';
    case 'urgencia': return 'Urgência';
    case 'outro': return 'Consulta';
    default: return 'Consulta Presencial';
  }
}

export function DesktopTimeline({
  dentists,
  slotsPerDentist,
  onSlotClick,
  workingHours = { start: 9, end: 19 },
}: DesktopTimelineProps) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [currentTimePosition, setCurrentTimePosition] = useState<number | null>(null);

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
    const interval = setInterval(updateCurrentTime, 60000); // Update every minute

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
    return (duration / 60) * HOUR_HEIGHT;
  };

  return (
    <div className="flex-1 flex flex-col bg-background overflow-hidden">
      {/* Dentist Headers */}
      <div className="flex border-b border-border bg-card/50 sticky top-0 z-10">
        <div className="w-16 flex-shrink-0" /> {/* Time column spacer */}
        {dentists.map((dentist) => (
          <div
            key={dentist.id}
            className="flex-1 px-4 py-3 border-l border-border first:border-l-0"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">
                  {dentist.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium truncate">{dentist.name}</p>
                <p className="text-[10px] text-muted-foreground">
                  {workingHours.start}h-{workingHours.end}h
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Timeline Grid */}
      <div ref={timelineRef} className="flex-1 overflow-y-auto overflow-x-auto scrollbar-hide">
        <div className="relative" style={{ height: `${hours.length * HOUR_HEIGHT}px` }}>
          {/* Hour Lines */}
          {hours.map((hour, idx) => (
            <div
              key={hour}
              className="absolute left-0 right-0 flex items-start"
              style={{ top: `${idx * HOUR_HEIGHT}px` }}
            >
              <div className="w-16 flex-shrink-0 pr-2 text-right">
                <span className="text-xs font-mono text-muted-foreground">
                  {hour.toString().padStart(2, '0')}:00
                </span>
              </div>
              <div className="flex-1 border-t border-border/50" />
            </div>
          ))}

          {/* Half-hour lines */}
          {hours.slice(0, -1).map((hour, idx) => (
            <div
              key={`half-${hour}`}
              className="absolute left-16 right-0 border-t border-border/20"
              style={{ top: `${idx * HOUR_HEIGHT + SLOT_HEIGHT}px` }}
            />
          ))}

          {/* Current Time Line */}
          {currentTimePosition !== null && (
            <div
              className="absolute left-14 right-0 z-20 flex items-center pointer-events-none"
              style={{ top: `${currentTimePosition}px` }}
            >
              <div className="w-3 h-3 rounded-full bg-destructive" />
              <div className="flex-1 h-0.5 bg-destructive" />
            </div>
          )}

          {/* Dentist Columns */}
          <div className="absolute top-0 left-16 right-0 flex h-full">
            {dentists.map((dentist, colIdx) => {
              const slots = slotsPerDentist[dentist.id] || [];
              const occupiedSlots = slots.filter((s) => s.status === 'ocupado' && s.consultation);
              const blockedSlots = slots.filter((s) => s.status === 'bloqueado');

              return (
                <div
                  key={dentist.id}
                  className={cn(
                    'flex-1 relative border-l border-border/30',
                    colIdx === 0 && 'border-l-0'
                  )}
                >
                  {/* Blocked Slots */}
                  {blockedSlots.map((slot, slotIdx) => (
                    <div
                      key={`blocked-${slotIdx}`}
                      className="absolute left-1 right-1 bg-bloqueado/30 rounded flex items-center justify-center border-l-4 border-l-bloqueado"
                      style={{
                        top: `${getSlotPosition(slot.time)}px`,
                        height: `${SLOT_HEIGHT}px`,
                      }}
                    >
                      <span className="text-[10px] font-medium text-muted-foreground">
                        {slot.blockReason}
                      </span>
                    </div>
                  ))}

                  {/* Consultation Blocks */}
                  {occupiedSlots.map((slot) => {
                    const consultation = slot.consultation!;
                    const colors = getConsultationColor(consultation);
                    const isTeleconsulta = consultation.type === 'teleconsulta';
                    const isUrgent = consultation.triage?.urgency === 'urgente';

                    return (
                      <div
                        key={consultation.id}
                        onClick={() => onSlotClick(slot)}
                        className={cn(
                          'absolute left-1 right-1 rounded-md p-2 cursor-pointer transition-all',
                          'hover:scale-[1.02] hover:shadow-lg border-l-4',
                          colors.bg,
                          colors.border
                        )}
                        style={{
                          top: `${getSlotPosition(slot.time)}px`,
                          height: `${getSlotHeight(consultation.duration)}px`,
                          minHeight: '50px',
                        }}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-mono text-muted-foreground">
                                {slot.time}
                              </span>
                              {isTeleconsulta && (
                                <Video className={cn("w-3 h-3", colors.text)} />
                              )}
                              {isUrgent && (
                                <AlertTriangle className="w-3 h-3 text-urgencia" />
                              )}
                            </div>
                            <p className="text-xs font-bold uppercase truncate mt-0.5">
                              {consultation.patient.name}
                            </p>
                            <p className={cn("text-[10px] truncate", colors.text)}>
                              {getCategoryLabel(consultation)}
                            </p>
                          </div>

                          {/* Status indicator */}
                          <div className="flex-shrink-0">
                            {consultation.isPaid ? (
                              <Check className="w-3 h-3 text-primary" />
                            ) : (
                              <Flag className="w-3 h-3 text-primeira-consulta" />
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