import { useState } from 'react';
import { Dentist, Clinic, TimeSlot, Consultation, CATEGORY_COLORS, CATEGORY_LABELS, getCategoryBadgeStyle , getCategoryLabel} from '@/types/calendar';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Video, AlertTriangle, Ban } from 'lucide-react';
import { ClickableDentistName } from '@/components/search/ClickableDentistName';
import { ClickableClinicName } from '@/components/search/ClickableClinicName';

// Short labels for tablet/mobile to prevent wrapping in narrow columns
const SHORT_CATEGORY_OVERRIDES: Record<string, string> = {
  destartarizacao: 'Destartariz.',
  odontopediatria: 'Odontoped.',
  teleconsulta: 'Telecons.',
  primeira_consulta: '1ª Cons.',
};
function getShortCategoryLabel(t: (k: string) => string, category: string): string {
  const full = (CATEGORY_LABELS as Record<string, string>)[category] ?? '';
  // Use short override if defined, else translated full label
  if (SHORT_CATEGORY_OVERRIDES[category]) return SHORT_CATEGORY_OVERRIDES[category];
  return full;
}

export interface DentistColumn {
  dentist: Dentist;
  clinic: Clinic;
  worksToday: boolean;
  slots: TimeSlot[];
}

interface MultiDentistGridProps {
  columns: DentistColumn[];
  onSlotClick?: (dentistId: string, clinicId: string, slot: TimeSlot) => void;
  onEmptySlotClick?: (dentistId: string, clinicId: string, time: string) => void;
  showFullName?: boolean;
  onDragMove?: (consultation: Consultation, fromDentistId: string, fromClinicId: string, fromTime: string, toDentistId: string, toClinicId: string, toTime: string) => void;
}

