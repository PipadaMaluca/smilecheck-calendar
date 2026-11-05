import { useEffect, useSyncExternalStore } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { zonedParts } from '@/lib/formatters';
import type { TimeSlot } from '@/types/calendar';
import type { AgendaException } from './agendaExceptions';

/**
 * Real absences / exceptional openings drawn on every agenda view.
 * One module-level store (like agendaSettingsStore) so the shared slot builder
 * (`generateTimeSlots`) can read it synchronously; demo never activates it.
 */
interface State { active: boolean; exceptions: AgendaException[]; zones: Record<string, string>; version: number }
let state: State = { active: false, exceptions: [], zones: {}, version: 0 };
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const set = (p: Partial<State>) => { state = { ...state, ...p, version: state.version + 1 }; emit(); };

export const agendaAvailabilityStore = {
  get: () => state,
  subscribe: (l: () => void) => { listeners.add(l); return () => listeners.delete(l); },
  /** Tests / sign-out. */
  reset: () => set({ active: false, exceptions: [], zones: {} }),
  setData: (exceptions: AgendaException[], zones: Record<string, string>) => set({ active: true, exceptions, zones }),
};

export async function refreshAgendaAvailability() {
  const from = new Date(Date.now() - 62 * 86400000).toISOString();
  const to = new Date(Date.now() + 400 * 86400000).toISOString();
  const { data, error } = await supabase.from('agenda_exceptions')
    .select('id, dentist_id, clinic_id, kind, starts_at, ends_at, full_day, reason, note, color')
    .gte('ends_at', from).lte('starts_at', to).order('starts_at').limit(2000);
  if (error) return;
  const rows = (data ?? []) as AgendaException[];
  const { data: cl } = await supabase.from('clinic_members').select('clinic_id, clinics(timezone)');
  const zones: Record<string, string> = {};
  (cl ?? []).forEach((r: { clinic_id: string; clinics: { timezone: string } | null }) => { if (r.clinics?.timezone) zones[r.clinic_id] = r.clinics.timezone; });
  agendaAvailabilityStore.setData(rows, { ...state.zones, ...zones });
}

/** Mount once in real (non-demo) agendas; returns a version to put in memo deps. */
export function useAgendaAvailability(enabled: boolean): number {
  const s = useSyncExternalStore(agendaAvailabilityStore.subscribe, agendaAvailabilityStore.get);
  useEffect(() => {
    if (!enabled) { if (state.active) agendaAvailabilityStore.reset(); return; }
    void refreshAgendaAvailability();
  }, [enabled]);
  return s.version;
}

// ---------- pure helpers (tested) ----------

const DEFAULT_TZ = 'Europe/Lisbon';
/** Wall-clock key (minutes since epoch, as if UTC) for comparisons in the clinic's zone. */
const wallKeyOf = (y: number, m: number, d: number, h: number, mi: number) => Date.UTC(y, m - 1, d, h, mi) / 60000;
function instantWall(iso: string, tz: string) { const p = zonedParts(iso, tz); return wallKeyOf(p.year, p.month, p.day, p.hour, p.minute); }

/** UTC instant for a wall-clock time in an IANA zone (DST-safe, two-pass). */
export function wallToUtc(y: number, m: number, d: number, h: number, mi: number, tz: string): Date {
  const target = wallKeyOf(y, m, d, h, mi) * 60000;
  let guess = target;
  for (let i = 0; i < 2; i++) {
    const p = zonedParts(guess, tz);
    guess += target - wallKeyOf(p.year, p.month, p.day, p.hour, p.minute) * 60000;
  }
  return new Date(guess);
}

export const appliesTo = (e: AgendaException, dentistId: string, clinicId: string) =>
  e.dentist_id === dentistId && (e.clinic_id === null || e.clinic_id === clinicId);

