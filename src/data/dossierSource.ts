import { supabase } from '@/integrations/supabase/client';
import type { OdontogramState, Surface, ToothData, ToothStatus } from '@/components/odontogram/odontogramData';
import { getDefaultOdontogram } from '@/components/odontogram/odontogramData';

/**
 * Real clinical dossier. Every write goes through a server RPC that checks the
 * active relationship (`can_read_dossier`) and the 12-month edit window
 * (`can_edit_patient`); reads are RLS-scoped (an old dentist only sees his own
 * rows). Nothing is ever deleted: notes are corrected by new immutable versions,
 * the odontogram is an append-only history, plan items are cancelled.
 */
const rpc = (fn: string, args: Record<string, unknown> = {}) => supabase.rpc(fn as never, args as never);
const from = (t: string) => supabase.from(t as never);

export interface NoteFields { motivo: string; observacoes: string; diagnostico: string; tratamento: string; proximos_passos: string }
export const EMPTY_NOTE: NoteFields = { motivo: '', observacoes: '', diagnostico: '', tratamento: '', proximos_passos: '' };
export const NOTE_KEYS: (keyof NoteFields)[] = ['motivo', 'observacoes', 'diagnostico', 'tratamento', 'proximos_passos'];

export interface ClinicalNote extends NoteFields {
  id: string; appointment_id: string; patient_id: string; author_id: string; clinic_id: string;
  version: number; created_at: string; updated_at: string;
}

/** A note shows "edited on…" only once a correction (version > 1) exists. */
export const wasEdited = (n: Pick<ClinicalNote, 'version'>) => n.version > 1;

export async function fetchNotes(patientId: string): Promise<ClinicalNote[]> {
  const { data, error } = await from('clinical_notes').select('*').eq('patient_id', patientId).order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as ClinicalNote[];
}

export async function saveNote(appointmentId: string, f: NoteFields) {
  const { data, error } = await rpc('save_clinical_note', {
    _appointment_id: appointmentId, _motivo: f.motivo, _observacoes: f.observacoes,
    _diagnostico: f.diagnostico, _tratamento: f.tratamento, _proximos_passos: f.proximos_passos,
  });
  if (error) throw error;
  return data as unknown as string;
}

