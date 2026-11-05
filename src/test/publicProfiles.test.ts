import { describe, it, expect } from 'vitest';
import { normalizeReviews, dentistToResult, PRIVATE_KEYS, MIN_REVIEWS_FOR_AVERAGE } from '@/data/publicProfiles';

describe('Public profiles & reviews', () => {
  it('average and list only from 3 verified reviews', () => {
    expect(MIN_REVIEWS_FOR_AVERAGE).toBe(3);
    const two = normalizeReviews({ count: 2, average: 5, reviews: [{ id: 'a', rating: 5, comment: null, created_at: '', author: 'Maria S.' }] });
    expect(two.average).toBeNull();
    expect(two.reviews).toEqual([]);
    expect(normalizeReviews({ count: 3, average: 4.3, reviews: [] }).average).toBe(4.3);
  });

  it('never invents a rating from missing data', () => {
    expect(normalizeReviews(null)).toEqual({ count: 0, average: null, reviews: [] });
  });

  it('dentist profile shape carries no private fields and no third-party rating/plan', () => {
    const r = dentistToResult({
      id: '11111111-1111-4111-8111-111111111111', name: 'Dr. Ana Real', avatar_url: null, specialties: ['ortodontia'],
      bio: 'Bio', languages: ['pt'], clinics: [{ id: 'c', name: 'Clínica', city: 'Lisboa' }],
      // Simulate a server that wrongly sends extra fields: they must not reach the UI shape.
      ...({ phone: '+351 900', email: 'x@y.z', date_of_birth: '1980-01-01' } as object),
    } as never);
    for (const k of ['phone', 'email', 'date_of_birth']) expect(r).not.toHaveProperty(k);
    expect(r.rating).toBe(0);
    expect(r.plan).toBe('free');
    expect(PRIVATE_KEYS).toContain('phone');
  });
});