// FIXED: Slot height is constant and immutable (38px tablet)
const SLOT_HEIGHT = 38; // Fixed height per 30-min slot

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
  onEmptySlotClick,
  showFullName = false,
  onDragMove,
}: MultiDentistGridProps) {
  const { t } = useTranslation();
  const [draggedConsultation, setDraggedConsultation] = useState<{ consultation: Consultation; fromDentistId: string; fromClinicId: string; fromTime: string } | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<string | null>(null);
  // Generate time slot labels (08:00 to 21:30 = 28 slots)
  const timeSlots: string[] = [];
  for (let hour = 8; hour < 22; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    timeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
  }
  
  const totalSlots = timeSlots.length;
  
  // Mobile detection - single vs multi dentist
  const isSingleColumn = columns.length === 1;
  const isMultiColumn = columns.length > 1;
  
  return (
    <div className={cn(
      "animate-slide-up",
      // Single dentist: no horizontal scroll, full width
      isSingleColumn && "calendar-grid-single w-full max-w-[100vw] overflow-x-hidden",
      // Multi dentist: allow horizontal scroll - NO padding left for sticky time column
      isMultiColumn && "calendar-grid-multi overflow-x-auto"
    )}
    style={isMultiColumn ? { WebkitOverflowScrolling: 'touch', paddingLeft: 0, marginLeft: 0 } : undefined}
    >
      <div className="relative">
        {/* Scroll indicator - only for multiple columns */}
        {columns.length > 3 && isMultiColumn && (
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />
        )}
        
        <div style={isSingleColumn ? { width: '100%' } : { minWidth: `${Math.max(600, columns.length * 200)}px` }}>
          {/* Dentist Headers */}
          <div className={cn(
            "flex border-b border-border pb-2 mb-2 sticky top-0 bg-background z-20",
            isSingleColumn && "calendar-grid-mobile"
          )}>
            <div className={cn(
              "flex-shrink-0",
              isSingleColumn ? "w-10 time-column-mobile" : "w-16",
              isMultiColumn && "sticky left-0 bg-background z-10"
            )} />
            {columns.map((col, idx) => (
              <div 
                key={`${col.clinic.id}-${col.dentist.id}-${idx}`} 
                className={cn(
                  "text-center px-2",
                  isSingleColumn 
                    ? "flex-1 min-w-0 dentist-column-mobile dentist-header-mobile" 
                    : "flex-1 min-w-[180px]"
                )}
              >
                <p className="text-xs font-semibold truncate"><ClickableDentistName name={col.dentist.name} className="text-xs font-semibold" /></p>
                <p className="text-[9px] text-muted-foreground truncate"><ClickableClinicName name={col.clinic.name} clinicId={col.clinic.id} className="text-[9px] text-muted-foreground" /></p>
                <p className="text-[9px] text-muted-foreground">{col.dentist.workingHours || '9h-21h'}</p>
              </div>
            ))}
          </div>

          {/* Time Grid with CSS Grid for fixed slot heights */}
          <div className={cn("flex calendar-grid-mobile", isSingleColumn && "w-full")} style={{ minHeight: `${totalSlots * SLOT_HEIGHT}px` }}>
            {/* Time Column - sticky when multi-column for scroll with SOLID background */}
            <div 
              className={cn(
                "flex-shrink-0 time-column-mobile bg-[#F8FAFC] dark:bg-[#0D2137] border-r border-[#E2E8F0] dark:border-[#1E3A5F]",
                isSingleColumn ? "w-10" : "w-16",
                isMultiColumn && "sticky left-0 z-10"
              )}
              style={{
                display: 'grid',
                gridTemplateRows: `repeat(${totalSlots}, ${SLOT_HEIGHT}px)`,
              }}
            >
              {timeSlots.map((time) => (
                <div 
                  key={time} 
                  className={cn(
                    "flex items-center justify-end pr-1 text-[#4A5568] dark:text-[#94A3B8] font-mono",
                    isSingleColumn ? "text-[10px]" : "text-xs pr-2"
                  )}
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
                        {t('agenda.doctorNotWorkingToday')}
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
                  className={cn(
                    "mx-0.5 relative dentist-column-mobile",
                    isSingleColumn ? "flex-1 min-w-0" : "flex-1 min-w-[180px]"
                  )}
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
                    
                    const slotId = `${col.clinic.id}-${col.dentist.id}-${time}`;
                    return (
                      <div
                        key={time}
                        className={cn(
                          "bg-muted/20 border border-dashed border-muted-foreground/10 rounded flex items-center justify-center transition-colors cursor-pointer hover:bg-primary/10",
                          dragOverSlot === slotId && "bg-primary/20 border-primary/50"
                        )}
                        style={{ gridRow: `${slotIdx + 1} / span 1` }}
                        onClick={() => onEmptySlotClick?.(col.dentist.id, col.clinic.id, time)}
                        onDragOver={(e) => { e.preventDefault(); setDragOverSlot(slotId); }}
                        onDragLeave={() => setDragOverSlot(null)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setDragOverSlot(null);
                          if (draggedConsultation && onDragMove) {
                            onDragMove(
                              draggedConsultation.consultation,
                              draggedConsultation.fromDentistId, draggedConsultation.fromClinicId, draggedConsultation.fromTime,
                              col.dentist.id, col.clinic.id, time
                            );
                          }
                          setDraggedConsultation(null);
                        }}
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
                        data-cat={category}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.effectAllowed = 'move';
                          setDraggedConsultation({ consultation, fromDentistId: col.dentist.id, fromClinicId: col.clinic.id, fromTime: slot.time });
                        }}
                        onDragEnd={() => setDraggedConsultation(null)}
                        onClick={() => onSlotClick?.(col.dentist.id, col.clinic.id, slot)}
                        className={cn(
                          "appt-block rounded-md flex flex-col justify-center cursor-grab active:cursor-grabbing hover:opacity-80 transition-all overflow-hidden appointment-card-mobile",
                          isSingleColumn ? "px-1.5" : "px-2",
                          draggedConsultation?.consultation.id === consultation.id && "opacity-40 border-2 border-dashed border-primary"
                        )}
                        style={{
                          gridRow: `${startIdx + 1} / span ${spanCount}`,
                          backgroundColor: `${colors.hex}73`,
                          borderLeft: `3px solid ${colors.hex}`,
                        }}
                      >
                        {/* Line 1: Time + Name (Age) */}
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-muted-foreground font-mono">{slot.time}</span>
                          <span className="font-bold text-white truncate text-[10px]">
                            {displayName}
                            {/* Hide age on small viewports, show on lg+ */}
                            <span className="hidden lg:inline text-[9px] ml-0.5 font-normal">({patientAge} anos)</span>
                          </span>
                        </div>
                        {/* Line 2: Type pill (own row) */}
                        <div data-line="type-row" className="flex items-center gap-1">
                          <span
                            className="inline-flex items-center font-bold text-[9px] leading-none rounded-full max-w-full truncate whitespace-nowrap"
                            style={{ ...getCategoryBadgeStyle(colors.hex), padding: '2px 6px' }}
                          >
                            <span className="lg:hidden">{getShortCategoryLabel(t, category)}</span>
                            <span className="hidden lg:inline">{getCategoryLabel(t, category)}</span>
                          </span>
                          {isTeleconsulta && (
                            <Video className="w-2.5 h-2.5 flex-shrink-0" style={{ color: colors.hex }} />
                          )}
                          {isUrgent && <AlertTriangle className="w-2.5 h-2.5 text-[#F44336] flex-shrink-0" />}
                          {consultation.notes && (
                            <span data-notes className="text-[8px] text-[#8B9CB6] truncate">
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
