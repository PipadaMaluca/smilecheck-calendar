import { TimeSlot, CATEGORY_COLORS, CATEGORY_LABELS } from '@/types/calendar';
import { format, addDays, subDays } from 'date-fns';
import { pt } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { AlertTriangle } from 'lucide-react';

interface ThreeDayViewProps {
  selectedDate: Date;
  getSlots: (date: Date) => TimeSlot[];
  onSlotClick?: (slot: TimeSlot) => void;
}

export function ThreeDayView({ selectedDate, getSlots, onSlotClick }: ThreeDayViewProps) {
  const days = [
    subDays(selectedDate, 1),
    selectedDate,
    addDays(selectedDate, 1),
  ];

  const timeLabels: string[] = [];
  for (let hour = 8; hour < 22; hour++) {
    for (let minutes = 0; minutes < 60; minutes += 30) {
      timeLabels.push(`${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
    }
  }

  return (
    <div className="px-2 overflow-x-auto animate-slide-up">
      <div className="min-w-full">
        {/* Day Headers */}
        <div className="flex border-b border-border pb-2 mb-2 sticky top-0 bg-background z-10">
          <div className="w-12 flex-shrink-0" />
          {days.map((day, idx) => {
            const isToday = idx === 1;
            return (
              <div
                key={idx}
                className={cn(
                  'flex-1 text-center px-1',
                  isToday && 'bg-primary/10 rounded-lg py-1'
                )}
              >
                <p className={cn(
                  'text-[10px] uppercase',
                  isToday ? 'text-primary font-semibold' : 'text-muted-foreground'
                )}>
                  {format(day, 'EEE', { locale: pt })}
                </p>
                <p className={cn(
                  'text-sm font-bold',
                  isToday ? 'text-primary' : 'text-foreground'
                )}>
                  {format(day, 'd')}
                </p>
                <p className={cn(
                  'text-[9px]',
                  isToday ? 'text-primary' : 'text-muted-foreground'
                )}>
                  {format(day, 'MMM', { locale: pt })}
                </p>
              </div>
            );
          })}
        </div>

        {/* Time Grid */}
        <div className="space-y-0.5">
          {timeLabels.map((time, timeIdx) => {
            // Pre-calculate slots for each day to check for spanning consultations
            const daySlots = days.map(day => getSlots(day));
            
            return (
              <div key={time} className="flex items-stretch min-h-[36px]">
                <div className="w-12 flex-shrink-0 text-[10px] text-muted-foreground font-mono pr-1 flex items-center justify-end">
                  {time}
                </div>
                {days.map((day, dayIdx) => {
                  const slots = daySlots[dayIdx];
                  
                  // Check if this slot is covered by a previous longer consultation
                  for (let checkIdx = 1; checkIdx <= 3; checkIdx++) {
                    const prevTimeIdx = timeIdx - checkIdx;
                    if (prevTimeIdx >= 0) {
                      const prevTime = timeLabels[prevTimeIdx];
                      const prevSlot = slots.find(s => s.time === prevTime);
                      if (prevSlot?.status === 'ocupado' && prevSlot.consultation) {
                        const duration = prevSlot.consultation.duration;
                        const slotsNeeded = Math.ceil(duration / 30);
                        if (checkIdx < slotsNeeded) {
                          // This slot is part of a longer consultation - render empty
                          return (
                            <div
                              key={`${dayIdx}-${time}`}
                              className="flex-1 mx-0.5 h-[36px]"
                            />
                          );
                        }
                      }
                    }
                  }
                  
                  const slot = slots.find(s => s.time === time);
                  const isOcupado = slot?.status === 'ocupado';
                  const isBloqueado = slot?.status === 'bloqueado';
                  const consultation = slot?.consultation;
                  const category = consultation?.category || 'restauracao';
                  const colors = CATEGORY_COLORS[category];
                  const isUrgentTeleconsulta = consultation?.isUrgentTeleconsulta;
                  const isUrgent = category === 'urgencia' || isUrgentTeleconsulta;
                  const isToday = dayIdx === 1;
                  
                  // Calculate height for long consultations
                  const duration = consultation?.duration || 30;
                  const slotsCount = Math.ceil(duration / 30);
                  const blockHeight = isOcupado && duration >= 60 ? slotsCount * 36 : 36;

                  return (
                    <div
                      key={`${dayIdx}-${time}`}
                      onClick={() => isOcupado && slot && onSlotClick?.(slot)}
                      className={cn(
                        'flex-1 mx-0.5 rounded flex items-center justify-center text-[9px] transition-all',
                        !slot || slot.status === 'livre' 
                          ? isToday 
                            ? 'bg-primary/5 border border-dashed border-primary/20' 
                            : 'bg-muted/20 border border-dashed border-muted-foreground/10'
                          : '',
                        isBloqueado && 'bg-[#607D8B]/30',
                        isOcupado && 'cursor-pointer hover:opacity-80'
                      )}
                      style={{
                        height: `${blockHeight}px`,
                        ...(isOcupado ? { 
                          backgroundColor: `${colors.hex}20`, 
                          borderLeft: `2px solid ${colors.hex}` 
                        } : {})
                      }}
                    >
                      {isOcupado && consultation && (
                        <div className="flex flex-col px-0.5 overflow-hidden leading-tight">
                          {/* Line 1: First + Last Name (age anos) */}
                          <div className="flex items-center gap-0.5 truncate">
                            <span className="truncate font-bold text-[8px] text-white">
                              {(() => {
                                const nameParts = consultation.patient.name.split(' ');
                                const firstName = nameParts[0];
                                const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
                                return lastName ? `${firstName} ${lastName}` : firstName;
                              })()}
                            </span>
                            <span className="text-[7px] text-muted-foreground whitespace-nowrap">
                              ({consultation.patient.age} anos)
                            </span>
                            {isUrgent && <AlertTriangle className="w-2 h-2 text-[#F44336] flex-shrink-0" />}
                          </div>
                          {/* Line 2: TYPE (colored) */}
                          <span className="text-[7px] font-bold truncate" style={{ color: colors.hex }}>
                            {CATEGORY_LABELS[category]}
                          </span>
                        </div>
                      )}
                      {isBloqueado && <span className="text-muted-foreground/60 text-[8px]">Pausa</span>}
                      {(!slot || slot.status === 'livre') && <span className="text-muted-foreground/40">—</span>}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
