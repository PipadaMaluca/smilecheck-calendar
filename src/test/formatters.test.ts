import { describe, it, expect, beforeEach } from 'vitest';
import i18n from '@/i18n';
import { formatCurrency, formatNumber } from '@/lib/formatters';
const clean = (s: string) => s.replace(/\u00a0|\u202f/g, ' ');

describe('formatCurrency / formatNumber follow the active language', () => {
  beforeEach(async () => { await i18n.changeLanguage('pt'); });
  it('PT: 24,99 € and 1 850', () => {
    expect(clean(formatCurrency(24.99))).toBe('24,99 €');
    expect(clean(formatNumber(1850))).toBe('1 850');
  });
  it('FR: 24,99 €', async () => {
    await i18n.changeLanguage('fr');
    expect(clean(formatCurrency(24.99))).toBe('24,99 €');
  });
  it('EN: €24.99', async () => {
    await i18n.changeLanguage('en');
    expect(formatCurrency(24.99)).toBe('€24.99');
  });
});

describe('counts in translations are grouped', () => {
  it('PT: 1 850 pontos', async () => {
    await i18n.changeLanguage('pt');
    expect(clean(i18n.t('store.points', { count: 1850 }))).toBe('1 850 pontos');
  });

  it('drops cents only for whole amounts, else always 2 decimals', () => {
    expect(clean(formatCurrency(24))).toBe('24 €');
    expect(formatCurrency(24)).not.toMatch(/[.,]00/);
    expect(clean(formatCurrency(24.5))).toBe('24,50 €');
    expect(clean(formatCurrency(2426))).toBe('2 426 €');
  });
});
