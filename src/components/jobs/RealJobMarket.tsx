import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { ArrowLeft, Briefcase, MapPin, Plus, Send, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useDirectory } from '@/data/directorySource';
import { supabase } from '@/integrations/supabase/client';
import { fetchDisplayNames } from '@/data/displayNames';
import { formatDate, weekdayLabels } from '@/lib/formatters';
import {
  applyToJob, createJobPost, listJobApplications, listJobPosts, setJobPostStatus, withdrawApplication,
  type JobApplication, type JobPost,
} from '@/data/clinicalDocs';
import type { UserRole } from '@/types/calendar';

const CONTRACTS = ['fullTime', 'partTime', 'freelancer', 'replacement'] as const;
const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;

/**
 * Real job market. Clinic owner: publish posts (approved clinics only), see applications to own posts.
 * Approved dentist: see open posts, apply with a message, see own applications.
 * RLS keeps competitors blind to each other's posts/applications; patients never reach this screen.
 */
export function RealJobMarket({ userRole, onBack }: { userRole: UserRole; onBack: () => void }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const dir = useDirectory();
  const dayLabels = weekdayLabels('short');
  const [posts, setPosts] = useState<JobPost[]>([]);
  const [apps, setApps] = useState<JobApplication[]>([]);
  const [clinicNames, setClinicNames] = useState<Map<string, { name: string; approved: boolean }>>(new Map());
  const [names, setNames] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [creating, setCreating] = useState(false);
  const [applyTo, setApplyTo] = useState<JobPost | null>(null);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ clinic_id: '', title: '', contract_type: 'fullTime', days: [] as string[], city: '', description: '' });

  const ownedClinics = useMemo(() => (userRole === 'clinic' ? dir.clinics : []), [dir.clinics, userRole]);

  const load = useCallback(async () => {
    setLoading(true); setError(false);
    try {
      const [p, a] = await Promise.all([listJobPosts(), listJobApplications()]);
      setPosts(p); setApps(a);
      const cids = Array.from(new Set([...p.map((x) => x.clinic_id), ...ownedClinics.map((c) => c.id)]));
      if (cids.length) {
        const { data } = await supabase.from('clinics').select('id, name, verification_status').in('id', cids);
        setClinicNames(new Map((data ?? []).map((c) => [c.id, { name: c.name, approved: c.verification_status === 'aprovado' }])));
      }
      if (userRole === 'clinic' && a.length) setNames(await fetchDisplayNames(a.map((x) => x.dentist_id)));
    } catch { setError(true); } finally { setLoading(false); }
  }, [ownedClinics, userRole]);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => { if (!form.clinic_id && ownedClinics[0]) setForm((f) => ({ ...f, clinic_id: ownedClinics[0].id })); }, [ownedClinics, form.clinic_id]);

  const publish = async () => {
    if (!user) return;
    try {
      await createJobPost({ clinic_id: form.clinic_id, title: form.title.trim(), contract_type: form.contract_type, days: form.days, city: form.city.trim() || null, description: form.description.trim() || null }, user.id);
      toast.success(t('jobsReal.published')); setCreating(false);
      setForm((f) => ({ ...f, title: '', days: [], city: '', description: '' })); void load();
    } catch { toast.error(t('jobsReal.publishError')); }
  };
  const apply = async () => {
    if (!user || !applyTo) return;
    try { await applyToJob(applyTo.id, user.id, message); toast.success(t('jobsReal.applied')); setApplyTo(null); setMessage(''); void load(); }
    catch { toast.error(t('jobsReal.applyError')); }
  };

  const dayText = (days: string[]) => days.map((d) => dayLabels[DAYS.indexOf(d as typeof DAYS[number])]).filter(Boolean).join(', ');
  const canPublish = ownedClinics.some((c) => clinicNames.get(c.id)?.approved);

  const PostCard = ({ p, children }: { p: JobPost; children?: React.ReactNode }) => (
    <div className="p-4 rounded-xl border border-border bg-card space-y-2" data-testid="job-post">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate">{p.title}</p>
          <p className="text-xs text-muted-foreground">{clinicNames.get(p.clinic_id)?.name ?? ''}</p>
        </div>
        <Badge variant={p.status === 'aberta' ? 'secondary' : 'outline'}>{t(`jobsReal.status.${p.status}`)}</Badge>
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />{t(`jobs.${p.contract_type}`)}</span>
        {p.city && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{p.city}</span>}
        {p.days.length > 0 && <span>{dayText(p.days)}</span>}
        <span>{formatDate(new Date(p.created_at), { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
      </div>
      {p.description && <p className="text-sm whitespace-pre-wrap">{p.description}</p>}
      {children}
    </div>
  );

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto w-full space-y-5 pb-28" data-testid="real-jobs">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" aria-label={t('a11y.back')} onClick={onBack}><ArrowLeft className="w-5 h-5" /></Button>
        <h1 className="text-xl font-bold flex-1">{t('jobsReal.title')}</h1>
        {userRole === 'clinic' && canPublish && <Button size="sm" className="gap-1" onClick={() => setCreating(true)}><Plus className="w-4 h-4" />{t('jobsReal.newPost')}</Button>}
      </div>
      {userRole === 'clinic' && !loading && !canPublish && <p className="text-sm text-muted-foreground">{t('jobsReal.clinicNotApproved')}</p>}
      {loading ? <Skeleton className="h-32 w-full" /> : error ? <p className="text-sm text-destructive">{t('docs.loadError')}</p> : userRole === 'clinic' ? (
        posts.length === 0 ? <p className="text-sm text-muted-foreground text-center py-10">{t('jobsReal.noOwnPosts')}</p> : (
          <div className="space-y-3">{posts.map((p) => {
            const pa = apps.filter((a) => a.post_id === p.id);
            return (
              <PostCard key={p.id} p={p}>
                <div className="pt-2 border-t border-border space-y-2">
                  <p className="text-xs font-semibold flex items-center gap-1"><Users className="w-3.5 h-3.5" />{t('jobsReal.applications', { count: pa.length })}</p>
                  {pa.map((a) => (
                    <div key={a.id} className="text-xs p-2 rounded-lg bg-secondary/50">
                      <p className="font-medium">{names.get(a.dentist_id) ?? '—'} · {formatDate(new Date(a.created_at), { day: '2-digit', month: '2-digit' })}</p>
                      {a.message && <p className="text-muted-foreground whitespace-pre-wrap">{a.message}</p>}
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={() => void setJobPostStatus(p.id, p.status === 'aberta' ? 'fechada' : 'aberta').then(load).catch(() => toast.error(t('jobsReal.publishError')))}>
                    {p.status === 'aberta' ? t('jobsReal.close') : t('jobsReal.reopen')}
                  </Button>
                </div>
              </PostCard>
            );
          })}</div>
        )
      ) : (
        posts.length === 0 ? <p className="text-sm text-muted-foreground text-center py-10">{t('jobsReal.noPosts')}</p> : (
          <div className="space-y-3">{posts.map((p) => {
            const mine = apps.find((a) => a.post_id === p.id && a.dentist_id === user?.id);
            return (
              <PostCard key={p.id} p={p}>
                {mine ? (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{t('jobsReal.youApplied')}</Badge>
                    <Button variant="ghost" size="sm" onClick={() => void withdrawApplication(mine.id).then(load)}>{t('jobsReal.withdraw')}</Button>
                  </div>
                ) : (
                  <Button size="sm" className="gap-1" onClick={() => setApplyTo(p)}><Send className="w-4 h-4" />{t('jobsReal.apply')}</Button>
                )}
              </PostCard>
            );
          })}</div>
        )
      )}

      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{t('jobsReal.newPost')}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            {ownedClinics.length > 1 && (
              <Select value={form.clinic_id} onValueChange={(v) => setForm({ ...form, clinic_id: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{ownedClinics.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            )}
            <div className="space-y-1"><Label>{t('jobsReal.postTitle')}</Label><Input maxLength={120} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div className="space-y-1"><Label>{t('jobsReal.contract')}</Label>
              <Select value={form.contract_type} onValueChange={(v) => setForm({ ...form, contract_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CONTRACTS.map((c) => <SelectItem key={c} value={c}>{t(`jobs.${c}`)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>{t('jobsReal.days')}</Label>
              <div className="flex flex-wrap gap-2">{DAYS.map((d, i) => (
                <Button key={d} type="button" size="sm" variant={form.days.includes(d) ? 'default' : 'outline'}
                  onClick={() => setForm({ ...form, days: form.days.includes(d) ? form.days.filter((x) => x !== d) : [...form.days, d] })}>{dayLabels[i]}</Button>
              ))}</div>
            </div>
            <div className="space-y-1"><Label>{t('jobsReal.city')}</Label><Input maxLength={120} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
            <div className="space-y-1"><Label>{t('jobsReal.description')}</Label><Textarea maxLength={4000} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreating(false)}>{t('common.cancel')}</Button>
            <Button disabled={form.title.trim().length < 3 || !form.clinic_id} onClick={() => void publish()}>{t('jobsReal.publish')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!applyTo} onOpenChange={(o) => { if (!o) { setApplyTo(null); setMessage(''); } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('jobsReal.applyTo', { title: applyTo?.title ?? '' })}</DialogTitle></DialogHeader>
          <Textarea maxLength={2000} value={message} onChange={(e) => setMessage(e.target.value)} placeholder={t('jobsReal.messagePlaceholder')} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setApplyTo(null)}>{t('common.cancel')}</Button>
            <Button onClick={() => void apply()}>{t('jobsReal.apply')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
