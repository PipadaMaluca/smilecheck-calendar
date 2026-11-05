import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { mapRpcRow, type RealSearchResult, type RpcRow } from '@/data/searchSource';

/**
 * Real public profiles (dentist / clinic) and verified reviews, through
 * SECURITY DEFINER RPCs that return public columns only — never phone, e-mail,
 * birth date, rating, level or plan of a third party.
 */
export interface PublicDentistJson {
  id: string; name: string | null; avatar_url: string | null;
  specialties: unknown; bio: string | null; languages: string[] | null;
  clinics: { id: string; name: string; address?: string | null; city?: string | null; postal_code?: string | null; lat?: number | null; lng?: number | null; timezone?: string }[];
}
export interface PublicClinicJson {
  id: string; name: string; address: string | null; city: string | null; postal_code: string | null;
  country: string; timezone: string; lat: number | null; lng: number | null; teleconsultation_available: boolean;
  dentists: { id: string; name: string | null; avatar_url: string | null; specialties: unknown }[];
}

export const PUBLIC_DENTIST_KEYS = ['id', 'name', 'avatar_url', 'specialties', 'bio', 'languages', 'clinics'] as const;
export const PRIVATE_KEYS = ['phone', 'email', 'date_of_birth', 'rating', 'level', 'plan'] as const;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = (s: string | null | undefined): boolean => !!s && UUID_RE.test(s);

/** Public dentist JSON → the card/profile shape the screens already use. */
export function dentistToResult(j: PublicDentistJson): RealSearchResult {
  const r = mapRpcRow({
    id: j.id, kind: 'dentist', name: j.name ?? '', avatar_url: j.avatar_url, specialties: j.specialties,
    languages: j.languages, clinics: j.clinics, distance_km: null, next_slot: null, total: 1,
  } as RpcRow);
  return { ...r, bio: j.bio ?? '' };
}

export async function fetchPublicDentist(id: string): Promise<RealSearchResult | null> {
  if (!isUuid(id)) return null;
  const { data, error } = await supabase.rpc('public_dentist_profile' as never, { _id: id } as never);
  if (error || !data) return null;
  return dentistToResult(data as unknown as PublicDentistJson);
}

export async function fetchPublicClinic(id: string): Promise<PublicClinicJson | null> {
  if (!isUuid(id)) return null;
  const { data, error } = await supabase.rpc('public_clinic_profile' as never, { _id: id } as never);
  if (error || !data) return null;
  return data as unknown as PublicClinicJson;
}

export interface ReviewSummary {
  count: number;
  /** null until there are at least 3 verified reviews. */
  average: number | null;
  reviews: { id: string; rating: number; comment: string | null; created_at: string; author: string }[];
}
export const EMPTY_REVIEWS: ReviewSummary = { count: 0, average: null, reviews: [] };
export const MIN_REVIEWS_FOR_AVERAGE = 3;

/** Mirrors the server rule so the UI never shows an average below the threshold. */
export function normalizeReviews(raw: Partial<ReviewSummary> | null | undefined): ReviewSummary {
  const count = Number(raw?.count ?? 0) || 0;
  if (count < MIN_REVIEWS_FOR_AVERAGE) return { count, average: null, reviews: [] };
  const avg = raw?.average == null ? null : Number(raw.average);
  return { count, average: Number.isFinite(avg) ? avg : null, reviews: Array.isArray(raw?.reviews) ? raw!.reviews! : [] };
}

export async function fetchReviews(target: { dentistId?: string; clinicId?: string }): Promise<ReviewSummary> {
  if (!isUuid(target.dentistId) && !isUuid(target.clinicId)) return EMPTY_REVIEWS;
  const { data, error } = await supabase.rpc('professional_reviews' as never, {
    _dentist: isUuid(target.dentistId) ? target.dentistId : null,
    _clinic: isUuid(target.clinicId) ? target.clinicId : null,
  } as never);
  if (error) return EMPTY_REVIEWS;
  return normalizeReviews(data as unknown as ReviewSummary);
}

export function useReviews(target: { dentistId?: string; clinicId?: string }, enabled: boolean) {
  const [data, setData] = useState<ReviewSummary>(EMPTY_REVIEWS);
  const [loading, setLoading] = useState(false);
  const key = `${target.dentistId ?? ''}|${target.clinicId ?? ''}`;
  useEffect(() => {
    if (!enabled) { setData(EMPTY_REVIEWS); return; }
    let alive = true;
    setLoading(true);
    void fetchReviews(target).then((d) => { if (alive) setData(d); }).finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, enabled]);
  return { ...data, loading };
}

/** Real patient search for professionals (active relationship only, server-side, paginated). */
export interface PatientHit { id: string; full_name: string | null; phone: string | null; date_of_birth: string | null; last_visit: string | null; next_visit: string | null; total: number }
export async function searchMyPatients(q: string, offset = 0, limit = 20): Promise<{ items: PatientHit[]; total: number }> {
  const { data, error } = await supabase.rpc('search_my_patients' as never, { _q: q.trim() || null, _limit: limit, _offset: offset } as never);
  if (error) throw error;
  const items = (data ?? []) as unknown as PatientHit[];
  return { items, total: Number(items[0]?.total ?? 0) };
}

/** Debounced server patient search (≥2 chars) for quick-search boxes; disabled in demo. */
export function usePatientSearch(query: string, enabled: boolean, limit = 5) {
  const [items, setItems] = useState<PatientHit[]>([]);
  useEffect(() => {
    if (!enabled || query.trim().length < 2) { setItems([]); return; }
    let alive = true;
    const h = setTimeout(() => {
      void searchMyPatients(query, 0, limit).then((r) => { if (alive) setItems(r.items); }).catch(() => { if (alive) setItems([]); });
    }, 250);
    return () => { alive = false; clearTimeout(h); };
  }, [query, enabled, limit]);
  return items;
}

/** "1980-05-02" → "02/05/1980" (date only, never converted). */
export const dobDisplay = (iso: string | null) => (iso ? iso.split('-').reverse().join('/') : '');
