import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/calendar';
import {
  USER_POINTS,
  UserPointsData,
  PointsHistoryEntry,
  getPointsHistoryForRole,
} from '@/data/pointsData';

/**
 * Phase 4 · sub-step 1 — READ path only.
 * Demo mode (and unauthenticated users) keep the mock points/level/streak values.
 * Real authenticated users read `user_levels` + `points_ledger` from the backend.
 * Writing point transactions is NOT part of this step.
 */

const DB_LEVEL_TO_KEY: Record<string, string> = {
  Lata: 'lata',
  Bronze: 'bronze',
  Prata: 'prata',
  Ouro: 'ouro',
  Platina: 'platina',
  Diamante: 'diamante',
  Adamantino: 'adamantino',
};

export interface PointsSourceValue extends UserPointsData {
  /** Level key as stored in the DB (real users) — level is still derived from XP in the UI. */
  levelKey: string;
  history: PointsHistoryEntry[];
  loading: boolean;
  error: string | null;
  isDemo: boolean;
}

interface LedgerRow {
  id: string;
  type: 'xp' | 'reward_points';
  amount: number;
  reason: string | null;
  created_at: string;
}

function buildHistory(rows: LedgerRow[]): PointsHistoryEntry[] {
  // The ledger stores XP and reward points as separate rows; pair them back up
  // by timestamp + reason so the UI shows one line per transaction.
  const grouped = new Map<string, PointsHistoryEntry>();
  for (const row of rows) {
    const key = `${row.created_at}|${row.reason ?? ''}`;
    const at = new Date(row.created_at);
    const existing = grouped.get(key) ?? {
      id: row.id,
      date: new Date(at.getFullYear(), at.getMonth(), at.getDate()),
      time: `${String(at.getHours()).padStart(2, '0')}:${String(at.getMinutes()).padStart(2, '0')}`,
      description: row.reason ?? '—',
      xp: 0,
      points: 0,
    };
    if (row.type === 'xp') existing.xp += row.amount;
    else existing.points += row.amount;
    grouped.set(key, existing);
  }
  return [...grouped.values()].sort((a, b) => b.date.getTime() - a.date.getTime() || b.time.localeCompare(a.time));
}

async function fetchPoints(userId: string) {
  const [levelRes, ledgerRes] = await Promise.all([
    supabase
      .from('user_levels')
      .select('current_xp, current_reward_points, level, streak_days, best_streak')
      .eq('id', userId)
      .maybeSingle(),
    supabase
      .from('points_ledger')
      .select('id, type, amount, reason, created_at')
      .eq('profile_id', userId)
      .order('created_at', { ascending: false })
      .limit(200)
      .returns<LedgerRow[]>(),
  ]);

  if (levelRes.error) throw levelRes.error;
  if (ledgerRes.error) throw ledgerRes.error;

  return {
    xp: levelRes.data?.current_xp ?? 0,
    rewardPoints: levelRes.data?.current_reward_points ?? 0,
    streak: levelRes.data?.streak_days ?? 0,
    bestStreak: levelRes.data?.best_streak ?? 0,
    levelKey: DB_LEVEL_TO_KEY[levelRes.data?.level ?? 'Lata'] ?? 'lata',
    history: buildHistory(ledgerRes.data ?? []),
  };
}

type PointsState = Awaited<ReturnType<typeof fetchPoints>> | null;

interface PointsContextValue {
  data: PointsState;
  loading: boolean;
  error: string | null;
  isDemo: boolean;
}

const PointsDataContext = createContext<PointsContextValue>({
  data: null,
  loading: false,
  error: null,
  isDemo: true,
});

export function PointsDataProvider({ children }: { children: React.ReactNode }) {
  const { demoMode, user } = useAuth();
  const [data, setData] = useState<PointsState>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (demoMode || !user) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    fetchPoints(user.id)
      .then((next) => {
        if (cancelled) return;
        setData(next);
        setError(null);
      })
      .catch((e) => {
        if (cancelled) return;
        setData(null);
        setError(e?.message ?? 'Erro ao carregar pontuações');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [demoMode, user]);

  const value = useMemo<PointsContextValue>(
    () => ({ data, loading, error, isDemo: demoMode || !user }),
    [data, loading, error, demoMode, user]
  );

  return <PointsDataContext.Provider value={value}>{children}</PointsDataContext.Provider>;
}

/**
 * Points/XP/level/streak for the current viewer.
 * `role` selects the mock dataset in demo mode; real users always get their own row.
 */
export function usePointsData(role: UserRole): PointsSourceValue {
  const { data, loading, error, isDemo } = useContext(PointsDataContext);
  const mock = USER_POINTS[role];

  return useMemo(() => {
    if (isDemo || !data) {
      return {
        ...mock,
        levelKey: '',
        history: getPointsHistoryForRole(role),
        loading: isDemo ? false : loading,
        error: isDemo ? null : error,
        isDemo,
      };
    }
    return {
      xp: data.xp,
      rewardPoints: data.rewardPoints,
      streak: data.streak,
      bestStreak: data.bestStreak,
      levelKey: data.levelKey,
      // Subscription plan and today's consultation counters are not modelled in
      // the DB yet — they stay on the mock values for this role.
      plan: mock.plan,
      todayConsultations: mock.todayConsultations,
      history: data.history,
      loading,
      error,
      isDemo,
    };
  }, [data, loading, error, isDemo, mock, role]);
}
