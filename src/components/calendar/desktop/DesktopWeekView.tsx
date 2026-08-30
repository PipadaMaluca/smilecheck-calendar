import { useMemo, useState } from 'react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { pt } from 'date-fns/locale';
import {
  Consultation, TimeSlot, CATEGORY_COLORS, CATEGORY_PILL_EMOJIS,
  ConsultationStatus, getCategoryBadgeStyle, getCategoryLabel,
} from '@/types/calendar';
import { useTranslation } from 'react-i18next';
import { mockConsultations, mockDentists, generateTimeSlots } from '@/data/mockData';
import { ConsultationContextMenu } from '../ConsultationContextMenu';
import { getDentistInitials } from '@/lib/avatarUtils';
import { cn } from '@/lib/utils';
import { useSlotHeight } from '@/stores/agendaSettingsStore';

interface DentistColumn {
  dentist: typeof mockDentists[number];
  clinicId: string;
  worksToday: boolean;
  key: string;
}

interface DesktopWeekViewProps {
  selectedDate: Date;
  dentistColumns: DentistColumn[];
  includeSunday?: boolean;
  onSlotClick: (slot: TimeSlot) => void;
  onDateChange: (date: Date) => void;
  onViewModeChange: (mode: 'day') => void;
  onStatusChange?: (consultation: Consultation, status: ConsultationStatus) => void;
  onCopy?: (consultation: Consultation) => void;
  onDragMove?: (
    consultation: Consultation,
    fromDate: Date, fromTime: string, fromDentistKey: string,
    toDate: Date, toTime: string, toDentistKey: string,
  ) => void;
  onConsultationHover?: (consultation: Consultation | null) => void;
}

const BASE_SLOT_HEIGHT = 48;
const HOURS = Array.from({ length: 14 }, (_, i) => i + 8);
const TOTAL_SLOTS = 28;

const TIME_SLOTS: string[] = [];
for (let h = 8; h < 22; h++) {
  TIME_SLOTS.push(`${String(h).padStart(2, '0')}:00`);
  TIME_SLOTS.push(`${String(h).padStart(2, '0')}:30`);
}

type ScaleLevel = 'normal' | 'compact' | 'dense' | 'ultra' | 'scroll';
function getScaleLevel(total: number): ScaleLevel {
  if (total <= 2) return 'normal';
  if (total <= 4) return 'compact';
  if (total <= 8) return 'dense';
  if (total <= 12) return 'ultra';
  return 'scroll';
}

const SCALE_STYLES: Record<ScaleLevel, {
  cardPad: string; timeFs: string; nameFs: string; pillFs: string; pillPad: string;
  notes: boolean; pillTextHidden: boolean; firstNameOnly: boolean; minColW: number;
}> = {
  normal:  { cardPad: 'px-1.5 py-1', timeFs: 'text-[11px]', nameFs: 'text-[11px]', pillFs: 'text-[11px]', pillPad: '2px 6px', notes: false, pillTextHidden: false, firstNameOnly: true, minColW: 0 },
  compact: { cardPad: 'px-1.5 py-1', timeFs: 'text-[11px]', nameFs: 'text-[11px]', pillFs: 'text-[11px]', pillPad: '2px 6px', notes: false, pillTextHidden: false, firstNameOnly: true, minColW: 0 },
  dense:   { cardPad: 'px-1 py-0.5', timeFs: 'text-[11px]', nameFs: 'text-[11px]', pillFs: 'text-[11px]', pillPad: '1px 5px', notes: false, pillTextHidden: false, firstNameOnly: true, minColW: 120 },
  ultra:   { cardPad: 'px-1 py-0.5', timeFs: 'text-[11px]',  nameFs: 'text-[11px]',  pillFs: 'text-[11px]',  pillPad: '1px 4px', notes: false, pillTextHidden: false, firstNameOnly: true, minColW: 100 },
  scroll:  { cardPad: 'px-1 py-0.5', timeFs: 'text-[11px]',  nameFs: 'text-[11px]',  pillFs: 'text-[11px]',  pillPad: '1px 4px', notes: false, pillTextHidden: false, firstNameOnly: true, minColW: 100 },
};

