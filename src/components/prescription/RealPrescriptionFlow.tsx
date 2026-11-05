import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { AlertTriangle, Check, Download, Plus, X, Pill, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useDirectory } from '@/data/directorySource';
import { useAuth } from '@/contexts/AuthContext';
import { awardPointsSilently } from '@/data/pointsWrites';
import { MEDICATIONS_WITH_TAGS, getMedicationAllergyBlock, getMedicationInteractions } from '@/data/drugSafetyData';
import { EMPTY_ITEM, cleanItems, downloadDocumentPdf, fetchSafety, issuePrescription, type RxItem } from '@/data/clinicalDocs';
import { dobDisplay } from '@/data/publicProfiles';
import { PatientPicker, type PickedPatient } from '@/components/clinical/PatientPicker';

type Step = 'patient' | 'items' | 'preview' | 'success';

/** Real prescription: active-relationship patient, safety from the real dossier, issued server-side (immutable). */
export function RealPrescriptionFlow({ onClose, onGoHome }: { onClose: () => void; onGoHome?: () => void }) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const dir = useDirectory();
  const myClinics = useMemo(() => dir.clinics.filter((c) => dir.clinicDentists.some((m) => m.clinicId === c.id && m.dentistId === user?.id)), [dir.clinics, dir.clinicDentists, user?.id]);
  const [step, setStep] = useState<Step>('patient');
  const [patient, setPatient] = useState<PickedPatient | null>(null);
  const [clinicId, setClinicId] = useState('');
  const [items, setItems] = useState<RxItem[]>([{ ...EMPTY_ITEM }]);
  const [notes, setNotes] = useState('');
  const [safety, setSafety] = useState<{ allergies: string[]; medications: { name: string; dosage: string }[] }>({ allergies: [], medications: [] });
  const [busy, setBusy] = useState(false);
  const [issuedId, setIssuedId] = useState<string | null>(null);

  useEffect(() => { if (!clinicId && myClinics[0]) setClinicId(myClinics[0].id); }, [myClinics, clinicId]);
  useEffect(() => {
    if (!patient) return;
    void fetchSafety(patient.id, patient.familyMemberId).then(setSafety).catch(() => setSafety({ allergies: [], medications: [] }));
  }, [patient?.id, patient?.familyMemberId]); // eslint-disable-line react-hooks/exhaustive-deps

  const check = (name: string) => {
    const def = MEDICATIONS_WITH_TAGS.find((m) => m.name.toLowerCase() === name.trim().toLowerCase());
    if (!def) return { block: null, inter: [] as ReturnType<typeof getMedicationInteractions> };
    return { block: getMedicationAllergyBlock(def, safety.allergies), inter: getMedicationInteractions(def, safety.medications) };
  };
  const valid = cleanItems(items);
  const blocked = valid.some((i) => !!check(i.medicamento).block);
  const steps: Step[] = ['patient', 'items', 'preview'];
  const idx = steps.indexOf(step);
  const setItem = (i: number, k: keyof RxItem, v: string) => setItems((p) => p.map((it, j) => (j === i ? { ...it, [k]: v } : it)));

  const issue = async () => {
    if (!patient || !clinicId) return;
    setBusy(true);
    try {
      const id = await issuePrescription({ patientId: patient.id, clinicId, items: valid, notes, familyMemberId: patient.familyMemberId });
      setIssuedId(id); setStep('success');
      if (user) awardPointsSilently(user.id, 'emitir_receita');
    } catch {
      toast.error(t('docs.issueError'));
    } finally { setBusy(false); }
  };

  const who = patient?.familyName ?? patient?.name ?? '';

  return (
    <div className={cn('flex flex-col bg-background', isMobile ? 'fixed inset-0 z-modal' : 'flex-1')} data-testid="real-prescription">
      <div className={cn('flex flex-col bg-background overflow-hidden', isMobile ? 'w-full h-full pb-14' : 'w-full h-full max-w-2xl mx-auto')}>
        <div className="flex items-center justify-center p-4 border-b border-border flex-shrink-0">
          <h1 className="font-bold text-center text-lg">{t('prescription.title')}</h1>
        </div>
        {step !== 'success' && (
          <div className="max-w-[600px] mx-auto w-full space-y-2 px-3.5 py-2.5">
            <p className="text-xs text-muted-foreground text-center">{t('prescription.step', { current: idx + 1, total: steps.length })}</p>
            <div className="flex gap-2">{steps.map((s, i) => <div key={s} className={cn('h-1.5 flex-1 rounded-full', i <= idx ? 'bg-primary' : 'bg-muted')} />)}</div>
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-4 max-w-[600px] mx-auto w-full space-y-4">
          {step === 'patient' && (<>
            <h2 className="text-lg font-bold text-center">{t('prescription.forWhom')}</h2>
            <PatientPicker value={patient} onChange={setPatient} />
          </>)}

          {step === 'items' && (<>
            <h2 className="text-lg font-bold">{t('prescription.prescribeMeds')}</h2>
            {myClinics.length > 1 && (
              <Select value={clinicId} onValueChange={setClinicId}>
                <SelectTrigger><SelectValue placeholder={t('docs.clinic')} /></SelectTrigger>
                <SelectContent>{myClinics.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            )}
            {safety.allergies.length > 0 && (
              <div className="flex flex-wrap gap-1">{safety.allergies.map((a) => (
                <span key={a} className="text-2xs px-1.5 py-0.5 rounded bg-destructive/10 text-destructive font-medium"><AlertTriangle className="inline w-3 h-3 mr-1" />{a}</span>
              ))}</div>
            )}
            {safety.medications.length > 0 && (
              <div className="p-2.5 rounded-lg border border-warning/30 bg-warning/5">
                <p className="text-xs font-medium text-warning mb-1">{t('prescription.currentPatientMeds')}:</p>
                <p className="text-2xs text-warning">{safety.medications.map((m) => `${m.name} ${m.dosage}`).join(', ')}</p>
              </div>
            )}
            <datalist id="rx-meds">{MEDICATIONS_WITH_TAGS.map((m) => <option key={`${m.name}-${m.dosage}`} value={m.name} />)}</datalist>
            {items.map((it, i) => {
              const c = check(it.medicamento);
              return (
                <div key={i} className={cn('p-3 rounded-lg border bg-card space-y-2', c.block ? 'border-destructive' : c.inter.length ? 'border-warning/50' : 'border-border')}>
                  <div className="flex items-center gap-2">
                    <Pill className="w-4 h-4 text-muted-foreground shrink-0" />
                    <Input list="rx-meds" placeholder={t('docs.item.medicamento')} value={it.medicamento} onChange={(e) => setItem(i, 'medicamento', e.target.value)} maxLength={200} />
                    {items.length > 1 && (
                      <Button aria-label={t('a11y.close')} variant="ghost" size="icon" onClick={() => setItems((p) => p.filter((_, j) => j !== i))}><X className="w-4 h-4" /></Button>
                    )}
                  </div>
                  {c.block && <p className="text-xs text-destructive font-medium">{t('prescription.allergyDetected')}: {c.block.matchedAllergy} — {t('prescription.prescriptionBlocked')}</p>}
                  {!c.block && c.inter.length > 0 && <p className="text-xs text-warning">{t('prescription.drugInteraction')}: {c.inter.map((w) => `${w.currentMedName} (${w.risk})`).join(', ')}</p>}
                  <div className="grid grid-cols-2 gap-2">
                    <Input placeholder={t('docs.item.dosagem')} value={it.dosagem} onChange={(e) => setItem(i, 'dosagem', e.target.value)} maxLength={200} />
                    <Input placeholder={t('docs.item.quantidade')} value={it.quantidade} onChange={(e) => setItem(i, 'quantidade', e.target.value)} maxLength={100} />
                    <Input placeholder={t('docs.item.posologia')} value={it.posologia} onChange={(e) => setItem(i, 'posologia', e.target.value)} maxLength={300} />
                    <Input placeholder={t('docs.item.duracao')} value={it.duracao} onChange={(e) => setItem(i, 'duracao', e.target.value)} maxLength={100} />
                  </div>
                </div>
              );
            })}
            {items.length < 30 && (
              <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => setItems((p) => [...p, { ...EMPTY_ITEM }])}><Plus className="w-4 h-4" /> {t('prescription.add')}</Button>
            )}
            <Textarea placeholder={t('docs.notes')} value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={2000} />
          </>)}

          {step === 'preview' && patient && (
            <div className="rounded-lg border border-border bg-card p-5 space-y-3">
              <p className="text-sm font-semibold">{dir.clinics.find((c) => c.id === clinicId)?.name}</p>
              <p className="text-sm">{t('docs.patient')}: {who} · {dobDisplay(patient.familyMemberId ? null : patient.dateOfBirth) || '—'}</p>
              <div className="space-y-2">{valid.map((i, k) => (
                <div key={k} className="pl-3 border-l-2 border-primary">
                  <p className="text-sm font-medium">{k + 1}. {i.medicamento} {i.dosagem}</p>
                  <p className="text-xs text-muted-foreground">{[i.posologia, i.duracao, i.quantidade].filter(Boolean).join(' · ')}</p>
                </div>
              ))}</div>
              {notes.trim() && <p className="text-xs text-muted-foreground">{notes}</p>}
              <p className="text-xs text-muted-foreground flex items-center gap-1"><QrCode className="w-4 h-4" /> {t('docs.qrNote')}</p>
              <p className="text-xs text-muted-foreground">{t('docs.immutableNote')}</p>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center space-y-4 py-8">
              <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto"><Check className="w-8 h-8 text-success" /></div>
              <h2 className="text-xl font-bold">{t('prescription.success')}</h2>
              <p className="text-sm text-muted-foreground">{t('prescription.patientNotified', { name: who })}</p>
              <div className="flex flex-col gap-2">
                <Button variant="outline" className="gap-2" onClick={() => issuedId && void downloadDocumentPdf('prescription', issuedId, t).catch(() => toast.error(t('docs.pdfError')))}>
                  <Download className="w-4 h-4" /> {t('docs.downloadPdf')}
                </Button>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => { setStep('patient'); setPatient(null); setItems([{ ...EMPTY_ITEM }]); setNotes(''); setIssuedId(null); }}>{t('prescription.newPrescription')}</Button>
                  <Button className="flex-1" onClick={() => (onGoHome ? onGoHome() : onClose())}>{t('prescription.goHome')}</Button>
                </div>
              </div>
            </div>
          )}
        </div>
        {step !== 'success' && (
          <div className={cn('border-t border-border bg-card flex justify-center', isMobile ? 'fixed bottom-[60px] left-0 right-0 z-modal p-4' : 'p-3')}>
            <div className="flex gap-2 w-full max-w-[600px]">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => (idx === 0 ? onClose() : setStep(steps[idx - 1]))}>
                {idx === 0 ? t('common.cancel') : t('prescription.previous')}
              </Button>
              {step === 'patient' && <Button size="sm" className="flex-1" disabled={!patient} onClick={() => setStep('items')}>{t('prescription.next')}</Button>}
              {step === 'items' && <Button size="sm" className="flex-1" disabled={valid.length === 0 || blocked || !clinicId} onClick={() => setStep('preview')}>{t('prescription.previewBtn')}</Button>}
              {step === 'preview' && <Button size="sm" className="flex-1" disabled={busy} onClick={() => void issue()}>{t('prescription.signAndSend')}</Button>}
            </div>
          </div>
        )}
        {step === 'items' && myClinics.length === 0 && <p className="text-xs text-destructive text-center pb-2">{t('docs.noClinic')}</p>}
      </div>
    </div>
  );
}
