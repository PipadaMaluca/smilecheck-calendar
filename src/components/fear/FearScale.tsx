import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/formatters';
import { FEAR_LEVELS, FEAR_META, clampFear, effectiveFear, fearMismatch, type FearLevel } from '@/lib/fearScale';
import { fetchFearSummary, type FearSummary } from '@/data/fearSource';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';

/** 5-option picker (label + colour + icon). Used by the patient (self) and by professionals after an appointment. */
export function FearScalePicker({ value, onChange, showDescriptions = true, labelledBy }: {
  value: number | null;
  onChange: (level: FearLevel) => void;
  showDescriptions?: boolean;
  labelledBy?: string;
}) {
  const { t } = useTranslation();
  return (
    <div role="radiogroup" aria-labelledby={labelledBy} className="grid gap-2">
      {FEAR_LEVELS.map((lvl) => {
        const meta = FEAR_META[lvl];
        const Icon = meta.icon;
        const selected = value === lvl;
        return (
          <button
            key={lvl}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(lvl)}
            className={cn(
              'flex items-start gap-3 rounded-xl border px-3 py-2.5 text-left min-h-11 transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              selected ? cn(meta.bg, meta.border, 'border-2') : 'border-border hover:bg-muted/40'
            )}
          >
            <span className={cn('mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full', meta.bg)}>
              <Icon className={cn('h-4 w-4', meta.text)} aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-foreground">
                <span className={cn('tabular-nums mr-1.5', meta.text)}>{lvl}</span>
                {t(`fear.levels.${lvl}.label`)}
              </span>
              {showDescriptions && <span className="block text-xs text-muted-foreground">{t(`fear.levels.${lvl}.desc`)}</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** Small numbered dot for agenda cards (only shown from level 2). */
export function FearDot({ level }: { level: number }) {
  const { t } = useTranslation();
  const l = clampFear(level);
  if (l === null) return null;
  return (
    <span
      className={cn('inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-2xs font-bold tabular-nums', FEAR_META[l].bg, FEAR_META[l].text)}
      title={t('fear.chip', { level: l, label: t(`fear.levels.${l}.label`) })}
      aria-label={t('fear.chip', { level: l, label: t(`fear.levels.${l}.label`) })}
    >
      {l}
    </span>
  );
}

/** Professional view: chip "Medo 3 · Medo intenso" + "P 2 · C 3"; opens a panel with the scale, both values, suggested approach and history. */
export function FearChip({ patientId }: { patientId: string }) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [data, setData] = useState<FearSummary | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    fetchFearSummary(patientId).then((d) => alive && setData(d)).catch(() => alive && setData({ patientLevel: null, history: [] }));
    return () => { alive = false; };
  }, [patientId]);

  if (!data) return <div className="h-11 w-48 animate-pulse rounded-full bg-muted" aria-hidden="true" />;
  const pro = data.history[0]?.level ?? null;
  const eff = effectiveFear(data.patientLevel, pro);
  if (eff === null) return <p className="text-sm text-muted-foreground">{t('fear.noData')}</p>;
  const meta = FEAR_META[eff];
  const Icon = meta.icon;
  const mismatch = fearMismatch(data.patientLevel, pro);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn('inline-flex items-center gap-2 rounded-full border px-3 min-h-11 text-sm font-medium', meta.bg, meta.border, 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring')}
        aria-haspopup="dialog"
      >
        <Icon className={cn('h-4 w-4', meta.text)} aria-hidden="true" />
        <span className={meta.text}>{t('fear.chip', { level: eff, label: t(`fear.levels.${eff}.label`) })}</span>
        <span className="text-xs text-muted-foreground tabular-nums">
          {t('fear.shortValues', { p: data.patientLevel ?? '—', c: pro ?? '—' })}
        </span>
        {mismatch && <AlertTriangle className="h-3.5 w-3.5 text-warning" aria-label={t('fear.mismatch')} />}
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side={isMobile ? 'bottom' : 'right'} className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{t('fear.panelTitle')}</SheetTitle>
            <SheetDescription>{t('fear.panelSubtitle')}</SheetDescription>
          </SheetHeader>
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <ValueBox label={t('fear.patientValue')} level={data.patientLevel} />
              <ValueBox label={t('fear.professionalValue')} level={pro} date={data.history[0]?.createdAt} />
            </div>
            {mismatch && (
              <p className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />{t('fear.mismatch')}
              </p>
            )}
            <div className="rounded-xl border border-border p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('fear.suggestedApproach')}</p>
              <p className="mt-1 text-sm text-foreground">{t(`fear.levels.${eff}.conduct`)}</p>
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold">{t('fear.scaleTitle')}</p>
              <ul className="space-y-1.5">
                {FEAR_LEVELS.map((l) => (
                  <li key={l} className={cn('flex gap-2 rounded-lg px-2 py-1.5 text-xs', l === eff && FEAR_META[l].bg)}>
                    <span className={cn('w-4 font-bold tabular-nums', FEAR_META[l].text)}>{l}</span>
                    <span><span className="font-medium text-foreground">{t(`fear.levels.${l}.label`)}</span> — <span className="text-muted-foreground">{t(`fear.levels.${l}.desc`)}</span></span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold">{t('fear.history')}</p>
              {data.history.length === 0 ? (
                <p className="text-xs text-muted-foreground">{t('fear.noHistory')}</p>
              ) : (
                <ul className="space-y-1">
                  {data.history.map((h, i) => (
                    <li key={i} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{formatDate(h.createdAt, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      <span className={cn('font-semibold', FEAR_META[h.level].text)}>{h.level} · {t(`fear.levels.${h.level}.label`)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

function ValueBox({ label, level, date }: { label: string; level: number | null; date?: string }) {
  const { t } = useTranslation();
  const l = clampFear(level);
  return (
    <div className={cn('rounded-xl border p-3', l !== null ? cn(FEAR_META[l].bg, FEAR_META[l].border) : 'border-border')}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn('text-lg font-bold tabular-nums', l !== null ? FEAR_META[l].text : 'text-muted-foreground')}>{l ?? '—'}</p>
      {l !== null && <p className="text-xs text-foreground">{t(`fear.levels.${l}.label`)}</p>}
      {date && <p className="mt-1 text-2xs text-muted-foreground">{t('fear.lastAssessed', { date: formatDate(date, { day: 'numeric', month: 'short', year: 'numeric' }) })}</p>}
    </div>
  );
}
