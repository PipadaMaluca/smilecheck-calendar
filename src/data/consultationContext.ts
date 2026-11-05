import { useEffect, useState } from 'react';
import type { TFunction } from 'i18next';
import { supabase } from '@/integrations/supabase/client';
import { MEDICATIONS_WITH_TAGS, DRUG_INTERACTIONS, matchesCurrentMed, getMedicationAllergyBlock, type MedicationDef } from '@/data/drugSafetyData';
import { fetchSafety } from '@/data/clinicalDocs';
import { fetchSelfDeclared, mergeSafetySources } from '@/data/dossierSource';
import { fetchDisplayNames } from '@/data/displayNames';
import { DB_TYPE_TO_CATEGORY } from '@/data/agendaSource';
import { formatDate } from '@/lib/formatters';
import type { Consultation, ConsultationCategory } from '@/types/calendar';

/**
 * Real-account context for a consultation detail: clinical safety alerts built from the
 * real dossier (self-declared + professional data + recent prescriptions) and the
 * patient's real visit history. Demo screens keep their own mock and never call this.
 */
export interface HealthAlerts { allergies: string[]; medications: { name: string; interaction?: string }[] }
export interface HistoryRow { id: string; date: string; category: ConsultationCategory; typeKey: ConsultationCategory; dentist: string }

/** Prescriptions issued in this window count as current medication for the alerts. */
export const RECENT_RX_DAYS = 30;

const findDef = (name: string): MedicationDef => {
  const n = name.trim().toLowerCase();
  return MEDICATIONS_WITH_TAGS.find((m) => n.includes(m.name.toLowerCase()) || m.name.toLowerCase().includes(n))
    ?? { name: name.trim(), dosage: '', allergenTags: [] };
};

/** Pure: only real data in → alerts out. No data → no alerts (never invented). */
export function buildHealthAlerts(
  input: { allergies: string[]; currentMeds: { name: string; dosage?: string }[]; prescribed: string[] },
  t: TFunction,
): HealthAlerts {
  const allergies = Array.from(new Map(input.allergies.map((a) => [a.trim().toLowerCase(), a.trim()])).values()).filter(Boolean);
  const meds = new Map<string, { name: string; interaction?: string }>();
  const add = (name: string, text: string) => {
    const k = name.trim().toLowerCase();
    const cur = meds.get(k);
    meds.set(k, { name: name.trim(), interaction: cur?.interaction ? `${cur.interaction}; ${text}` : text });
  };
  const current = input.currentMeds.map((m) => ({ name: m.name, dosage: m.dosage ?? '' })).filter((m) => m.name.trim());

  // Current medication that is risky with common dental drugs.
  for (const m of current) {
    const hits = DRUG_INTERACTIONS.filter((i) => matchesCurrentMed(m.name, i.currentMed));
    if (!hits.length) { meds.set(m.name.trim().toLowerCase(), { name: m.name.trim() }); continue; }
    for (const h of hits) add(m.name, t('safetyReal.riskWith', { tags: h.prescribedTags.join(', '), risk: t(`safetyReal.risk.${h.riskKey}`) }));
  }
  // Recently prescribed drugs vs allergies and current medication.
  for (const p of input.prescribed) {
    if (!p.trim()) continue;
    const def = findDef(p);
    const block = getMedicationAllergyBlock(def, allergies);
    if (block) add(p, t('safetyReal.allergyConflict', { allergy: block.matchedAllergy }));
    for (const i of DRUG_INTERACTIONS) {
      const cm = current.find((c) => matchesCurrentMed(c.name, i.currentMed));
      if (!cm) continue;
      const byTag = def.allergenTags.some((tag) => (i.prescribedTags as string[]).includes(tag));
      const byName = (i.prescribedTags as string[]).some((x) => def.name.toLowerCase().includes(x.toLowerCase()));
      if (byTag || byName) add(p, t('safetyReal.interactsWith', { med: cm.name, risk: t(`safetyReal.risk.${i.riskKey}`) }));
    }
  }
  return { allergies, medications: Array.from(meds.values()) };
}

