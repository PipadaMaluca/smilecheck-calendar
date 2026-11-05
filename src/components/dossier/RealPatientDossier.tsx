import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, ClipboardList, Eye, FileText, History, Plus, Upload, User } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useDirectory } from '@/data/directorySource';
import { fetchDisplayNames } from '@/data/displayNames';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OdontogramChart } from '@/components/odontogram/OdontogramChart';
import type { OdontogramHistory } from '@/components/odontogram/odontogramData';
import { generateClinicalAlerts, SEVERITY_CONFIG } from '@/data/clinicalSafetyData';
import { formatCurrency, formatDate } from '@/lib/formatters';
import {
  EMPTY_NOTE, NOTE_KEYS, type ClinicalNote, type NoteFields, type SelfDeclared, type TreatmentPlan, type ClinicalDocument,
  type DocType, DOC_TYPES, DOC_MIME, buildOdontogram, fetchNotes, saveNote, fetchOdontogram, saveTooth, fetchPlans, createPlan,
  addPlanItem, setItemStatus, fetchDocuments, uploadDocument, openDocument, fetchSelfDeclared, mergeSafetySources,
  wasEdited, validateDocFile, type OdontogramEntry, type ItemStatus,
} from '@/data/dossierSource';

interface Props { patientId: string }
interface ApptRow { id: string; scheduled_at: string; consultation_type: string; status: string; dentist_id: string | null; clinic_id: string | null }

const Section = ({ title, icon: Icon, children, aside }: { title: string; icon: typeof User; children: React.ReactNode; aside?: React.ReactNode }) => (
  <div className="bg-card rounded-xl border border-border p-4 space-y-3">
    <div className="flex items-center justify-between gap-2">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-2"><Icon className="w-4 h-4" />{title}</h3>
      {aside}
    </div>
    {children}
  </div>
);

