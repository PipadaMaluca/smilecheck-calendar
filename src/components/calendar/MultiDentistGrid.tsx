import { Dentist, Clinic, TimeSlot, CATEGORY_COLORS, CATEGORY_LABELS } from '@/types/calendar';
import { cn } from '@/lib/utils';
import { Video, AlertTriangle, Ban } from 'lucide-react';

export interface DentistColumn {
  dentist: Dentist;
  clinic: Clinic;
  worksToday: boolean;
  slots: TimeSlot[];
}

interface MultiDentistGridProps {
  columns: DentistColumn[];
  onSlotClick?: (dentistId: string, clinicId: string, slot: TimeSlot) => void;
  showFullName?: boolean;
}

// FIXED: Slot height is constant and immutable
const SLOT_HEIGHT = 40; // Fixed height per 30-min slot

// Convert time string to slot index (0-based, where 08:00 = 0)
function timeToSlotIndex(time: string): number {
  const [hour, minute] = time.split(':').map(Number);
  const hoursFromStart = hour - 8; // Start at 08:00
  const halfHours = Math.floor(minute / 30);
  return hoursFromStart * 2 + halfHours;
}

export function MultiDentistGrid({
  columns,
  onSlotClick,
  showFullName = false
}: MultiDentistGridProps) {
  // Generate time slot labels (08:00 to 21:30 = 28 slots)
  const timeSlots: string[] = [];
  for (let hour = 8; hour < 22; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    timeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
  }
  
  const totalSlots = timeSlots.length;
  
  return (
    <div className="px-4 overflow-x-auto animate-slide-up">
      <div className="relative">
        {/* Scroll indicator */}
        {columns.length > 3 && (
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />
        )}
        
        <div style={{ minWidth: `${Math.max(600, columns.length * 200)}px` }}>
          {/* Dentist Headers */}
          <div className="flex border-b border-border pb-2 mb-2 sticky top-0 bg-background z-20">
            <div className="w-16 flex-shrink-0" />
            {columns.map((col, idx) => (
              <div 
                key={`${col.clinic.id}-${col.dentist.id}-${idx}`} 
                className="flex-1 text-center px-2 min-w-[180px]"
              >
                <p className="text-xs font-semibold truncate">{col.dentist.name}</p>
                <p className="text-[9px] text-muted-foreground truncate">{col.clinic.name}</p>
                <p className="text-[9px] text-muted-foreground">{col.dentist.workingHours || '9h-21h'}</p>
              </div>
            ))}
          </div>

          {/* Time Grid with CSS Grid for fixed slot heights */}
          <div className="flex" style={{ minHeight: `${totalSlots * SLOT_HEIGHT}px` }}>
            {/* Time Column */}
            <div 
              className="w-16 flex-shrink-0"
              style={{
                display: 'grid',
                gridTemplateRows: `repeat(${totalSlots}, ${SLOT_HEIGHT}px)`,
              }}
            >
              {timeSlots.map((time) => (
                <div 
                  key={time} 
                  className="flex items-center justify-end pr-2 text-xs text-muted-foreground font-mono"
                >
                  {time}
                </div>
              ))}
            </div>

            {/* Dentist Columns */}
            {columns.map((col, idx) => {
              // If dentist doesn't work today, show grayed out column
              if (!col.worksToday) {
                return (
                  <div
                    key={`${col.clinic.id}-${col.dentist.id}-${idx}`}
                    className="flex-1 min-w-[180px] mx-0.5 bg-[#2A3A4A] rounded-lg flex items-center justify-center"
                    style={{ minHeight: `${totalSlots * SLOT_HEIGHT}px` }}
                  >
                    <div className="text-center px-2">
                      <Ban className="w-5 h-5 mx-auto mb-1 text-[#8B9CB6]" />
                      <p className="text-[10px] text-[#8B9CB6] leading-tight">
                        Hoje o médico<br />não trabalha<br />nesta clínica
                      </p>
                    </div>
                  </div>
                );
              }

              // Build slot occupancy map
              const primarySlots: { slot: TimeSlot; startIdx: number; spanCount: number }[] = [];
              
              col.slots.forEach(slot => {
                if (slot.status === 'ocupado' && slot.consultation) {
                  const startIdx = timeToSlotIndex(slot.time);
                  const duration = slot.consultation.duration || 30;
                  const spanCount = Math.ceil(duration / 30);
                  
                  // Check if this is a primary slot (not covered by a previous consultation)
                  const isCovered = primarySlots.some(ps => {
                    const psEnd = ps.startIdx + ps.spanCount;
                    return startIdx >= ps.startIdx && startIdx < psEnd;
                  });
                  
                  if (!isCovered) {
                    primarySlots.push({ slot, startIdx, spanCount });
                  }
                } else if (slot.status === 'bloqueado') {
                  const startIdx = timeToSlotIndex(slot.time);
                  primarySlots.push({ slot, startIdx, spanCount: 1 });
                }
              });

              return (
                <div
                  key={`${col.clinic.id}-${col.dentist.id}-${idx}`}
                  className="flex-1 min-w-[180px] mx-0.5 relative"
                  style={{
                    display: 'grid',
                    gridTemplateRows: `repeat(${totalSlots}, ${SLOT_HEIGHT}px)`,
                  }}
                >
                  {/* Empty slot backgrounds */}
                  {timeSlots.map((time, slotIdx) => {
                    // Check if this slot is occupied
                    const isOccupied = primarySlots.some(ps => {
                      const psEnd = ps.startIdx + ps.spanCount;
                      return slotIdx >= ps.startIdx && slotIdx < psEnd;
                    });
                    
                    if (isOccupied) return null;
                    
                    return (
                      <div
                        key={time}
                        className="bg-muted/20 border border-dashed border-muted-foreground/10 rounded flex items-center justify-center"
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
                          <span className="text-muted-foreground/60 text-center text-[10px]">
                            {slot.blockReason}
                          </span>
                        </div>
                      );
                    }
                    
                    if (!consultation) return null;
                    
                    const category = consultation.category || 'restauracao';
                    const colors = CATEGORY_COLORS[category];
                    const isTeleconsulta = consultation.type === 'teleconsulta';
                    const isUrgentTeleconsulta = consultation.isUrgentTeleconsulta;
                    const isUrgent = category === 'urgencia' || isUrgentTeleconsulta;
                    
                    const patientName = consultation.patient.name || '';
                    const patientAge = consultation.patient.age;
                    const displayName = showFullName 
                      ? `${patientName.split(' ')[0]} ${patientName.split(' ').slice(-1)[0]}`
                      : patientName.split(' ')[0];

                    return (
                      <div
                        key={consultation.id}
                        onClick={() => onSlotClick?.(col.dentist.id, col.clinic.id, slot)}
                        className="rounded-md flex flex-col justify-center px-2 cursor-pointer hover:opacity-80 transition-all overflow-hidden"
                        style={{
                          gridRow: `${startIdx + 1} / span ${spanCount}`,
                          backgroundColor: `${colors.hex}20`,
                          borderLeft: `3px solid ${colors.hex}`,
                        }}
                      >
                        {/* Line 1: Time + Name (Age) */}
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-muted-foreground font-mono">{slot.time}</span>
                          <span className="font-bold text-white truncate text-[10px]">
                            {displayName}
                            <span className="text-[9px] ml-0.5 font-normal">({patientAge} anos)</span>
                          </span>
                        </div>
                        {/* Line 2: Type (colored) + Notes (gray) */}
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-[9px]" style={{ color: colors.hex }}>
                            {CATEGORY_LABELS[category]}
                          </span>
                          {isTeleconsulta && (
                            <Video className="w-2.5 h-2.5 flex-shrink-0" style={{ color: colors.hex }} />
                          )}
                          {isUrgent && <AlertTriangle className="w-2.5 h-2.5 text-[#F44336] flex-shrink-0" />}
                          {consultation.notes && (
                            <span className="text-[8px] text-[#8B9CB6] truncate ml-1">
                              {consultation.notes}
                            </span>
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
      </div>
    </div>
  );
}
