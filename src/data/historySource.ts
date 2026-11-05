import { supabase } from '@/integrations/supabase/client';
import { fetchDisplayNames } from '@/data/displayNames';
import { DB_TYPE_TO_CATEGORY } from '@/data/agendaSource';
import { zonedParts } from '@/lib/formatters';
import type { ConsultationScore } from '@/types/scoring';
import type { UserRole } from '@/types/calendar';

/** Real consultation history (past visits only), points from the caller's own ledger, own ratings. */
export interface RealHistoryItem extends ConsultationScore { counterpartId: string | null }

export const HISTORY_STATUSES = ['visto', 'concluida', 'falta'] as const;

export async function fetchRealHistory(profileId: string, role: UserRole): Promise<RealHistoryItem[]> {
  let q = supabase.from('appointments').select('id, scheduled_at, consultation_type, status, patient_id, dentist_id, clinic_id')
    .in('status', [...HISTORY_STATUSES]).lt('scheduled_at', new Date().toISOString())
    .order('scheduled_at', { ascending: false }).limit(200);
  if (role === 'patient') q = q.eq('patient_id', profileId);
  else if (role === 'dentist') q = q.eq('dentist_id', profileId);
  const { data: appts, error } = await q;
  if (error) throw error;
  const rows = appts ?? [];
  if (!rows.length) return [];
  const ids = rows.map((r) => r.id);
  const clinicIds = [...new Set(rows.map((r) => r.clinic_id).filter((c): c is string => !!c))];
  const [{ data: ledger }, { data: given }, { data: received }, { data: clinics }, names] = await Promise.all([
    supabase.from('points_ledger').select('related_appointment_id, amount, reason').eq('profile_id', profileId).eq('type', 'reward_points').in('related_appointment_id', ids),
    supabase.from('feedback').select('appointment_id, rating, comment, created_at').eq('from_profile_id', profileId).in('appointment_id', ids),
    supabase.from('feedback').select('appointment_id, rating').eq('to_profile_id', profileId).in('appointment_id', ids),
    clinicIds.length ? supabase.from('clinics').select('id, name, timezone').in('id', clinicIds) : Promise.resolve({ data: [] as { id: string; name: string; timezone: string }[] }),
    fetchDisplayNames(rows.flatMap((r) => [r.patient_id, r.dentist_id ?? ''])),
  ]);
  const clinicById = new Map((clinics ?? []).map((c) => [c.id, c]));
  return rows.map((r) => {
    const pts = (ledger ?? []).filter((l) => l.related_appointment_id === r.id);
    const mine = (given ?? []).find((f) => f.appointment_id === r.id);
    const got = (received ?? []).find((f) => f.appointment_id === r.id);
    const clinic = r.clinic_id ? clinicById.get(r.clinic_id) : undefined;
    const z = zonedParts(r.scheduled_at, clinic?.timezone || 'Europe/Lisbon');
    const counterpartId = role === 'patient' ? r.dentist_id : r.patient_id;
    return {
      id: r.id, consultationId: r.id, counterpartId,
      date: new Date(z.year, z.month - 1, z.day),
      consultationTime: `${String(z.hour).padStart(2, '0')}:${String(z.minute).padStart(2, '0')}`,
      dentistName: (r.dentist_id && names.get(r.dentist_id)) || '—',
      clinicName: clinic?.name ?? '—',
      patientName: names.get(r.patient_id) ?? undefined,
      category: DB_TYPE_TO_CATEGORY[r.consultation_type] ?? 'outro',
      totalPoints: pts.reduce((s, l) => s + l.amount, 0),
      breakdown: pts.map((l) => ({ label: l.reason ?? '—', points: l.amount })),
      // Only an attended visit can be rated (server rule); absences never show the prompt.
      feedbackStatus: mine || role === 'clinic' ? 'completed' : r.status === 'falta' ? 'expired' : 'pending',
      patientFeedback: mine ? { rating: mine.rating, comment: mine.comment ?? undefined, submittedAt: new Date(mine.created_at) } : undefined,
      receivedRating: got?.rating,
    } satisfies RealHistoryItem;
  });
}
