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
