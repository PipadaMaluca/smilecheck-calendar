import { AgendaExceptionBlock, AgendaOpeningBand, openingRuns } from '../AgendaExceptionBlock';
import { onActivateKey } from '@/lib/a11y';
import { getDateFnsLocale } from '@/lib/formatters';
import { TimeSlot, Consultation, CATEGORY_COLORS, CATEGORY_PILL_EMOJIS, getCategoryBadgeStyle , getCategoryLabel} from '@/types/calendar';
import { useTranslation } from 'react-i18next';
import { useEffect, useRef, useState } from 'react';
import { format, addDays, subDays } from 'date-fns';

import { cn } from '@/lib/utils';

interface ThreeDayViewProps {
  selectedDate: Date;
  getSlots: (date: Date) => TimeSlot[];
  onSlotClick?: (slot: TimeSlot) => void;
  onDragMove?: (consultation: Consultation, fromDate: Date, fromTime: string, toDate: Date, toTime: string) => void;
}

// FIXED: Slot height is constant and immutable (35px mobile)
const SLOT_HEIGHT = 35; // Fixed height per 30-min slot

// Convert time string to slot index (0-based, where 08:00 = 0)
function timeToSlotIndex(time: string): number {
  const [hour, minute] = time.split(':').map(Number);
  const hoursFromStart = hour - 8; // Start at 08:00
  const halfHours = Math.floor(minute / 30);
  return hoursFromStart * 2 + halfHours;
}

