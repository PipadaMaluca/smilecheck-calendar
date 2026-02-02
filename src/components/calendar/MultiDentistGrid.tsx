import { Dentist, Clinic, TimeSlot, CATEGORY_COLORS, CATEGORY_LABELS } from '@/types/calendar';
import { cn } from '@/lib/utils';
import { Video, MapPin, AlertTriangle, Ban } from 'lucide-react';

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

export function MultiDentistGrid({
  columns,
  onSlotClick,
  showFullName = false
}: MultiDentistGridProps) {
  const timeLabels: string[] = [];
  for (let hour = 8; hour < 22; hour++) {
    for (let minutes = 0; minutes < 60; minutes += 30) {
      timeLabels.push(`${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
    }
  }
  
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

        {/* Time Grid */}
        <div className="space-y-0">
          {timeLabels.map((time, timeIdx) => {
            return (
              <div key={time} className="flex items-stretch">
                <div className="w-16 flex-shrink-0 text-xs text-muted-foreground font-mono pr-2 flex items-center justify-end h-[40px]">
                  {time}
                </div>
                {columns.map((col, idx) => {
                  // If dentist doesn't work today, show grayed out column
                  if (!col.worksToday) {
                    return (
                      <div
                        key={`${col.clinic.id}-${col.dentist.id}-${time}-${idx}`}
                        className="flex-1 mx-0.5 min-w-[180px] bg-[#2A3A4A] flex items-center justify-center h-[40px]"
                        style={{ 
                          borderRadius: time === '08:00' ? '8px 8px 0 0' : time === '21:30' ? '0 0 8px 8px' : '0' 
                        }}
                      >
                        {time === '14:00' && (
                          <div className="text-center px-2">
                            <Ban className="w-5 h-5 mx-auto mb-1 text-[#8B9CB6]" />
                            <p className="text-[10px] text-[#8B9CB6] leading-tight">
                              Hoje o médico<br />não trabalha<br />nesta clínica
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  }

                  // Check if this slot is part of a longer consultation from previous slots
                  // Check up to 3 previous slots (for consultations up to 120 min)
                  for (let offset = 1; offset <= 3; offset++) {
                    const checkIdx = timeIdx - offset;
                    if (checkIdx >= 0) {
                      const checkTime = timeLabels[checkIdx];
                      const checkSlot = col.slots.find(s => s.time === checkTime);
                      if (checkSlot?.status === 'ocupado' && checkSlot.consultation) {
                        const duration = checkSlot.consultation.duration || 30;
                        const slotsNeeded = Math.ceil(duration / 30);
                        if (offset < slotsNeeded) {
                          // This slot is covered by a previous consultation - render empty placeholder
                          return (
                            <div
                              key={`${col.clinic.id}-${col.dentist.id}-${time}-${idx}`}
                              className="flex-1 mx-0.5 min-w-[180px] h-[40px]"
                            />
                          );
                        }
                      }
                    }
                  }

                  const slot = col.slots.find(s => s.time === time);
                  const isOcupado = slot?.status === 'ocupado';
                  const isBloqueado = slot?.status === 'bloqueado';
                  const consultation = slot?.consultation;
                  const category = consultation?.category || 'restauracao';
                  const colors = CATEGORY_COLORS[category];
                  const isTeleconsulta = consultation?.type === 'teleconsulta';
                  const isUrgentTeleconsulta = consultation?.isUrgentTeleconsulta;
                  const isUrgent = category === 'urgencia' || isUrgentTeleconsulta;
                  
                  // Calculate height based on duration (30min = 40px, 60min = 80px, 90min = 120px, 120min = 160px)
                  const duration = consultation?.duration || 30;
                  const slotsNeeded = Math.ceil(duration / 30);
                  const blockHeight = slotsNeeded * 40;

                  // Get patient name with age
                  const patientName = consultation?.patient.name || '';
                  const patientAge = consultation?.patient.age;
                  const displayName = showFullName 
                    ? `${patientName.split(' ')[0]} ${patientName.split(' ').slice(-1)[0]}`
                    : patientName.split(' ')[0];

                  return (
                    <div
                      key={`${col.clinic.id}-${col.dentist.id}-${time}-${idx}`}
                      onClick={() => isOcupado && slot && onSlotClick?.(col.dentist.id, col.clinic.id, slot)}
                      className={cn(
                        'flex-1 mx-0.5 min-w-[180px] rounded-md flex flex-col justify-center px-2 text-[10px] transition-all',
                        !slot || slot.status === 'livre' ? 'bg-muted/20 border border-dashed border-muted-foreground/10' : '',
                        isBloqueado && 'bg-[#607D8B]/30',
                        isOcupado && 'cursor-pointer hover:opacity-80'
                      )}
                      style={{
                        height: `${blockHeight}px`,
                        ...(isOcupado ? { 
                          backgroundColor: `${colors.hex}20`, 
                          borderLeft: `3px solid ${colors.hex}` 
                        } : {})
                      }}
                    >
                      {isOcupado && consultation && (
                        <div className="overflow-hidden">
                          {/* Line 1: Time + Name (Age) */}
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-muted-foreground font-mono">{time}</span>
                            <span className="font-bold text-white uppercase truncate">
                              {displayName}
                              <span className="text-[9px] ml-0.5 font-normal">({patientAge} anos)</span>
                            </span>
                          </div>
                          {/* Line 2: Type (colored) + Notes (gray) */}
                          <div className="flex items-center gap-1">
                            <span className="font-bold uppercase text-[9px]" style={{ color: colors.hex }}>
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
                      )}
                      {isBloqueado && <span className="text-muted-foreground/60 text-center">{slot?.blockReason}</span>}
                      {(!slot || slot.status === 'livre') && <span className="text-muted-foreground/40 text-center">—</span>}
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
