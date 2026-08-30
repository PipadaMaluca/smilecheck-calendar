import { supabase } from '@/integrations/supabase/client';
import { awardPoints, type AwardResult } from '@/data/pointsWrites';
import { SEED_CLINIC_UUID_BY_ID, SEED_DENTIST_UUID_BY_ID } from '@/data/seedIds';
import type { FeedbackTargetRole, PendingFeedbackItem } from '@/data/bidirectionalFeedback';
import type { UserRole } from '@/types/calendar';

/**
 * Feedback / rating persistence.
 *
 * - The rating row lives in `feedback` (appointment_id, from_profile_id,
 *   to_profile_id, rating, comment).
 * - RLS (`can_rate_appointment`) guarantees the author took part in the
 *   appointment and that the recipient is one of its counterparties.
 * - A unique index on (appointment_id, from_profile_id, to_profile_id) blocks
 *   duplicate ratings for the same direction.
 * - Points for the rating go to the RECIPIENT and are computed server-side by
 *   `award_points` ('feedback_rating' → avaliacao_N rule, non-linear scale,
 *   40 evaluations/day anti-fraud cap).
 *
 * Demo mode never reaches this module — every call site branches on `isDemo`.
 */

export type SubmitFeedbackFailure = 'already_rated' | 'not_allowed' | 'failed';

export interface SubmitFeedbackResult {
  saved: boolean;
  reason?: SubmitFeedbackFailure;
  award?: AwardResult | null;
}

export interface SubmitFeedbackInput {
  appointmentId: string;
  fromProfileId: string;
  toProfileId: string;
  rating: number;
  comment?: string;
}

export async function submitFeedback({
  appointmentId,
  fromProfileId,
  toProfileId,
  rating,
  comment,
}: SubmitFeedbackInput): Promise<SubmitFeedbackResult> {
  const { error } = await supabase.from('feedback').insert({
    appointment_id: appointmentId,
    from_profile_id: fromProfileId,
    to_profile_id: toProfileId,
    rating,
    comment: comment?.trim() ? comment.trim() : null,
  });

  if (error) {
    if (error.code === '23505') return { saved: false, reason: 'already_rated' };
    if (error.code === '42501') return { saved: false, reason: 'not_allowed' };
    console.warn('[feedback] insert failed', error.message);
    return { saved: false, reason: 'failed' };
  }

  // Points go to the person being rated, server-side.
  const award = await awardPoints(toProfileId, 'feedback_rating', { rating, appointmentId });
  return { saved: true, award };
}

/* ==================== READ ==================== */

export interface ReceivedFeedbackRow {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  fromProfileId: string;
  fromName: string | null;
}

