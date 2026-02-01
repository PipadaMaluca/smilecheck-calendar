import { Video, MapPin, Lock, AlertTriangle } from 'lucide-react';
import { TimeSlot, CATEGORY_COLORS, CATEGORY_LABELS } from '@/types/calendar';
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
        const consultation = slot.consultation;
        const category = consultation?.category || 'restauracao';
        const colors = CATEGORY_COLORS[category];
        const categoryLabel = CATEGORY_LABELS[category];
        const isTeleconsulta = consultation?.type === 'teleconsulta';
        const isUrgentTeleconsulta = consultation?.isUrgentTeleconsulta;
        const isUrgent = category === 'urgencia' || isUrgentTeleconsulta;

        // Patient info with age
        const patientAge = consultation?.patient.age;
        const patientNameWithAge = patientAge 
          ? `${consultation?.patient.name} (${patientAge})`
          : consultation?.patient.name;

        return (
          <div
            key={idx}
            onClick={() => isOcupado && onSlotClick?.(slot)}
            className={cn(
              'time-slot',
              slot.status === 'livre' && 'time-slot-livre',
              isOcupado && 'time-slot-ocupado cursor-pointer hover:scale-[1.01] transition-transform',
              isBloqueado && 'time-slot-bloqueado'
            )}
            style={isOcupado ? { borderLeftColor: colors.hex, borderLeftWidth: '3px' } : undefined}
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

            {isOcupado && consultation && (
              <div className="flex flex-col flex-1 overflow-hidden">
                {/* Line 1: Name (Age) */}
                <div className="flex items-center gap-1.5">
                  {isTeleconsulta ? (
                    <Video className="w-4 h-4 flex-shrink-0" style={{ color: colors.hex }} />
                  ) : (
                    <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: colors.hex }} />
                  )}
                  <span className="text-sm font-bold uppercase text-white truncate">
                    {patientNameWithAge}
                  </span>
                  {isUrgent && <AlertTriangle className="w-3 h-3 text-[#F44336] flex-shrink-0" />}
                </div>
                {/* Line 2: Category + Notes */}
                <div className="flex items-center gap-2 ml-5">
                  <span 
                    className="text-xs font-bold uppercase"
                    style={{ color: colors.hex }}
                  >
                    {categoryLabel}
                  </span>
                  {consultation.notes && (
                    <span className="text-xs text-[#8B9CB6] truncate">
                      {consultation.notes}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground ml-auto flex-shrink-0">
                    {consultation.duration} min
                  </span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
