import { describe, it, expect } from 'vitest';
import i18n from '@/i18n';
import { demoText } from '@/lib/demoText';
import { getAchievementCategories } from '@/components/achievements/AchievementsView';
import { ACHIEVEMENTS_PER_ROLE } from '@/components/achievements/achievementData';

describe('demo text follows the active language', () => {
  it('translates a mock consultation note to French', async () => {
    await i18n.changeLanguage('fr');
    expect(demoText('Avaliação inicial')).toBe('Bilan initial');
    await i18n.changeLanguage('pt');
  });
  it('leaves real (unknown) text untouched', () => {
    expect(demoText('Nota escrita pelo dentista')).toBe('Nota escrita pelo dentista');
  });
});

describe('landing achievement count', () => {
  it.each(['patient', 'dentist', 'clinic'] as const)('matches the real %s achievement list', (role) => {
    const total = getAchievementCategories(role, (k) => k).reduce((n, c) => n + c.achievements.length, 0);
    expect(total).toBe(ACHIEVEMENTS_PER_ROLE);
  });
});