export async function fetchReceivedFeedback(
  profileId: string,
  limit = 20
): Promise<ReceivedFeedbackRow[]> {
  const { data, error } = await supabase
    .from('feedback')
    .select('id, rating, comment, created_at, from_profile_id, profiles!feedback_from_profile_id_fkey(full_name)')
    .eq('to_profile_id', profileId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return data.map((row) => ({
    id: row.id,
    rating: row.rating,
    comment: row.comment,
    createdAt: row.created_at,
    fromProfileId: row.from_profile_id,
    fromName: (row as { profiles?: { full_name: string | null } | null }).profiles?.full_name ?? null,
  }));
}

export interface RatingSummary {
  average: number | null;
  count: number;
}

/** Average rating computed from the real feedback rows for a profile. */
export async function fetchRatingSummary(profileId: string): Promise<RatingSummary> {
  const { data, error } = await supabase
    .from('feedback')
    .select('rating')
    .eq('to_profile_id', profileId);
  if (error || !data || data.length === 0) return { average: null, count: 0 };
  const sum = data.reduce((acc, r) => acc + r.rating, 0);
  return { average: Math.round((sum / data.length) * 10) / 10, count: data.length };
}

/**
 * Resolves a mock dentist/clinic id to the seeded *profile* UUID that receives
 * feedback (for clinics that is the owner profile, not the clinic row).
 */
export async function seededProfileIdFor(
  role: 'dentist' | 'clinic',
  id: string
): Promise<string | null> {
  if (role === 'dentist') return SEED_DENTIST_UUID_BY_ID[id.replace(/^dentist-/, '')] ?? null;
  const clinicUuid = SEED_CLINIC_UUID_BY_ID[id];
  if (!clinicUuid) return null;
  const { data } = await supabase
    .from('clinics')
    .select('owner_profile_id')
    .eq('id', clinicUuid)
    .maybeSingle();
  return data?.owner_profile_id ?? null;
}

/* ==================== PENDING PROMPTS ==================== */

interface AppointmentRow {
  id: string;
  scheduled_at: string;
  consultation_type: string;
  patient_id: string;
  dentist_id: string | null;
  clinic_id: string | null;
}

/**
 * Real pending feedback: completed appointments the caller took part in,
 * minus the directions already rated. One item per counterparty.
 */
export async function fetchPendingFeedback(
  profileId: string,
  role: UserRole
): Promise<PendingFeedbackItem[]> {
  const base = supabase
    .from('appointments')
    .select('id, scheduled_at, consultation_type, patient_id, dentist_id, clinic_id')
    .in('status', ['concluida'])
    .order('scheduled_at', { ascending: false })
    .limit(30);

  const query =
    role === 'patient'
      ? base.eq('patient_id', profileId)
      : role === 'dentist'
        ? base.eq('dentist_id', profileId)
        : base;

  const { data, error } = await query;
  if (error || !data || data.length === 0) return [];
  const appointments = data as AppointmentRow[];

  // Already-submitted directions for these appointments.
  const { data: existing } = await supabase
    .from('feedback')
    .select('appointment_id, to_profile_id')
    .eq('from_profile_id', profileId)
    .in('appointment_id', appointments.map((a) => a.id));
  const done = new Set((existing ?? []).map((f) => `${f.appointment_id}:${f.to_profile_id}`));

  // Names for every counterparty + clinic owner resolution.
  const profileIds = new Set<string>();
  appointments.forEach((a) => {
    profileIds.add(a.patient_id);
    if (a.dentist_id) profileIds.add(a.dentist_id);
  });
  const clinicIds = Array.from(
    new Set(appointments.map((a) => a.clinic_id).filter((c): c is string => !!c))
  );

  const [{ data: clinics }, { data: profiles }] = await Promise.all([
    clinicIds.length
      ? supabase.from('clinics').select('id, name, owner_profile_id').in('id', clinicIds)
      : Promise.resolve({ data: [] as { id: string; name: string; owner_profile_id: string | null }[] }),
    supabase.from('profiles').select('id, full_name').in('id', Array.from(profileIds)),
  ]);

  const nameById = new Map((profiles ?? []).map((p) => [p.id, p.full_name ?? '—']));
  const clinicById = new Map((clinics ?? []).map((c) => [c.id, c]));

  const items: PendingFeedbackItem[] = [];
  const push = (
    appt: AppointmentRow,
    targetRole: FeedbackTargetRole,
    targetId: string,
    targetName: string,
    contextLabel?: string
  ) => {
    if (!targetId || targetId === profileId) return;
    if (done.has(`${appt.id}:${targetId}`)) return;
    const date = new Date(appt.scheduled_at);
    items.push({
      id: `${appt.id}:${targetId}`,
      pairId: appt.id,
      giverRole: role,
      targetRole,
      targetId,
      targetName,
      date,
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      consultationType: appt.consultation_type,
      contextLabel,
      appointmentId: appt.id,
      targetProfileId: targetId,
    });
  };

  for (const appt of appointments) {
    const clinic = appt.clinic_id ? clinicById.get(appt.clinic_id) : undefined;
    const isClinicOwner = clinic?.owner_profile_id === profileId;
    if (role === 'clinic' && !isClinicOwner) continue;

    if (role === 'patient') {
      if (appt.dentist_id) push(appt, 'dentist', appt.dentist_id, nameById.get(appt.dentist_id) ?? '—', clinic?.name);
      if (clinic?.owner_profile_id) push(appt, 'clinic', clinic.owner_profile_id, clinic.name, nameById.get(appt.dentist_id ?? ''));
    } else if (role === 'dentist') {
      push(appt, 'patient', appt.patient_id, nameById.get(appt.patient_id) ?? '—', appt.consultation_type);
      if (clinic?.owner_profile_id) push(appt, 'clinic', clinic.owner_profile_id, clinic.name);
    } else {
      push(appt, 'patient', appt.patient_id, nameById.get(appt.patient_id) ?? '—', appt.consultation_type);
      if (appt.dentist_id) push(appt, 'dentist', appt.dentist_id, nameById.get(appt.dentist_id) ?? '—', clinic?.name);
    }
  }

  return items.slice(0, 10);
}
