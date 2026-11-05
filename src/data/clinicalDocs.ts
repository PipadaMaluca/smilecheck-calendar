import { useCallback, useEffect, useState } from 'react';
import type { TFunction } from 'i18next';
import { supabase } from '@/integrations/supabase/client';
import { formatDate } from '@/lib/formatters';

/**
 * Real prescriptions & referral letters. Issue/void only through server RPCs
 * (active relationship, immutable once issued); reads are RLS-scoped; the PDF
 * payload comes from `clinical_document`; public QR check is `verify_document`
 * (status, date and clinic only — never patient data).
 */
export type DocKind = 'prescription' | 'referral_letter';

export interface RxItem { medicamento: string; dosagem: string; posologia: string; duracao: string; quantidade: string }
export const EMPTY_ITEM: RxItem = { medicamento: '', dosagem: '', posologia: '', duracao: '', quantidade: '' };

export interface DocRow {
  id: string; number: number; clinic_id: string; dentist_id: string; patient_id: string;
  family_member_id: string | null; status: 'emitida' | 'anulada'; created_at: string;
  verification_code: string; void_reason: string | null; voided_at: string | null;
  items?: RxItem[]; notes?: string | null;
  to_dentist_id?: string | null; to_clinic_id?: string | null; to_external?: string | null;
  reason?: string; clinical_summary?: string | null; urgency?: 'normal' | 'urgente';
}

export interface DocPayload extends DocRow {
  clinic: { name: string; address: string | null; postal_code: string | null; city: string | null; phone: string | null } | null;
  dentist: { name: string | null; order_number: string | null } | null;
  patient: { name: string | null; date_of_birth: string | null } | null;
  to_dentist_name?: string | null; to_clinic_name?: string | null;
}

const rpc = (fn: string, args: Record<string, unknown>) => supabase.rpc(fn as never, args as never);

export async function fetchSafety(patientId: string, familyMemberId?: string | null) {
  const { data, error } = await rpc('dossier_safety', { _patient_id: patientId, _family_member_id: familyMemberId ?? null });
  if (error) throw error;
  const d = (data ?? {}) as { allergies?: unknown; medications?: unknown };
  const allergies = Array.isArray(d.allergies) ? d.allergies.map(String) : [];
  const medications = Array.isArray(d.medications)
    ? (d.medications as { name?: string; dosage?: string }[]).map((m) => ({ name: String(m?.name ?? ''), dosage: String(m?.dosage ?? '') })).filter((m) => m.name)
    : [];
  return { allergies, medications };
}

/** Items the server will accept: non-empty medicine, trimmed fields. */
export function cleanItems(items: RxItem[]): RxItem[] {
  return items
    .map((i) => ({ medicamento: i.medicamento.trim(), dosagem: i.dosagem.trim(), posologia: i.posologia.trim(), duracao: i.duracao.trim(), quantidade: i.quantidade.trim() }))
    .filter((i) => i.medicamento.length > 0);
}

export async function issuePrescription(a: { patientId: string; clinicId: string; items: RxItem[]; notes?: string; familyMemberId?: string | null }) {
  const { data, error } = await rpc('issue_prescription', {
    _patient_id: a.patientId, _clinic_id: a.clinicId, _items: cleanItems(a.items), _notes: a.notes ?? null,
    _family_member_id: a.familyMemberId ?? null, _appointment_id: null,
  });
  if (error) throw error;
  return data as unknown as string;
}

export async function issueReferralLetter(a: {
  patientId: string; clinicId: string; reason: string; summary?: string; urgency: 'normal' | 'urgente';
  toDentistId?: string | null; toClinicId?: string | null; toExternal?: string | null; familyMemberId?: string | null;
}) {
  const { data, error } = await rpc('issue_referral_letter', {
    _patient_id: a.patientId, _clinic_id: a.clinicId, _reason: a.reason, _clinical_summary: a.summary ?? null,
    _urgency: a.urgency, _to_dentist_id: a.toDentistId ?? null, _to_clinic_id: a.toClinicId ?? null,
    _to_external: a.toExternal ?? null, _family_member_id: a.familyMemberId ?? null, _appointment_id: null,
  });
  if (error) throw error;
  return data as unknown as string;
}

export async function voidDocument(kind: DocKind, id: string, reason: string) {
  const { error } = await rpc('void_clinical_document', { _kind: kind, _id: id, _reason: reason });
  if (error) throw error;
}

