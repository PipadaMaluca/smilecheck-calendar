import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { notifyProfileSilently } from '@/data/notificationsSource';

/** Stored timestamps are rendered from their UTC components (see `toUtcTimestamp`). */
function formatSlot(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const hh = String(d.getUTCHours()).padStart(2, '0');
  const mi = String(d.getUTCMinutes()).padStart(2, '0');
  return { date: `${dd}/${mm}/${d.getUTCFullYear()}`, time: `${hh}:${mi}` };
}

/** Patient id + slot of an appointment, used to address event notifications. */
async function appointmentTarget(id: string) {
  const { data } = await supabase
    .from('appointments')
    .select('patient_id, scheduled_at')
    .eq('id', id)
    .maybeSingle();
  return data ?? null;
}


/**
 * Phase 3 · sub-step 2 — CREATE (INSERT) path.
 * Only used for real authenticated users; demo mode never touches the backend.
 * Edit / cancel / status changes still live in the existing mock code.
 */

type DbConsultationType = Database['public']['Enums']['consultation_type'];
type DbPaymentStatus = Database['public']['Enums']['payment_status'];
type DbWaitingUrgency = Database['public']['Enums']['waiting_urgency'];

export class SlotTakenError extends Error {
  constructor() {
    super('Horário já ocupado');
    this.name = 'SlotTakenError';
  }
}

/**
 * The read path renders stored timestamps using their UTC components, so the
 * wall-clock time picked in the UI is stored verbatim as UTC. This keeps the
 * seeded rows and the newly created ones displaying identically.
 */
export function toUtcTimestamp(date: Date, time: string): string {
  const [hh, mm] = time.split(':').map(Number);
  return new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), hh, mm, 0, 0)
  ).toISOString();
}

export function parseDurationMinutes(label: string): number {
  const trimmed = label.trim().toLowerCase();
  const hourMatch = trimmed.match(/^(\d+)h(?:(\d{2}))?$/);
  if (hourMatch) return Number(hourMatch[1]) * 60 + Number(hourMatch[2] ?? 0);
  const minMatch = trimmed.match(/^(\d+)\s*min$/);
  if (minMatch) return Number(minMatch[1]);
  return 30;
}

/** Maps a consultation-reason i18n key to the backend consultation_type enum. */
export function reasonToConsultationType(reasonKey: string): DbConsultationType {
  const key = reasonKey.toLowerCase();
  if (key.includes('teleconsult')) return 'teleconsulta';
  if (key.includes('emergency') || key.includes('urgen')) return 'urgencia';
  if (key.includes('first')) return 'primeira_consulta';
  if (key.includes('scaling') || key.includes('planing')) return 'destartarizacao';
  if (key.includes('surgery') || key.includes('extraction') || key.includes('implant')) return 'cirurgia';
  if (key.includes('endodont') || key.includes('canal')) return 'endodontia';
  if (key.includes('child') || key.includes('pediatr')) return 'odontopediatria';
  if (key.includes('orthodont') || key.includes('braces') || key.includes('aligner')) return 'ortodontia';
  if (key.includes('prosth') || key.includes('protese') || key.includes('crown') || key.includes('denture')) return 'protese';
  if (key.includes('restor') || key.includes('whiten') || key.includes('filling')) return 'restauracao';
  if (key.includes('control') || key.includes('checkup') || key.includes('evaluat')) return 'avaliacao';
  return 'primeira_consulta';
}

interface Interval {
  start: number;
  end: number;
}

function overlaps(a: Interval, b: Interval) {
  return a.start < b.end && b.start < a.end;
}

/**
 * Double-booking guard: rejects a slot that overlaps an existing (non-cancelled)
 * appointment on the same dentist's agenda.
 */
