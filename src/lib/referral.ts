/** Referral action key in `points_rules`. */
export const REFERRAL_ACTION_KEY = 'convidar_amigo';

/** Actions the server (`award_points`) currently refuses with `action_suspended`. Keep in sync. */
export const SUSPENDED_ACTIONS: string[] = ['convidar_amigo'];

/** Personal referral code derived from the current user: SMILE-<FIRSTNAME>-<4 chars of id hash>. */
export function buildReferralCode(name: string, userId: string): string {
  const first = (name || '')
    .replace(/^(Dr\.?|Dra\.?)\s+/i, '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .split(/[\s@]+/)[0]
    .replace(/[^A-Za-z0-9]/g, '')
    .toUpperCase()
    .slice(0, 10) || 'SMILE';
  let h = 0;
  for (let i = 0; i < userId.length; i++) h = (h * 31 + userId.charCodeAt(i)) >>> 0;
  const suffix = h.toString(36).toUpperCase().padStart(4, '0').slice(-4);
  return `SMILE-${first}-${suffix}`;
}
