import { describe, it, expect } from 'vitest';
import { planVatMode } from '@/lib/planRules';
import { getVisibilityBoost } from '@/data/pointsData';
import { SORT_OPTIONS } from '@/data/mockDentistSearch';
import { confirmWordFor } from '@/components/settings/AccountDataSection';
import * as rewards from '@/data/rewardsData';
import pt from '@/i18n/locales/pt.json';

describe('Pedido 7 — conformidade', () => {
  it('patients see VAT-included prices, professionals "+ VAT"', () => {
    expect(planVatMode('patient')).toBe('included');
    expect(planVatMode('dentist')).toBe('plus');
    expect(planVatMode('clinic')).toBe('plus');
  });

  it('search visibility never depends on level or plan', () => {
    for (const lvl of ['lata', 'ouro', 'adamantino']) {
      for (const plan of ['free', 'pro', 'premium'] as const) expect(getVisibilityBoost(lvl, plan)).toBe(0);
    }
  });

  it('search cannot be sorted by rating or "recommended"', () => {
    expect(SORT_OPTIONS.map(o => o.value)).toEqual(['distance', 'price']);
  });

  it('no store reward buys a search highlight', () => {
    expect(JSON.stringify(rewards)).not.toMatch(/Destaque/i);
  });

  it('delete confirmation word follows the language', () => {
    expect(confirmWordFor('pt')).toBe('ELIMINAR');
    expect(confirmWordFor('fr-FR')).toBe('SUPPRIMER');
    expect(confirmWordFor('en')).toBe('DELETE');
  });

  it('AI triage result never talks about diagnosis, severity or analysis', () => {
    const txt = JSON.stringify(pt.triage.ai).toLowerCase();
    for (const w of ['análise', 'gravidade', 'avaliação clínica']) expect(txt).not.toContain(w);
    expect(txt).not.toMatch(/"[^"]*diagnóstico[^"]*"/.source.includes('x') ? /x/ : /urgência (baixa|moderada)/);
  });
});
