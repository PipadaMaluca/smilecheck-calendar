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
