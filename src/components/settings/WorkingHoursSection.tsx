import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { useDirectory, WEEKDAYS, type Weekday, type WorkingHours } from '@/data/directorySource';
import { saveWorkingHours, validateWorkingHours } from '@/data/directoryWrites';
import { weekdayLabels } from '@/lib/formatters';

interface DayRow { on: boolean; start: string; end: string; lunch: boolean; lunchStart: string; lunchEnd: string }

function toRows(wh: WorkingHours | undefined): Record<Weekday, DayRow> {
  const out = {} as Record<Weekday, DayRow>;
  for (const d of WEEKDAYS) {
    const iv = wh?.[d] ?? [];
    if (iv.length === 2) out[d] = { on: true, start: iv[0][0], end: iv[1][1], lunch: true, lunchStart: iv[0][1], lunchEnd: iv[1][0] };
    else if (iv.length === 1) out[d] = { on: true, start: iv[0][0], end: iv[0][1], lunch: false, lunchStart: '13:00', lunchEnd: '14:00' };
    else out[d] = { on: false, start: '09:00', end: '18:00', lunch: false, lunchStart: '13:00', lunchEnd: '14:00' };
  }
  return out;
}

export function toWorkingHours(rows: Record<Weekday, DayRow>): WorkingHours {
  const wh: WorkingHours = {};
  for (const d of WEEKDAYS) {
    const r = rows[d];
    if (!r.on) continue;
    wh[d] = r.lunch ? [[r.start, r.lunchStart], [r.lunchEnd, r.end]] : [[r.start, r.end]];
  }
  return wh;
}

function ClinicHours({ memberId, clinicName, initial, onSaved }: { memberId: string; clinicName: string; initial?: WorkingHours; onSaved: () => void }) {
  const { t } = useTranslation();
  const labels = weekdayLabels('long');
  const [rows, setRows] = useState(() => toRows(initial));
  const [saving, setSaving] = useState(false);
  useEffect(() => setRows(toRows(initial)), [initial]);
  const set = (d: Weekday, patch: Partial<DayRow>) => setRows((p) => ({ ...p, [d]: { ...p[d], ...patch } }));

  const save = async () => {
    const wh = toWorkingHours(rows);
    if (!validateWorkingHours(wh)) { toast.error(t('directory.hours.invalid')); return; }
    setSaving(true);
    try { await saveWorkingHours(memberId, wh); toast.success(t('directory.hours.saved')); onSaved(); }
    catch { toast.error(t('directory.hours.invalid')); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-foreground">{clinicName}</p>
      <div className="space-y-2">
        {WEEKDAYS.map((d, i) => {
          const r = rows[d];
          return (
            <div key={d} className="rounded-lg border border-border p-2 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Switch checked={r.on} onCheckedChange={(on) => set(d, { on })} aria-label={labels[i]} />
                <span className="text-sm w-24 capitalize">{labels[i]}</span>
                {r.on && (
                  <>
                    <Input type="time" aria-label={t('directory.hours.start')} value={r.start} onChange={(e) => set(d, { start: e.target.value })} className="w-28" />
                    <span className="text-muted-foreground">–</span>
                    <Input type="time" aria-label={t('directory.hours.end')} value={r.end} onChange={(e) => set(d, { end: e.target.value })} className="w-28" />
                  </>
                )}
              </div>
              {r.on && (
                <div className="flex flex-wrap items-center gap-2 pl-1">
                  <Switch checked={r.lunch} onCheckedChange={(lunch) => set(d, { lunch })} aria-label={t('directory.hours.lunch')} />
                  <span className="text-xs text-muted-foreground">{t('directory.hours.lunch')}</span>
                  {r.lunch && (
                    <>
                      <Input type="time" aria-label={t('directory.hours.lunchStart')} value={r.lunchStart} onChange={(e) => set(d, { lunchStart: e.target.value })} className="w-28" />
                      <span className="text-muted-foreground">–</span>
                      <Input type="time" aria-label={t('directory.hours.lunchEnd')} value={r.lunchEnd} onChange={(e) => set(d, { lunchEnd: e.target.value })} className="w-28" />
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex justify-end">
        <Button onClick={save} disabled={saving}>
          {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}{t('directory.hours.save')}
        </Button>
      </div>
    </div>
  );
}

/** Dentist Settings: one working-hours editor per clinic (real accounts only). */
export function WorkingHoursSection() {
  const { t } = useTranslation();
  const dir = useDirectory();
  if (dir.isDemo) return null;
  const mine = dir.clinicDentists.filter((m) => m.dentistId === dir.selfId && m.memberId);

  return (
    <Card className="bg-card/80 backdrop-blur border-border">
      <CardHeader className="pb-2">
        <CardTitle size="compact" className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" aria-hidden />{t('directory.hours.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {dir.loading ? <Skeleton className="h-40 w-full rounded-xl" />
          : mine.length === 0 ? <p className="text-sm text-muted-foreground">{t('noClinic.description')}</p>
          : mine.map((m) => (
            <ClinicHours key={m.memberId} memberId={m.memberId!} initial={m.workingHours}
              clinicName={dir.clinics.find((c) => c.id === m.clinicId)?.name ?? ''} onSaved={dir.refresh} />
          ))}
      </CardContent>
    </Card>
  );
}
