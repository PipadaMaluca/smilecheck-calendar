import { useEffect, useMemo, useRef } from 'react';
import { MultiDentistGrid, DentistColumn } from '../MultiDentistGrid';
import { Consultation, TimeSlot } from '@/types/calendar';
import { cn } from '@/lib/utils';
import { ClickableDentistName } from '@/components/search/ClickableDentistName';
import { ClickableClinicName } from '@/components/search/ClickableClinicName';
import { getDentistInitials } from '@/lib/avatarUtils';

interface Props {
  columns: DentistColumn[];
  activeKey?: string;
  onActiveKeyChange?: (key: string) => void;
  onSlotClick?: (dentistId: string, clinicId: string, slot: TimeSlot) => void;
  onEmptySlotClick?: (dentistId: string, clinicId: string, time: string) => void;
}

/**
 * Mobile (<500px) single-dentist agenda viewer.
 * Shows ONE dentist column at full width with swipe-left/right to switch
 * between the selected dentists. Dots indicator + centered name header.
 */
export function MobileSingleDentistAgenda({
  columns,
  activeKey,
  onActiveKeyChange,
  onSlotClick,
  onEmptySlotClick,
}: Props) {
  const keys = useMemo(
    () => columns.map(c => `${c.clinic.id}-${c.dentist.id}`),
    [columns]
  );
  const activeIdx = Math.max(
    0,
    activeKey ? keys.indexOf(activeKey) : 0
  );

  // Keep activeKey valid as selection changes
  useEffect(() => {
    if (keys.length === 0) return;
    if (!activeKey || !keys.includes(activeKey)) {
      onActiveKeyChange?.(keys[0]);
    }
  }, [keys, activeKey, onActiveKeyChange]);

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const go = (dir: 1 | -1) => {
    const next = activeIdx + dir;
    if (next < 0 || next >= keys.length) return;
    onActiveKeyChange?.(keys[next]);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null || touchStartY.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    touchStartX.current = null;
    touchStartY.current = null;
    // Ignore mostly-vertical gestures (scrolling)
    if (Math.abs(dx) < 50 || Math.abs(dy) > Math.abs(dx)) return;
    go(dx < 0 ? 1 : -1);
  };

  if (columns.length === 0) return null;

  const active = columns[activeIdx];
  const single: DentistColumn[] = active ? [active] : [];

  return (
    <div
      className="w-full"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Active dentist name + dots */}
      {active && (
        <div className="px-4 pt-1 pb-2 flex flex-col items-center gap-1.5">
          <p className="text-sm font-bold text-foreground text-center truncate max-w-full">
            <ClickableDentistName name={active.dentist.name} className="text-sm font-bold" />
            <span className="mx-1 text-muted-foreground font-normal">—</span>
            <ClickableClinicName
              name={active.clinic.name.replace('Clínica ', '')}
              clinicId={active.clinic.id}
              className="text-sm font-semibold text-muted-foreground"
            />
          </p>
          {columns.length > 1 && (
            <div
              className="flex items-center gap-1.5 max-w-full overflow-x-auto px-2"
              style={{ scrollbarWidth: 'none' }}
            >
              {columns.map((c, i) => {
                const k = keys[i];
                const isActive = i === activeIdx;
                return (
                  <button
                    key={k}
                    onClick={() => onActiveKeyChange?.(k)}
                    aria-label={`Ver ${c.dentist.name}`}
                    className={cn(
                      'flex-shrink-0 flex items-center justify-center transition-colors',
                      'text-[11px] font-bold',
                      isActive
                        ? 'bg-[#2196F3] text-white'
                        : 'bg-white/10 text-[#94A3B8] hover:bg-white/20'
                    )}
                    style={{ width: 32, height: 28, borderRadius: 14 }}
                  >
                    {getDentistInitials(c.dentist.name)}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      <div className="w-full animate-slide-up" key={keys[activeIdx]}>
        <MultiDentistGrid
          columns={single}
          onSlotClick={onSlotClick}
          onEmptySlotClick={onEmptySlotClick}
          showFullName
        />
      </div>
    </div>
  );
}