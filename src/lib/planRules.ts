// Single source of truth for plan-dependent business rules (commissions, limits).
// Prices live with the plan definitions; only rules derived from the tier live here.

export type PlanTier = 'free' | 'pro' | 'premium';

/** Platform commission charged to dentists on each teleconsultation, by plan. */
export const TELECONSULT_COMMISSION_RATE: Record<PlanTier, number> = {
  free: 0.15,
  pro: 0.10,
  premium: 0.05,
};

/** Maximum number of dentists (active + pending invites) per clinic plan. `null` = unlimited. */
export const CLINIC_DENTIST_LIMIT: Record<PlanTier, number | null> = {
  free: 2,
  pro: 5,
  premium: null,
};

/** Standard teleconsultation price (EUR). */
export const TELECONSULT_PRICE = 20;

/** Demo plans used while billing/team data is still mock. */
export const DEMO_CURRENT_PLAN: { dentist: PlanTier; clinic: PlanTier } = {
  dentist: 'pro',
  clinic: 'pro',
};

export const commissionPercent = (plan: PlanTier) => Math.round(TELECONSULT_COMMISSION_RATE[plan] * 100);

/** Commission and net for one teleconsultation, rounded to cents. */
export function teleconsultSplit(amount: number, plan: PlanTier) {
  const commission = Math.round(amount * TELECONSULT_COMMISSION_RATE[plan] * 100) / 100;
  return { commission, net: Math.round((amount - commission) * 100) / 100 };
}

export function canInviteDentist(plan: PlanTier, currentCount: number) {
  const limit = CLINIC_DENTIST_LIMIT[plan];
  return limit === null || currentCount < limit;
}

export function planTierFromName(name?: string): PlanTier {
  const n = (name ?? '').toLowerCase();
  return n === 'premium' ? 'premium' : n === 'pro' ? 'pro' : 'free';
}
