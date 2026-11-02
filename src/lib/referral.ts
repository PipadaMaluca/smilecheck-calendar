/** Referral action key in `points_rules`. */
export const REFERRAL_ACTION_KEY = 'convidar_amigo';

/** Level-2 referral action: 1 point per person brought by my invitees. */
export const REFERRAL_L2_ACTION_KEY = 'convite_nivel2';

/** Referral points are awarded only by the server (referrals + try_validate_referral), never by the client. Nothing suspended. */
export const SUSPENDED_ACTIONS: string[] = [];

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