export function DesktopWeekView({
  selectedDate,
  dentistColumns,
  includeSunday = false,
  onSlotClick,
  onDateChange,
  onViewModeChange,
  onStatusChange,
  onCopy,
  onDragMove,
  onConsultationHover,
}: DesktopWeekViewProps) {
  const { t } = useTranslation();
  const SLOT_HEIGHT = useSlotHeight(BASE_SLOT_HEIGHT);
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const numDays = includeSunday ? 7 : 6;
  const weekDays = Array.from({ length: numDays }, (_, i) => addDays(weekStart, i));
  const today = new Date();

  const [contextMenu, setContextMenu] = useState<{ consultation: Consultation; position: { x: number; y: number } } | null>(null);
  const [dragged, setDragged] = useState<{ consultation: Consultation; fromDate: Date; fromTime: string; fromKey: string } | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);

  const dentists = dentistColumns.length > 0 ? dentistColumns : [];

  // Filter Sunday columns to teleconsulta dentists only? Skip for now — same set every day.
  const totalColumns = weekDays.length * Math.max(1, dentists.length);
  const scale = getScaleLevel(totalColumns);
  const scaleCfg = SCALE_STYLES[scale];
  const isScroll = scale === 'scroll';

  // Slots: per [dayKey][dentistKey]
  const matrix = useMemo(() => {
    const m: Record<string, Record<string, TimeSlot[]>> = {};
    weekDays.forEach(day => {
      const dayKey = format(day, 'yyyy-MM-dd');
      m[dayKey] = {};
      const isSunday = day.getDay() === 0;
      dentists.forEach(({ dentist, clinicId, key }) => {
        if (isSunday) {
          // Sunday: no in-person; just generate empty slots (no lunch either)
          m[dayKey][key] = [];
          return;
        }
        const dc = mockConsultations.filter(
          c => isSameDay(c.date, day) && c.dentist.id === dentist.id && c.clinic.id === clinicId
        );
        m[dayKey][key] = generateTimeSlots(day, dc);
      });
    });
    return m;
  }, [weekDays.map(d => d.toISOString()).join('|'), dentists.map(d => d.key).join('|')]);

  const handleContextMenu = (e: React.MouseEvent, c: Consultation) => {
    e.preventDefault();
    setContextMenu({ consultation: c, position: { x: e.clientX, y: e.clientY } });
  };

  const showSubHeaders = dentists.length > 1;
  const subColMinW = scaleCfg.minColW;
  const dayMinW = subColMinW > 0 ? subColMinW * dentists.length : 0;

  return (
    <div className="flex-1 overflow-auto bg-[#1A2F3D]" onClick={() => setContextMenu(null)}>
      <div
        className="min-w-full"
        style={ isScroll ? { width: 'max-content' } : undefined }
      >
        {/* Day headers */}
        <div className="flex border-b border-border sticky top-0 bg-card/95 backdrop-blur z-10">
          <div className="w-14 flex-shrink-0 border-r border-[#1E3A5F]" />
          {weekDays.map(day => {
            const isToday = isSameDay(day, today);
            const isSelected = isSameDay(day, selectedDate);
            return (
              <div
                key={day.toISOString()}
                className={cn(
                  'flex-1 min-w-0 border-l border-border',
                  isToday && 'bg-primary/15',
                  !isToday && isSelected && 'bg-primary/5'
                )}
                style={ dayMinW ? { minWidth: dayMinW } : undefined }
              >
                <div
                  className="text-center py-1.5 cursor-pointer hover:bg-secondary/30 transition-colors"
                  onClick={() => { onDateChange(day); onViewModeChange('day'); }}
                >
                  <div className={cn('text-[11px] uppercase font-medium', isToday ? 'text-primary' : 'text-muted-foreground')}>
                    {format(day, 'EEE', { locale: pt })}
                  </div>
                  <div className={cn('text-xs font-semibold', isToday && 'text-primary')}>
                    {format(day, "d MMM", { locale: pt })}
                  </div>
                </div>
                {showSubHeaders && (
                  <div className="flex border-t border-border/50">
                    {dentists.map(({ dentist, key }) => (
                      <div
                        key={key}
                        className="flex-1 min-w-0 px-1 py-0.5 text-center border-l border-border/40 first:border-l-0"
                        title={dentist.name}
                      >
                        <span className="text-[11px] font-bold text-primary">
                          {getDentistInitials(dentist.name)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Time grid */}
        <div className="relative flex">
          {/* Time labels */}
          <div className="w-14 flex-shrink-0 sticky left-0 z-[5] bg-[#1A2F3D] border-r border-[#1E3A5F]">
            {HOURS.map(hour => (
              <div key={hour} className="flex items-start justify-end pr-2" style={{ height: SLOT_HEIGHT * 2 }}>
                <span className="text-[11px] text-muted-foreground -mt-1.5 font-mono">
                  {String(hour).padStart(2, '0')}:00
                </span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {weekDays.map(day => {
            const dayKey = format(day, 'yyyy-MM-dd');
            const isToday = isSameDay(day, today);
            const isSunday = day.getDay() === 0;
            return (
              <div
                key={dayKey}
                className={cn(
                  'flex-1 min-w-0 flex border-l border-border',
                  isToday && 'bg-primary/5'
                )}
                style={ dayMinW ? { minWidth: dayMinW } : undefined }
              >
                {dentists.map(({ dentist, key, worksToday }, idx) => {
                  const slots = matrix[dayKey]?.[key] || [];
                  const occupied = new Set<number>();
                  const primary: { slot: TimeSlot; startIdx: number; spanCount: number }[] = [];
                  slots.forEach(slot => {
                    if (slot.status === 'ocupado' && slot.consultation) {
                      const [h, m] = slot.time.split(':').map(Number);
                      const startIdx = (h - 8) * 2 + (m >= 30 ? 1 : 0);
                      const spanCount = Math.ceil(slot.consultation.duration / 30);
                      if (!occupied.has(startIdx)) {
                        primary.push({ slot, startIdx, spanCount });
                        for (let i = 0; i < spanCount; i++) occupied.add(startIdx + i);
                      }
                    } else if (slot.status === 'bloqueado') {
                      const [h, m] = slot.time.split(':').map(Number);
                      const startIdx = (h - 8) * 2 + (m >= 30 ? 1 : 0);
                      if (!occupied.has(startIdx)) {
                        primary.push({ slot, startIdx, spanCount: 1 });
                        occupied.add(startIdx);
                      }
                    }
                  });

                  return (
                    <div
                      key={key}
                      className={cn(
                        'flex-1 min-w-0 relative box-border border-l border-border/40 first:border-l-0',
                        !worksToday && !isSunday && 'bg-[#2A3A4A]/40'
                      )}
                      style={{ height: TOTAL_SLOTS * SLOT_HEIGHT, ...(subColMinW ? { minWidth: subColMinW } : {}) }}
                    >
                      {/* Grid lines */}
                      {HOURS.map(hour => (
                        <div
                          key={hour}
                          className="absolute w-full border-t border-border/20"
                          style={{ top: (hour - 8) * 2 * SLOT_HEIGHT }}
                        />
                      ))}

                      {isSunday && (
                        <div className="absolute inset-0 flex items-center justify-center text-[11px] text-muted-foreground px-2 text-center">
                          Sem agenda
                        </div>
                      )}

                      {/* Empty drop targets */}
                      {!isSunday && TIME_SLOTS.map((time, i) => {
                        if (occupied.has(i)) return null;
                        const slotId = `${dayKey}-${key}-${time}`;
                        return (
                          <div
                            key={`drop-${time}`}
                            className={cn(
                              'absolute left-0.5 right-0.5 transition-colors rounded-full',
                              dragOver === slotId && 'bg-primary/20 border border-primary/50'
                            )}
                            style={{ top: i * SLOT_HEIGHT, height: SLOT_HEIGHT }}
                            onDragOver={(e) => { e.preventDefault(); setDragOver(slotId); }}
                            onDragLeave={() => setDragOver(null)}
                            onDrop={(e) => {
                              e.preventDefault();
                              setDragOver(null);
                              if (dragged && onDragMove) {
                                onDragMove(
                                  dragged.consultation,
                                  dragged.fromDate, dragged.fromTime, dragged.fromKey,
                                  day, time, key,
                                );
                              }
                              setDragged(null);
                            }}
                          />
                        );
                      })}

                      {/* Blocks + appointments */}
                      {primary.map(({ slot, startIdx, spanCount }) => {
                        if (slot.status === 'bloqueado') {
                          return (
                            <div
                              key={`blk-${slot.time}`}
                              className="absolute left-0.5 right-0.5 rounded bg-[#9E9E9E]/30 border-l-2 border-l-[#9E9E9E] flex items-center justify-center"
                              style={{ top: startIdx * SLOT_HEIGHT + 1, height: SLOT_HEIGHT - 2 }}
                            >
                              <span className="text-[11px] font-medium text-muted-foreground">
                                {slot.blockReason}
                              </span>
                            </div>
                          );
                        }
                        const c = slot.consultation!;
                        const category = c.category || 'restauracao';
                        const colors = CATEGORY_COLORS[category] || CATEGORY_COLORS.restauracao;
                        const pillEmoji = CATEGORY_PILL_EMOJIS[category];
                        const fullName = c.patient.name;
                        const displayName = scaleCfg.firstNameOnly ? fullName.split(' ')[0] : fullName;

                        return (
                          <div
                            key={c.id}
                            data-cat={category}
                            draggable
                            onDragStart={(e) => {
                              e.dataTransfer.effectAllowed = 'move';
                              setDragged({ consultation: c, fromDate: day, fromTime: slot.time, fromKey: key });
                            }}
                            onDragEnd={() => setDragged(null)}
                            className={cn(
                              'appt-block absolute left-0.5 right-0.5 rounded cursor-grab active:cursor-grabbing transition-all hover:shadow-lg flex flex-col',
                              scaleCfg.cardPad,
                              dragged?.consultation.id === c.id && 'opacity-40 border-2 border-dashed border-primary'
                            )}
                            style={{
                              top: startIdx * SLOT_HEIGHT + 1,
                              height: spanCount * SLOT_HEIGHT - 2,
                              minHeight: 44,
                              borderLeftWidth: '3px',
                              borderLeftColor: colors.hex,
                              backgroundColor: `${colors.hex}73`,
                            }}
                            onClick={() => onSlotClick(slot)}
                            onMouseEnter={() => onConsultationHover?.(c)}
                            onMouseLeave={() => onConsultationHover?.(null)}
                            onContextMenu={(e) => handleContextMenu(e, c)}
                          >
                            <div className="leading-tight min-w-0 w-full">
                              <div className="flex items-center gap-1 min-w-0">
                                <span className={cn('font-mono text-muted-foreground flex-shrink-0', scaleCfg.timeFs)}>
                                  {slot.time}
                                </span>
                                <span className={cn('font-semibold truncate text-white', scaleCfg.nameFs)}>
                                  {displayName}
                                </span>
                              </div>
                              <div className="mt-0.5 flex items-center gap-1 min-w-0">
                                <span
                                  className={cn(
                                    'inline-flex items-center gap-0.5 font-bold leading-none rounded-full flex-shrink-0',
                                    scaleCfg.pillFs
                                  )}
                                  style={{ ...getCategoryBadgeStyle(colors.hex), padding: scaleCfg.pillPad, whiteSpace: 'nowrap', overflow: 'visible' }}
                                  title={getCategoryLabel(t, category)}
                                >
                                  {scaleCfg.pillTextHidden ? (
                                    pillEmoji ? <span>{pillEmoji}</span> : <span style={{ width: 6, height: 6, borderRadius: 999, background: colors.hex, display: 'inline-block' }} />
                                  ) : (
                                    <>
                                      {getCategoryLabel(t, category)}
                                      {pillEmoji && <span style={{ fontSize: 'inherit', lineHeight: 1 }}>{pillEmoji}</span>}
                                    </>
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {contextMenu && (
        <ConsultationContextMenu
          consultation={contextMenu.consultation}
          position={contextMenu.position}
          onClose={() => setContextMenu(null)}
          onStatusChange={(c, s) => { onStatusChange?.(c, s); setContextMenu(null); }}
          onCopy={(c) => { onCopy?.(c); setContextMenu(null); }}
          onViewProfile={() => setContextMenu(null)}
          onSendMessage={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}
