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
        const isTeleconsultaUrgente = category === 'teleconsulta_urgente';
        const isUrgent = category === 'urgencia' || isTeleconsultaUrgente;

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
              <div className="flex items-center gap-3 flex-1">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${colors.hex}20` }}
                >
                  {isTeleconsulta ? (
                    <Video className="w-4 h-4" style={{ color: colors.hex }} />
                  ) : (
                    <MapPin className="w-4 h-4" style={{ color: colors.hex }} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-medium truncate">
                      {consultation.patient.name}
                    </p>
                    {isUrgent && <AlertTriangle className="w-3 h-3 text-[#F44336] flex-shrink-0" />}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {consultation.duration} min
                  </p>
                </div>
                <div
                  className="px-2 py-0.5 rounded text-[10px] font-bold"
                  style={{ backgroundColor: `${colors.hex}20`, color: colors.hex }}
                >
                  {categoryLabel}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}