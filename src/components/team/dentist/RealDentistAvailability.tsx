import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, Loader2, CalendarOff } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EmptyState } from '@/components/ui/empty-state';
import { WorkingHoursSection } from '@/components/settings/WorkingHoursSection';
import { useAuth } from '@/contexts/AuthContext';
import { useDirectory } from '@/data/directorySource';
import { formatDate } from '@/lib/formatters';
import { listExceptions, createExceptions, deleteException, type AgendaException } from '@/data/agendaExceptions';

const REASONS = ['availability.reasonHoliday', 'availability.reasonTraining', 'availability.reasonPersonal', 'availability.reasonOther'] as const;

export const exceptionReasonLabel = (reason: string, t: (k: string) => string) => (reason.startsWith('availability.') ? t(reason) : reason);

/** Real dentist availability: saved working hours + saved absences (no demo data). */
export function RealDentistAvailability() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const dir = useDirectory();
  const [rows, setRows] = useState<AgendaException[] | null>(null);
  const [form, setForm] = useState({ start: '', end: '', reason: REASONS[0] as string, note: '', clinicId: '' });
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    try { setRows(await listExceptions(user.id)); } catch { setRows([]); toast.error(t('exceptionsReal.loadFailed')); }
  }, [user, t]);
  useEffect(() => { void load(); }, [load]);

  const add = async () => {
    if (!user || !form.start) return;
    const end = form.end || form.start;
    if (end < form.start) { toast.error(t('exceptionsReal.endBeforeStart')); return; }
    const s = new Date(`${form.start}T00:00:00`); const e = new Date(`${end}T23:59:59`);
    setBusy(true);
    try {
      await createExceptions([{ dentist_id: user.id, clinic_id: form.clinicId || null, kind: 'ausencia', starts_at: s.toISOString(), ends_at: e.toISOString(), full_day: true, reason: form.reason, note: form.note.trim() || null, color: null }]);
      setForm({ start: '', end: '', reason: REASONS[0], note: '', clinicId: '' });
      toast.success(t('exceptionsReal.saved'));
      await load();
    } catch { toast.error(t('exceptionsReal.saveFailed')); } finally { setBusy(false); }
  };

  const remove = async (id: string) => {
    try { await deleteException(id); setRows((r) => (r ?? []).filter((x) => x.id !== id)); toast.success(t('exceptionsReal.deleted')); }
    catch { toast.error(t('exceptionsReal.saveFailed')); }
  };

  const clinicName = (id: string | null) => (id ? dir.clinics.find((c) => c.id === id)?.name : null) ?? t('exceptionsReal.allClinics');

  return (
    <div className="space-y-4">
      <WorkingHoursSection />
      <Card className="bg-card/80 border-border">
        <CardHeader className="pb-2"><CardTitle size="compact">{t('availability.exceptions')}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1"><Label htmlFor="ex-start" className="text-xs">{t('creationTabs.startDate')}</Label>
              <Input id="ex-start" type="date" value={form.start} onChange={(e) => setForm((f) => ({ ...f, start: e.target.value }))} /></div>
            <div className="space-y-1"><Label htmlFor="ex-end" className="text-xs">{t('creationTabs.endDate')}</Label>
              <Input id="ex-end" type="date" value={form.end} min={form.start || undefined} onChange={(e) => setForm((f) => ({ ...f, end: e.target.value }))} /></div>
            <div className="space-y-1"><Label className="text-xs">{t('exceptionsReal.reason')}</Label>
              <Select value={form.reason} onValueChange={(v) => setForm((f) => ({ ...f, reason: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{REASONS.map((r) => <SelectItem key={r} value={r}>{t(r)}</SelectItem>)}</SelectContent>
              </Select></div>
            <div className="space-y-1"><Label className="text-xs">{t('exceptionsReal.clinic')}</Label>
              <Select value={form.clinicId || 'all'} onValueChange={(v) => setForm((f) => ({ ...f, clinicId: v === 'all' ? '' : v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('exceptionsReal.allClinics')}</SelectItem>
                  {dir.clinics.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select></div>
          </div>
          <Textarea value={form.note} maxLength={1000} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} placeholder={t('exceptionsReal.notePlaceholder')} aria-label={t('exceptionsReal.notePlaceholder')} />
          <Button onClick={add} disabled={busy || !form.start} className="gap-2">{busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}{t('exceptionsReal.add')}</Button>

          {rows === null ? <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /> : rows.length === 0 ? (
            <EmptyState icon={CalendarOff} size="sm" title={t('exceptionsReal.empty')} />
          ) : (
            <ul className="space-y-2">
              {rows.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-secondary/50 border border-border/50">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{exceptionReasonLabel(r.reason, t) || t('exceptionsReal.absence')} · {clinicName(r.clinic_id)}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(r.starts_at)}{formatDate(r.starts_at) !== formatDate(r.ends_at) ? ` – ${formatDate(r.ends_at)}` : ''}{r.note ? ` · ${r.note}` : ''}</p>
                  </div>
                  <Button variant="ghost" size="icon" aria-label={t('exceptionsReal.delete')} onClick={() => remove(r.id)}><Trash2 className="w-4 h-4" /></Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
