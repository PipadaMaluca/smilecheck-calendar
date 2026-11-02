import { describe, it, expect } from 'vitest';
import { getDentistRevenueMonths } from '@/components/billing/billingMockData';

describe('monthly revenue chart', () => {
  it('shows the last 6 months ending with the current month', () => {
    const months = getDentistRevenueMonths(new Date(2026, 10, 2)); // 2 Nov 2026
    expect(months).toHaveLength(6);
    expect(months[0]).toMatchObject({ monthIndex: 5, year: 2026 }); // June
    expect(months[5]).toMatchObject({ monthIndex: 10, year: 2026 }); // November
  });
  it('crosses the year boundary', () => {
    const months = getDentistRevenueMonths(new Date(2027, 1, 10));
    expect(months[0]).toMatchObject({ monthIndex: 8, year: 2026 });
    expect(months[5]).toMatchObject({ monthIndex: 1, year: 2027 });
  });
});
