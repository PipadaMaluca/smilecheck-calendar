import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { Ban, CalendarPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TimeSlot } from '@/types/calendar';

/** Real absence block (diagonal stripes + reason) — same family as the demo blocks. */
export function AgendaExceptionBlock({ slot, style, className, compact }: { slot: TimeSlot; style?: CSSProperties; className?: string; compact?: boolean }) {
  const { t } = useTranslation();
  const color = slot.blockColor;
  return (
    <div
      data-agenda-exception="ausencia"
      role="note"
      aria-label={`${t('exceptionsReal.absence')}: ${slot.blockReason || ''}`}
      title={slot.blockReason || t('exceptionsReal.absence')}
      className={cn('agenda-exception-block rounded flex items-center justify-center gap-1 overflow-hidden border-l-2 px-1', className)}
      style={{ ...(color ? ({ '--exc-color': color } as CSSProperties) : {}), ...style }}
    >
      {!compact && <Ban className="w-3 h-3 shrink-0 text-muted-foreground" aria-hidden />}
      <span className="text-2xs font-medium text-muted-foreground truncate">{slot.blockReason || t('exceptionsReal.absence')}</span>
    </div>
  );
}

/** Exceptional opening band drawn under free slots (never blocks clicks). */
export function AgendaOpeningBand({ reason, color, style, className }: { reason?: string; color?: string; style?: CSSProperties; className?: string }) {
  const { t } = useTranslation();
  return (
    <div
      data-agenda-exception="abertura"
      aria-hidden
      title={reason || t('exceptionsReal.opening')}
      className={cn('agenda-opening-band pointer-events-none rounded flex items-start justify-end p-0.5', className)}
      style={{ ...(color ? ({ '--exc-color': color } as CSSProperties) : {}), ...style }}
    >
      <span className="flex items-center gap-0.5 text-2xs font-medium text-success truncate">
        <CalendarPlus className="w-3 h-3 shrink-0" aria-hidden />{reason || t('exceptionsReal.opening')}
      </span>
    </div>
  );
}

/** Consecutive opening slots as runs: index of the first slot (in `slots`) + length. */
export function openingRuns(slots: TimeSlot[]): { time: string; span: number; reason?: string; color?: string }[] {
  const out: { time: string; span: number; reason?: string; color?: string; id?: string }[] = [];
  slots.forEach((s) => {
    if (s.exceptionKind !== 'abertura') return;
    const last = out[out.length - 1];
    const prevIdx = last ? slots.findIndex((x) => x.time === last.time) + last.span : -1;
    if (last && last.id === s.exceptionId && slots[prevIdx] === s) last.span += 1;
    else out.push({ time: s.time, span: 1, reason: s.blockReason, color: s.blockColor, id: s.exceptionId });
  });
  return out.map(({ id: _id, ...r }) => r);
}
