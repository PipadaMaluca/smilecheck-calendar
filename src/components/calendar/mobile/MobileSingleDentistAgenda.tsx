import { useEffect, useMemo, useRef, useState } from 'react';
import { MultiDentistGrid, DentistColumn } from '../MultiDentistGrid';
import { Consultation, TimeSlot } from '@/types/calendar';
import { cn } from '@/lib/utils';
import { ClickableDentistName } from '@/components/search/ClickableDentistName';
import { ClickableClinicName } from '@/components/search/ClickableClinicName';

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
  const [slideClass, setSlideClass] = useState<string>('');

  const go = (dir: 1 | -1) => {
    const next = activeIdx + dir;
    if (next < 0 || next >= keys.length) return;
    setSlideClass(dir === 1 ? 'animate-slide-in-right' : 'animate-slide-in-left');
    onActiveKeyChange?.(keys[next]);
    window.setTimeout(() => setSlideClass(''), 220);
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
            <div className="flex items-center gap-1.5">
              {keys.map((k, i) => (
                <button
                  key={k}
                  onClick={() => onActiveKeyChange?.(k)}
                  aria-label={`Ver dentista ${i + 1}`}
                  className={cn(
                    'rounded-full transition-all',
                    i === activeIdx
                      ? 'w-2 h-2 bg-primary'
                      : 'w-1.5 h-1.5 bg-muted-foreground/40 hover:bg-muted-foreground/70'
                  )}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <div className={cn('w-full', slideClass)} key={keys[activeIdx]}>
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