export function ThreeDayView({ selectedDate, getSlots, onSlotClick, onDragMove }: ThreeDayViewProps) {
  const { t } = useTranslation();
  const [draggedConsultation, setDraggedConsultation] = useState<{ consultation: Consultation; fromDate: Date; fromTime: string } | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<string | null>(null);
  // Touch drag (HTML5 drag events don't fire on touch screens): long-press 300 ms, move, release on a free slot.
  const touchRef = useRef<{ timer: number | null; active: boolean; data: { consultation: Consultation; fromDate: Date; fromTime: string } | null }>({ timer: null, active: false, data: null });
  const slotAt = (x: number, y: number) => {
    const el = document.elementFromPoint(x, y)?.closest('[data-3d-slot]') as HTMLElement | null;
    return el ? { id: el.dataset['3dSlot'] as string, day: Number(el.dataset.dayIdx), time: el.dataset.time as string } : null;
  };
  useEffect(() => {
    if (!draggedConsultation || !touchRef.current.active) return;
    const block = (e: TouchEvent) => e.preventDefault();
    document.addEventListener('touchmove', block, { passive: false });
    return () => document.removeEventListener('touchmove', block);
  }, [draggedConsultation]);
  const onTouchStartBlock = (data: { consultation: Consultation; fromDate: Date; fromTime: string }) => {
    const r = touchRef.current;
    if (r.timer) window.clearTimeout(r.timer);
    r.data = data; r.active = false;
    r.timer = window.setTimeout(() => { r.active = true; setDraggedConsultation(data); navigator.vibrate?.(20); }, 300);
  };
  const onTouchMoveBlock = (e: React.TouchEvent) => {
    const r = touchRef.current;
    if (!r.active) { if (r.timer) { window.clearTimeout(r.timer); r.timer = null; } return; }
    const tch = e.touches[0];
    setDragOverSlot(slotAt(tch.clientX, tch.clientY)?.id ?? null);
  };
  const onTouchEndBlock = (e: React.TouchEvent) => {
    const r = touchRef.current;
    if (r.timer) { window.clearTimeout(r.timer); r.timer = null; }
    if (r.active && r.data) {
      e.preventDefault();
      const tch = e.changedTouches[0];
      const target = slotAt(tch.clientX, tch.clientY);
      if (target && onDragMove) onDragMove(r.data.consultation, r.data.fromDate, r.data.fromTime, days[target.day], target.time);
    }
    r.active = false; r.data = null;
    setDragOverSlot(null); setDraggedConsultation(null);
  };
  const days = [
    subDays(selectedDate, 1),
    selectedDate,
    addDays(selectedDate, 1),
  ];

  // Generate time slot labels (08:00 to 21:30 = 28 slots)
  const timeSlots: string[] = [];
  for (let hour = 8; hour < 22; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    timeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
  }
  
  const totalSlots = timeSlots.length;

  return (
    <div className="px-2 overflow-x-auto animate-slide-up">
      <div className="min-w-full">
        {/* Day Headers */}
        <div className="flex border-b border-border pb-2 mb-2 sticky top-0 bg-background z-10">
          <div className="w-12 flex-shrink-0" />
          {days.map((day, idx) => {
            const isToday = idx === 1;
            return (
              <div
                key={idx}
                className={cn(
                  'flex-1 text-center px-1',
                  isToday && 'bg-primary/10 rounded-lg py-1'
                )}
              >
                <p className={cn(
                  'text-2xs',
                  isToday ? 'text-primary font-semibold' : 'text-muted-foreground'
                )}>
                  {format(day, 'EEE', { locale: getDateFnsLocale() })}
                </p>
                <p className={cn(
                  'text-sm font-bold',
                  isToday ? 'text-primary' : 'text-foreground'
                )}>
                  {format(day, 'd')}
                </p>
                <p className={cn(
                  'text-2xs',
                  isToday ? 'text-primary' : 'text-muted-foreground'
                )}>
                  {format(day, 'MMM', { locale: getDateFnsLocale() })}
                </p>
              </div>
            );
          })}
        </div>

        {/* Time Grid with CSS Grid for fixed slot heights */}
        <div className="flex" style={{ minHeight: `${totalSlots * SLOT_HEIGHT}px` }}>
          {/* Time Column */}
          <div 
            className="w-12 flex-shrink-0"
            style={{
              display: 'grid',
              gridTemplateRows: `repeat(${totalSlots}, ${SLOT_HEIGHT}px)`,
            }}
          >
            {timeSlots.map((time) => (
              <div 
                key={time} 
                className="flex items-center justify-end pr-1 text-2xs text-muted-foreground font-mono"
              >
                {time}
              </div>
            ))}
          </div>

          {/* Day Columns */}
          {days.map((day, dayIdx) => {
            const slots = getSlots(day);
            const isToday = dayIdx === 1;
            
            // Build slot occupancy map for this day
            const primarySlots: { slot: TimeSlot; startIdx: number; spanCount: number }[] = [];
            const occupiedIndices = new Set<number>();
            
            slots.forEach(slot => {
              if (slot.status === 'ocupado' && slot.consultation) {
                const startIdx = timeToSlotIndex(slot.time);
                const duration = slot.consultation.duration || 30;
                const spanCount = Math.ceil(duration / 30);
                
                if (!occupiedIndices.has(startIdx)) {
                  primarySlots.push({ slot, startIdx, spanCount });
                  for (let i = 0; i < spanCount; i++) {
                    occupiedIndices.add(startIdx + i);
                  }
                }
              } else if (slot.status === 'bloqueado') {
                const startIdx = timeToSlotIndex(slot.time);
                if (slot.blockHidden) { occupiedIndices.add(startIdx); return; }
                if (!occupiedIndices.has(startIdx)) {
                  const span = slot.blockSpan ?? 1;
                  primarySlots.push({ slot, startIdx, spanCount: span });
                  for (let i = 0; i < span; i++) occupiedIndices.add(startIdx + i);
                }
              }
            });

            return (
              <div
                key={dayIdx}
                className="flex-1 mx-0.5 relative"
                style={{
                  display: 'grid',
                  gridTemplateRows: `repeat(${totalSlots}, ${SLOT_HEIGHT}px)`,
                }}
              >
                {/* Empty slot backgrounds */}
                {timeSlots.map((time, slotIdx) => {
                  if (occupiedIndices.has(slotIdx)) return null;
                  
                    const slotId = `${dayIdx}-${time}`;
                    return (
                      <div
                        key={time}
                        className={cn(
                          'rounded flex items-center justify-center transition-colors',
                          isToday 
                            ? 'bg-primary/5 border border-dashed border-primary/20' 
                            : 'bg-muted/20 border border-dashed border-muted-foreground/10',
                          dragOverSlot === slotId && 'bg-primary/20 border-primary/50'
                        )}
                        style={{ gridRow: `${slotIdx + 1} / span 1` }}
                        data-3d-slot={slotId} data-day-idx={dayIdx} data-time={time}
                        onDragOver={(e) => { e.preventDefault(); setDragOverSlot(slotId); }}
                        onDragLeave={() => setDragOverSlot(null)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setDragOverSlot(null);
                          if (draggedConsultation && onDragMove) {
                            onDragMove(draggedConsultation.consultation, draggedConsultation.fromDate, draggedConsultation.fromTime, day, time);
                          }
                          setDraggedConsultation(null);
                        }}
                      >
                        <span className="text-muted-foreground/40">—</span>
                      </div>
                    );
                })}
                
                {openingRuns(slots).map(r => (
                  <AgendaOpeningBand key={`open-${r.time}`} reason={r.reason} color={r.color}
                    style={{ gridRow: `${timeToSlotIndex(r.time) + 1} / span ${r.span}`, gridColumn: 1 }} />
                ))}

                {/* Consultation blocks using grid-row span */}
                {primarySlots.map(({ slot, startIdx, spanCount }) => {
                  const isBlocked = slot.status === 'bloqueado';
                  const consultation = slot.consultation;
                  
                  if (isBlocked && slot.exceptionKind) {
                    return <AgendaExceptionBlock key={`exc-${slot.time}`} slot={slot} compact style={{ gridRow: `${startIdx + 1} / span ${spanCount}` }} />;
                  }
                  if (isBlocked) {
                    return (
                      <div
                        key={`blocked-${slot.time}`}
                        className="bg-[#607D8B]/30 rounded flex items-center justify-center"
                        style={{ gridRow: `${startIdx + 1} / span 1` }}
                      >
                        <span className="text-muted-foreground/60 text-2xs">{t('i18nB.break')}</span>
                      </div>
                    );
                  }
                  
                  if (!consultation) return null;
                  
                  const category = consultation.category || 'restauracao';
                  const colors = CATEGORY_COLORS[category];
                  const pillEmoji = CATEGORY_PILL_EMOJIS[category];
                  // First name + last name
                  const nameParts = consultation.patient.name.split(' ');
                  const firstName = nameParts[0];
                  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
                  const displayName = lastName ? `${firstName} ${lastName}` : firstName;

                  return (
                    <div role="button" tabIndex={0} onKeyDown={onActivateKey}
                      key={consultation.id}
                      data-cat={category}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.effectAllowed = 'move';
                        setDraggedConsultation({ consultation, fromDate: day, fromTime: slot.time });
                      }}
                      onDragEnd={() => setDraggedConsultation(null)}
                      onTouchStart={onDragMove ? () => onTouchStartBlock({ consultation, fromDate: day, fromTime: slot.time }) : undefined}
                      onTouchMove={onDragMove ? onTouchMoveBlock : undefined}
                      onTouchEnd={onDragMove ? onTouchEndBlock : undefined}
                      onContextMenu={onDragMove ? (e) => e.preventDefault() : undefined}
                      onClick={() => onSlotClick?.(slot)}
                      className={cn(
                        "appt-block rounded cursor-grab active:cursor-grabbing hover:opacity-80 transition-colors overflow-hidden px-0.5",
                        draggedConsultation?.consultation.id === consultation.id && "opacity-40 border-2 border-dashed border-primary"
                      )}
                      style={{
                        gridRow: `${startIdx + 1} / span ${spanCount}`,
                        backgroundColor: `${colors.hex}73`,
                        borderLeft: `2px solid ${colors.hex}`,
                      }}
                    >
                      <div className="flex flex-col leading-tight py-0.5">
                        {/* Line 1: First + Last Name (age anos) */}
                        <div className="flex items-center gap-0.5 truncate">
                          <span className="truncate font-bold text-2xs text-white">
                            {displayName}
                          </span>
                          <span className="text-2xs text-muted-foreground whitespace-nowrap">
                            ({t('i18nB.age', { count: consultation.patient.age })})
                          </span>
                        </div>
                        {/* Line 2: TYPE pill + notes */}
                        <div data-line="type-row" className="flex flex-wrap items-center gap-1 min-w-0">
                          <span
                            className="inline-flex items-center text-2xs font-bold leading-none rounded-full whitespace-nowrap flex-shrink-0"
                            style={{ ...getCategoryBadgeStyle(colors.hex), padding: '2px 6px' }}
                          >
                            {getCategoryLabel(t, category)}
                            {pillEmoji && <span style={{ fontSize: 'inherit', lineHeight: 1 }}>{pillEmoji}</span>}
                          </span>
                          {consultation.notes && (
                            <span data-notes className="text-2xs text-[#8B9CB6] min-w-0 flex-shrink flex-grow overflow-hidden text-ellipsis whitespace-nowrap">
                              {consultation.notes}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