/**
 * Mark the day's 30-min slots covered by real exceptions.
 * Absence → `bloqueado` (first slot spans the run, the rest are hidden continuations);
 * opening → keeps the slot bookable but tagged `abertura`. Booked slots are never hidden.
 */
export function applyExceptions(
  slots: TimeSlot[], date: Date, dentistId: string, clinicId: string,
  exceptions: AgendaException[], tz: string = DEFAULT_TZ,
): TimeSlot[] {
  const mine = exceptions.filter((e) => appliesTo(e, dentistId, clinicId));
  if (!mine.length) return slots;
  const y = date.getFullYear(), mo = date.getMonth() + 1, d = date.getDate();
  const ranges = mine.map((e) => ({ e, s: instantWall(e.starts_at, tz), en: instantWall(e.ends_at, tz) }));
  const out = slots.map((slot) => {
    const [h, mi] = slot.time.split(':').map(Number);
    const s = wallKeyOf(y, mo, d, h, mi), en = s + 30;
    const abs = ranges.find((r) => r.e.kind === 'ausencia' && r.s < en && r.en > s);
    if (abs && slot.status !== 'ocupado') {
      return { ...slot, status: 'bloqueado' as const, consultation: undefined, blockReason: abs.e.reason, blockColor: abs.e.color ?? undefined, exceptionKind: 'ausencia' as const, exceptionId: abs.e.id };
    }
    const open = ranges.find((r) => r.e.kind === 'abertura' && r.s < en && r.en > s);
    if (open && slot.status === 'livre') return { ...slot, exceptionKind: 'abertura' as const, exceptionId: open.e.id, blockReason: open.e.reason, blockColor: open.e.color ?? undefined };
    return slot;
  });
  // Merge consecutive slots of the same absence into one drawn block.
  for (let i = 0; i < out.length; i++) {
    const cur = out[i];
    if (cur.exceptionKind !== 'ausencia' || cur.blockHidden) continue;
    let j = i + 1;
    while (j < out.length && out[j].exceptionKind === 'ausencia' && out[j].exceptionId === cur.exceptionId) { out[j] = { ...out[j], blockHidden: true }; j++; }
    out[i] = { ...cur, blockSpan: j - i };
  }
  return out;
}

/** Real exceptions touching a calendar day (month views). */
export function exceptionsOnDay(date: Date, dentistIds: string[] | null, exceptions: AgendaException[], tz: string = DEFAULT_TZ): AgendaException[] {
  const y = date.getFullYear(), mo = date.getMonth() + 1, d = date.getDate();
  const s = wallKeyOf(y, mo, d, 0, 0), en = s + 1440;
  return exceptions.filter((e) => (!dentistIds || dentistIds.includes(e.dentist_id)) && instantWall(e.starts_at, tz) < en && instantWall(e.ends_at, tz) > s);
}

export function zoneFor(clinicId: string | null | undefined): string {
  return (clinicId && state.zones[clinicId]) || DEFAULT_TZ;
}

/** Translate the server's availability refusals into i18n keys. */
export function availabilityErrorKey(err: unknown): string | null {
  const msg = String((err as { message?: string })?.message ?? err ?? '');
  if (msg.includes('slot_in_absence')) return 'availabilityReal.inAbsence';
  if (msg.includes('outside_working_hours')) return 'availabilityReal.outsideHours';
  return null;
}

export interface ConflictingAppointment { id: string; scheduled_at: string; duration_minutes: number; patient_id: string; clinic_id: string | null }
/** Appointments already inside a range (dentist / own clinic only) — used to warn after creating an absence. */
export async function findConflicts(dentistId: string, clinicId: string | null, start: Date, end: Date): Promise<ConflictingAppointment[]> {
  const { data, error } = await supabase.rpc('appointments_in_range', { _dentist: dentistId, _clinic: clinicId, _start: start.toISOString(), _end: end.toISOString() });
  if (error) return [];
  return (data ?? []) as ConflictingAppointment[];
}
