import { describe, it, expect } from 'vitest';
import { teleconsultSplit, canInviteDentist } from '@/lib/planRules';

describe('plan rules', () => {
  it('teleconsult commission on €20 is €3 / €2 / €1 for Free / Pro / Premium', () => {
    expect(teleconsultSplit(20, 'free')).toEqual({ commission: 3, net: 17 });
    expect(teleconsultSplit(20, 'pro')).toEqual({ commission: 2, net: 18 });
    expect(teleconsultSplit(20, 'premium')).toEqual({ commission: 1, net: 19 });
  });

  it('clinic Free allows 2 dentists', () => {
    expect(canInviteDentist('free', 1)).toBe(true);
    expect(canInviteDentist('free', 2)).toBe(false);
  });

  it('clinic Pro allows 5 dentists', () => {
    expect(canInviteDentist('pro', 4)).toBe(true);
    expect(canInviteDentist('pro', 5)).toBe(false);
  });

  it('clinic Premium is unlimited', () => {
    expect(canInviteDentist('premium', 500)).toBe(true);
  });
});

import { annualMonthlyPrice, PLAN_MONTHLY_PRICE, PLAN_FEATURES } from '@/lib/planRules';
describe('annual prices are exactly −15%', () => {
  it('dentist Pro 19,99 → 16,99', () => expect(annualMonthlyPrice(PLAN_MONTHLY_PRICE.dentist.pro)).toBe(16.99));
  it('clinic Pro 39,99 → 33,99', () => expect(annualMonthlyPrice(PLAN_MONTHLY_PRICE.clinic.pro)).toBe(33.99));
  it('patient Pro 4,99 → 4,24', () => expect(annualMonthlyPrice(4.99)).toBe(4.24));
});
describe('no appointment limit in any plan', () => {
  it('no feature caps appointments', () => {
    const keys = Object.values(PLAN_FEATURES).flatMap((r) => Object.values(r).flat()).map((f) => f.key);
    expect(keys.some((k) => /20|perMonth|PerMonth/.test(k))).toBe(false);
  });
});
