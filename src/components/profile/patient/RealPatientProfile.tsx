import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pencil, Mail, Phone, Cake, Users, HeartPulse } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useDirectory } from '@/data/directorySource';
import { usePointsData } from '@/data/pointsSource';
import { getLevelForXP } from '@/data/pointsData';
import { parseSelfDeclared, type SelfDeclared } from '@/data/dossierSource';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PersonAvatar } from '@/components/ui/person-avatar';
import { formatDate, formatNumber } from '@/lib/formatters';

interface OwnRow { full_name: string | null; email: string | null; phone: string | null; date_of_birth: string | null; avatar_url: string | null }

/** Patient's own profile for real accounts — only their own saved data, nothing invented. */
export function RealPatientProfile({ onEditProfile }: { onEditProfile: () => void }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const dir = useDirectory();
  const points = usePointsData('patient');
  const level = getLevelForXP(points.xp);
  const [me, setMe] = useState<OwnRow | null>(null);
  const [health, setHealth] = useState<SelfDeclared | null>(null);
  const [visits, setVisits] = useState<{ total: number; tele: number } | null>(null);

  useEffect(() => {
    if (!user) return;
    let alive = true;
    void Promise.all([
      supabase.from('profiles').select('full_name, email, phone, date_of_birth, avatar_url').eq('id', user.id).maybeSingle(),
      supabase.from('patients').select('self_health').eq('id', user.id).maybeSingle(),
      supabase.from('appointments').select('is_teleconsultation').eq('patient_id', user.id).in('status', ['visto', 'concluida']),
    ]).then(([p, h, a]) => {
      if (!alive) return;
      setMe((p.data as OwnRow) ?? { full_name: null, email: user.email ?? null, phone: null, date_of_birth: null, avatar_url: null });
      setHealth(parseSelfDeclared(h.data?.self_health));
      const rows = a.data ?? [];
      setVisits({ total: rows.length, tele: rows.filter((r) => r.is_teleconsultation).length });
    });
    return () => { alive = false; };
  }, [user]);

  if (!me) return <div className="p-6 space-y-3"><Skeleton className="h-24 w-full" /><Skeleton className="h-40 w-full" /></div>;
  const family = dir.familyMembers.filter((m) => !m.self);
  const none = <span className="text-muted-foreground">{t('patientProfileReal.none')}</span>;
  const chips = (xs: string[]) => (xs.length ? <div className="flex flex-wrap gap-1.5">{xs.map((x) => <span key={x} className="text-xs px-2 py-1 rounded-full bg-secondary text-foreground">{x}</span>)}</div> : none);

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-4" data-testid="real-patient-profile">
      <section className="bg-card/40 border border-border rounded-xl p-5 flex items-center gap-4">
        <PersonAvatar name={me.full_name ?? ''} photo={me.avatar_url ?? undefined} size="xl" />
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-foreground truncate">{me.full_name || t('patientProfileReal.noName')}</h2>
          <p className="text-sm text-muted-foreground">{t('patientProfileReal.levelLine', { level: t(LEVEL_TRANSLATION_KEYS[level.key] || level.name), xp: formatNumber(points.xp), points: formatNumber(points.rewardPoints) })}</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={onEditProfile}><Pencil className="w-4 h-4" />{t('profile.editProfile')}</Button>
      </section>

      <section className="bg-card/40 border border-border rounded-xl p-5 space-y-2 text-sm">
        <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-muted-foreground" />{me.email || none}</p>
        <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-muted-foreground" />{me.phone || none}</p>
        <p className="flex items-center gap-2"><Cake className="w-4 h-4 text-muted-foreground" />{me.date_of_birth ? formatDate(me.date_of_birth) : none}</p>
      </section>

      <section className="bg-card/40 border border-border rounded-xl p-5 space-y-3 text-sm">
        <h3 className="font-semibold text-foreground flex items-center gap-2"><HeartPulse className="w-4 h-4" />{t('patientProfileReal.selfDeclared')}</h3>
        <div><p className="text-xs text-muted-foreground mb-1">{t('consultationDetail.allergies')}</p>{chips(health?.allergies ?? [])}</div>
        <div><p className="text-xs text-muted-foreground mb-1">{t('patientProfileReal.conditions')}</p>{chips(health?.conditions ?? [])}</div>
        <div><p className="text-xs text-muted-foreground mb-1">{t('patientProfileReal.medications')}</p>{chips((health?.medications ?? []).map((m) => [m.name, m.dosage].filter(Boolean).join(' ')))}</div>
      </section>

      <section className="bg-card/40 border border-border rounded-xl p-5 space-y-2 text-sm">
        <h3 className="font-semibold text-foreground flex items-center gap-2"><Users className="w-4 h-4" />{t('patientProfileReal.family')}</h3>
        {family.length ? family.map((m) => <p key={m.id}>{m.name}</p>) : none}
      </section>

      {visits && (
        <section className="bg-card/40 border border-border rounded-xl p-5 grid grid-cols-2 gap-3 text-center">
          <div><p className="text-xl font-bold text-foreground">{formatNumber(visits.total)}</p><p className="text-xs text-muted-foreground">{t('patientProfileReal.visits')}</p></div>
          <div><p className="text-xl font-bold text-foreground">{formatNumber(visits.tele)}</p><p className="text-xs text-muted-foreground">{t('patientProfileReal.teleVisits')}</p></div>
        </section>
      )}
    </div>
  );
}
