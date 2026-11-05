import { describe, it, expect, afterEach } from 'vitest';
import i18n from '@/i18n';
import { weekdayLabels } from '@/lib/formatters';
import { SPOKEN_LANGUAGES, sortedSpokenLanguages, isSpokenLanguage } from '@/lib/spokenLanguages';

afterEach(() => i18n.changeLanguage('pt'));

describe('spoken languages', () => {
  it('is exactly the closed ISO list chosen by the owner', () => {
    expect([...SPOKEN_LANGUAGES].sort()).toEqual(['ar', 'de', 'en', 'es', 'fr', 'it', 'nl', 'pl', 'pt', 'ro', 'ru', 'tr', 'uk', 'zh']);
    expect(isSpokenLanguage('ja')).toBe(false);
  });
  it('lists PT, FR, EN first, then the rest alphabetically in the app language', () => {
    const list = sortedSpokenLanguages('en-GB');
    expect(list.slice(0, 3).map(l => l.code)).toEqual(['pt', 'fr', 'en']);
    const rest = list.slice(3).map(l => l.name);
    expect(rest).toEqual([...rest].sort((a, b) => a.localeCompare(b, 'en-GB')));
    expect(list.find(l => l.code === 'de')?.name).toBe('German');
  });
});

describe('weekday labels follow the active language', () => {
  it('EN is not Portuguese', async () => {
    await i18n.changeLanguage('en');
    expect(weekdayLabels('short')[0]).toBe('Mon');
    expect(weekdayLabels('narrow')).toEqual(['M', 'T', 'W', 'T', 'F', 'S', 'S']);
  });
  it('FR starts on lundi', async () => {
    await i18n.changeLanguage('fr');
    expect(weekdayLabels('short')[0]).toBe('Lun');
    expect(weekdayLabels('narrow')[0]).toBe('L');
  });
  it('PT keeps S T Q Q S S D', async () => {
    await i18n.changeLanguage('pt');
    expect(weekdayLabels('narrow')).toEqual(['S', 'T', 'Q', 'Q', 'S', 'S', 'D']);
  });
});
