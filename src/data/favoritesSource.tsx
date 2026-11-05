import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { dentistToResult, isUuid, type PublicClinicJson, type PublicDentistJson } from '@/data/publicProfiles';
import type { RealSearchResult } from '@/data/searchSource';

/**
 * Real favourites (`favorites` table, RLS = owner only). Demo screens keep their
 * local mock state; this provider is read only when `isDemo` is false.
 */
export interface FavoritesValue {
  isDemo: boolean;
  loading: boolean;
  dentistIds: string[];
  clinicIds: string[];
  dentists: RealSearchResult[];
  clinics: PublicClinicJson[];
  isFavorite: (kind: 'dentist' | 'clinic', id: string) => boolean;
  toggle: (kind: 'dentist' | 'clinic', id: string) => Promise<void>;
  refresh: () => void;
}

const noop = async () => {};
const DEMO: FavoritesValue = {
  isDemo: true, loading: false, dentistIds: [], clinicIds: [], dentists: [], clinics: [],
  isFavorite: () => false, toggle: noop, refresh: () => {},
};
const Ctx = createContext<FavoritesValue>(DEMO);

type FavJson = ({ kind: 'dentist' } & PublicDentistJson) | ({ kind: 'clinic' } & PublicClinicJson);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { demoMode, user } = useAuth();
  const isDemo = demoMode || !user;
  const [rows, setRows] = useState<FavJson[]>([]);
  const [loading, setLoading] = useState(false);
  const [key, setKey] = useState(0);
  const refresh = useCallback(() => setKey((k) => k + 1), []);

  useEffect(() => {
    if (isDemo) { setRows([]); return; }
    let alive = true;
    setLoading(true);
    void supabase.rpc('my_favorites' as never).then(({ data }) => {
      if (alive) setRows(((data ?? []) as unknown as FavJson[]));
    }).then(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [isDemo, user?.id, key]);

  const toggle = useCallback(async (kind: 'dentist' | 'clinic', id: string) => {
    if (isDemo || !user || !isUuid(id)) return;
    const col = kind === 'dentist' ? 'dentist_id' : 'clinic_id';
    const exists = rows.some((r) => r.kind === kind && r.id === id);
    // Optimistic: flip locally, then reconcile with the server list.
    if (exists) {
      setRows((rs) => rs.filter((r) => !(r.kind === kind && r.id === id)));
      await supabase.from('favorites' as never).delete().eq('user_id', user.id).eq(col, id);
    } else {
      setRows((rs) => [{ kind, id, name: '', clinics: [], dentists: [] } as unknown as FavJson, ...rs]);
      await supabase.from('favorites' as never).insert({ user_id: user.id, [col]: id } as never);
    }
    refresh();
  }, [isDemo, user, rows, refresh]);

  const value = useMemo<FavoritesValue>(() => {
    if (isDemo) return DEMO;
    const ds = rows.filter((r): r is { kind: 'dentist' } & PublicDentistJson => r.kind === 'dentist');
    const cs = rows.filter((r): r is { kind: 'clinic' } & PublicClinicJson => r.kind === 'clinic');
    return {
      isDemo: false, loading,
      dentistIds: ds.map((d) => d.id), clinicIds: cs.map((c) => c.id),
      dentists: ds.filter((d) => d.name).map(dentistToResult), clinics: cs.filter((c) => c.name),
      isFavorite: (kind, id) => (kind === 'dentist' ? ds : cs).some((r) => r.id === id),
      toggle, refresh,
    };
  }, [isDemo, rows, loading, toggle, refresh]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useFavorites(): FavoritesValue {
  return useContext(Ctx);
}
