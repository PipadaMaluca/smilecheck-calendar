import { supabase } from '@/integrations/supabase/client';
import type { ConsultationStatus, UserRole } from '@/types/calendar';
import { SEED_CLINIC_UUID_BY_ID, SEED_DENTIST_UUID_BY_ID } from '@/data/seedIds';

/**
 * Phase 4 · sub-step 2 — WRITE path.
 *
 * Points are ALWAYS written by the backend function `award_points`
 * (SECURITY DEFINER). The client never inserts into `points_ledger` and can no
 * longer update `user_levels` (those grants/policies were revoked), so values
 * cannot be forged: the function resolves the XP/point values from the
 * `points_rules` table, applies the level multiplier to reward points only,
 * keeps XP monotonic, recomputes the level and enforces the anti-fraud limits.
 *
 * Demo mode must never reach this module — every call site branches on
 * `isDemo` first.
 */

export type PointsActionKey =
  // patient
  | 'confirmacao_24h'
  | 'confirmacao_1h'
  | 'compareceu'
  | 'chegou_a_horas'
  | 'colaborou'
  | 'higiene_oral'
  | 'seguiu_recomendacoes'
  | 'convidar_amigo'
  | 'falta'
  | 'penalizacao_confirmacao'
  | 'cancelamento_tardio'
  // dentist
  | 'consulta_concluida'
  | 'mensagem_24h'
  | 'emitir_receita'
  | 'carta_referencia'
  // clinic
  | 'consulta_clinica'
  | 'novo_dentista_ativo'
  | 'taxa_confirmacao_90'
  // shared
  | 'teleconsulta'
  | 'checkin_diario'
  | 'feedback_rating';

export interface AwardResult {
  awarded: boolean;
  reason?: string;
  action_key?: string;
  xp_awarded?: number;
  points_awarded?: number;
  multiplier?: number;
  current_xp?: number;
  current_reward_points?: number;
  level?: string;
  level_up?: boolean;
  streak_days?: number;
  streak_bonus?: string;
}

export async function awardPoints(
  profileId: string,
  actionKey: PointsActionKey,
  opts: { appointmentId?: string | null; rating?: number } = {}
): Promise<AwardResult | null> {
  const { data, error } = await supabase.rpc('award_points', {
    _profile_id: profileId,
    _action_key: actionKey,
    _related_appointment_id: opts.appointmentId ?? undefined,
    _rating: opts.rating ?? undefined,
  });
  if (error) {
    // Points are a side effect: never break the user's primary action.
    console.warn('[points] award failed', actionKey, error.message);
    return null;
  }
  return data as unknown as AwardResult;
}

/** Fire-and-forget variant used by UI side effects. */
export function awardPointsSilently(
  profileId: string,
  actionKey: PointsActionKey,
  opts: { appointmentId?: string | null; rating?: number } = {}
) {
  void awardPoints(profileId, actionKey, opts).catch(() => undefined);
}

interface AppointmentParties {
  id: string;
  patientId: string;
  dentistId: string | null;
  clinicOwnerId: string | null;
  isTeleconsultation: boolean;
  scheduledAt: string;
}

async function loadParties(appointmentId: string): Promise<AppointmentParties | null> {
  const { data, error } = await supabase
    .from('appointments')
    .select('id, patient_id, dentist_id, clinic_id, is_teleconsultation, scheduled_at, clinics(owner_profile_id)')
    .eq('id', appointmentId)
    .maybeSingle();
  if (error || !data) return null;
  const clinic = (data as { clinics?: { owner_profile_id: string | null } | null }).clinics;
  return {
    id: data.id,
    patientId: data.patient_id,
    dentistId: data.dentist_id,
    clinicOwnerId: clinic?.owner_profile_id ?? null,
    isTeleconsultation: !!data.is_teleconsultation,
    scheduledAt: data.scheduled_at,
  };
}

/**
 * Awards the point transactions attached to an appointment status change.
 * - `visto` (consultation completed, DB `concluida`) → attendance (patient)
 *   + consulta concluída/teleconsulta (dentist)
 *   + consulta na clínica/teleconsulta (clinic owner)
 * - `falta_nao_justificada` → patient no-show penalty (reward points only).
 *   A justified absence carries no penalty.
 * - `confirmada` → patient confirmation points (24h vs 1h window)
 */
export async function awardStatusPoints(
  appointmentId: string,
  status: ConsultationStatus,
  actorRole: UserRole
): Promise<void> {
  if (status !== 'visto' && status !== 'falta_nao_justificada' && status !== 'confirmada') return;
  const parties = await loadParties(appointmentId);
  if (!parties) return;

  const opts = { appointmentId };

  if (status === 'confirmada') {
    // Only the patient earns confirmation points, and only for their own row.
    if (actorRole !== 'patient') return;
    const hoursAhead = (new Date(parties.scheduledAt).getTime() - Date.now()) / 3_600_000;
    await awardPoints(parties.patientId, hoursAhead > 1 ? 'confirmacao_24h' : 'confirmacao_1h', opts);
    return;
  }

  if (status === 'falta_nao_justificada') {
    await awardPoints(parties.patientId, 'falta', opts);
    return;
  }

  // visto / concluída — the attendance formula is computed server-side.
  await awardPoints(parties.patientId, 'compareceu', opts);
  if (parties.dentistId) {
    await awardPoints(
      parties.dentistId,
      parties.isTeleconsultation ? 'teleconsulta' : 'consulta_concluida',
      opts
    );
  }
  if (parties.clinicOwnerId) {
    await awardPoints(
      parties.clinicOwnerId,
      parties.isTeleconsultation ? 'teleconsulta' : 'consulta_clinica',
      opts
    );
  }
}

/**
 * Resolves the mock feedback target (dentist-3 / clinic "1" / patient name)
 * to a real profile UUID so rating points can be awarded server-side.
 */
export async function resolveFeedbackTargetProfileId(
  targetRole: 'patient' | 'dentist' | 'clinic',
  targetId: string,
  targetName: string
): Promise<string | null> {
  if (targetRole === 'dentist') {
    const key = targetId.replace(/^dentist-/, '');
    return SEED_DENTIST_UUID_BY_ID[key] ?? null;
  }
  if (targetRole === 'clinic') {
    const uuid = SEED_CLINIC_UUID_BY_ID[targetId];
    if (uuid) {
      const { data } = await supabase
        .from('clinics')
        .select('owner_profile_id')
        .eq('id', uuid)
        .maybeSingle();
      return data?.owner_profile_id ?? null;
    }
    return null;
  }
  const { data } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'patient')
    .eq('full_name', targetName)
    .limit(1)
    .maybeSingle();
  return data?.id ?? null;
}

/** Feedback rating → points for the person being rated (all 6 directions). */
export async function awardFeedbackPoints(
  targetProfileId: string,
  rating: number,
  appointmentId?: string | null
): Promise<AwardResult | null> {
  return awardPoints(targetProfileId, 'feedback_rating', { rating, appointmentId });
}

/**
 * Reward-point reset rule (modelled, not scheduled yet):
 * - Free plan → reward points reset every 1 January (XP never resets)
 * - Pro / Premium → no reset (Premium additionally gets a +10% year-end bonus)
 */
export const REWARD_POINTS_RESET_RULE = {
  free: { resetsAnnually: true, resetOn: '01-01', yearEndBonusPct: 0 },
  pro: { resetsAnnually: false, resetOn: null, yearEndBonusPct: 0 },
  premium: { resetsAnnually: false, resetOn: null, yearEndBonusPct: 10 },
} as const;
