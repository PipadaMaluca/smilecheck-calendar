import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/types/calendar';
import type { Achievement, AchievementCategory } from '@/components/achievements/achievementData';

/**
 * Achievements read path + unlock trigger.
 *
 * - Definitions (name/emoji/category/bonus) stay in the UI; the DB mirrors the
 *   machine-readable part (target, bonus, secret, metric) in `achievement_defs`.
 * - Per-user state lives in `achievements`. The client can only SELECT it:
 *   INSERT/UPDATE/DELETE were revoked, so `unlocked` (and the bonus points that
 *   come with it) can only be set by the SECURITY DEFINER `check_achievements`.
 * - Demo mode never reaches this module — call sites branch on `isDemo`.
 */

export interface AchievementState {
  unlocked: boolean;
  progress: number;
  target: number;
  unlockedAt: string | null;
}

export type AchievementStateMap = Record<string, AchievementState>;

export async function fetchAchievementState(profileId: string): Promise<AchievementStateMap> {
  const { data, error } = await supabase
    .from('achievements')
    .select('achievement_key, unlocked, progress, target, unlocked_at')
    .eq('profile_id', profileId);
  if (error) throw error;
  const map: AchievementStateMap = {};
  for (const row of data ?? []) {
    map[row.achievement_key] = {
      unlocked: row.unlocked,
      progress: row.progress,
      target: row.target,
      unlockedAt: row.unlocked_at,
    };
  }
  return map;
}

export interface CheckAchievementsResult {
  unlocked: { achievement_key: string; bonus_points: number; secret: boolean }[];
  unlocked_count: number;
  bonus_points_awarded: number;
}

/**
 * Recomputes progress from real activity and unlocks whatever reached its
 * target, awarding the bonus points server-side.
 */
export async function checkAchievements(profileId: string): Promise<CheckAchievementsResult | null> {
  const { data, error } = await supabase.rpc('check_achievements', { _profile_id: profileId });
  if (error) {
    // Achievements are a side effect: never break the user's primary action.
    console.warn('[achievements] check failed', error.message);
    return null;
  }
  return data as unknown as CheckAchievementsResult;
}

/** Fire-and-forget variant used by UI side effects. */
export function checkAchievementsSilently(profileId: string | null | undefined) {
  if (!profileId) return;
  void checkAchievements(profileId).catch(() => undefined);
}

/** Overlays real progress/unlock state on the UI achievement definitions. */
export function applyAchievementState(
  categories: AchievementCategory[],
  state: AchievementStateMap
): AchievementCategory[] {
  return categories.map((cat) => ({
    ...cat,
    achievements: cat.achievements.map((a): Achievement => {
      const s = state[a.id];
      if (!s) return a;
      return {
        ...a,
        unlocked: s.unlocked,
        // Single-step achievements keep the plain badge look (no progress bar).
        progress: s.target > 1 ? { current: Math.min(s.progress, s.target), target: s.target } : undefined,
      };
    }),
  }));
}

export interface AchievementsSourceValue {
  categories: AchievementCategory[];
  loading: boolean;
  error: string | null;
  isDemo: boolean;
  unlockedCount: number;
  total: number;
  refresh: () => void;
}

/**
 * Achievements for the current viewer.
 * Demo mode (and unauthenticated users) keep the mock unlock state baked into
 * the UI definitions; real users get their own rows from the database.
 */
export function useAchievements(
  _role: UserRole,
  mockCategories: AchievementCategory[]
): AchievementsSourceValue {
  const { demoMode, user } = useAuth();
  const isDemo = demoMode || !user;
  const [state, setState] = useState<AchievementStateMap | null>(null);
  const [loading, setLoading] = useState(!isDemo);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => {
    if (isDemo || !user) {
      setState(null);
      setLoading(false);
      setError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    // Recompute first so the page always reflects the latest activity, then read.
    checkAchievements(user.id)
      .then(() => fetchAchievementState(user.id))
      .then((next) => {
        if (cancelled) return;
        setState(next);
        setError(null);
      })
      .catch((e) => {
        if (cancelled) return;
        setState(null);
        setError(e?.message ?? 'Erro ao carregar conquistas');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isDemo, user, tick]);

  return useMemo(() => {
    const categories = isDemo || !state ? mockCategories : applyAchievementState(mockCategories, state);
    const all = categories.flatMap((c) => c.achievements);
    return {
      categories,
      loading: isDemo ? false : loading,
      error: isDemo ? null : error,
      isDemo,
      unlockedCount: all.filter((a) => a.unlocked).length,
      total: all.length,
      refresh,
    };
  }, [isDemo, state, mockCategories, loading, error, refresh]);
}
