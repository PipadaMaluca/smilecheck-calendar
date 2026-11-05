import { addDays, isSameDay, isSameMonth, isSameWeek, isWithinInterval, startOfMonth, startOfWeek, endOfMonth } from 'date-fns';
import type { Consultation } from '@/types/calendar';
import { mockConsultations } from '@/data/mockData';
import { DEMO_TODAY } from '@/lib/demoClock';
import { zonedParts } from '@/lib/formatters';
import type { WorkingHours, Weekday } from '@/data/directorySource';

/** Single definition of every consultation KPI, shared by Estatísticas, Equipa and Dashboard. */
export type KpiPeriod = 'today' | 'week' | 'month';

const CONFIRMED = new Set(['confirmada', 'em_sala_espera', 'em_consulta', 'visto']);
const ABSENCE = new Set(['falta_justificada', 'falta_nao_justificada']);

export function inPeriod(c: Consultation, period: KpiPeriod, ref = DEMO_TODAY) {
  if (period === 'today') return isSameDay(c.date, ref);
  if (period === 'week') return isSameWeek(c.date, ref, { weekStartsOn: 1 });
  return isSameMonth(c.date, ref);
}

export function computeKpis(cons: Consultation[]) {
  const total = cons.length;
  const confirmed = cons.filter(c => CONFIRMED.has(c.status as string)).length;
  const absences = cons.filter(c => ABSENCE.has(c.status as string)).length;
  const tele = cons.filter(c => c.type === 'teleconsulta').length;
  const pct = (n: number) => (total > 0 ? Math.round((n / total) * 100) : 0);
  return {
    total,
    confirmed,
    absences,
    tele,
    presencial: total - tele,
    confirmRate: pct(confirmed),
    absenceRate: pct(absences),
    revenue: cons.reduce((s, c) => s + (Number.isFinite(c.price) ? c.price || 0 : 0), 0),
  };
}

/** KPIs for one dentist across the demo month (used by the Team screen). */
export function dentistMonthKpis(dentistId: string, clinicId?: string) {
  return computeKpis(
    mockConsultations.filter(c => c.dentist.id === dentistId && (!clinicId || c.clinic.id === clinicId) && inPeriod(c, 'month')),
  );
}

/* ───────────── Real data helpers ───────────── */

/** "Today" as a local midnight Date matching the wall-clock day in the clinic's time zone. */
export function clinicToday(timeZone = 'Europe/Lisbon', now: Date = new Date()): Date {
  const z = zonedParts(now, timeZone);
  return new Date(z.year, z.month - 1, z.day);
}

/** Backend id of the dentist / clinic (real rows); falls back to the display id (demo). */
export const dentistKey = (c: Consultation) => c.ref?.dentistId ?? c.dentist.id;
export const clinicKey = (c: Consultation) => c.ref?.clinicId ?? c.clinic.id;

export interface KpiScope {
  role: 'patient' | 'dentist' | 'clinic';
  selfId: string;
  /** Clinics the signed-in clinic account owns. */
  clinicIds: string[];
}

/**
 * Narrows real appointments to what each role's KPIs cover — dentist: own agenda;
 * clinic: its clinics; patient: own + family (RLS already limits the rows). Cancelled never counts.
 */
export function scopeConsultations(cons: Consultation[], scope: KpiScope): Consultation[] {
  const clinics = new Set(scope.clinicIds);
  return cons.filter((c) => {
    if (c.ref?.dbStatus === 'cancelada') return false;
    if (scope.role === 'dentist') return dentistKey(c) === scope.selfId;
    if (scope.role === 'clinic') return clinics.has(clinicKey(c));
    return true;
  });
}

const DAY_KEYS: Weekday[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

export function periodRange(period: KpiPeriod, ref: Date): { start: Date; end: Date } {
  if (period === 'today') return { start: ref, end: ref };
  if (period === 'week') {
    const start = startOfWeek(ref, { weekStartsOn: 1 });
    return { start, end: addDays(start, 6) };
  }
  return { start: startOfMonth(ref), end: endOfMonth(ref) };
}

/** Minutes the dentist is scheduled to work at a clinic between two days (inclusive). */
export function workingMinutes(hours: WorkingHours | undefined, start: Date, end: Date): number {
  if (!hours) return 0;
  let total = 0;
  for (let d = new Date(start); d <= end; d = addDays(d, 1)) {
    for (const [a, b] of hours[DAY_KEYS[d.getDay()]] ?? []) total += Math.max(0, toMin(b) - toMin(a));
  }
  return total;
}

/**
 * Occupancy % = booked in-person minutes ÷ working minutes (from `clinic_members.working_hours`).
 * Returns null when no working hours are saved (shown as "—", never invented).
 */
export function occupancyRate(
  cons: Consultation[],
  members: { dentistId: string; clinicId: string; hours?: WorkingHours }[],
  period: KpiPeriod,
  ref: Date,
): number | null {
  const { start, end } = periodRange(period, ref);
  const available = members.reduce((s, m) => s + workingMinutes(m.hours, start, end), 0);
  if (available <= 0) return null;
  const keys = new Set(members.map((m) => `${m.dentistId}|${m.clinicId}`));
  const booked = cons
    .filter((c) => c.type !== 'teleconsulta' && keys.has(`${dentistKey(c)}|${clinicKey(c)}`))
    .filter((c) => isWithinInterval(c.date, { start, end }))
    .reduce((s, c) => s + (c.duration || 0), 0);
  return Math.min(100, Math.round((booked / available) * 100));
}