/** Real dossier for professionals (demo keeps PatientDossierView's mock untouched). */
export function RealPatientDossier({ patientId }: Props) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const dir = useDirectory();
  const me = user?.id ?? '';
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);
  const [patient, setPatient] = useState<{ full_name: string | null; date_of_birth: string | null } | null>(null);
  const [appts, setAppts] = useState<ApptRow[]>([]);
  const [notes, setNotes] = useState<ClinicalNote[]>([]);
  const [odo, setOdo] = useState<OdontogramEntry[]>([]);
  const [plans, setPlans] = useState<TreatmentPlan[]>([]);
  const [docs, setDocs] = useState<ClinicalDocument[]>([]);
  const [self, setSelf] = useState<SelfDeclared | null>(null);
  const [rxMeds, setRxMeds] = useState<{ name: string; dosage?: string }[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [p, a, n, o, pl, d, s, rx] = await Promise.all([
        supabase.from('profiles').select('full_name, date_of_birth').eq('id', patientId).maybeSingle(),
        supabase.from('appointments').select('id, scheduled_at, consultation_type, status, dentist_id, clinic_id').eq('patient_id', patientId).order('scheduled_at', { ascending: false }).limit(100),
        fetchNotes(patientId), fetchOdontogram(patientId), fetchPlans(patientId), fetchDocuments(patientId),
        fetchSelfDeclared(patientId).catch(() => null),
        supabase.from('prescriptions' as never).select('items, status').eq('patient_id', patientId),
      ]);
      setPatient((p.data as never) ?? null);
      setAppts(((a.data ?? []) as ApptRow[]));
      setNotes(n); setOdo(o); setPlans(pl); setDocs(d); setSelf(s); setDenied(s === null && n.length === 0);
      const meds = ((rx.data ?? []) as { items: { medicamento?: string; dosagem?: string }[]; status: string }[])
        .filter((r) => r.status !== 'anulada').flatMap((r) => (r.items ?? []).map((i) => ({ name: String(i.medicamento ?? ''), dosage: String(i.dosagem ?? '') })));
      setRxMeds(meds.filter((m) => m.name));
      const ids = Array.from(new Set([...n.map((x) => x.author_id), ...o.map((x) => x.author_id), ...d.map((x) => x.uploaded_by)]));
      if (ids.length) setNames(Object.fromEntries(await fetchDisplayNames(ids).catch(() => new Map<string, string>())));
    } catch {
      setDenied(true);
    } finally { setLoading(false); }
  }, [patientId]);
  useEffect(() => { void load(); }, [load]);

  // Clinic used for writes: the latest appointment at one of my clinics, else my first clinic.
  const myClinicIds = useMemo(() => new Set(dir.clinics.map((c) => c.id)), [dir.clinics]);
  const writeClinic = useMemo(() => appts.find((a) => a.clinic_id && myClinicIds.has(a.clinic_id))?.clinic_id ?? dir.clinics[0]?.id ?? null, [appts, myClinicIds, dir.clinics]);

  const safety = useMemo(() => {
    const s = self ?? { allergies: [], medications: [], conditions: [], vaccines: [], bloodType: '', height: '', weight: '' };
    const m = mergeSafetySources(s, { allergies: [], medications: rxMeds });
    return generateClinicalAlerts(m.conditions, m.medications, m.allergies);
  }, [self, rxMeds]);

  const odoState = useMemo(() => buildOdontogram(odo), [odo]);
  const odoHistory: OdontogramHistory[] = useMemo(() => odo.slice(0, 20).map((e) => ({
    date: formatDate(e.created_at), dentist: names[e.author_id] ?? '—', tooth: String(e.tooth),
    description: `${t(`dossierReal.odoStatus.${e.status}`)}${e.faces.length ? ` (${e.faces.join(', ')})` : ''}`,
  })), [odo, names, t]);

  if (loading) return <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-4"><Skeleton className="h-20 w-full" /><Skeleton className="h-40 w-full" /><Skeleton className="h-40 w-full" /></div>;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <ScrollArea className="flex-1">
        <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-5">
          <div className="flex items-start gap-4">
            <div className="w-18 h-18 md:w-20 md:h-20 rounded-full bg-secondary flex items-center justify-center shrink-0">
              <User className="w-9 h-9 md:w-10 md:h-10 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-foreground">{patient?.full_name || '—'}</h1>
              {patient?.date_of_birth && <p className="text-sm text-muted-foreground mt-0.5">{t('dossier.birthDate')}: {formatDate(patient.date_of_birth)}</p>}
              {denied && <p className="text-sm text-muted-foreground mt-2">{t('dossierReal.ownNotesOnly')}</p>}
            </div>
          </div>

          {safety.length > 0 && (
            <Section title={t('dossierReal.safetyAlerts')} icon={AlertTriangle}>
              <ul className="space-y-2">
                {safety.map((a) => (
                  <li key={a.id} className="text-sm flex items-start gap-2">
                    <span className={SEVERITY_CONFIG[a.severity].text}>●</span>
                    <span><span className="font-medium">{a.title}</span> — {a.description}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {self && <SelfDeclaredSection data={self} />}

          <NotesSection appts={appts} notes={notes} names={names} me={me} onSaved={load} />

          <OdontogramChart state={odoState} history={odoHistory} readOnly={!writeClinic}
            onSaveTooth={async (tooth, data) => { if (!writeClinic) return; await saveTooth({ patientId, clinicId: writeClinic, tooth, data }); toast.success(t('odontogram.saved')); await load(); }} />

          <PlansSection plans={plans} patientId={patientId} clinicId={writeClinic} onChanged={load} />

          <DocumentsSection docs={docs} names={names} onUpload={writeClinic ? (f, type) => uploadDocument({ patientId, file: f, docType: type, clinicId: writeClinic }) : undefined} onChanged={load} />
        </div>
      </ScrollArea>
    </div>
  );
}

function SelfDeclaredSection({ data }: { data: SelfDeclared }) {
  const { t } = useTranslation();
  const list = (xs: string[]) => (xs.length ? xs.join(', ') : '—');
  return (
    <Section title={t('dossierReal.selfDeclared')} icon={User} aside={<Badge variant="secondary">{t('dossierReal.declaredByPatient')}</Badge>}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
        <p><span className="text-muted-foreground">{t('dossierReal.allergies')}:</span> {list(data.allergies)}</p>
        <p><span className="text-muted-foreground">{t('dossierReal.conditions')}:</span> {list(data.conditions)}</p>
        <p className="md:col-span-2"><span className="text-muted-foreground">{t('dossierReal.medications')}:</span> {list(data.medications.map((m) => (m.dosage ? `${m.name} (${m.dosage})` : m.name)))}</p>
        <p><span className="text-muted-foreground">{t('dossierReal.vaccines')}:</span> {list(data.vaccines.map((v) => v.name))}</p>
        <p><span className="text-muted-foreground">{t('dossierReal.bloodType')}:</span> {data.bloodType || '—'}</p>
      </div>
    </Section>
  );
}

function NotesSection({ appts, notes, names, me, onSaved }: { appts: ApptRow[]; notes: ClinicalNote[]; names: Record<string, string>; me: string; onSaved: () => void }) {
  const { t } = useTranslation();
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<NoteFields>(EMPTY_NOTE);
  const [saving, setSaving] = useState(false);
  const byAppt = useMemo(() => {
    const m = new Map<string, ClinicalNote[]>();
    for (const n of notes) m.set(n.appointment_id, [...(m.get(n.appointment_id) ?? []), n]);
    return m;
  }, [notes]);
  // Appointments I can see + any note whose appointment I can't see (old dentist's own notes).
  const apptIds = new Set(appts.map((a) => a.id));
  const orphan = notes.filter((n) => !apptIds.has(n.appointment_id));
  const start = (apptId: string) => {
    const mine = byAppt.get(apptId)?.find((n) => n.author_id === me);
    setForm(mine ? { motivo: mine.motivo, observacoes: mine.observacoes, diagnostico: mine.diagnostico, tratamento: mine.tratamento, proximos_passos: mine.proximos_passos } : EMPTY_NOTE);
    setEditing(apptId);
  };
  const submit = async () => {
    if (!editing) return;
    setSaving(true);
    try { await saveNote(editing, form); toast.success(t('dossierReal.noteSaved')); setEditing(null); onSaved(); }
    catch (e) { toast.error(t(`dossierReal.errors.${(e as { message?: string }).message ?? ''}`, { defaultValue: t('dossierReal.saveError') })); }
    finally { setSaving(false); }
  };
  const NoteView = ({ n }: { n: ClinicalNote }) => (
    <div className="rounded-lg bg-secondary/50 p-3 space-y-1 text-sm">
      <p className="text-xs text-muted-foreground">
        {names[n.author_id] ?? '—'} · {formatDate(n.created_at)}
        {wasEdited(n) && <> · {t('dossierReal.editedOn', { date: formatDate(n.updated_at) })}</>}
      </p>
      {NOTE_KEYS.filter((k) => n[k]).map((k) => (
        <p key={k}><span className="text-muted-foreground">{t(`dossierReal.note.${k}`)}:</span> {n[k]}</p>
      ))}
    </div>
  );
  return (
    <Section title={t('dossierReal.clinicalNotes')} icon={ClipboardList}>
      {appts.length === 0 && orphan.length === 0 && <p className="text-sm text-muted-foreground italic">{t('dossierReal.noAppointments')}</p>}
      <div className="space-y-3">
        {appts.map((a) => {
          const list = byAppt.get(a.id) ?? [];
          return (
            <div key={a.id} className="border border-border rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">{formatDate(a.scheduled_at)} · {t(`consultationTypes.${a.consultation_type}`, { defaultValue: a.consultation_type })}</p>
                {editing !== a.id && (
                  <Button size="sm" variant="outline" onClick={() => start(a.id)}>
                    {list.some((n) => n.author_id === me) ? t('dossierReal.correctNote') : t('dossierReal.addNote')}
                  </Button>
                )}
              </div>
              {list.map((n) => <NoteView key={n.id} n={n} />)}
              {editing === a.id && (
                <div className="space-y-2">
                  {NOTE_KEYS.map((k) => (
                    <label key={k} className="block space-y-1">
                      <span className="text-xs text-muted-foreground">{t(`dossierReal.note.${k}`)}</span>
                      <Textarea value={form[k]} onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))} rows={k === 'observacoes' ? 3 : 2} />
                    </label>
                  ))}
                  <p className="text-xs text-muted-foreground">{t('dossierReal.versionHint')}</p>
                  <div className="flex gap-2 justify-end">
                    <Button variant="ghost" size="sm" onClick={() => setEditing(null)}>{t('common.cancel')}</Button>
                    <Button size="sm" onClick={submit} disabled={saving}>{t('common.save')}</Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {orphan.map((n) => <NoteView key={n.id} n={n} />)}
      </div>
    </Section>
  );
}

function PlansSection({ plans, patientId, clinicId, onChanged }: { plans: TreatmentPlan[]; patientId: string; clinicId: string | null; onChanged: () => void }) {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [item, setItem] = useState<Record<string, { procedure: string; tooth: string; price: string }>>({});
  const run = async (fn: () => Promise<unknown>) => {
    try { await fn(); onChanged(); } catch (e) { toast.error(t(`dossierReal.errors.${(e as { message?: string }).message ?? ''}`, { defaultValue: t('dossierReal.saveError') })); }
  };
  return (
    <Section title={t('dossierReal.plans')} icon={History}>
      {plans.length === 0 && <p className="text-sm text-muted-foreground italic">{t('dossierReal.noPlans')}</p>}
      {plans.map((p) => {
        const it = item[p.id] ?? { procedure: '', tooth: '', price: '' };
        return (
          <div key={p.id} className="border border-border rounded-lg p-3 space-y-2">
            <p className="text-sm font-medium">{p.title} <span className="text-xs text-muted-foreground">· {formatDate(p.created_at)}</span></p>
            {p.internal_notes && <p className="text-xs text-muted-foreground"><span className="font-medium">{t('dossierReal.internalNotes')}:</span> {p.internal_notes}</p>}
            <ul className="space-y-1">
              {p.items.map((i) => (
                <li key={i.id} className="flex items-center justify-between gap-2 text-sm">
                  <span className={i.status === 'cancelado' ? 'line-through text-muted-foreground' : ''}>
                    {i.tooth ? `${t('odontogram.tooth')} ${i.tooth} · ` : ''}{i.procedure}{i.estimated_price != null ? ` · ${formatCurrency(Number(i.estimated_price))}` : ''}
                  </span>
                  <Select value={i.status} onValueChange={(v) => run(() => setItemStatus(i.id, v as ItemStatus))} disabled={!clinicId}>
                    <SelectTrigger className="h-8 w-32" aria-label={t('dossierReal.itemStatus')}><SelectValue /></SelectTrigger>
                    <SelectContent>{(['planeado', 'feito', 'cancelado'] as const).map((s) => <SelectItem key={s} value={s}>{t(`dossierReal.itemStatusValue.${s}`)}</SelectItem>)}</SelectContent>
                  </Select>
                </li>
              ))}
            </ul>
            {clinicId && (
              <div className="flex flex-wrap gap-2">
                <Input className="h-9 flex-1 min-w-40" placeholder={t('dossierReal.procedure')} value={it.procedure} onChange={(e) => setItem((s) => ({ ...s, [p.id]: { ...it, procedure: e.target.value } }))} />
                <Input className="h-9 w-20" inputMode="numeric" placeholder={t('odontogram.tooth')} value={it.tooth} onChange={(e) => setItem((s) => ({ ...s, [p.id]: { ...it, tooth: e.target.value.replace(/\D/g, '').slice(0, 2) } }))} />
                <Input className="h-9 w-28" inputMode="decimal" placeholder={t('dossierReal.estimatedPrice')} value={it.price} onChange={(e) => setItem((s) => ({ ...s, [p.id]: { ...it, price: e.target.value } }))} />
                <Button size="sm" disabled={!it.procedure.trim()} onClick={() => run(async () => {
                  await addPlanItem({ planId: p.id, procedure: it.procedure, tooth: it.tooth ? Number(it.tooth) : null, price: it.price ? Number(it.price.replace(',', '.')) : null });
                  setItem((s) => ({ ...s, [p.id]: { procedure: '', tooth: '', price: '' } }));
                })} className="gap-1"><Plus className="w-3.5 h-3.5" />{t('health.add')}</Button>
              </div>
            )}
          </div>
        );
      })}
      {clinicId && (
        <div className="space-y-2 pt-1">
          <Input className="h-9" placeholder={t('dossierReal.planTitle')} value={title} onChange={(e) => setTitle(e.target.value)} />
          <Textarea rows={2} placeholder={t('dossierReal.internalNotesPlaceholder')} value={notes} onChange={(e) => setNotes(e.target.value)} />
          <Button size="sm" variant="outline" disabled={!title.trim()} onClick={() => run(async () => { await createPlan({ patientId, clinicId, title, internalNotes: notes }); setTitle(''); setNotes(''); })} className="gap-1">
            <Plus className="w-3.5 h-3.5" />{t('dossierReal.newPlan')}
          </Button>
        </div>
      )}
    </Section>
  );
}

export function DocumentsSection({ docs, names, onUpload, onChanged }: {
  docs: ClinicalDocument[]; names: Record<string, string>; onUpload?: (f: File, type: DocType) => Promise<void>; onChanged: () => void;
}) {
  const { t } = useTranslation();
  const input = useRef<HTMLInputElement>(null);
  const [type, setType] = useState<DocType>('radiografia');
  const [busy, setBusy] = useState(false);
  const pick = async (f: File | undefined) => {
    if (!f || !onUpload) return;
    const err = validateDocFile(f);
    if (err) { toast.error(t(err)); return; }
    setBusy(true);
    try { await onUpload(f, type); toast.success(t('dossierReal.docs.uploaded')); onChanged(); }
    catch { toast.error(t('dossierReal.docs.uploadError')); }
    finally { setBusy(false); if (input.current) input.current.value = ''; }
  };
  const view = async (id: string) => {
    const w = window.open('', '_blank', 'noopener');
    try { const url = await openDocument(id); if (w) w.location.href = url; else window.location.assign(url); }
    catch { w?.close(); toast.error(t('dossierReal.docs.openError')); }
  };
  return (
    <Section title={t('dossierReal.docs.title')} icon={FileText}>
      {docs.length === 0 ? <p className="text-sm text-muted-foreground italic">{t('health.noDocuments')}</p> : (
        <div className="space-y-2">
          {docs.map((d) => (
            <div key={d.id} className="flex items-center justify-between gap-2 p-3 rounded-lg bg-secondary/50">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{d.title || t(`dossierReal.docs.type.${d.doc_type}`)}</p>
                <p className="text-xs text-muted-foreground">
                  {t(`dossierReal.docs.type.${d.doc_type}`)} · {formatDate(d.created_at)} · {d.uploaded_by_patient ? t('dossierReal.docs.byPatient') : (names[d.uploaded_by] ?? '—')}
                </p>
              </div>
              <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => view(d.id)}><Eye className="w-3.5 h-3.5" />{t('health.viewBtn')}</Button>
            </div>
          ))}
        </div>
      )}
      {onUpload && (
        <div className="flex flex-wrap gap-2">
          <Select value={type} onValueChange={(v) => setType(v as DocType)}>
            <SelectTrigger className="h-9 w-44" aria-label={t('dossierReal.docs.typeLabel')}><SelectValue /></SelectTrigger>
            <SelectContent>{DOC_TYPES.map((d) => <SelectItem key={d} value={d}>{t(`dossierReal.docs.type.${d}`)}</SelectItem>)}</SelectContent>
          </Select>
          <input ref={input} type="file" accept={DOC_MIME.join(',')} className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
          <Button variant="outline" size="sm" className="gap-1.5 flex-1" disabled={busy} onClick={() => input.current?.click()}>
            <Upload className="w-4 h-4" />{t('health.uploadDocument')}
          </Button>
          <p className="w-full text-xs text-muted-foreground">{t('dossierReal.docs.hint')}</p>
        </div>
      )}
    </Section>
  );
}


