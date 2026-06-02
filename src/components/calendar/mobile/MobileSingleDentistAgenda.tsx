import { useEffect, useMemo, useRef } from 'react';
import { MultiDentistGrid, DentistColumn } from '../MultiDentistGrid';
import { TimeSlot } from '@/types/calendar';

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
  const hasAppointments = !!active && active.slots.some(s => s.consultation);

  return (
    <div
      className="w-full"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="w-full animate-slide-up relative" key={keys[activeIdx]}>
        <MultiDentistGrid
          columns={single}
          onSlotClick={onSlotClick}
          onEmptySlotClick={onEmptySlotClick}
          showFullName
          hideColumnHeader
        />
        {!hasAppointments && (
          <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-center py-16">
            <span className="px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-sm text-xs text-muted-foreground border border-border">
              Sem consultas agendadas
            </span>
          </div>
        )}
      </div>
    </div>
  );
}