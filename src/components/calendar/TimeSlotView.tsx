import { Video, MapPin, Lock } from 'lucide-react';
import { TimeSlot, CATEGORY_COLORS, getCategoryBadgeStyle , getCategoryLabel} from '@/types/calendar';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface TimeSlotViewProps {
  slots: TimeSlot[];
  onSlotClick?: (slot: TimeSlot) => void;
  showNotes?: boolean;
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

export function TimeSlotView({ slots, onSlotClick, showNotes = true }: TimeSlotViewProps) {
  const { t } = useTranslation();
  // Build slot occupancy map for proper spanning
  const primarySlots: { slot: TimeSlot; startIdx: number; spanCount: number }[] = [];
  const occupiedIndices = new Set<number>();
  
  slots.forEach(slot => {
    if (slot.status === 'ocupado' && slot.consultation) {
      const startIdx = timeToSlotIndex(slot.time);
      const duration = slot.consultation.duration || 30;
      const spanCount = Math.ceil(duration / 30);
      
      // Check if this is a primary slot (not covered by a previous consultation)
      if (!occupiedIndices.has(startIdx)) {
        primarySlots.push({ slot, startIdx, spanCount });
        // Mark all slots this consultation occupies
        for (let i = 0; i < spanCount; i++) {
          occupiedIndices.add(startIdx + i);
        }
      }
    } else if (slot.status === 'bloqueado') {
      const startIdx = timeToSlotIndex(slot.time);
      if (!occupiedIndices.has(startIdx)) {
        primarySlots.push({ slot, startIdx, spanCount: 1 });
        occupiedIndices.add(startIdx);
      }
    } else if (slot.status === 'livre') {
      const startIdx = timeToSlotIndex(slot.time);
      if (!occupiedIndices.has(startIdx)) {
        primarySlots.push({ slot, startIdx, spanCount: 1 });
      }
    }
  });

  // Sort by start index
  primarySlots.sort((a, b) => a.startIdx - b.startIdx);

  return (
    <div 
      className="px-4 animate-slide-up"
      style={{
        display: 'grid',
        gridTemplateRows: `repeat(${slots.length}, ${SLOT_HEIGHT}px)`,
        gap: '4px',
      }}
    >
      {primarySlots.map(({ slot, startIdx, spanCount }, idx) => {
        const isOcupado = slot.status === 'ocupado';
        const isBloqueado = slot.status === 'bloqueado';
        const consultation = slot.consultation;
        const category = consultation?.category || 'restauracao';
        const colors = CATEGORY_COLORS[category];
        const isTeleconsulta = consultation?.type === 'teleconsulta';
        // Patient info with age
        const patientAge = consultation?.patient.age;
        const patientNameWithAge = patientAge 
          ? `${consultation?.patient.name} (${patientAge} anos)`
          : consultation?.patient.name;

        return (
          <div
            key={`${slot.time}-${idx}`}
            onClick={() => isOcupado && onSlotClick?.(slot)}
            className={cn(
              'time-slot',
              slot.status === 'livre' && 'time-slot-livre',
              isOcupado && 'time-slot-ocupado cursor-pointer hover:scale-[1.01] transition-transform',
              isBloqueado && 'time-slot-bloqueado',
            )}
            style={{
              gridRow: `${startIdx + 1} / span ${spanCount}`,
              borderLeftColor: isOcupado ? colors.hex : undefined,
              borderLeftWidth: isOcupado ? '3px' : undefined,
            }}
          >
            <span className="w-10 text-xs font-mono text-muted-foreground">
              {slot.time}
            </span>

            {slot.status === 'livre' && (
              <span className="text-xs text-muted-foreground/60">Livre</span>
            )}

            {isBloqueado && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground/80">
                <Lock className="w-3 h-3" />
                <span className="font-medium">{slot.blockReason}</span>
              </div>
            )}

            {isOcupado && consultation && (
              <div className="flex flex-col flex-1 overflow-hidden">
                {/* Line 1: Name (Age) with icons */}
                <div className="flex items-center gap-1">
                  {isTeleconsulta ? (
                    <Video className="w-3 h-3 flex-shrink-0" style={{ color: colors.hex }} />
                  ) : (
                    <MapPin className="w-3 h-3 flex-shrink-0" style={{ color: colors.hex }} />
                  )}
                  <span className="text-xs font-bold text-white truncate">
                    {patientNameWithAge}
                  </span>
                </div>
                {/* Line 2: Category (colored) + Notes (gray) + Duration */}
                <div className="flex flex-wrap items-center gap-1 ml-4 min-w-0">
                  <span
                    className="inline-flex items-center text-[11px] font-bold leading-none rounded-full whitespace-nowrap flex-shrink-0"
                    style={{ ...getCategoryBadgeStyle(colors.hex), padding: '2px 10px' }}
                  >
                    {getCategoryLabel(t, category)}
                  </span>
                  {showNotes && consultation.notes && (
                    <span className="text-[9px] text-[#8B9CB6] min-w-0 flex-shrink flex-grow overflow-hidden text-ellipsis whitespace-nowrap">
                      {consultation.notes}
                    </span>
                  )}
                  <span className="text-[10px] text-muted-foreground ml-auto flex-shrink-0">
                    {consultation.duration}min
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
