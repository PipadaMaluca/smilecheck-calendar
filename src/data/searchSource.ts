import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { formatDate } from '@/lib/formatters';
import type { DentistSearchResult } from '@/data/mockDentistSearch';

/**
 * Real professional search (approved dentists/clinics only) via the
 * `search_professionals` RPC. Demo mode keeps using the mock in the screen.
 * Third-party rating, level, plan and "previous patient" are never mapped.
 */
export interface SearchParams {
  q?: string;
  kind?: 'all' | 'dentist' | 'clinic';
  specialty?: string | null;
  cityOrPostal?: string;
  lat?: number | null;
  lng?: number | null;
  maxKm?: number | null;
  language?: string | null;
  available?: 'any' | 'today' | 'tomorrow' | 'week';
  sort?: 'distance' | 'name' | 'relevance';
}

export interface RpcRow {
  id: string;
  kind: string;
  name: string;
  avatar_url: string | null;
  specialties: unknown;
  languages: string[] | null;
  clinics: { id: string; name: string; city?: string | null; postal_code?: string | null; address?: string | null; lat?: number | null; lng?: number | null; distance_km?: number | null }[] | null;
  distance_km: number | null;
  next_slot: string | null;
  total: number;
}

export type RealSearchResult = DentistSearchResult & {
  isReal: true;
  kind: 'dentist' | 'clinic';
  hasDistance: boolean;
  hasCoords: boolean;
  languages: string[];
};

export const PAGE_SIZE = 20;

export function mapAvailability(a: string): SearchParams['available'] {
  return a === 'today' || a === 'tomorrow' ? a : a === 'thisWeek' ? 'week' : 'any';
}

/** Pure adapter: RPC row → card shape. Keeps the server order; never invents rating/plan. */
export function mapRpcRow(row: RpcRow, timezones: Record<string, string> = {}): RealSearchResult {
  const clinics = Array.isArray(row.clinics) ? row.clinics : [];
  const withCoords = clinics.find(c => c.lat != null && c.lng != null);
  const specialties = Array.isArray(row.specialties) ? (row.specialties as unknown[]).map(String) : [];
  const tz = clinics.map(c => timezones[c.id]).find(Boolean) || 'Europe/Lisbon';
  return {
    id: row.id,
    name: row.name ?? '',
    avatar: row.avatar_url ?? undefined,
    rating: 0,
    reviewCount: 0,
    level: 'bronze',
    plan: 'free',
    previousPatient: false,
    specialties,
    distance: row.distance_km ?? 0,
    clinics: clinics.map(c => ({
      id: c.id,
      name: c.name,
      address: [c.address, c.postal_code, c.city].filter(Boolean).join(', '),
      distance: c.distance_km ?? 0,
    })),
    nextAvailable: row.next_slot
      ? formatDate(row.next_slot, { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: tz })
      : '',
    teleconsultaPrice: 0,
    bio: '',
    lat: withCoords ? Number(withCoords.lat) : NaN,
    lng: withCoords ? Number(withCoords.lng) : NaN,
    isReal: true,
    kind: row.kind === 'clinic' ? 'clinic' : 'dentist',
    hasDistance: row.distance_km != null,
    hasCoords: !!withCoords,
    languages: row.languages ?? [],
  };
}

export function isRealResult(d: DentistSearchResult): d is RealSearchResult {
  return (d as RealSearchResult).isReal === true;
}

export function useProfessionalSearch(params: SearchParams, enabled: boolean) {
  const [items, setItems] = useState<RealSearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const reqId = useRef(0);
  const key = JSON.stringify(params);

  const fetchPage = useCallback(async (offset: number) => {
    const id = ++reqId.current;
    setLoading(true); setError(false);
    const p = JSON.parse(key) as SearchParams;
    const { data, error: err } = await supabase.rpc('search_professionals' as never, {
      _q: p.q?.trim() || null,
      _kind: p.kind ?? 'all',
      _specialty: p.specialty || null,
      _city_or_postal: p.cityOrPostal?.trim() || null,
      _lat: p.lat ?? null,
      _lng: p.lng ?? null,
      _max_km: p.maxKm || null,
      _language: p.language || null,
      _available: p.available ?? 'any',
      _sort: p.sort ?? 'distance',
      _limit: PAGE_SIZE,
      _cursor: offset,
    } as never);
    if (id !== reqId.current) return;
    if (err) { setError(true); setLoading(false); return; }
    const rows = (data ?? []) as unknown as RpcRow[];
    const clinicIds = [...new Set(rows.flatMap(r => (r.clinics ?? []).map(c => c.id)))];
    let tz: Record<string, string> = {};
    if (clinicIds.length) {
      const { data: dir } = await supabase.from('public_clinic_directory' as never).select('id,timezone').in('id', clinicIds);
      tz = Object.fromEntries(((dir ?? []) as { id: string; timezone: string }[]).map(c => [c.id, c.timezone]));
    }
    if (id !== reqId.current) return;
    const mapped = rows.map(r => mapRpcRow(r, tz));
    setItems(prev => (offset === 0 ? mapped : [...prev, ...mapped]));
    setTotal(rows[0]?.total != null ? Number(rows[0].total) : offset === 0 ? 0 : total);
    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (!enabled) return;
    const h = setTimeout(() => { void fetchPage(0); }, 250);
    return () => clearTimeout(h);
  }, [enabled, fetchPage]);

  const loadMore = useCallback(() => { if (!loading && items.length < total) void fetchPage(items.length); }, [loading, items.length, total, fetchPage]);
  return { items, total, loading, error, loadMore, hasMore: items.length < total, retry: () => fetchPage(0) };
}
