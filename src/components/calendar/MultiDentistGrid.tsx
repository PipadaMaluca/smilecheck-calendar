import { Dentist, TimeSlot } from '@/types/calendar';
import { cn } from '@/lib/utils';
import { Video, MapPin } from 'lucide-react';

interface MultiDentistGridProps {
  dentists: Dentist[];
  slotsPerDentist: Record<string, TimeSlot[]>;
  onSlotClick?: (dentistId: string, slot: TimeSlot) => void;
}

export function MultiDentistGrid({ dentists, slotsPerDentist, onSlotClick }: MultiDentistGridProps) {
  const timeLabels: string[] = [];
  for (let hour = 8; hour < 20; hour++) {
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
          {dentists.map((dentist) => (
            <div
              key={dentist.id}
              className="flex-1 text-center px-2"
            >
              <p className="text-xs font-semibold truncate">{dentist.name}</p>
              <p className="text-[10px] text-muted-foreground">{dentist.specialty}</p>
            </div>
          ))}
        </div>

        {/* Time Grid */}
        <div className="space-y-1">
          {timeLabels.map((time, timeIdx) => (
            <div key={time} className="flex items-stretch min-h-[40px]">
              <div className="w-16 flex-shrink-0 text-xs text-muted-foreground font-mono pr-2 flex items-center justify-end">
                {time}
              </div>
              {dentists.map((dentist) => {
                const slots = slotsPerDentist[dentist.id] || [];
                const slot = slots.find((s) => s.time === time);
                const isOcupado = slot?.status === 'ocupado';
                const isBloqueado = slot?.status === 'bloqueado';
                const isTeleconsulta = slot?.consultation?.type === 'teleconsulta';

                return (
                  <div
                    key={`${dentist.id}-${time}`}
                    onClick={() => isOcupado && slot && onSlotClick?.(dentist.id, slot)}
                    className={cn(
                      'flex-1 mx-0.5 rounded-md flex items-center justify-center text-[10px] transition-all',
                      !slot || slot.status === 'livre'
                        ? 'bg-muted/20 border border-dashed border-muted-foreground/10'
                        : '',
                      isBloqueado && 'bg-bloqueado',
                      isOcupado && isTeleconsulta && 'bg-teleconsulta/20 border border-teleconsulta/30 cursor-pointer hover:bg-teleconsulta/30',
                      isOcupado && !isTeleconsulta && 'bg-presencial/20 border border-presencial/30 cursor-pointer hover:bg-presencial/30'
                    )}
                  >
                    {isOcupado && slot?.consultation && (
                      <div className="flex items-center gap-1 px-1 truncate">
                        {isTeleconsulta ? (
                          <Video className="w-3 h-3 text-teleconsulta flex-shrink-0" />
                        ) : (
                          <MapPin className="w-3 h-3 text-presencial flex-shrink-0" />
                        )}
                        <span className="truncate font-medium">
                          {slot.consultation.patient.name.split(' ')[0]}
                        </span>
                      </div>
                    )}
                    {isBloqueado && (
                      <span className="text-muted-foreground/60">{slot?.blockReason}</span>
                    )}
                    {(!slot || slot.status === 'livre') && (
                      <span className="text-muted-foreground/40">—</span>
                    )}
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
