import { Dentist, TimeSlot, CATEGORY_COLORS, CATEGORY_LABELS } from '@/types/calendar';
import { cn } from '@/lib/utils';
import { Video, MapPin, AlertTriangle } from 'lucide-react';

interface MultiDentistGridProps {
  dentists: Dentist[];
  slotsPerDentist: Record<string, TimeSlot[]>;
  onSlotClick?: (dentistId: string, slot: TimeSlot) => void;
  showFullName?: boolean;
}

export function MultiDentistGrid({
  dentists,
  slotsPerDentist,
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
      <div className="min-w-[600px]">
        {/* Dentist Headers */}
        <div className="flex border-b border-border pb-2 mb-2 sticky top-0 bg-background z-10">
          <div className="w-16 flex-shrink-0" />
          {dentists.map(dentist => (
            <div key={dentist.id} className="flex-1 text-center px-2">
              <p className="text-xs font-semibold truncate">{dentist.name}</p>
              <p className="text-[9px] text-muted-foreground">{dentist.workingHours || '9h-21h'}</p>
            </div>
          ))}
        </div>

        {/* Time Grid */}
        <div className="space-y-1">
          {timeLabels.map((time) => (
            <div key={time} className="flex items-stretch min-h-[40px]">
              <div className="w-16 flex-shrink-0 text-xs text-muted-foreground font-mono pr-2 flex items-center justify-end">
                {time}
              </div>
              {dentists.map(dentist => {
                const slots = slotsPerDentist[dentist.id] || [];
                const slot = slots.find(s => s.time === time);
                const isOcupado = slot?.status === 'ocupado';
                const isBloqueado = slot?.status === 'bloqueado';
                const consultation = slot?.consultation;
                const category = consultation?.category || 'restauracao';
                const colors = CATEGORY_COLORS[category];
                const isTeleconsulta = consultation?.type === 'teleconsulta';
                const isTeleconsultaUrgente = category === 'teleconsulta_urgente';
                const isUrgent = category === 'urgencia' || isTeleconsultaUrgente;

                return (
                  <div
                    key={`${dentist.id}-${time}`}
                    onClick={() => isOcupado && slot && onSlotClick?.(dentist.id, slot)}
                    className={cn(
                      'flex-1 mx-0.5 rounded-md flex items-center justify-center text-[10px] transition-all',
                      !slot || slot.status === 'livre' ? 'bg-muted/20 border border-dashed border-muted-foreground/10' : '',
                      isBloqueado && 'bg-[#607D8B]/30',
                      isOcupado && 'cursor-pointer hover:opacity-80'
                    )}
                    style={isOcupado ? { 
                      backgroundColor: `${colors.hex}20`, 
                      borderLeft: `3px solid ${colors.hex}` 
                    } : undefined}
                  >
                    {isOcupado && consultation && (
                      <div className="flex items-center gap-1 px-1 truncate">
                        {isTeleconsulta ? (
                          <Video className="w-3 h-3 flex-shrink-0" style={{ color: colors.hex }} />
                        ) : (
                          <MapPin className="w-3 h-3 flex-shrink-0" style={{ color: colors.hex }} />
                        )}
                        {isUrgent && <AlertTriangle className="w-2.5 h-2.5 text-[#F44336] flex-shrink-0" />}
                        <span className="truncate font-medium">
                          {showFullName 
                            ? `${consultation.patient.name.split(' ')[0]} ${consultation.patient.name.split(' ').slice(-1)[0]}` 
                            : consultation.patient.name.split(' ')[0]}
                        </span>
                      </div>
                    )}
                    {isBloqueado && <span className="text-muted-foreground/60">{slot?.blockReason}</span>}
                    {(!slot || slot.status === 'livre') && <span className="text-muted-foreground/40">—</span>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}