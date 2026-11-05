import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Check, Download, Search, Building2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContext';
import { useDirectory } from '@/data/directorySource';
import { supabase } from '@/integrations/supabase/client';
import { awardPointsSilently } from '@/data/pointsWrites';
import { downloadDocumentPdf, issueReferralLetter } from '@/data/clinicalDocs';
import { PatientPicker, type PickedPatient } from '@/components/clinical/PatientPicker';

type Step = 'patient' | 'recipient' | 'details' | 'preview' | 'success';
interface Recipient { kind: 'dentist' | 'clinic' | 'external'; id?: string; name: string }

/** Real referral letter: recipient from the real (approved) search or free text; issued server-side, immutable. */
export function RealReferralFlow({ onClose, onGoHome }: { onClose: () => void; onGoHome?: () => void }) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const dir = useDirectory();
  const myClinics = useMemo(() => dir.clinics.filter((c) => dir.clinicDentists.some((m) => m.clinicId === c.id && m.dentistId === user?.id)), [dir.clinics, dir.clinicDentists, user?.id]);
  const [step, setStep] = useState<Step>('patient');
  const [patient, setPatient] = useState<PickedPatient | null>(null);
  const [q, setQ] = useState('');
  const [hits, setHits] = useState<{ id: string; kind: string; name: string }[]>([]);
  const [recipient, setRecipient] = useState<Recipient | null>(null);
  const [external, setExternal] = useState('');
  const [reason, setReason] = useState('');
  const [summary, setSummary] = useState('');
  const [urgency, setUrgency] = useState<'normal' | 'urgente'>('normal');
  const [clinicId, setClinicId] = useState('');
  const [busy, setBusy] = useState(false);
  const [issuedId, setIssuedId] = useState<string | null>(null);

  useEffect(() => { if (!clinicId && myClinics[0]) setClinicId(myClinics[0].id); }, [myClinics, clinicId]);
  useEffect(() => {
    if (step !== 'recipient') return;
    let alive = true;
    const h = setTimeout(() => {
      void supabase.rpc('search_professionals' as never, {
        _q: q.trim() || null, _kind: 'all', _specialty: null, _city_or_postal: null, _lat: null, _lng: null, _max_km: null,
        _language: null, _available: 'any', _sort: 'name', _limit: 10, _cursor: 0,
      } as never).then(({ data }) => {
        if (!alive) return;
        setHits(((data ?? []) as { id: string; kind: string; name: string }[]).filter((r) => r.id !== user?.id));
      });
    }, 250);
    return () => { alive = false; clearTimeout(h); };
  }, [q, step, user?.id]);

  const steps: Step[] = ['patient', 'recipient', 'details', 'preview'];
  const idx = steps.indexOf(step);
  const rec: Recipient | null = recipient ?? (external.trim() ? { kind: 'external', name: external.trim() } : null);
  const can = step === 'patient' ? !!patient : step === 'recipient' ? !!rec : step === 'details' ? reason.trim().length >= 3 && !!clinicId : true;

  const send = async () => {
    if (!patient || !rec) return;
    setBusy(true);
    try {
      const id = await issueReferralLetter({
        patientId: patient.id, clinicId, reason, summary, urgency, familyMemberId: patient.familyMemberId,
        toDentistId: rec.kind === 'dentist' ? rec.id : null, toClinicId: rec.kind === 'clinic' ? rec.id : null,
        toExternal: rec.kind === 'external' ? rec.name : null,
      });
      setIssuedId(id); setStep('success');
      if (user) awardPointsSilently(user.id, 'carta_referencia');
    } catch { toast.error(t('docs.issueError')); } finally { setBusy(false); }
  };

  return (
    <div className={cn('flex flex-col bg-background', isMobile ? 'fixed inset-0 z-modal' : 'flex-1')} data-testid="real-referral">
      <div className={cn('flex flex-col bg-background overflow-hidden', isMobile ? 'w-full h-full pb-14' : 'w-full h-full max-w-2xl mx-auto')}>
        <div className="flex items-center justify-center p-4 border-b border-border flex-shrink-0">
          <h1 className="font-bold text-center text-lg">{t('referral.title')}</h1>
        </div>
        {step !== 'success' && (
          <div className="max-w-[600px] mx-auto w-full space-y-2 px-3.5 py-2.5">
            <p className="text-xs text-muted-foreground text-center">{t('prescription.step', { current: idx + 1, total: steps.length })}</p>
            <div className="flex gap-2">{steps.map((s, i) => <div key={s} className={cn('h-1.5 flex-1 rounded-full', i <= idx ? 'bg-primary' : 'bg-muted')} />)}</div>
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-4 max-w-[600px] mx-auto w-full space-y-4">
          {step === 'patient' && (<>
            <h2 className="text-lg font-bold text-center">{t('docs.whichPatient')}</h2>
            <PatientPicker value={patient} onChange={setPatient} />
          </>)}
          {step === 'recipient' && (<>
            <h2 className="text-lg font-bold text-center">{t('docs.toWhom')}</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('docs.searchRecipient')} className="pl-9" />
            </div>
            <div className="space-y-2">{hits.map((h) => {
              const sel = recipient?.id === h.id;
              return (
                <button key={`${h.kind}-${h.id}`} type="button" onClick={() => { setRecipient({ kind: h.kind === 'clinic' ? 'clinic' : 'dentist', id: h.id, name: h.name }); setExternal(''); }}
                  className={cn('w-full flex items-center gap-2.5 p-2.5 rounded-lg border text-left', sel ? 'border-primary bg-primary/10' : 'border-border hover:border-primary')}>
                  {h.kind === 'clinic' ? <Building2 className="w-4 h-4 text-primary" /> : <User className="w-4 h-4 text-primary" />}
                  <span className="text-sm flex-1">{h.name}</span>
                  {sel && <Check className="w-4 h-4 text-primary" />}
                </button>
              );
            })}</div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">{t('docs.externalRecipient')}</p>
              <Input value={external} maxLength={300} onChange={(e) => { setExternal(e.target.value); if (e.target.value) setRecipient(null); }} placeholder={t('docs.externalPlaceholder')} />
            </div>
          </>)}
          {step === 'details' && (<>
            <h2 className="text-lg font-bold">{t('docs.letterDetails')}</h2>
            {myClinics.length > 1 && (
              <Select value={clinicId} onValueChange={setClinicId}>
                <SelectTrigger><SelectValue placeholder={t('docs.clinic')} /></SelectTrigger>
                <SelectContent>{myClinics.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            )}
            <Input value={reason} maxLength={500} onChange={(e) => setReason(e.target.value)} placeholder={t('docs.reason')} />
            <Textarea value={summary} maxLength={4000} onChange={(e) => setSummary(e.target.value)} placeholder={t('docs.summary')} className="min-h-[140px]" />
            <div className="flex gap-2">
              {(['normal', 'urgente'] as const).map((u) => (
                <Button key={u} type="button" size="sm" variant={urgency === u ? 'default' : 'outline'} className="flex-1" onClick={() => setUrgency(u)}>{t(`docs.urgencyLevel.${u}`)}</Button>
              ))}
            </div>
            {myClinics.length === 0 && <p className="text-xs text-destructive">{t('docs.noClinic')}</p>}
          </>)}
          {step === 'preview' && patient && rec && (
            <div className="rounded-lg border border-border bg-card p-5 space-y-2 text-sm">
              <p><span className="font-semibold">{t('docs.patient')}:</span> {patient.familyName ?? patient.name}</p>
              <p><span className="font-semibold">{t('docs.to')}:</span> {rec.name}</p>
              <p><span className="font-semibold">{t('docs.urgency')}:</span> {t(`docs.urgencyLevel.${urgency}`)}</p>
              <p><span className="font-semibold">{t('docs.reason')}:</span> {reason}</p>
              {summary && <p className="whitespace-pre-wrap text-muted-foreground">{summary}</p>}
              <p className="text-xs text-muted-foreground pt-2">{rec.kind === 'external' ? t('docs.externalNote') : t('docs.recipientNote')}</p>
              <p className="text-xs text-muted-foreground">{t('docs.immutableNote')}</p>
            </div>
          )}
          {step === 'success' && (
            <div className="text-center space-y-4 py-8">
              <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto"><Check className="w-8 h-8 text-success" /></div>
              <h2 className="text-xl font-bold">{t('docs.letterSent')}</h2>
              <div className="flex flex-col gap-2">
                <Button variant="outline" className="gap-2" onClick={() => issuedId && void downloadDocumentPdf('referral_letter', issuedId, t).catch(() => toast.error(t('docs.pdfError')))}>
                  <Download className="w-4 h-4" /> {t('docs.downloadPdf')}
                </Button>
                <Button onClick={() => (onGoHome ? onGoHome() : onClose())}>{t('prescription.goHome')}</Button>
              </div>
            </div>
          )}
        </div>
        {step !== 'success' && (
          <div className={cn('border-t border-border bg-card flex justify-center', isMobile ? 'fixed bottom-[60px] left-0 right-0 z-modal p-4' : 'p-3')}>
            <div className="flex gap-2 w-full max-w-[600px]">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => (idx === 0 ? onClose() : setStep(steps[idx - 1]))}>
                {idx === 0 ? t('referral.cancel') : t('referral.previous')}
              </Button>
              <Button size="sm" className="flex-1" disabled={!can || busy} onClick={() => (step === 'preview' ? void send() : setStep(steps[idx + 1]))}>
                {step === 'preview' ? t('referral.signAndSend') : step === 'details' ? t('referral.previewBtn') : t('referral.next')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