export const hasAlerts = (a: HealthAlerts | null | undefined) => !!a && (a.allergies.length > 0 || a.medications.some((m) => m.interaction));

const rpc = (fn: string, args: Record<string, unknown>) => supabase.rpc(fn as never, args as never);

async function fetchHistory(patientId: string, excludeId: string, familyMemberId: string | null): Promise<HistoryRow[]> {
  let q = supabase.from('appointments').select('id, scheduled_at, consultation_type, dentist_id')
    .eq('patient_id', patientId).in('status', ['visto', 'concluida']).lt('scheduled_at', new Date().toISOString())
    .neq('id', excludeId).order('scheduled_at', { ascending: false }).limit(5);
  q = familyMemberId ? q.eq('family_member_id', familyMemberId) : q.is('family_member_id', null);
  const { data, error } = await q;
  if (error) throw error;
  const names = await fetchDisplayNames((data ?? []).map((r) => r.dentist_id ?? '').filter(Boolean));
  return (data ?? []).map((r) => {
    const cat = DB_TYPE_TO_CATEGORY[r.consultation_type] ?? 'outro';
    return { id: r.id, date: formatDate(r.scheduled_at, { day: '2-digit', month: 'short', year: 'numeric' }), category: cat, typeKey: cat, dentist: (r.dentist_id && names.get(r.dentist_id)) || '—' };
  });
}

/**
 * `mode: 'professional'` gates everything behind `can_read_dossier` (the safety RPCs also log access);
 * `mode: 'patient'` only loads the patient's own visit history (RLS: own appointments).
 */
export function useConsultationContext(consultation: Consultation, enabled: boolean, mode: 'professional' | 'patient', t: TFunction) {
  const [state, setState] = useState<{ loading: boolean; alerts: HealthAlerts | null; history: HistoryRow[]; denied: boolean }>({ loading: enabled, alerts: null, history: [], denied: false });
  const id = consultation.id; const patientId = consultation.patient.id;
  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    (async () => {
      try {
        const { data: row } = await supabase.from('appointments').select('family_member_id').eq('id', id).maybeSingle();
        const fam = (row?.family_member_id as string | null) ?? null;
        if (mode === 'patient') {
          const history = await fetchHistory(patientId, id, fam);
          if (alive) setState({ loading: false, alerts: null, history, denied: false });
          return;
        }
        const { data: ok } = await rpc('can_read_dossier', { _patient_id: patientId });
        if (!ok) { if (alive) setState({ loading: false, alerts: null, history: [], denied: true }); return; }
        const since = new Date(Date.now() - RECENT_RX_DAYS * 86400000).toISOString();
        let rxq = supabase.from('prescriptions').select('items').eq('patient_id', patientId).eq('status', 'emitida').gte('created_at', since);
        rxq = fam ? rxq.eq('family_member_id', fam) : rxq.is('family_member_id', null);
        const [pro, self, rx, history] = await Promise.all([
          fetchSafety(patientId, fam), fetchSelfDeclared(patientId, fam), rxq, fetchHistory(patientId, id, fam),
        ]);
        const merged = mergeSafetySources(self, pro);
        const prescribed = (rx.data ?? []).flatMap((r) => (Array.isArray(r.items) ? r.items : []).map((i) => String((i as { medicamento?: unknown })?.medicamento ?? '')));
        const alerts = buildHealthAlerts({ allergies: merged.allergies, currentMeds: merged.medications, prescribed }, t);
        if (alive) setState({ loading: false, alerts, history, denied: false });
      } catch {
        if (alive) setState({ loading: false, alerts: null, history: [], denied: false });
      }
    })();
    return () => { alive = false; };
  }, [enabled, id, patientId, mode, t]);
  return state;
}
