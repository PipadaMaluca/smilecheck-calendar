import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

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
  durationMinutes: number
): Promise<void> {
  const start = new Date(scheduledAtIso).getTime();
  const target: Interval = { start, end: start + durationMinutes * 60_000 };

  // Fetch the same-day rows for that dentist and compare intervals client-side.
  const dayStart = new Date(start);
  dayStart.setUTCHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart.getTime() + 24 * 3600_000);

  const { data, error } = await supabase
    .from('appointments')
    .select('scheduled_at, duration_minutes, status')
    .eq('dentist_id', dentistId)
    .gte('scheduled_at', dayStart.toISOString())
    .lt('scheduled_at', dayEnd.toISOString());

  if (error) throw error;

  const clash = (data ?? []).some((row) => {
    if (row.status === 'cancelada') return false;
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