export async function assertDentistSlotFree(
  dentistId: string,
  scheduledAtIso: string,
  durationMinutes: number,
  excludeAppointmentId?: string
): Promise<void> {
  const start = new Date(scheduledAtIso).getTime();
  const target: Interval = { start, end: start + durationMinutes * 60_000 };

  // Fetch the same-day rows for that dentist and compare intervals client-side.
  const dayStart = new Date(start);
  dayStart.setUTCHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart.getTime() + 24 * 3600_000);

  const { data, error } = await supabase
    .from('appointments')
    .select('id, scheduled_at, duration_minutes, status')
    .eq('dentist_id', dentistId)
    .gte('scheduled_at', dayStart.toISOString())
    .lt('scheduled_at', dayEnd.toISOString());

  if (error) throw error;

  const clash = (data ?? []).some((row) => {
    if (row.status === 'cancelada') return false;
    if (excludeAppointmentId && row.id === excludeAppointmentId) return false;
    const s = new Date(row.scheduled_at).getTime();
    return overlaps(target, { start: s, end: s + (row.duration_minutes ?? 30) * 60_000 });
  });

  if (clash) throw new SlotTakenError();
}


export interface CreateAppointmentInput {
  patientId: string;
  dentistId: string | null;
  clinicId: string | null;
  consultationType: DbConsultationType;
  scheduledAt: string;
  durationMinutes: number;
  isTeleconsultation: boolean;
  paymentStatus: DbPaymentStatus;
  notes?: string | null;
  observation?: string | null;
  price?: number | null;
}

export async function createAppointment(input: CreateAppointmentInput): Promise<string> {
  if (!input.patientId) throw new Error('Paciente obrigatório');
  if (input.dentistId) {
    await assertDentistSlotFree(input.dentistId, input.scheduledAt, input.durationMinutes);
  }

  const { data, error } = await supabase
    .from('appointments')
    .insert({
      patient_id: input.patientId,
      dentist_id: input.dentistId,
      clinic_id: input.clinicId,
      consultation_type: input.consultationType,
      status: 'agendada',
      scheduled_at: input.scheduledAt,
      duration_minutes: input.durationMinutes,
      notes: input.notes ?? null,
      observation: input.observation ?? null,
      is_teleconsultation: input.isTeleconsultation,
      payment_status: input.paymentStatus,
      price: input.price ?? null,
    })
    .select('id')
    .single();

  if (error) throw error;

  const slot = formatSlot(input.scheduledAt);
  notifyProfileSilently({
    profileId: input.patientId,
    type: 'appointment_created',
    title: 'Nova consulta agendada',
    message: `${slot.date} às ${slot.time}`,
    actionUrl: '/app?tab=agenda',
  });

  return data.id;
}


export interface CreateWaitingListInput {
  patientId: string;
  dentistId: string | null;
  clinicId: string | null;
  consultationType: DbConsultationType;
  preferredSlots: { date: string; time: string }[];
  genericPreferences: { periods: string[]; weekdays: number[] };
  urgency: DbWaitingUrgency;
  observation?: string | null;
}

