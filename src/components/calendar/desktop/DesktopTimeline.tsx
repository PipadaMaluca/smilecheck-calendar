import { useEffect, useRef, useState, useMemo } from 'react';
import { Video, Flag, AlertTriangle, Check, Ban } from 'lucide-react';
import { Consultation, Dentist, TimeSlot, CATEGORY_COLORS, CATEGORY_LABELS } from '@/types/calendar';
import { cn } from '@/lib/utils';
import { mockClinics, dentistWorksOnDemo } from '@/data/mockData';

interface DentistColumn {
  dentist: Dentist;
  clinicId: string;
  worksToday: boolean;
  key: string;
}

interface DesktopTimelineProps {
  dentistColumns: DentistColumn[];
  slotsPerDentist: Record<string, TimeSlot[]>;
  onSlotClick: (slot: TimeSlot) => void;
  selectedDate: Date;
  workingHours?: {
    start: number;
    end: number;
  };
}

// FIXED: Slot heights - fixed and immutable
const SLOT_HEIGHT = 56; // Fixed height per 30-min slot
const TOTAL_SLOTS = 28; // 08:00 to 22:00 = 14 hours = 28 slots

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

// Convert time string to slot index (0-based, where 08:00 = 0)
function timeToSlotIndex(time: string, startHour: number): number {
  const [hour, minute] = time.split(':').map(Number);
  const hoursFromStart = hour - startHour;
  const halfHours = Math.floor(minute / 30);
  return hoursFromStart * 2 + halfHours;
}