export async function fetchNoteVersions(noteId: string) {
  const { data, error } = await from('clinical_note_versions').select('*').eq('note_id', noteId).order('version', { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as (NoteFields & { id: string; version: number; edited_by: string; created_at: string })[];
}

// ---------- Odontogram ----------
const TO_DB: Record<ToothStatus, string> = {
  healthy: 'saudavel', cavity: 'carie', restoration: 'restauracao', crown: 'coroa', missing: 'ausente',
  implant: 'implante', rootCanal: 'endodontia', prosthesis: 'protese', toTreat: 'a_tratar',
};
export interface OdontogramEntry {
  id: string; tooth: number; faces: string[]; status: string; surfaces: Partial<Record<Surface, ToothStatus>>;
  notes: string | null; author_id: string; created_at: string;
}

/** Summary row for a saved tooth: non-healthy faces and the dominant status. */
export function toothToEntry(data: ToothData): { faces: Surface[]; status: string; surfaces: Record<Surface, ToothStatus> } {
  const surfaces = Object.fromEntries(Object.entries(data.surfaces).map(([k, v]) => [k, v.status])) as Record<Surface, ToothStatus>;
  const faces = (Object.keys(surfaces) as Surface[]).filter((k) => surfaces[k] !== 'healthy');
  const status = data.isMissing ? 'ausente' : faces.length ? TO_DB[surfaces[faces[0]]] : 'saudavel';
  return { faces, status, surfaces };
}

/** Current chart = latest entry per tooth (entries arrive newest first). */
export function buildOdontogram(entries: OdontogramEntry[]): OdontogramState {
  const state = getDefaultOdontogram();
  const seen = new Set<number>();
  for (const e of entries) {
    if (seen.has(e.tooth)) continue;
    seen.add(e.tooth);
    const id = String(e.tooth);
    if (!state[id]) continue;
    const base = state[id];
    const surfaces = { ...base.surfaces };
    for (const [k, v] of Object.entries(e.surfaces ?? {})) if (k in surfaces && v) surfaces[k as Surface] = { status: v as ToothStatus };
    state[id] = { surfaces, notes: e.notes ?? '', isMissing: e.status === 'ausente' };
  }
  return state;
}

export async function fetchOdontogram(patientId: string): Promise<OdontogramEntry[]> {
  const { data, error } = await from('odontogram_entries').select('*').eq('patient_id', patientId).is('family_member_id', null).order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as OdontogramEntry[];
}

export async function saveTooth(a: { patientId: string; clinicId: string; tooth: string; data: ToothData }) {
  const e = toothToEntry(a.data);
  const { error } = await rpc('add_odontogram_entry', {
    _patient_id: a.patientId, _clinic_id: a.clinicId, _tooth: Number(a.tooth), _faces: e.faces,
    _status: e.status, _surfaces: e.surfaces, _notes: a.data.notes || null,
  });
  if (error) throw error;
}

// ---------- Treatment plans ----------
export type ItemStatus = 'planeado' | 'feito' | 'cancelado';
export interface PlanItem { id: string; tooth: number | null; procedure: string; status: ItemStatus; estimated_price: number | null }
export interface TreatmentPlan { id: string; title: string; internal_notes?: string | null; clinic_id?: string; created_at: string; updated_at: string; items: PlanItem[]; clinic?: string | null; family_member_id?: string | null }

/** Professional view (RLS: author or active relationship). */
export async function fetchPlans(patientId: string): Promise<TreatmentPlan[]> {
  const { data, error } = await from('treatment_plans').select('*, items:treatment_plan_items(*)').eq('patient_id', patientId).order('created_at', { ascending: false });
  if (error) throw error;
  return ((data ?? []) as unknown as TreatmentPlan[]).map((p) => ({ ...p, items: [...(p.items ?? [])].sort((a, b) => ((a as unknown as { sort_order: number }).sort_order ?? 0) - ((b as unknown as { sort_order: number }).sort_order ?? 0)) }));
}

/** Patient view: server omits internal notes. */
export async function fetchMyPlans(): Promise<TreatmentPlan[]> {
  const { data, error } = await rpc('my_treatment_plans');
  if (error) throw error;
  const rows = (Array.isArray(data) ? data : []) as unknown as TreatmentPlan[];
  return rows.map((p) => { const { internal_notes: _drop, ...rest } = p; return rest as TreatmentPlan; });
}

export async function createPlan(a: { patientId: string; clinicId: string; title: string; internalNotes?: string }) {
  const { data, error } = await rpc('create_treatment_plan', { _patient_id: a.patientId, _clinic_id: a.clinicId, _title: a.title, _internal_notes: a.internalNotes || null, _family_member_id: null });
  if (error) throw error;
  return data as unknown as string;
}
export async function addPlanItem(a: { planId: string; procedure: string; tooth?: number | null; price?: number | null }) {
  const { error } = await rpc('add_treatment_item', { _plan_id: a.planId, _procedure: a.procedure, _tooth: a.tooth ?? null, _estimated_price: a.price ?? null });
  if (error) throw error;
}
export async function setItemStatus(itemId: string, status: ItemStatus) {
  const { error } = await rpc('set_treatment_item_status', { _item_id: itemId, _status: status });
  if (error) throw error;
}

// ---------- Documents (private bucket, short signed URLs) ----------
export const DOC_BUCKET = 'clinical-documents';
export const DOC_MAX_BYTES = 15 * 1024 * 1024;
export const DOC_MIME = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'] as const;
export const DOC_TYPES = ['radiografia', 'relatorio', 'consentimento', 'outro'] as const;
export type DocType = typeof DOC_TYPES[number];
export const SIGNED_URL_SECONDS = 60;
const EXT: Record<string, string> = { 'application/pdf': 'pdf', 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

export interface ClinicalDocument {
  id: string; patient_id: string; family_member_id: string | null; clinic_id: string | null; uploaded_by: string;
  uploaded_by_patient: boolean; doc_type: DocType; title: string | null; mime_type: string; size_bytes: number; created_at: string;
}

/** Client-side guard mirroring the bucket/table rules; returns an i18n error key or null. */
export function validateDocFile(f: { type: string; size: number }): string | null {
  if (!(DOC_MIME as readonly string[]).includes(f.type)) return 'dossierReal.docs.badType';
  if (f.size <= 0 || f.size > DOC_MAX_BYTES) return 'dossierReal.docs.tooBig';
  return null;
}

/** Storage path is always `<patientId>/<uuid>.<ext>` — the folder drives storage RLS. */
export function docPath(patientId: string, mime: string, id = crypto.randomUUID()) {
  return `${patientId}/${id}.${EXT[mime] ?? 'bin'}`;
}

export async function fetchDocuments(patientId: string): Promise<ClinicalDocument[]> {
  const { data, error } = await from('clinical_documents').select('id, patient_id, family_member_id, clinic_id, uploaded_by, uploaded_by_patient, doc_type, title, mime_type, size_bytes, created_at').eq('patient_id', patientId).order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as ClinicalDocument[];
}

export async function uploadDocument(a: { patientId: string; file: File; docType: DocType; title?: string; clinicId?: string | null; familyMemberId?: string | null }) {
  const err = validateDocFile(a.file);
  if (err) throw new Error(err);
  const path = docPath(a.patientId, a.file.type);
  const up = await supabase.storage.from(DOC_BUCKET).upload(path, a.file, { contentType: a.file.type, upsert: false });
  if (up.error) throw up.error;
  const { error } = await rpc('register_clinical_document', {
    _patient_id: a.patientId, _storage_path: path, _doc_type: a.docType, _mime_type: a.file.type,
    _size_bytes: a.file.size, _title: a.title || a.file.name, _clinic_id: a.clinicId ?? null, _family_member_id: a.familyMemberId ?? null,
  });
  if (error) throw error;
}

/** Server checks access, logs the view and signs a 60 s URL (sign-file). Clients cannot sign directly. */
export async function signPrivateFile(kind: 'clinical' | 'message', id: string): Promise<string> {
  const { data, error } = await supabase.functions.invoke('sign-file', { body: { kind, id } });
  const url = (data as { url?: string } | null)?.url;
  if (error || !url) throw error ?? new Error('sign_failed');
  return url;
}
export const openDocument = (id: string) => signPrivateFile('clinical', id);

// ---------- Self-declared + triage ----------
export interface SelfDeclared {
  allergies: string[]; medications: { name: string; dosage?: string }[]; conditions: string[];
  vaccines: { name: string; date?: string }[]; bloodType: string; height: string; weight: string;
}
export function parseSelfDeclared(raw: unknown): SelfDeclared {
  const h = (raw ?? {}) as Record<string, unknown>;
  const arr = (v: unknown) => (Array.isArray(v) ? v : []);
  return {
    allergies: arr(h.allergies).map(String).filter(Boolean),
    medications: arr(h.medications).map((m) => ({ name: String((m as { name?: unknown })?.name ?? ''), dosage: String((m as { dosage?: unknown })?.dosage ?? '') })).filter((m) => m.name),
    conditions: arr(h.conditions).map(String).filter(Boolean),
    vaccines: arr(h.vaccines).map((v) => ({ name: String((v as { name?: unknown })?.name ?? ''), date: String((v as { date?: unknown })?.date ?? '') })).filter((v) => v.name),
    bloodType: String(h.bloodType ?? ''), height: String(h.height ?? ''), weight: String(h.weight ?? ''),
  };
}
export async function fetchSelfDeclared(patientId: string, familyMemberId: string | null = null): Promise<SelfDeclared> {
  const { data, error } = await rpc('dossier_self_declared', { _patient_id: patientId, _family_member_id: familyMemberId });
  if (error) throw error;
  return parseSelfDeclared(data);
}

/** Safety alerts combine both sources, de-duplicated case-insensitively. */
export function mergeSafetySources(self: SelfDeclared, professional: { allergies: string[]; medications: { name: string; dosage?: string }[] }) {
  const uniq = (xs: string[]) => Array.from(new Map(xs.map((x) => [x.trim().toLowerCase(), x.trim()])).values()).filter(Boolean);
  const meds = new Map<string, { name: string; dosage?: string }>();
  for (const m of [...self.medications, ...professional.medications]) if (m.name.trim()) meds.set(m.name.trim().toLowerCase(), m);
  return { allergies: uniq([...self.allergies, ...professional.allergies]), medications: Array.from(meds.values()), conditions: uniq(self.conditions) };
}

export interface TriageResponse { id: string; appointment_id: string; answers: Record<string, unknown>; summary: string | null; created_at: string }
export async function fetchTriage(appointmentId: string): Promise<TriageResponse | null> {
  const { data, error } = await from('triage_responses').select('id, appointment_id, answers, summary, created_at').eq('appointment_id', appointmentId).order('created_at', { ascending: false }).limit(1).maybeSingle();
  if (error) throw error;
  return (data ?? null) as unknown as TriageResponse | null;
}
