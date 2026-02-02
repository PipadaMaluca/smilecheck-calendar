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

// FIXED: Slot height is constant and immutable (35px mobile)
const SLOT_HEIGHT = 35; // Fixed height per 30-min slot

// Convert time string to slot index (0-based, where 08:00 = 0)
function timeToSlotIndex(time: string): number {
  const [hour, minute] = time.split(':').map(Number);
  const hoursFromStart = hour - 8; // Start at 08:00
  const halfHours = Math.floor(minute / 30);
  return hoursFromStart * 2 + halfHours;
}

export function ThreeDayView({ selectedDate, getSlots, onSlotClick }: ThreeDayViewProps) {
  const days = [
    subDays(selectedDate, 1),
    selectedDate,
    addDays(selectedDate, 1),
  ];

  // Generate time slot labels (08:00 to 21:30 = 28 slots)
  const timeSlots: string[] = [];
  for (let hour = 8; hour < 22; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    timeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
  }
  
  const totalSlots = timeSlots.length;

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
                  'text-[10px]',
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

        {/* Time Grid with CSS Grid for fixed slot heights */}
        <div className="flex" style={{ minHeight: `${totalSlots * SLOT_HEIGHT}px` }}>
          {/* Time Column */}
          <div 
            className="w-12 flex-shrink-0"
            style={{
              display: 'grid',
              gridTemplateRows: `repeat(${totalSlots}, ${SLOT_HEIGHT}px)`,
            }}
          >
            {timeSlots.map((time) => (
              <div 
                key={time} 
                className="flex items-center justify-end pr-1 text-[10px] text-muted-foreground font-mono"
              >
                {time}
              </div>
            ))}
          </div>

          {/* Day Columns */}
          {days.map((day, dayIdx) => {
            const slots = getSlots(day);
            const isToday = dayIdx === 1;
            
            // Build slot occupancy map for this day
            const primarySlots: { slot: TimeSlot; startIdx: number; spanCount: number }[] = [];
            const occupiedIndices = new Set<number>();
            
            slots.forEach(slot => {
              if (slot.status === 'ocupado' && slot.consultation) {
                const startIdx = timeToSlotIndex(slot.time);
                const duration = slot.consultation.duration || 30;
                const spanCount = Math.ceil(duration / 30);
                
                if (!occupiedIndices.has(startIdx)) {
                  primarySlots.push({ slot, startIdx, spanCount });
                  for (let i = 0; i < spanCount; i++) {
                    occupiedIndices.add(startIdx + i);
                  }
                }
              } else if (slot.status === 'bloqueado') {
                const startIdx = timeToSlotIndex(slot.time);
                if (!occupiedIndices.has(startIdx)) {
                  primarySlots.push({ slot, startIdx, spanCount: 1 });
                  occupiedIndices.add(startIdx);
                }
              }
            });

            return (
              <div
                key={dayIdx}
                className="flex-1 mx-0.5 relative"
                style={{
                  display: 'grid',
                  gridTemplateRows: `repeat(${totalSlots}, ${SLOT_HEIGHT}px)`,
                }}
              >
                {/* Empty slot backgrounds */}
                {timeSlots.map((time, slotIdx) => {
                  if (occupiedIndices.has(slotIdx)) return null;
                  
                  return (
                    <div
                      key={time}
                      className={cn(
                        'rounded flex items-center justify-center',
                        isToday 
                          ? 'bg-primary/5 border border-dashed border-primary/20' 
                          : 'bg-muted/20 border border-dashed border-muted-foreground/10'
                      )}
                      style={{ gridRow: `${slotIdx + 1} / span 1` }}
                    >
                      <span className="text-muted-foreground/40">—</span>
                    </div>
                  );
                })}
                
                {/* Consultation blocks using grid-row span */}
                {primarySlots.map(({ slot, startIdx, spanCount }) => {
                  const isBlocked = slot.status === 'bloqueado';
                  const consultation = slot.consultation;
                  
                  if (isBlocked) {
                    return (
                      <div
                        key={`blocked-${slot.time}`}
                        className="bg-[#607D8B]/30 rounded flex items-center justify-center"
                        style={{ gridRow: `${startIdx + 1} / span 1` }}
                      >
                        <span className="text-muted-foreground/60 text-[8px]">Pausa</span>
                      </div>
                    );
                  }
                  
                  if (!consultation) return null;
                  
                  const category = consultation.category || 'restauracao';
                  const colors = CATEGORY_COLORS[category];
                  const isUrgentTeleconsulta = consultation.isUrgentTeleconsulta;
                  const isUrgent = category === 'urgencia' || isUrgentTeleconsulta;
                  
                  // First name + last name
                  const nameParts = consultation.patient.name.split(' ');
                  const firstName = nameParts[0];
                  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
                  const displayName = lastName ? `${firstName} ${lastName}` : firstName;

                  return (
                    <div
                      key={consultation.id}
                      onClick={() => onSlotClick?.(slot)}
                      className="rounded cursor-pointer hover:opacity-80 transition-all overflow-hidden px-0.5"
                      style={{
                        gridRow: `${startIdx + 1} / span ${spanCount}`,
                        backgroundColor: `${colors.hex}20`,
                        borderLeft: `2px solid ${colors.hex}`,
                      }}
                    >
                      <div className="flex flex-col leading-tight py-0.5">
                        {/* Line 1: First + Last Name (age anos) */}
                        <div className="flex items-center gap-0.5 truncate">
                          <span className="truncate font-bold text-[8px] text-white">
                            {displayName}
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
