import { useState } from 'react';
import { Dentist, Clinic, TimeSlot, Consultation, CATEGORY_COLORS, CATEGORY_LABELS, getCategoryBadgeStyle , getCategoryLabel} from '@/types/calendar';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Ban } from 'lucide-react';
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
  const timeColumnWidth = isSingleColumn ? '40px' : '64px';
  const agendaGridTemplate = isSingleColumn
    ? `${timeColumnWidth} minmax(0, 1fr)`
    : `${timeColumnWidth} repeat(${columns.length}, minmax(200px, 1fr))`;

  // Density tier based on number of visible columns (desktop only — mobile is single-column).
  // Spec: 7+ cols → 8/7px;  4-6 cols → 9/8px;  1-3 cols → 10/9px.
  const density: 'sm' | 'md' | 'lg' =
    columns.length >= 7 ? 'sm' : columns.length >= 4 ? 'md' : 'lg';
  const D = {
    sm: { time: 'text-[8px]', name: 'text-[8px]', age: 'text-[8px]', pill: 'text-[7px]', pillPad: '1px 3px', notes: 'text-[7px]', pad: 'px-[2px] py-[2px]' },
    md: { time: 'text-[9px]', name: 'text-[9px]', age: 'text-[9px]', pill: 'text-[8px]', pillPad: '1px 4px', notes: 'text-[8px]', pad: 'px-[3px] py-[2px]' },
    lg: { time: 'text-[10px]', name: 'text-[10px]', age: 'text-[10px]', pill: 'text-[9px]', pillPad: '1px 5px', notes: 'text-[9px]', pad: 'px-[3px] py-[2px]' },
  }[density];
  
  return (
    <div className={cn(
      "animate-slide-up",
      // Single dentist: no horizontal scroll, full width
      isSingleColumn && "calendar-grid-single w-full max-w-[100vw] overflow-x-hidden",
      // Multi dentist: allow horizontal scroll - NO padding left for sticky time column
      isMultiColumn && "calendar-grid-multi w-full max-w-full overflow-x-auto"
    )}
    style={isMultiColumn ? { WebkitOverflowScrolling: 'touch', paddingLeft: 0, marginLeft: 0, width: '100%', maxWidth: '100%' } : undefined}
    >
      <div className="relative">
        {/* Scroll indicator - only for multiple columns */}
        {columns.length > 3 && isMultiColumn && (
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />
        )}
        
        <div className="min-w-0" style={{ width: '100%', minWidth: isMultiColumn ? '100%' : undefined }}>
          {/* Dentist Headers */}
          <div className={cn(
            "grid border-b border-border pb-2 mb-2 sticky top-0 bg-background z-20",
            isSingleColumn && "calendar-grid-mobile"
          )} style={{ gridTemplateColumns: agendaGridTemplate }}>
            <div className={cn(
              "min-w-0",
              isSingleColumn ? "time-column-mobile" : "time-column-mobile",
              isMultiColumn && "sticky left-0 bg-background z-10"
            )} />
            {columns.map((col, idx) => (
              <div 
                key={`${col.clinic.id}-${col.dentist.id}-${idx}`} 
                data-dentist-header
                className={cn(
                  "text-center px-2 min-w-0 overflow-hidden",
                  isSingleColumn 
                    ? "flex-1 min-w-0 dentist-column-mobile dentist-header-mobile" 
                    : "dentist-column-mobile border-l border-[hsl(0_0%_100%/0.08)]"
                )}
              >
                <p className="text-[11px] font-bold leading-tight truncate" title={col.dentist.name}>
                  <ClickableDentistName name={col.dentist.name} className="text-[11px] font-bold" />
                </p>
                <p className="text-[9px] text-muted-foreground leading-tight truncate" title={`${col.clinic.name} · ${col.dentist.workingHours || '9h-21h'}`}>
                  <ClickableClinicName name={col.clinic.name} clinicId={col.clinic.id} className="text-[9px] text-muted-foreground" />
                  <span className="ml-1">· {col.dentist.workingHours || '9h-21h'}</span>
                </p>
              </div>
            ))}
          </div>

          {/* Time Grid with CSS Grid for fixed slot heights */}
          <div data-agenda-grid-row className={cn("grid", isSingleColumn && "w-full")} style={{ minHeight: `${totalSlots * SLOT_HEIGHT}px`, gridTemplateColumns: agendaGridTemplate }}>
            {/* Time Column - sticky when multi-column for scroll with SOLID background */}
            <div 
              className={cn(
                "time-column-mobile bg-[#F8FAFC] dark:bg-[#0D2137] border-r border-[#E2E8F0] dark:border-[#1E3A5F]",
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
                          "appt-block rounded-md flex flex-col items-start justify-start gap-[1px] cursor-grab active:cursor-grabbing hover:opacity-80 transition-all overflow-hidden appointment-card-mobile",
                          isSingleColumn ? "px-[3px] py-[2px]" : D.pad,
                          draggedConsultation?.consultation.id === consultation.id && "opacity-40 border-2 border-dashed border-primary"
                        )}
                        style={{
                          gridRow: `${startIdx + 1} / span ${spanCount}`,
                          backgroundColor: `${colors.hex}73`,
                          borderLeft: `3px solid ${colors.hex}`,
                        }}
                      >
                        {/* Line 1: Time + Name (Age) — bold, top-aligned */}
                        <div className="flex items-baseline gap-1 w-full" style={{ lineHeight: 1 }}>
                          <span className={cn("text-white font-bold font-mono flex-shrink-0", isSingleColumn ? "text-[9px]" : D.time)}>{slot.time}</span>
                          <span className={cn("font-medium text-white truncate min-w-0", isSingleColumn ? "text-[9px]" : D.name)} title={`${displayName}${patientAge ? ` (${patientAge} anos)` : ''}`}>
                            {displayName}
                          </span>
                          {patientAge != null && (
                            <span className={cn("text-white/85 font-medium flex-shrink-0", isSingleColumn ? "text-[9px]" : D.age)}>({patientAge} anos)</span>
                          )}
                        </div>
                        {/* Line 2: Type pill + description */}
                        <div data-line="type-row" className="flex flex-wrap items-center gap-1 w-full min-w-0" style={{ lineHeight: 1 }}>
                          <span
                            className={cn("inline-flex items-center font-bold leading-none rounded-full whitespace-nowrap flex-shrink-0", isSingleColumn ? "text-[8px]" : D.pill)}
                            style={{ ...getCategoryBadgeStyle(colors.hex), padding: isSingleColumn ? '1px 4px' : D.pillPad }}
                          >
                            <span className="lg:hidden">{getShortCategoryLabel(t, category)}</span>
                            <span className="hidden lg:inline">{getCategoryLabel(t, category)}</span>
                          </span>
                          {consultation.notes && (
                            <span data-notes className={cn("text-[#8B9CB6] truncate min-w-0 flex-1", isSingleColumn ? "text-[8px]" : D.notes)}>
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
