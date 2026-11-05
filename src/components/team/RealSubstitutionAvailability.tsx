import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, MessageCircle, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { PersonAvatar } from '@/components/ui/person-avatar';
import { formatDate, formatNumber } from '@/lib/formatters';
import { startConversation } from '@/data/conversationsSource';
import { OPEN_CONVERSATION_KEY } from '@/components/conversations/RealConversations';

/**
 * Substitution availability (real accounts). Dentists manage their own windows
 * (RLS: own rows); only owners of approved clinics read them, through
 * `list_dentist_availability` (public name only), and contact by opening a conversation.
 */
interface Row { id: string; dentist_id: string; dentist_name?: string | null; avatar_url?: string | null; starts_at: string; ends_at: string; city: string; radius_km: number; notes: string | null }
const range = (r: Row) => `${formatDate(r.starts_at, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} – ${formatDate(r.ends_at, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}`;

export function DentistSubstitutionAvailability() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [f, setF] = useState({ start: '', end: '', city: '', radius: '20', notes: '' });
  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from('dentist_availability' as never).select('*').eq('dentist_id', user.id).order('starts_at');
    setRows((data ?? []) as unknown as Row[]);
  }, [user]);
  useEffect(() => { void load(); }, [load]);
  const valid = f.start && f.end && new Date(f.end) > new Date(f.start) && f.city.trim();
  const add = async () => {
    if (!user || !valid) return;
    const { error } = await supabase.from('dentist_availability' as never).insert({
      dentist_id: user.id, starts_at: new Date(f.start).toISOString(), ends_at: new Date(f.end).toISOString(),
      city: f.city.trim(), radius_km: Math.max(0, Math.min(300, Number(f.radius) || 0)), notes: f.notes.trim() || null,
    } as never);
    if (error) { toast.error(t('availReal.saveError')); return; }
    setF({ start: '', end: '', city: '', radius: '20', notes: '' }); toast.success(t('availReal.published')); void load();
  };
  const remove = async (id: string) => {
    const { error } = await supabase.from('dentist_availability' as never).delete().eq('id', id);
    if (error) toast.error(t('availReal.saveError')); else void load();
  };
  return (
    <Card>
      <CardHeader className="pb-3"><CardTitle className="text-base">{t('availReal.dentistTitle')}</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{t('availReal.dentistHint')}</p>
        {rows === null ? <Skeleton className="h-12" /> : rows.length === 0 ? <p className="text-sm text-muted-foreground italic">{t('availReal.none')}</p> : rows.map((r) => (
          <div key={r.id} className="flex items-center justify-between gap-2 p-3 rounded-lg bg-secondary/50">
            <div className="min-w-0">
              <p className="text-sm font-medium">{range(r)}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{r.city} · {t('availReal.radius', { km: formatNumber(r.radius_km) })}</p>
            </div>
            <Button variant="ghost" size="icon" aria-label={t('a11y.remove')} onClick={() => remove(r.id)}><Trash2 className="w-4 h-4" /></Button>
          </div>
        ))}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <label className="space-y-1"><span className="text-xs text-muted-foreground">{t('availReal.from')}</span><Input type="datetime-local" value={f.start} onChange={(e) => setF({ ...f, start: e.target.value })} /></label>
          <label className="space-y-1"><span className="text-xs text-muted-foreground">{t('availReal.to')}</span><Input type="datetime-local" value={f.end} onChange={(e) => setF({ ...f, end: e.target.value })} /></label>
          <label className="space-y-1"><span className="text-xs text-muted-foreground">{t('availReal.city')}</span><Input value={f.city} maxLength={120} onChange={(e) => setF({ ...f, city: e.target.value })} /></label>
          <label className="space-y-1"><span className="text-xs text-muted-foreground">{t('availReal.radiusLabel')}</span><Input inputMode="numeric" value={f.radius} onChange={(e) => setF({ ...f, radius: e.target.value.replace(/\D/g, '').slice(0, 3) })} /></label>
          <label className="space-y-1 md:col-span-2"><span className="text-xs text-muted-foreground">{t('availReal.notes')}</span><Input value={f.notes} maxLength={500} onChange={(e) => setF({ ...f, notes: e.target.value })} /></label>
        </div>
        <Button size="sm" className="gap-1" disabled={!valid} onClick={add}><Plus className="w-4 h-4" />{t('availReal.publish')}</Button>
      </CardContent>
    </Card>
  );
}

export function ClinicSubstitutionAvailability({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  const { t } = useTranslation();
  const [rows, setRows] = useState<Row[] | null>(null);
  useEffect(() => {
    void supabase.rpc('list_dentist_availability' as never).then(({ data }) => setRows((Array.isArray(data) ? data : []) as unknown as Row[]));
  }, []);
  const contact = async (dentistId: string) => {
    try {
      const id = await startConversation(dentistId);
      sessionStorage.setItem(OPEN_CONVERSATION_KEY, id);
      onNavigate?.('conversas');
    } catch { toast.error(t('chatReal.errors.no_relationship')); }
  };
  return (
    <Card>
      <CardHeader className="pb-3"><CardTitle className="text-base">{t('availReal.clinicTitle')}</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        {rows === null ? <Skeleton className="h-12" /> : rows.length === 0 ? <p className="text-sm text-muted-foreground italic">{t('availReal.clinicNone')}</p> : rows.map((r) => (
          <div key={r.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
            <PersonAvatar name={r.dentist_name ?? '—'} photo={r.avatar_url} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{r.dentist_name ?? '—'}</p>
              <p className="text-xs text-muted-foreground">{range(r)} · {r.city} · {t('availReal.radius', { km: formatNumber(r.radius_km) })}</p>
              {r.notes && <p className="text-xs text-muted-foreground truncate">{r.notes}</p>}
            </div>
            <Button size="sm" variant="outline" className="gap-1" onClick={() => contact(r.dentist_id)}><MessageCircle className="w-4 h-4" />{t('availReal.contact')}</Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