export async function createWaitingListEntry(input: CreateWaitingListInput): Promise<string> {
  const { data, error } = await supabase
    .from('waiting_list')
    .insert({
      patient_id: input.patientId,
      dentist_id: input.dentistId,
      clinic_id: input.clinicId,
      consultation_type: input.consultationType,
      preferred_slots: input.preferredSlots,
      generic_preferences: input.genericPreferences,
      urgency: input.urgency,
      observation: input.observation ?? null,
      status: 'em_espera',
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

/**
 * Real occupancy for the availability grid: `yyyy-mm-dd_HH:MM` keys covered by
 * an existing appointment on that dentist's agenda.
 */
export async function fetchOccupiedSlotKeys(
  dentistId: string,
  from: Date,
  to: Date,
  slotMinutes = 30
): Promise<Set<string>> {
  const { data, error } = await supabase
    .from('appointments')
    .select('scheduled_at, duration_minutes, status')
    .eq('dentist_id', dentistId)
    .gte('scheduled_at', from.toISOString())
    .lt('scheduled_at', to.toISOString());

  if (error) throw error;

  const keys = new Set<string>();
  for (const row of data ?? []) {
    if (row.status === 'cancelada') continue;
    const start = new Date(row.scheduled_at);
    const steps = Math.max(1, Math.ceil((row.duration_minutes ?? 30) / slotMinutes));
    for (let i = 0; i < steps; i++) {
      const slot = new Date(start.getTime() + i * slotMinutes * 60_000);
      const y = slot.getUTCFullYear();
      const m = String(slot.getUTCMonth() + 1).padStart(2, '0');
      const d = String(slot.getUTCDate()).padStart(2, '0');
      const hh = String(slot.getUTCHours()).padStart(2, '0');
      const mm = String(slot.getUTCMinutes()).padStart(2, '0');
      keys.add(`${y}-${m}-${d}_${hh}:${mm}`);
    }
  }
  return keys;
}

/* ------------------------------------------------------------------ *
 * Phase 3 · sub-step 3 — UPDATE / CANCEL path + waiting-list match.
 * Demo mode never reaches this module.
 * ------------------------------------------------------------------ */

type DbAppointmentStatus = Database['public']['Enums']['appointment_status'];

/** UI status -> backend appointment_status enum. */
export const STATUS_TO_DB: Record<string, DbAppointmentStatus> = {
  agendada: 'agendada',
  confirmada: 'confirmada',
  em_sala_espera: 'em_sala_de_espera',
  em_consulta: 'em_consulta',
  concluida: 'concluida',
  visto: 'visto',
  falta_justificada: 'falta',
  falta_nao_justificada: 'falta',
  cancelada: 'cancelada',
};

export interface UpdateAppointmentInput {
  id: string;
  dentistId?: string | null;
  clinicId?: string | null;
  scheduledAt?: string;
  durationMinutes?: number;
  consultationType?: DbConsultationType;
  isTeleconsultation?: boolean;
  notes?: string | null;
  observation?: string | null;
  price?: number | null;
}

/**
 * Edit / reschedule. Reuses the create-path double-booking guard, excluding the
 * row being edited so keeping the same slot is always allowed.
 */
export async function updateAppointment(input: UpdateAppointmentInput): Promise<void> {
  const { id, ...rest } = input;

  if (rest.scheduledAt || rest.durationMinutes || rest.dentistId !== undefined) {
    const { data: current, error: readError } = await supabase
      .from('appointments')
      .select('dentist_id, scheduled_at, duration_minutes')
      .eq('id', id)
      .single();
    if (readError) throw readError;

    const dentistId = rest.dentistId !== undefined ? rest.dentistId : current.dentist_id;
    const scheduledAt = rest.scheduledAt ?? current.scheduled_at;
    const duration = rest.durationMinutes ?? current.duration_minutes ?? 30;
    if (dentistId) await assertDentistSlotFree(dentistId, scheduledAt, duration, id);
  }

  const patch: Database['public']['Tables']['appointments']['Update'] = {};
  if (rest.dentistId !== undefined) patch.dentist_id = rest.dentistId;
  if (rest.clinicId !== undefined) patch.clinic_id = rest.clinicId;
  if (rest.scheduledAt !== undefined) patch.scheduled_at = rest.scheduledAt;
  if (rest.durationMinutes !== undefined) patch.duration_minutes = rest.durationMinutes;
  if (rest.consultationType !== undefined) patch.consultation_type = rest.consultationType;
  if (rest.isTeleconsultation !== undefined) patch.is_teleconsultation = rest.isTeleconsultation;
  if (rest.notes !== undefined) patch.notes = rest.notes;
  if (rest.observation !== undefined) patch.observation = rest.observation;
  if (rest.price !== undefined) patch.price = rest.price;

  if (!Object.keys(patch).length) return;

  const { error } = await supabase.from('appointments').update(patch).eq('id', id);
  if (error) throw error;

  if (rest.scheduledAt) {
    const target = await appointmentTarget(id);
    const slot = formatSlot(rest.scheduledAt);
    notifyProfileSilently({
      profileId: target?.patient_id,
      type: 'appointment_changed',
      title: 'Consulta alterada',
      message: `Novo horário: ${slot.date} às ${slot.time}`,
      actionUrl: '/app?tab=agenda',
    });
  }
}

/** Status change (points writing stays for the later points phase). */
export async function updateAppointmentStatus(id: string, uiStatus: string): Promise<void> {
  const status = STATUS_TO_DB[uiStatus];
  if (!status) throw new Error(`Estado desconhecido: ${uiStatus}`);
  const { error } = await supabase.from('appointments').update({ status }).eq('id', id);
  if (error) throw error;

  if (status === 'confirmada' || status === 'cancelada' || status === 'concluida') {
    const target = await appointmentTarget(id);
    const slot = target ? formatSlot(target.scheduled_at) : null;
    if (status === 'confirmada') {
      notifyProfileSilently({
        profileId: target?.patient_id,
        type: 'appointment_confirmed',
        title: 'Consulta confirmada',
        message: slot ? `${slot.date} às ${slot.time}` : undefined,
        actionUrl: '/app?tab=agenda',
      });
    } else if (status === 'cancelada') {
      notifyProfileSilently({
        profileId: target?.patient_id,
        type: 'appointment_cancelled',
        title: 'Consulta cancelada',
        message: slot ? `${slot.date} às ${slot.time}` : undefined,
        actionUrl: '/app?tab=agenda',
      });
    } else {
      // Completed consultation -> ask the patient for the bidirectional rating.
      notifyProfileSilently({
        profileId: target?.patient_id,
        type: 'feedback_pending',
        title: 'Avalie a sua consulta',
        message: slot ? `Consulta de ${slot.date}` : undefined,
        actionUrl: '/app?tab=pontuacoes',
      });
    }
  }
}

/** Soft cancel — the row is kept for history and the slot becomes free again. */
export async function cancelAppointment(id: string, options?: { silent?: boolean }): Promise<void> {
  const target = options?.silent ? null : await appointmentTarget(id);
  const { error } = await supabase
    .from('appointments')
    .update({ status: 'cancelada' as DbAppointmentStatus })
    .eq('id', id);
  if (error) throw error;

  if (target) {
    const slot = formatSlot(target.scheduled_at);
    notifyProfileSilently({
      profileId: target.patient_id,
      type: 'appointment_cancelled',
      title: 'Consulta cancelada',
      message: `${slot.date} às ${slot.time}`,
      actionUrl: '/app?tab=agenda',
    });
  }
}


/* ---------------- Waiting-list auto-match on cancel ---------------- */

export interface WaitingMatch {
  id: string;
  patientId: string;
  patientName: string;
  consultationType: DbConsultationType;
  urgency: DbWaitingUrgency;
  createdAt: string;
  reason: 'preferred_slot' | 'generic_preferences';
}

interface WaitingRow {
  id: string;
  patient_id: string;
  dentist_id: string | null;
  clinic_id: string | null;
  consultation_type: DbConsultationType;
  preferred_slots: unknown;
  generic_preferences: unknown;
  urgency: DbWaitingUrgency;
  created_at: string;
}

function toDateKey(d: Date) {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}

function toTimeKey(d: Date) {
  return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
}

/** JS getUTCDay() (0=Sun) -> stored weekday numbering (1=Mon .. 6=Sat). */
function toStoredWeekday(d: Date) {
  const day = d.getUTCDay();
  return day === 0 ? 0 : day;
}

export interface FreedSlot {
  scheduledAt: string;
  durationMinutes: number;
  dentistId: string | null;
  clinicId: string | null;
  consultationType: DbConsultationType;
  isTeleconsultation: boolean;
  price: number | null;
}

/**
 * Waiting entries (em_espera) that want the freed slot, either through an
 * explicit preferred slot or through their generic preferences.
 * Sorted urgent-first, then oldest-first.
 */
export async function findWaitingMatches(slot: FreedSlot): Promise<WaitingMatch[]> {
  let query = supabase
    .from('waiting_list')
    .select('id, patient_id, dentist_id, clinic_id, consultation_type, preferred_slots, generic_preferences, urgency, created_at')
    .eq('status', 'em_espera')
    .eq('consultation_type', slot.consultationType);

  if (slot.dentistId) query = query.or(`dentist_id.eq.${slot.dentistId},dentist_id.is.null`);

  const { data, error } = await query.returns<WaitingRow[]>();
  if (error) throw error;

  const freed = new Date(slot.scheduledAt);
  const dateKey = toDateKey(freed);
  const timeKey = toTimeKey(freed);
  const weekday = toStoredWeekday(freed);
  const period = freed.getUTCHours() < 13 ? 'morning' : 'afternoon';

  const rows = (data ?? []).filter((row) => {
    if (slot.clinicId && row.clinic_id && row.clinic_id !== slot.clinicId) return false;
    return true;
  });

  const matches: WaitingMatch[] = [];
  for (const row of rows) {
    const slots = Array.isArray(row.preferred_slots)
      ? (row.preferred_slots as { date?: string; time?: string }[])
      : [];
    const prefersSlot = slots.some((s) => s?.date === dateKey && s?.time === timeKey);

    const prefs = (row.generic_preferences ?? {}) as { periods?: string[]; weekdays?: number[] };
    const periods = prefs.periods ?? [];
    const weekdays = prefs.weekdays ?? [];
    const periodOk = periods.length === 0 ? false : periods.includes(period);
    const weekdayOk = weekdays.length === 0 ? false : weekdays.includes(weekday);
    const prefersGeneric =
      (periods.length > 0 || weekdays.length > 0) &&
      (periods.length === 0 || periodOk) &&
      (weekdays.length === 0 || weekdayOk);

    if (!prefersSlot && !prefersGeneric) continue;

    matches.push({
      id: row.id,
      patientId: row.patient_id,
      patientName: 'Paciente',
      consultationType: row.consultation_type,
      urgency: row.urgency,
      createdAt: row.created_at,
      reason: prefersSlot ? 'preferred_slot' : 'generic_preferences',
    });
  }

  if (matches.length) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', [...new Set(matches.map((m) => m.patientId))]);
    const names = new Map((profiles ?? []).map((p) => [p.id, p.full_name ?? 'Paciente']));
    for (const m of matches) m.patientName = names.get(m.patientId) ?? 'Paciente';
  }

  matches.sort((a, b) => {
    if (a.urgency !== b.urgency) return a.urgency === 'urgente' ? -1 : 1;
    return a.createdAt.localeCompare(b.createdAt);
  });

  return matches;
}

/**
 * Assign a freed slot to a waiting patient. Sequential writes with rollback:
 * the appointment INSERT happens first, and the waiting entry is only marked
 * `confirmado` afterwards. If that second write fails, the appointment is
 * soft-cancelled again so the two tables never disagree.
 */
export async function assignWaitingMatch(
  match: WaitingMatch,
  slot: FreedSlot,
  notificationMessage: string
): Promise<string> {
  if (slot.dentistId) {
    await assertDentistSlotFree(slot.dentistId, slot.scheduledAt, slot.durationMinutes);
  }

  const appointmentId = await createAppointment({
    patientId: match.patientId,
    dentistId: slot.dentistId,
    clinicId: slot.clinicId,
    consultationType: slot.consultationType,
    scheduledAt: slot.scheduledAt,
    durationMinutes: slot.durationMinutes,
    isTeleconsultation: slot.isTeleconsultation,
    paymentStatus: slot.isTeleconsultation ? 'a_pagar' : 'nao_aplicavel',
    price: slot.price,
  });

  const { data: confirmed, error: waitingError } = await supabase
    .from('waiting_list')
    .update({ status: 'confirmado' })
    .eq('id', match.id)
    .eq('status', 'em_espera')
    .select('id');

  // Roll back so we never keep an appointment without a confirmed entry —
  // both on a hard error and when the entry was already taken meanwhile.
  if (waitingError || !confirmed?.length) {
    await cancelAppointment(appointmentId, { silent: true }).catch(() => undefined);
    throw waitingError ?? new Error('Entrada da lista de espera já não está em espera');
  }

  // Non-blocking: the patient notification must not undo a consistent pair.
  await supabase
    .from('notifications')
    .insert({
      profile_id: match.patientId,
      type: 'appointment',
      title: 'Horário confirmado',
      message: notificationMessage,
      action_url: '/app',
      read: false,
    })
    .then(({ error }) => {
      if (error) console.warn('Notificação não criada:', error.message);
    });

  return appointmentId;
}
