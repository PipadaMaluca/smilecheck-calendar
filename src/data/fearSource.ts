import { supabase } from '@/integrations/supabase/client';
import type { FearLevel } from '@/lib/fearScale';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isRealId = (id?: string | null) => !!id && UUID.test(id);

export interface FearAssessment { level: FearLevel; createdAt: string; professionalId: string }
export interface FearSummary { patientLevel: number | null; history: FearAssessment[] }

/** Demo values (mock patients): self 2, professional 3 → shows the "differs by ≥ 2"-free normal case with history. */
export const DEMO_FEAR: FearSummary = {
  patientLevel: 2,
  history: [
    { level: 3, createdAt: '2026-01-20T10:00:00Z', professionalId: 'demo' },
    { level: 2, createdAt: '2025-11-04T15:30:00Z', professionalId: 'demo' },
  ],
};

/** Patient's own self-assessment (RLS: only the patient's own row). */
export async function saveOwnFearLevel(level: FearLevel) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: true, demo: true };
  const { error } = await supabase.from('patients').update({ fear_level: level }).eq('id', user.id);
  if (error) throw error;
  return { ok: true, demo: false };
}

export async function fetchOwnFearLevel(): Promise<number | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from('patients').select('fear_level').eq('id', user.id).maybeSingle();
  return data?.fear_level ?? null;
}

/** Professional view. Reads only what RLS allows (active relationship) and records the dossier access. */
export async function fetchFearSummary(patientId: string): Promise<FearSummary> {
  if (!isRealId(patientId)) return DEMO_FEAR;
  const [{ data: p }, { data: rows }] = await Promise.all([
    supabase.from('patients').select('fear_level').eq('id', patientId).maybeSingle(),
    supabase.from('fear_assessments').select('level, created_at, professional_id').eq('patient_id', patientId).order('created_at', { ascending: false }).limit(20),
  ]);
  void supabase.rpc('log_dossier_access', { _patient_id: patientId, _section: 'fear_scale' });
  return {
    patientLevel: p?.fear_level ?? null,
    history: (rows ?? []).map((r) => ({ level: r.level as FearLevel, createdAt: r.created_at, professionalId: r.professional_id })),
  };
}

/** Professional records their assessment after the appointment (insert-only; RLS checks the relationship). */
export async function recordFearAssessment(patientId: string, appointmentId: string | null, level: FearLevel) {
  if (!isRealId(patientId)) return { ok: true, demo: true };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: true, demo: true };
  const { error } = await supabase.from('fear_assessments').insert({
    patient_id: patientId,
    professional_id: user.id,
    appointment_id: isRealId(appointmentId) ? appointmentId : null,
    level,
  });
  if (error) throw error;
  return { ok: true, demo: false };
}
