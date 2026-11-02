import { describe, it, expect } from 'vitest';
import i18n from '@/i18n';

const photos = (lng: string, count: number) => i18n.getFixedT(lng)('triage.photos.photosAttached', { count });

describe('plural rules', () => {
  it('PT-PT treats 0 as plural (0 fotos), 1 singular, 2 plural', () => {
    expect(photos('pt', 0)).toBe('0 fotos anexadas');
    expect(photos('pt', 1)).toBe('1 foto anexada');
    expect(photos('pt', 2)).toBe('2 fotos anexadas');
  });
  it('FR treats 0 as singular', () => {
    expect(photos('fr', 0)).toBe('0 photo jointe');
    expect(photos('fr', 1)).toBe('1 photo jointe');
    expect(photos('fr', 2)).toBe('2 photos jointes');
  });
  it('EN treats 0 as plural', () => {
    expect(photos('en', 0)).toBe('0 photos attached');
    expect(photos('en', 1)).toBe('1 photo attached');
    expect(photos('en', 2)).toBe('2 photos attached');
  });
});
