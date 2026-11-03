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
export const DEMO_CURRENT_PLAN: { patient: PlanTier; dentist: PlanTier; clinic: PlanTier } = {
  patient: 'pro',
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

export interface TeleconsultLine { amount: number; commission: number; net: number }

/** Billing summary derived from the individual lines — the summary is always the sum of its lines. */
export function summarizeTeleconsults(lines: TeleconsultLine[]) {
  const r = (v: number) => Math.round(v * 100) / 100;
  return {
    count: lines.length,
    amount: r(lines.reduce((s, l) => s + l.amount, 0)),
    commission: r(lines.reduce((s, l) => s + l.commission, 0)),
    net: r(lines.reduce((s, l) => s + l.net, 0)),
  };
}

export type PlanRole = 'patient' | 'dentist' | 'clinic';

/** Monthly list prices (EUR). Free = 0. */
export const PLAN_MONTHLY_PRICE: Record<PlanRole, Record<PlanTier, number>> = {
  patient: { free: 0, pro: 4.99, premium: 9.99 },
  dentist: { free: 0, pro: 19.99, premium: 29.99 },
  clinic: { free: 0, pro: 39.99, premium: 49.99 },
};

export const ANNUAL_DISCOUNT = 0.15;

/** Monthly-equivalent price when billed annually: exactly −15%, truncated to the cent (19,99 → 16,99). */
export function annualMonthlyPrice(monthly: number) {
  return Math.floor(Math.round(monthly * (1 - ANNUAL_DISCOUNT) * 10000) / 100) / 100;
}

export function annualTotalPrice(monthly: number) {
  return Math.round(annualMonthlyPrice(monthly) * 12 * 100) / 100;
}

export interface PlanFeature {
  /** i18n key under `plans.f.` */
  key: string;
  params?: Record<string, unknown>;
  /** Not available yet → shown with "Em breve". */
  soon?: boolean;
  /** Muted "Tudo do Free/Pro" line. */
  inherited?: boolean;
}

const tele = (tier: PlanTier): PlanFeature => ({ key: 'teleCommission', params: { pct: commissionPercent(tier) }, soon: true });
const dentists = (tier: PlanTier): PlanFeature => {
  const n = CLINIC_DENTIST_LIMIT[tier];
  return n === null ? { key: 'unlimitedDentists' } : { key: 'dentistLimit', params: { count: n } };
};

/** Features per role and tier — single source for the landing pricing and the in-app plan screens. */
export const PLAN_FEATURES: Record<PlanRole, Record<PlanTier, PlanFeature[]>> = {
  patient: {
    free: [{ key: 'bookAppointments' }, { key: 'earnPointsLevels' }, { key: 'rewardsShop' }, { key: 'healthFearProfile' }, { key: 'withAds' }],
    pro: [{ key: 'allFromFree', inherited: true }, { key: 'noAds' }, { key: 'pointsNeverLost' }, { key: 'theme13' }, { key: 'exclusiveAchievements' }, { key: 'fullHistory' }],
    premium: [{ key: 'allFromPro', inherited: true }, { key: 'fullVisual' }, { key: 'appIconColor', soon: true }, { key: 'pointsBonus10', soon: true }, { key: 'premiumBadge' }, { key: 'prioritySupport' }],
  },
  dentist: {
    free: [{ key: 'onlineAgenda' }, { key: 'unlimitedAppointments' }, { key: 'dossierFear' }, { key: 'waitingList' }, { key: 'publicProfile' }, { key: 'withAds' }, tele('free')],
    pro: [{ key: 'allFromFree', inherited: true }, { key: 'noAds' }, { key: 'autoReminders' }, { key: 'multiClinicAgenda' }, { key: 'detailedStats' }, { key: 'rankingsAchievements' }, { key: 'pointsNeverLost' }, { key: 'themeCustom' }, tele('pro')],
    premium: [{ key: 'allFromPro', inherited: true }, { key: 'prescriptionsLetters', soon: true }, { key: 'fullVisualAppIcon', soon: true }, { key: 'premiumBadge' }, { key: 'prioritySupport' }, tele('premium')],
  },
  clinic: {
    free: [dentists('free'), { key: 'clinicDashboard' }, { key: 'sharedAgenda' }, { key: 'waitingList' }, { key: 'monthlyReports' }, { key: 'withAds' }],
    pro: [dentists('pro'), { key: 'allFromFree', inherited: true }, { key: 'noAds' }, { key: 'teamSchedules' }, { key: 'advancedStatsWeekly' }, { key: 'clinicRankings' }, { key: 'exportPdfExcel' }, { key: 'pointsNeverLost' }, { key: 'themeCustom' }],
    premium: [dentists('premium'), { key: 'allFromPro', inherited: true }, { key: 'teamTeleconsults', soon: true }, { key: 'fullVisualAppIcon', soon: true }, { key: 'dedicatedSupport' }],
  },
};

/** Free plans of every role carry the yearly points-reset warning. */
export const planHasPointsResetWarning = (tier: PlanTier) => tier === 'free';

/** Patients are consumers (prices shown VAT included); dentists and clinics are B2B (prices shown "+ VAT"). */
export type VatMode = 'included' | 'plus';
export const planVatMode = (role: PlanRole): VatMode => (role === 'patient' ? 'included' : 'plus');
