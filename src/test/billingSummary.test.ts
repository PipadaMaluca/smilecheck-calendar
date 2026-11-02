import { describe, it, expect } from 'vitest';
import { summarizeTeleconsults, commissionPercent, TELECONSULT_COMMISSION_RATE } from '@/lib/planRules';
import { getDentistTeleconsultas } from '@/components/billing/billingMockData';

describe('billing summary = sum of lines', () => {
  it('dentist Pro: 12 teleconsults of €20 → €240, 10% commission = €24', () => {
    const lines = getDentistTeleconsultas('pro');
    const s = summarizeTeleconsults(lines);
    expect(s.count).toBe(12);
    expect(s.amount).toBe(240);
    expect(s.commission).toBe(24);
    expect(s.net).toBe(216);
    expect(commissionPercent('pro')).toBe(10);
  });
  it('summary commission matches the labelled percentage for every plan', () => {
    for (const plan of ['free', 'pro', 'premium'] as const) {
      const s = summarizeTeleconsults(getDentistTeleconsultas(plan));
      expect(s.commission).toBeCloseTo(s.amount * TELECONSULT_COMMISSION_RATE[plan], 2);
      expect(s.amount).toBeCloseTo(s.commission + s.net, 2);
    }
  });
});