export async function fetchDocument(kind: DocKind, id: string): Promise<DocPayload> {
  const { data, error } = await rpc('clinical_document', { _kind: kind, _id: id });
  if (error) throw error;
  return data as unknown as DocPayload;
}

export interface VerifyResult { status: 'emitida' | 'anulada' | 'not_found'; kind?: DocKind; issued_on?: string; clinic?: string }
/** Only these keys are ever returned by the public check. */
export const VERIFY_PUBLIC_KEYS = ['status', 'kind', 'issued_on', 'clinic'] as const;
export async function verifyDocument(code: string): Promise<VerifyResult> {
  const { data, error } = await rpc('verify_document', { _code: code });
  if (error) throw error;
  const raw = (data ?? {}) as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const k of VERIFY_PUBLIC_KEYS) if (k in raw) out[k] = raw[k];
  return out as unknown as VerifyResult;
}

/** Docs readable by the current user (RLS: author, clinic owner, patient holder, recipient). */
export function useDocuments(kind: DocKind, enabled: boolean) {
  const [rows, setRows] = useState<DocRow[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(false);
  const load = useCallback(async () => {
    if (!enabled) { setRows([]); setLoading(false); return; }
    setLoading(true); setError(false);
    const table = kind === 'prescription' ? 'prescriptions' : 'referral_letters';
    const { data, error: e } = await supabase.from(table as never).select('*').order('created_at', { ascending: false }).limit(200);
    if (e) setError(true); else setRows((data ?? []) as unknown as DocRow[]);
    setLoading(false);
  }, [kind, enabled]);
  useEffect(() => { void load(); }, [load]);
  return { rows, loading, error, reload: load };
}

export const verifyUrl = (code: string) =>
  `${typeof window !== 'undefined' ? window.location.origin : 'https://smilecheck.app'}/verificar/${code}`;

export const docNumberLabel = (kind: DocKind, n: number) => `${kind === 'prescription' ? 'RX' : 'REF'}-${String(n).padStart(5, '0')}`;

const dob = (iso: string | null | undefined) => (iso ? iso.split('-').reverse().join('/') : '—');

/** PDF (jsPDF): clinic, dentist (+ order number), patient (name, birth date), body, date, QR with the code. */
export async function buildDocumentPdf(kind: DocKind, d: DocPayload, t: TFunction): Promise<Blob> {
  const [{ jsPDF }, { default: autoTable }, QR] = await Promise.all([import('jspdf'), import('jspdf-autotable'), import('qrcode')]);
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  doc.setFont('helvetica', 'bold'); doc.setFontSize(16);
  doc.text(d.clinic?.name ?? 'SmileCheck', 40, 50);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
  const addr = [d.clinic?.address, [d.clinic?.postal_code, d.clinic?.city].filter(Boolean).join(' ')].filter(Boolean).join(', ');
  if (addr) doc.text(addr, 40, 64);
  if (d.clinic?.phone) doc.text(d.clinic.phone, 40, 76);
  doc.setFontSize(11);
  doc.text(d.dentist?.name ?? '', 40, 96);
  if (d.dentist?.order_number) { doc.setFontSize(9); doc.text(`${t('docs.orderNumber')}: ${d.dentist.order_number}`, 40, 108); }

  doc.setFont('helvetica', 'bold'); doc.setFontSize(14);
  doc.text(t(kind === 'prescription' ? 'docs.rxTitle' : 'docs.letterTitle'), 40, 140);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
  doc.text(`${t('docs.number')}: ${docNumberLabel(kind, d.number)}`, 40, 154);
  doc.text(`${t('docs.date')}: ${formatDate(new Date(d.created_at), { day: '2-digit', month: '2-digit', year: 'numeric' })}`, 40, 166);
  doc.setFontSize(10);
  doc.text(`${t('docs.patient')}: ${d.patient?.name ?? '—'}`, 40, 186);
  doc.text(`${t('docs.dob')}: ${dob(d.patient?.date_of_birth)}`, 40, 200);

  let y = 220;
  if (kind === 'prescription') {
    autoTable(doc, {
      startY: y,
      head: [[t('docs.item.medicamento'), t('docs.item.dosagem'), t('docs.item.posologia'), t('docs.item.duracao'), t('docs.item.quantidade')]],
      body: (d.items ?? []).map((i) => [i.medicamento, i.dosagem, i.posologia, i.duracao, i.quantidade]),
      styles: { fontSize: 9 }, headStyles: { fillColor: [33, 150, 243] },
    });
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 18;
    if (d.notes) { doc.text(doc.splitTextToSize(`${t('docs.notes')}: ${d.notes}`, W - 80), 40, y); y += 30; }
  } else {
    const to = d.to_external ?? [d.to_dentist_name, d.to_clinic_name].filter(Boolean).join(' — ');
    const lines = [
      `${t('docs.to')}: ${to}`,
      `${t('docs.urgency')}: ${t(`docs.urgencyLevel.${d.urgency ?? 'normal'}`)}`,
      `${t('docs.reason')}: ${d.reason ?? ''}`,
    ];
    for (const l of lines) { doc.text(doc.splitTextToSize(l, W - 80), 40, y); y += 16; }
    if (d.clinical_summary) {
      y += 6; doc.setFont('helvetica', 'bold'); doc.text(t('docs.summary'), 40, y); doc.setFont('helvetica', 'normal'); y += 14;
      const s = doc.splitTextToSize(d.clinical_summary, W - 80); doc.text(s, 40, y); y += s.length * 12;
    }
  }
  if (d.status === 'anulada') {
    doc.setTextColor(200, 30, 30); doc.setFont('helvetica', 'bold');
    doc.text(`${t('docs.voided')}${d.void_reason ? ` — ${d.void_reason}` : ''}`, 40, y + 10);
    doc.setTextColor(0, 0, 0); doc.setFont('helvetica', 'normal');
  }
  const qr = await QR.toDataURL(verifyUrl(d.verification_code), { margin: 0, width: 240 });
  const H = doc.internal.pageSize.getHeight();
  doc.addImage(qr, 'PNG', W - 140, H - 160, 100, 100);
  doc.setFontSize(8);
  doc.text(`${t('docs.verifyCode')}: ${d.verification_code}`, W - 140, H - 48);
  doc.line(40, H - 80, 220, H - 80);
  doc.text(t('docs.signature'), 40, H - 68);
  return doc.output('blob');
}

export async function downloadDocumentPdf(kind: DocKind, id: string, t: TFunction) {
  const d = await fetchDocument(kind, id);
  const blob = await buildDocumentPdf(kind, d, t);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `${docNumberLabel(kind, d.number)}.pdf`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/* ---------- Rankings (private, server-computed) ---------- */
export interface RankScope { position: number; total: number; change: number; country?: string }
export interface MyRanking { xp: number; global: RankScope; national: RankScope | null; clinics?: (RankScope & { id: string; name: string })[] }
export function useMyRanking(enabled: boolean) {
  const [data, setData] = useState<MyRanking | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(false);
  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    void (async () => {
      const { data: d, error: e } = await rpc('my_ranking', {});
      if (!alive) return;
      if (e) setError(true); else setData(d as unknown as MyRanking);
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [enabled]);
  return { data, loading, error };
}

/* ---------- Job market ---------- */
export interface JobPost {
  id: string; clinic_id: string; title: string; contract_type: string; days: string[];
  city: string | null; description: string | null; status: 'aberta' | 'fechada'; created_at: string;
}
export interface JobApplication { id: string; post_id: string; dentist_id: string; message: string | null; created_at: string }

export async function listJobPosts() {
  const { data, error } = await supabase.from('job_posts' as never).select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as JobPost[];
}
export async function listJobApplications() {
  const { data, error } = await supabase.from('job_applications' as never).select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as JobApplication[];
}
export async function createJobPost(p: Omit<JobPost, 'id' | 'status' | 'created_at'>, userId: string) {
  const { error } = await supabase.from('job_posts' as never).insert({ ...p, created_by: userId } as never);
  if (error) throw error;
}
export async function setJobPostStatus(id: string, status: 'aberta' | 'fechada') {
  const { error } = await supabase.from('job_posts' as never).update({ status } as never).eq('id', id);
  if (error) throw error;
}
export async function applyToJob(postId: string, userId: string, message: string) {
  const { error } = await supabase.from('job_applications' as never).insert({ post_id: postId, dentist_id: userId, message: message.trim() || null } as never);
  if (error) throw error;
}
export async function withdrawApplication(id: string) {
  const { error } = await supabase.from('job_applications' as never).delete().eq('id', id);
  if (error) throw error;
}
