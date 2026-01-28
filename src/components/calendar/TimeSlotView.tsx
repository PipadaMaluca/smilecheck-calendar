import { Video, MapPin, Lock } from 'lucide-react';
import { TimeSlot } from '@/types/calendar';
import { cn } from '@/lib/utils';

interface TimeSlotViewProps {
  slots: TimeSlot[];
  onSlotClick?: (slot: TimeSlot) => void;
}

export function TimeSlotView({ slots, onSlotClick }: TimeSlotViewProps) {
  return (
    <div className="space-y-2 px-4 animate-slide-up">
      {slots.map((slot, idx) => {
        const isOcupado = slot.status === 'ocupado';
        const isBloqueado = slot.status === 'bloqueado';
        const isTeleconsulta = slot.consultation?.type === 'teleconsulta';

        return (
          <div
            key={idx}
            onClick={() => isOcupado && onSlotClick?.(slot)}
            className={cn(
              'time-slot',
              slot.status === 'livre' && 'time-slot-livre',
              isOcupado && 'time-slot-ocupado cursor-pointer hover:scale-[1.01] transition-transform',
              isBloqueado && 'time-slot-bloqueado',
              isOcupado && isTeleconsulta && 'border-l-2 border-l-teleconsulta',
              isOcupado && !isTeleconsulta && 'border-l-2 border-l-presencial'
            )}
          >
            <span className="w-12 text-sm font-mono text-muted-foreground">
              {slot.time}
            </span>

            {slot.status === 'livre' && (
              <span className="text-sm text-muted-foreground/60">Livre</span>
            )}

            {isBloqueado && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground/80">
                <Lock className="w-4 h-4" />
                <span className="font-medium">{slot.blockReason}</span>
              </div>
            )}

            {isOcupado && slot.consultation && (
              <div className="flex items-center gap-3 flex-1">
                <div
                  className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center',
                    isTeleconsulta ? 'bg-teleconsulta/20' : 'bg-presencial/20'
                  )}
                >
                  {isTeleconsulta ? (
                    <Video className="w-4 h-4 text-teleconsulta" />
                  ) : (
                    <MapPin className="w-4 h-4 text-presencial" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {slot.consultation.patient.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {slot.consultation.duration} min
                  </p>
                </div>
                <div
                  className={cn(
                    'px-2 py-0.5 rounded text-[10px] font-medium',
                    isTeleconsulta ? 'badge-teleconsulta' : 'badge-presencial'
                  )}
                >
                  {isTeleconsulta ? 'TELE' : 'PRES'}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
