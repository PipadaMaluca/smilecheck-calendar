import { supabase } from '@/integrations/supabase/client';
import type { UserRole } from '@/types/calendar';
import type { RedeemHistoryItem } from '@/data/rewardsData';

/**
 * Rewards shop — SPEND path.
 *
 * Reward points are ALWAYS spent by the backend function `redeem_reward`
 * (SECURITY DEFINER). The client cannot update `user_levels` nor insert into
 * `points_ledger` / `redemptions` (no grants/policies for that), so a balance
 * can never be bypassed: the function resolves the cost from `rewards_catalog`,
 * locks the level row, validates the balance and — in a single transaction —
 * deducts the points, writes the ledger row and creates the redemption with a
 * unique code. XP is never touched by spending.
 *
 * Demo mode must never reach this module — every call site branches on `isDemo`.
 */

/** Catalog keys are role-scoped: the shop product id prefixed with the role. */
export function rewardKeyFor(role: UserRole, productId: string): string {
  return `${role}:${productId}`;
}

export interface RedeemSuccess {
  redeemed: true;
  redemption_id: string;
  reward_key: string;
  reward_name: string;
  points_cost: number;
  redemption_code: string;
  status: 'pendente' | 'usado' | 'expirado';
  expires_at: string;
  current_reward_points: number;
  current_xp: number;
}

export interface RedeemFailure {
  redeemed: false;
  reason: 'insufficient_points' | string;
  points_cost?: number;
  current_reward_points?: number;
}

export type RedeemResult = RedeemSuccess | RedeemFailure;

export async function redeemReward(profileId: string, rewardKey: string): Promise<RedeemResult> {
  const { data, error } = await supabase.rpc('redeem_reward', {
    _profile_id: profileId,
    _reward_key: rewardKey,
  });
  if (error) {
    return { redeemed: false, reason: error.message };
  }
  return data as unknown as RedeemResult;
}

interface RedemptionRow {
  id: string;
  reward_name: string;
  points_cost: number;
  redemption_code: string;
  status: 'pendente' | 'usado' | 'expirado';
  expires_at: string;
  created_at: string;
}

const PT_MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')} ${PT_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/** Redemption history for the signed-in user, newest first. */
export async function fetchRedemptions(profileId: string): Promise<RedeemHistoryItem[]> {
  const { data, error } = await supabase
    .from('redemptions')
    .select('id, reward_name, points_cost, redemption_code, status, expires_at, created_at')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false })
    .limit(200)
    .returns<RedemptionRow[]>();
  if (error) throw error;

  const now = Date.now();
  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.reward_name,
    points: row.points_cost,
    date: formatDate(row.created_at),
    code: row.redemption_code,
    // A pending code past its expiry reads as expired (no cron job needed).
    status:
      row.status === 'pendente' && new Date(row.expires_at).getTime() < now ? 'expirado' : row.status,
  }));
}
