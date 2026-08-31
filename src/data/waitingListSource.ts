import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Database } from '@/integrations/supabase/types';
import { assignWaitingMatch, type FreedSlot, type WaitingMatch } from '@/data/agendaWrites';
import { SEED_DENTIST_ID_BY_UUID } from '@/data/seedIds';
import { mockDentists } from '@/data/mockData';

/**
 * Phase 4 — waiting-list management panel: real READ + actions.
 * Demo mode never reaches this module (callers branch on `isDemo`).
 */

type DbConsultationType = Database['public']['Enums']['consultation_type'];
type DbWaitingUrgency = Database['public']['Enums']['waiting_urgency'];
type DbWaitingStatus = Database['public']['Enums']['waiting_status'];

export interface WaitingEntry {
  id: string;
  patientId: string;
  patientName: string;
  dentistId: string | null;
  dentistName: string;
  clinicId: string | null;
  consultationType: DbConsultationType;
  preferredSlots: { date: string; time: string }[];
  genericPrefs: { periods: string[]; weekdays: number[] };
  observation: string | null;
  urgency: DbWaitingUrgency;
  status: DbWaitingStatus;
  createdAt: string;
}

interface Row {
  id: string;
  patient_id: string;
  dentist_id: string | null;
  clinic_id: string | null;
  consultation_type: DbConsultationType;
  preferred_slots: unknown;
  generic_preferences: unknown;
  observation: string | null;
  urgency: DbWaitingUrgency;
  status: DbWaitingStatus;
  created_at: string;
}

function dentistNameFor(uuid: string | null): string {
  if (!uuid) return '—';
  const mockId = SEED_DENTIST_ID_BY_UUID[uuid];
  return mockDentists.find((d) => d.id === mockId)?.name ?? '—';
}

/** RLS scopes this to the entries the signed-in dentist / clinic may manage. */
export async function fetchWaitingEntries(): Promise<WaitingEntry[]> {
  const { data, error } = await supabase
    .from('waiting_list')
    .select(
      'id, patient_id, dentist_id, clinic_id, consultation_type, preferred_slots, generic_preferences, observation, urgency, status, created_at'
    )
    .in('status', ['em_espera', 'notificado'])
    .order('created_at', { ascending: true })
    .limit(500)
    .returns<Row[]>();

  if (error) throw error;
  const rows = data ?? [];
  if (!rows.length) return [];

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name')
    .in('id', [...new Set(rows.map((r) => r.patient_id))]);
  const names = new Map((profiles ?? []).map((p) => [p.id, p.full_name ?? 'Paciente']));

  const entries: WaitingEntry[] = rows.map((row) => {
    const prefs = (row.generic_preferences ?? {}) as { periods?: string[]; weekdays?: number[] };
    return {
      id: row.id,
      patientId: row.patient_id,
      patientName: names.get(row.patient_id) ?? 'Paciente',
      dentistId: row.dentist_id,
      dentistName: dentistNameFor(row.dentist_id),
      clinicId: row.clinic_id,
      consultationType: row.consultation_type,
      preferredSlots: Array.isArray(row.preferred_slots)
        ? (row.preferred_slots as { date?: string; time?: string }[])
            .filter((s) => s?.date && s?.time)
            .map((s) => ({ date: s.date as string, time: s.time as string }))
        : [],
      genericPrefs: { periods: prefs.periods ?? [], weekdays: prefs.weekdays ?? [] },
      observation: row.observation,
      urgency: row.urgency,
      status: row.status,
      createdAt: row.created_at,
    };
  });

  // Urgent first, then oldest first.
  return entries.sort((a, b) => {
    if (a.urgency !== b.urgency) return a.urgency === 'urgente' ? -1 : 1;
    return a.createdAt.localeCompare(b.createdAt);
  });
}

/** Status -> `notificado` plus an in-app notification for the patient. */
export async function notifyWaitingEntry(entry: WaitingEntry, message: string): Promise<void> {
  const { data, error } = await supabase
    .from('waiting_list')
    .update({ status: 'notificado' })
    .eq('id', entry.id)
    .select('id');
  if (error) throw error;
  if (!data?.length) throw new Error('Entrada não encontrada');

  await supabase.from('notifications').insert({
    profile_id: entry.patientId,
    type: 'waiting_list',
    title: 'Vaga disponível',
    message,
    action_url: '/app',
    read: false,
  });
}

/** Hard delete — the waiting list is not clinical history. */
export async function removeWaitingEntry(id: string): Promise<void> {
  const { error } = await supabase.from('waiting_list').delete().eq('id', id);
  if (error) throw error;
}

/**
 * Assign a slot: reuses the Phase 3.3 auto-match writer, so the appointment is
 * inserted first and the entry is only marked `confirmado` afterwards (with a
 * rollback of the appointment when that second write fails).
 */
export async function assignWaitingEntry(
  entry: WaitingEntry,
  slot: { date: string; time: string },
  fallbackDentistId: string | null,
  message: string
): Promise<string> {
  const [y, m, d] = slot.date.split('-').map(Number);
  const [hh, mm] = slot.time.split(':').map(Number);
  const scheduledAt = new Date(Date.UTC(y, m - 1, d, hh, mm, 0, 0)).toISOString();

  const freed: FreedSlot = {
    scheduledAt,
    durationMinutes: 30,
    dentistId: entry.dentistId ?? fallbackDentistId,
    clinicId: entry.clinicId,
    consultationType: entry.consultationType,
    isTeleconsultation: entry.consultationType === 'teleconsulta',
    price: null,
  };

  const match: WaitingMatch = {
    id: entry.id,
    patientId: entry.patientId,
    patientName: entry.patientName,
    consultationType: entry.consultationType,
    urgency: entry.urgency,
    createdAt: entry.createdAt,
    reason: 'preferred_slot',
  };

  return assignWaitingMatch(match, freed, message);
}

/** Next weekday slots offered as alternatives when assigning manually. */
export function upcomingSlotOptions(count = 4): { date: string; time: string }[] {
  const times = ['09:00', '11:00', '14:30', '16:00'];
  const out: { date: string; time: string }[] = [];
  const cursor = new Date();
  cursor.setUTCHours(0, 0, 0, 0);
  let i = 0;
  while (out.length < count && i < 21) {
    cursor.setUTCDate(cursor.getUTCDate() + 1);
    i += 1;
    if (cursor.getUTCDay() === 0) continue;
    const date = `${cursor.getUTCFullYear()}-${String(cursor.getUTCMonth() + 1).padStart(2, '0')}-${String(cursor.getUTCDate()).padStart(2, '0')}`;
    out.push({ date, time: times[out.length % times.length] });
  }
  return out;
}

export interface WaitingListData {
  entries: WaitingEntry[];
  loading: boolean;
  error: string | null;
  isDemo: boolean;
  refresh: () => void;
}

export function useWaitingList(): WaitingListData {
  const { demoMode, user } = useAuth();
  const isDemo = demoMode || !user;
  const [entries, setEntries] = useState<WaitingEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (isDemo) {
      setEntries([]);
      setLoading(false);
      setError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetchWaitingEntries()
      .then((rows) => {
        if (cancelled) return;
        setEntries(rows);
        setError(null);
      })
      .catch((e) => {
        if (cancelled) return;
        setEntries([]);
        setError(e?.message ?? 'Erro ao carregar lista de espera');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isDemo, reloadKey]);

  const refresh = useCallback(() => setReloadKey((k) => k + 1), []);

  return useMemo(
    () => ({ entries, loading, error, isDemo, refresh }),
    [entries, loading, error, isDemo, refresh]
  );
}
