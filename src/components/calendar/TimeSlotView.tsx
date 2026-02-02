import { Video, MapPin, Lock, AlertTriangle } from 'lucide-react';
import { TimeSlot, CATEGORY_COLORS, CATEGORY_LABELS } from '@/types/calendar';
import { cn } from '@/lib/utils';

interface TimeSlotViewProps {
  slots: TimeSlot[];
  onSlotClick?: (slot: TimeSlot) => void;
  showNotes?: boolean;
}

export function TimeSlotView({ slots, onSlotClick, showNotes = true }: TimeSlotViewProps) {
  // Group slots to handle long consultations (60min, 90min, 120min)
  const processedSlots: { slot: TimeSlot; skip?: boolean; height: number }[] = [];
  
  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i];
    const consultation = slot.consultation;
    const duration = consultation?.duration || 30;
    
    if (duration >= 60 && slot.status === 'ocupado') {
      const slotsToSpan = Math.ceil(duration / 30);
      processedSlots.push({ slot, height: slotsToSpan });
      // Mark subsequent slots to skip based on duration
      for (let j = 1; j < slotsToSpan && (i + j) < slots.length; j++) {
        processedSlots.push({ slot: slots[i + j], skip: true, height: 1 });
        i++;
      }
    } else {
      processedSlots.push({ slot, height: 1 });
    }
  }

  return (
    <div className="space-y-2 px-4 animate-slide-up">
      {processedSlots.filter(p => !p.skip).map((processed, idx) => {
        const slot = processed.slot;
        const isOcupado = slot.status === 'ocupado';
        const isBloqueado = slot.status === 'bloqueado';
        const consultation = slot.consultation;
        const category = consultation?.category || 'restauracao';
        const colors = CATEGORY_COLORS[category];
        const isTeleconsulta = consultation?.type === 'teleconsulta';
        const isUrgentTeleconsulta = consultation?.isUrgentTeleconsulta;
        const isUrgent = category === 'urgencia' || isUrgentTeleconsulta;

        // Patient info with age
        const patientAge = consultation?.patient.age;
        const patientNameWithAge = patientAge 
          ? `${consultation?.patient.name} (${patientAge} anos)`
          : consultation?.patient.name;

        // Calculate height class based on number of slots (1 = 36px, 2 = 72px, 3 = 108px, 4 = 144px)
        const heightMap: Record<number, string> = {
          1: '',
          2: 'min-h-[72px]',
          3: 'min-h-[108px]',
          4: 'min-h-[144px]',
        };
        const slotHeight = heightMap[processed.height] || '';

        return (
          <div
            key={idx}
            onClick={() => isOcupado && onSlotClick?.(slot)}
            className={cn(
              'time-slot',
              slot.status === 'livre' && 'time-slot-livre',
              isOcupado && 'time-slot-ocupado cursor-pointer hover:scale-[1.01] transition-transform',
              isBloqueado && 'time-slot-bloqueado',
              slotHeight
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
                {/* Line 1: Name (Age) with icons */}
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
                {/* Line 2: Category (colored) + Notes (gray) */}
                <div className="flex items-center gap-2 ml-5">
                  <span 
                    className="text-xs font-bold uppercase"
                    style={{ color: colors.hex }}
                  >
                    {CATEGORY_LABELS[category]}
                  </span>
                  {showNotes && consultation.notes && (
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
