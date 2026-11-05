import { toast } from 'sonner';
import type { TFunction } from 'i18next';
import { supabase } from '@/integrations/supabase/client';
import { createExceptions, type NewException } from '@/data/agendaExceptions';
import { findConflicts, refreshAgendaAvailability, wallToUtc, zoneFor, type ConflictingAppointment } from '@/data/agendaAvailability';
import { formatDate } from '@/lib/formatters';

export interface WallRange { start: Date; end: Date } // local Date objects carrying the wall-clock date/time picked in the form
export interface ExceptionTarget { dentistId: string; clinicId: string | null }

/** Wall-clock (as picked) → UTC instant in the clinic's zone. */
export function wallDateToUtc(d: Date, clinicId: string | null): Date {
  return wallToUtc(d.getFullYear(), d.getMonth() + 1, d.getDate(), d.getHours(), d.getMinutes(), zoneFor(clinicId));
}

/**
 * Save real absences/openings, refresh every agenda view and — for absences — warn
 * the dentist/clinic about appointments already inside them (never cancels them).
 */
export async function saveAgendaExceptions(
  t: TFunction,
  kind: 'ausencia' | 'abertura',
  targets: ExceptionTarget[],
  ranges: WallRange[],
  base: { createdBy: string; fullDay: boolean; reason: string; note: string | null; color: string | null },
): Promise<ConflictingAppointment[]> {
  const rows: (NewException & { created_by: string })[] = targets.flatMap((tg) => ranges.map((r) => ({
    dentist_id: tg.dentistId, clinic_id: tg.clinicId, kind,
    starts_at: wallDateToUtc(r.start, tg.clinicId).toISOString(),
    ends_at: wallDateToUtc(r.end, tg.clinicId).toISOString(),
    full_day: base.fullDay, reason: base.reason.slice(0, 120), note: base.note,
    color: base.color && /^#[0-9A-Fa-f]{6}$/.test(base.color) ? base.color : null,
    created_by: base.createdBy,
  })));
  await createExceptions(rows);
  await refreshAgendaAvailability();
  if (kind !== 'ausencia') return [];

  const found = (await Promise.all(rows.map((r) => findConflicts(r.dentist_id, r.clinic_id, new Date(r.starts_at), new Date(r.ends_at))))).flat();
  const unique = [...new Map(found.map((c) => [c.id, c])).values()].sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at));
  if (unique.length) await warnConflicts(t, unique);
  return unique;
}

export async function warnConflicts(t: TFunction, list: ConflictingAppointment[]) {
  const ids = [...new Set(list.map((c) => c.patient_id))];
  const { data } = await supabase.from('profiles').select('id, full_name').in('id', ids);
  const names = new Map((data ?? []).map((p) => [p.id, p.full_name ?? '—']));
  const lines = list.slice(0, 8).map((c) => {
    const tz = zoneFor(c.clinic_id);
    const when = formatDate(c.scheduled_at, { timeZone: tz, weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    return `• ${when} — ${names.get(c.patient_id) ?? '—'}`;
  });
  if (list.length > 8) lines.push(t('availabilityReal.andMore', { count: list.length - 8 }));
  toast.warning(t('availabilityReal.conflictsTitle', { count: list.length }), {
    description: `${lines.join('\n')}\n${t('availabilityReal.conflictsHint')}`,
    duration: 20000,
    className: 'whitespace-pre-line',
  });
}