export function DesktopTimeline({
  dentistColumns,
  slotsPerDentist,
  onSlotClick,
  selectedDate,
  workingHours: defaultWorkingHours
}: DesktopTimelineProps) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [currentTimePosition, setCurrentTimePosition] = useState<number | null>(null);

  // Fixed hours 8h-22h
  const workingHours = useMemo(() => {
    return defaultWorkingHours || { start: 8, end: 22 };
  }, [defaultWorkingHours]);

  // Generate time slot labels (every 30 min)
  const timeSlots: string[] = useMemo(() => {
    const slots: string[] = [];
    for (let h = workingHours.start; h < workingHours.end; h++) {
      slots.push(`${h.toString().padStart(2, '0')}:00`);
      slots.push(`${h.toString().padStart(2, '0')}:30`);
    }
    return slots;
  }, [workingHours]);

  // Calculate current time line position
  useEffect(() => {
    const updateCurrentTime = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      if (currentHour >= workingHours.start && currentHour < workingHours.end) {
        const hoursFromStart = currentHour - workingHours.start;
        const minutesFraction = currentMinute / 60;
        const position = (hoursFromStart * 2 + minutesFraction * 2) * SLOT_HEIGHT;
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

  return (
    <div className="flex-1 flex flex-col bg-[#1A2F3D] overflow-hidden">
      {/* Dentist Headers */}
      <div className="flex border-b border-border bg-card/50 sticky top-0 z-10">
        <div className="w-16 flex-shrink-0 border-r border-[#1E3A5F]" />
        {dentistColumns.map(({ dentist, clinicId, key }) => {
          const clinic = mockClinics.find(c => c.id === clinicId);
          return (
            <div 
              key={key} 
              className="flex-1 px-3 py-2 border-l border-border first:border-l-0 min-w-[180px]"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-primary">
                    {dentist.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-medium truncate">{dentist.name}</p>
                  <p className="text-[9px] text-muted-foreground truncate">
                    {clinic?.name || 'Clínica'} • {dentist.workingHours || '9h-21h'}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Timeline Grid - CSS Grid with fixed slot heights */}
      <div ref={timelineRef} className="flex-1 overflow-y-auto overflow-x-auto scrollbar-hide">
        <div className="flex" style={{ minHeight: `${TOTAL_SLOTS * SLOT_HEIGHT}px` }}>
          {/* Time Column */}
          <div 
            className="w-16 flex-shrink-0 border-r border-[#1E3A5F]"
            style={{
              display: 'grid',
              gridTemplateRows: `repeat(${TOTAL_SLOTS}, ${SLOT_HEIGHT}px)`,
            }}
          >
            {timeSlots.map((time, idx) => (
              <div 
                key={time} 
                className="flex items-start justify-end pr-2 pt-1"
              >
                {/* Only show hour labels, not :30 */}
                {time.endsWith(':00') && (
                  <span className="text-[11px] font-mono text-muted-foreground">
                    {time}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Dentist Columns */}
          <div className="flex-1 flex relative">
            {/* Grid lines */}
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                display: 'grid',
                gridTemplateRows: `repeat(${TOTAL_SLOTS}, ${SLOT_HEIGHT}px)`,
              }}
            >
              {timeSlots.map((time, idx) => (
                <div 
                  key={`line-${time}`} 
                  className={cn(
                    "border-t",
                    time.endsWith(':00') ? 'border-border/50' : 'border-border/20'
                  )} 
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

            {/* Dentist Columns with Appointments */}
            {dentistColumns.map(({ dentist, clinicId, worksToday, key }, colIdx) => {
              const slots = slotsPerDentist[key] || [];
              
              // If dentist doesn't work today, show grayed out column
              if (!worksToday) {
                return (
                  <div 
                    key={key} 
                    className={cn(
                      "flex-1 min-w-[180px] bg-[#2A3A4A] flex items-center justify-center",
                      colIdx > 0 && 'border-l border-border'
                    )}
                    style={{ minHeight: `${TOTAL_SLOTS * SLOT_HEIGHT}px` }}
                  >
                    <div className="text-center px-4">
                      <Ban className="w-8 h-8 mx-auto mb-2 text-[#8B9CB6]" />
                      <p className="text-sm text-[#8B9CB6] leading-tight">
                        Hoje o médico<br />não trabalha<br />nesta clínica
                      </p>
                    </div>
                  </div>
                );
              }

              // Build a map of which slots are occupied by which consultation
              const slotOccupancy: (TimeSlot | null)[] = new Array(TOTAL_SLOTS).fill(null);
              const primarySlots: { slot: TimeSlot; startIdx: number; spanCount: number }[] = [];
              
              slots.forEach(slot => {
                if (slot.status === 'ocupado' && slot.consultation) {
                  const startIdx = timeToSlotIndex(slot.time, workingHours.start);
                  const duration = slot.consultation.duration || 30;
                  const spanCount = Math.ceil(duration / 30);
                  
                  // Mark all slots this consultation occupies
                  for (let i = 0; i < spanCount && (startIdx + i) < TOTAL_SLOTS; i++) {
                    slotOccupancy[startIdx + i] = slot;
                  }
                  
                  primarySlots.push({ slot, startIdx, spanCount });
                } else if (slot.status === 'bloqueado') {
                  const startIdx = timeToSlotIndex(slot.time, workingHours.start);
                  slotOccupancy[startIdx] = slot;
                  primarySlots.push({ slot, startIdx, spanCount: 1 });
                }
              });

              return (
                <div 
                  key={key} 
                  className={cn(
                    "flex-1 min-w-[180px] relative",
                    colIdx > 0 && 'border-l border-border'
                  )}
                  style={{
                    display: 'grid',
                    gridTemplateRows: `repeat(${TOTAL_SLOTS}, ${SLOT_HEIGHT}px)`,
                  }}
                >
                  {/* Render consultation blocks using grid-row span */}
                  {primarySlots.map(({ slot, startIdx, spanCount }) => {
                    const isBlocked = slot.status === 'bloqueado';
                    const consultation = slot.consultation;
                    
                    if (isBlocked) {
                      return (
                        <div
                          key={`blocked-${slot.time}`}
                          className="mx-0.5 bg-[#9E9E9E]/30 rounded flex items-center justify-center border-l-2 border-l-[#9E9E9E]"
                          style={{
                            gridRow: `${startIdx + 1} / span 1`,
                          }}
                        >
                          <span className="text-[10px] font-medium text-muted-foreground">
                            {slot.blockReason}
                          </span>
                        </div>
                      );
                    }
                    
                    if (!consultation) return null;
                    
                    const styles = getConsultationStyles(consultation);
                    const isTeleconsulta = consultation.type === 'teleconsulta';
                    const isUrgentTeleconsulta = consultation.isUrgentTeleconsulta;
                    const isUrgent = consultation.category === 'urgencia' || isUrgentTeleconsulta;
                    
                    return (
                      <div
                        key={consultation.id}
                        onClick={() => onSlotClick(slot)}
                        className="mx-0.5 rounded cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg overflow-hidden"
                        style={{
                          gridRow: `${startIdx + 1} / span ${spanCount}`,
                          borderLeftWidth: '3px',
                          borderLeftColor: styles.borderColor,
                          backgroundColor: `${styles.borderColor}30`,
                        }}
                      >
                        <div className="flex items-start justify-between gap-0.5 p-1.5 h-full">
                          <div className="flex-1 min-w-0 overflow-hidden">
                            {/* Line 1: time + name (age) */}
                            <div className="flex items-center gap-1 flex-wrap">
                              <span className="text-[9px] font-mono text-muted-foreground">
                                {slot.time}
                              </span>
                              <span className="text-[10px] font-bold truncate text-white leading-tight">
                                {consultation.patient.name}
                                {consultation.patient.age && (
                                  <span className="font-normal ml-0.5">({consultation.patient.age} anos)</span>
                                )}
                              </span>
                              {(isTeleconsulta || isUrgentTeleconsulta) && (
                                <Video className="w-3 h-3 flex-shrink-0" style={{ color: styles.borderColor }} />
                              )}
                              {isUrgent && <AlertTriangle className="w-3 h-3 text-[#F44336] flex-shrink-0" />}
                            </div>
                            {/* Line 2: type (colored) + notes (gray) */}
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span 
                                className="text-[9px] font-bold truncate" 
                                style={{ color: styles.borderColor }}
                              >
                                {getCategoryLabel(consultation)}
                              </span>
                              {consultation.notes && (
                                <span className="text-[9px] text-[#8B9CB6] truncate">
                                  {consultation.notes}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* Status indicator */}
                          <div className="flex-shrink-0">
                            {consultation.isPaid 
                              ? <Check className="w-3 h-3 text-primary" /> 
                              : <Flag className="w-3 h-3 text-[#FDD835]" />
                            }
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
