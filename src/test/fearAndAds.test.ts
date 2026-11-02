import { describe, it, expect } from 'vitest';
import { effectiveFear, fearMismatch, showFearDotOnCard } from '@/lib/fearScale';
import { demoAdStep, EMPTY_AD_STATE } from '@/data/adsSource';

describe('fear scale', () => {
  it('professional value wins over the patient value', () => expect(effectiveFear(2, 3)).toBe(3));
  it('falls back to the patient value', () => expect(effectiveFear(1, null)).toBe(1));
  it('warns when values differ by 2 or more', () => {
    expect(fearMismatch(1, 3)).toBe(true);
    expect(fearMismatch(2, 3)).toBe(false);
  });
  it('agenda dot only from level 2', () => {
    expect(showFearDotOnCard(1)).toBe(false);
    expect(showFearDotOnCard(2)).toBe(true);
  });
});

describe('ads (demo rules mirror the server)', () => {
  it('5 videos give 8 hours without ads and reset to 0/5', () => {
    let s = { ...EMPTY_AD_STATE };
    for (let i = 0; i < 5; i++) s = demoAdStep(s, 'video', 0);
    expect(s.videosWatched).toBe(0);
    expect(new Date(s.adFreeUntil!).getTime()).toBe(8 * 3600_000);
  });
  it('10 ads award points once a day only', () => {
    let s = { ...EMPTY_AD_STATE }; let awarded = 0;
    for (let i = 0; i < 25; i++) { const r = demoAdStep(s, 'ad'); if (r.pointsAwarded) awarded++; s = r; }
    expect(awarded).toBe(1);
  });
});
