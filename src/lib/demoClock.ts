import { addDays, differenceInCalendarDays, startOfDay } from 'date-fns';
import type { ConsultationStatus } from '@/types/calendar';

/**
 * Demo clock. Mock data was authored around a fixed anchor day (Sat 31 Jan 2026).
 * Every demo date is shifted so the anchor lands on the real "today" (or on Monday
 * when today is Sunday — physical clinics are closed on Sundays).
 */
export const DEMO_ANCHOR = new Date(2026, 0, 31);

function computeOffset(now = new Date()) {
  const today = startOfDay(now);
  const target = today.getDay() === 0 ? addDays(today, 1) : today;
  return differenceInCalendarDays(target, DEMO_ANCHOR);
}

export const DEMO_DAY_OFFSET = computeOffset();

/** Same signature as `new Date(y, m, d, h, mi)` but shifted relative to today. */
export function demoDate(y: number, m: number, d = 1, h = 0, mi = 0, s = 0): Date {
  return addDays(new Date(y, m, d, h, mi, s), DEMO_DAY_OFFSET);
}

/** The demo "today" (anchor day after shifting). */
export const DEMO_TODAY = demoDate(2026, 0, 31);

const toMinutes = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

/**
 * Status that matches the real clock: past → visto (absences kept), ongoing → em_consulta,
 * future → agendada/confirmada.
 */
export function liveDemoStatus(
  date: Date,
  time: string,
  duration: number,
  original: ConsultationStatus | undefined,
  now = new Date(),
): ConsultationStatus {
  const start = new Date(date);
  const mins = toMinutes(time);
  start.setHours(Math.floor(mins / 60), mins % 60, 0, 0);
  const end = new Date(start.getTime() + (duration || 30) * 60000);
  const isAbsence = original === 'falta_justificada' || original === 'falta_nao_justificada';
  if (end <= now) return isAbsence ? original! : 'visto';
  if (start <= now) return isAbsence ? original! : 'em_consulta';
  if (original === 'confirmada') return 'confirmada';
  return 'agendada';
}

/** Parse "HH:mm" on a given day. */
export function atTime(date: Date, time: string) {
  const d = new Date(date);
  const mins = toMinutes(time);
  d.setHours(Math.floor(mins / 60), mins % 60, 0, 0);
  return d;
}

/** "Next" appointment: first one starting at/after now with status agendada/confirmada. */
export function pickNextAppointment<T extends { date: Date; time: string; status?: ConsultationStatus }>(
  items: T[],
  now = new Date(),
): T | undefined {
  return items
    .filter(c => (c.status === 'agendada' || c.status === 'confirmada') && atTime(c.date, c.time) >= now)
    .sort((a, b) => atTime(a.date, a.time).getTime() - atTime(b.date, b.time).getTime())[0];
}
