import { useCallback, useEffect, useSyncExternalStore } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { DEFAULT_SHOWCASED } from '@/components/achievements/achievementData';
import type { UserRole } from '@/types/calendar';

/** Max achievements a profile can highlight (also enforced by a DB check). */
export const SHOWCASE_LIMIT = 8;

/**
 * Profile highlights ("destaques"), shared by the achievements screen and the
 * profile showcase so stars and modal stay in sync.
 * - Signed in: `profiles.showcased_achievements` (owner-only write via RLS).
 * - Demo: localStorage per role.
 */
const state = new Map<string, string[]>();
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l); };
const demoKey = (role: string) => `sc:showcase:${role}`;
const loaded = new Set<string>();

export function useShowcase(role: UserRole) {
  const { user, demoMode } = useAuth();
  const isDemo = demoMode || !user;
  const key = isDemo ? `demo:${role}` : `user:${user!.id}`;

  if (!state.has(key) && isDemo) {
    let ids = DEFAULT_SHOWCASED[role] || [];
    try { const raw = localStorage.getItem(demoKey(role)); if (raw) ids = JSON.parse(raw); } catch { /* ignore */ }
    state.set(key, ids);
  }

  useEffect(() => {
    if (isDemo || loaded.has(key)) return;
    loaded.add(key);
    supabase.from('profiles').select('showcased_achievements').eq('id', user!.id).maybeSingle()
      .then(({ data }) => { state.set(key, data?.showcased_achievements ?? []); emit(); });
  }, [isDemo, key, user]);

  const ids = useSyncExternalStore(subscribe, () => state.get(key) ?? EMPTY);

  const save = useCallback(async (next: string[]) => {
    const clean = Array.from(new Set(next)).slice(0, SHOWCASE_LIMIT);
    const prev = state.get(key) ?? [];
    state.set(key, clean); emit();
    if (isDemo) { localStorage.setItem(demoKey(role), JSON.stringify(clean)); return true; }
    const { error } = await supabase.from('profiles').update({ showcased_achievements: clean }).eq('id', user!.id);
    if (error) { state.set(key, prev); emit(); return false; }
    return true;
  }, [isDemo, key, role, user]);

  return { ids, save };
}
const EMPTY: string[] = [];
