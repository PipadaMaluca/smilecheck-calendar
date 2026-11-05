import { addDays, addMonths, addWeeks, isAfter } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

/** Real absences / exceptional openings (table `agenda_exceptions`, RLS: dentist + own clinic). */
export interface AgendaException {
  id: string; dentist_id: string; clinic_id: string | null; kind: 'ausencia' | 'abertura';
  starts_at: string; ends_at: string; full_day: boolean; reason: string; note: string | null; color: string | null;
}
export type NewException = Omit<AgendaException, 'id'>;

export const MAX_OCCURRENCES = 100;

/** Expand a (possibly repeating) range into concrete occurrences; capped so a typo can't flood the agenda. */
export function expandOccurrences(
  start: Date, end: Date,
  repeat: null | { frequency: 'daily' | 'weekly' | 'monthly'; until: Date; weekdays?: number[] },
): { start: Date; end: Date }[] {
  if (!(end > start)) return [];
  if (!repeat) return [{ start, end }];
  const len = end.getTime() - start.getTime();
  const out: { start: Date; end: Date }[] = [];
  const until = new Date(repeat.until); until.setHours(23, 59, 59, 999);
  if (repeat.frequency === 'weekly' && repeat.weekdays?.length) {
    // weekdays: 0 = Monday … 6 = Sunday (UI order)
    for (let d = new Date(start); !isAfter(d, until) && out.length < MAX_OCCURRENCES; d = addDays(d, 1)) {
      if (repeat.weekdays.includes((d.getDay() + 6) % 7)) out.push({ start: new Date(d), end: new Date(d.getTime() + len) });
    }
    return out;
  }
  const step = repeat.frequency === 'daily' ? (d: Date) => addDays(d, 1) : repeat.frequency === 'weekly' ? (d: Date) => addWeeks(d, 1) : (d: Date) => addMonths(d, 1);
  for (let d = new Date(start); !isAfter(d, until) && out.length < MAX_OCCURRENCES; d = step(d)) out.push({ start: new Date(d), end: new Date(d.getTime() + len) });
  return out;
}

const tbl = () => supabase.from('agenda_exceptions');

export async function listExceptions(dentistId: string, fromIso = new Date(Date.now() - 86400000).toISOString()): Promise<AgendaException[]> {
  const { data, error } = await tbl().select('id, dentist_id, clinic_id, kind, starts_at, ends_at, full_day, reason, note, color')
    .eq('dentist_id', dentistId).gte('ends_at', fromIso).order('starts_at').limit(300);
  if (error) throw error;
  return (data ?? []) as AgendaException[];
}

export async function createExceptions(rows: NewException[]) {
  if (!rows.length) return;
  const { error } = await tbl().insert(rows);
  if (error) throw error;
}

export async function deleteException(id: string) {
  const { error } = await tbl().delete().eq('id', id);
  if (error) throw error;
}
