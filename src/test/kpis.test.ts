import { describe, it, expect } from 'vitest';
import { computeKpis, inPeriod } from '@/data/kpis';
import { mockConsultations } from '@/data/mockData';
import { clinicTeamMembers } from '@/components/team/shared/teamMockData';

describe('KPIs come from one source', () => {
  it('per-dentist counts add up to the total', () => {
    const month = mockConsultations.filter(c => inPeriod(c, 'month'));
    const total = computeKpis(month).total;
    const ids = [...new Set(month.map(c => c.dentist.id))];
    const sum = ids.reduce((s, id) => s + computeKpis(month.filter(c => c.dentist.id === id)).total, 0);
    expect(sum).toBe(total);
  });
  it('Equipa uses the same confirmation rate as Estatísticas for each dentist', () => {
    for (const m of clinicTeamMembers) {
      const cons = mockConsultations.filter(c => c.dentist.id === m.id && c.clinic.id === '1' && inPeriod(c, 'month'));
      expect(m.confirmationRate).toBe(computeKpis(cons).confirmRate);
      expect(m.consultationsThisMonth).toBe(cons.length);
    }
  });
});
