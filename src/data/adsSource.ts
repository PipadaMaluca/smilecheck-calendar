import { supabase } from '@/integrations/supabase/client';

export const ADS_VIDEOS_FOR_BREAK = 5;
export const ADS_BREAK_HOURS = 8;
export const ADS_FOR_REWARD = 10;
export const AD_MAX_SECONDS = 30;

export interface AdState {
  videosWatched: number;
  adFreeUntil: string | null;
  adsSeen: number;
  rewardedToday: boolean;
  phoneVerified: boolean;
}

export const EMPTY_AD_STATE: AdState = { videosWatched: 0, adFreeUntil: null, adsSeen: 0, rewardedToday: false, phoneVerified: true };

/** Server state for the signed-in user (counters and timer never live in localStorage). */
export async function fetchAdState(userId: string): Promise<AdState> {
  const today = new Date().toISOString().slice(0, 10);
  const [{ data: s }, { data: r }] = await Promise.all([
    supabase.from('ad_state').select('videos_watched, ad_free_until, ads_seen').eq('profile_id', userId).maybeSingle(),
    supabase.from('ad_rewards_daily').select('reward_date').eq('profile_id', userId).eq('reward_date', today).maybeSingle(),
  ]);
  return {
    videosWatched: s?.videos_watched ?? 0,
    adFreeUntil: s?.ad_free_until ?? null,
    adsSeen: s?.ads_seen ?? 0,
    rewardedToday: !!r,
    phoneVerified: true,
  };
}

/** Server records the view and, at 10 ads, awards 2 reward points (no XP) at most once a day. */
export async function recordAdView(kind: 'video' | 'ad'): Promise<AdState & { pointsAwarded: boolean }> {
  const { data, error } = await supabase.rpc('record_ad_view', { _kind: kind });
  if (error) throw error;
  const d = data as Record<string, unknown>;
  return {
    videosWatched: Number(d.videos_watched ?? 0),
    adFreeUntil: (d.ad_free_until as string | null) ?? null,
    adsSeen: Number(d.ads_seen ?? 0),
    rewardedToday: !!d.rewarded_today,
    phoneVerified: !!d.phone_verified,
    pointsAwarded: !!d.points_awarded,
  };
}

/** Same rules, in memory only, for the demo mode (no account). */
export function demoAdStep(s: AdState, kind: 'video' | 'ad', now = Date.now()): AdState & { pointsAwarded: boolean } {
  if (kind === 'video') {
    const n = s.videosWatched + 1;
    return n >= ADS_VIDEOS_FOR_BREAK
      ? { ...s, videosWatched: 0, adFreeUntil: new Date(now + ADS_BREAK_HOURS * 3600_000).toISOString(), pointsAwarded: false }
      : { ...s, videosWatched: n, pointsAwarded: false };
  }
  if (s.rewardedToday) return { ...s, pointsAwarded: false };
  const n = s.adsSeen + 1;
  return n >= ADS_FOR_REWARD
    ? { ...s, adsSeen: 0, rewardedToday: true, pointsAwarded: true }
    : { ...s, adsSeen: n, pointsAwarded: false };
}
