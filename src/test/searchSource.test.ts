import { describe, it, expect } from 'vitest';
import { mapRpcRow, mapAvailability, type RpcRow } from '@/data/searchSource';

const row = (over: Partial<RpcRow> & Record<string, unknown> = {}): RpcRow => ({
  id: 'a', kind: 'dentist', name: 'Ana', avatar_url: null, specialties: ['ortodontia'], languages: ['pt'],
  clinics: [{ id: 'c1', name: 'C1', city: 'Lisboa', postal_code: '1000-001', lat: 38.7, lng: -9.1, distance_km: 2.3 }],
  distance_km: 2.3, next_slot: null, total: 2, ...over,
} as RpcRow);

describe('real search adapter', () => {
  it('never copies rating, plan, level or previous-patient from the server', () => {
    const r = mapRpcRow(row({ rating: 4.9, plan: 'premium', level: 'ouro', previous_patient: true } as never));
    expect(r.rating).toBe(0);
    expect(r.reviewCount).toBe(0);
    expect(r.plan).toBe('free');
    expect(r.previousPatient).toBe(false);
  });
  it('keeps the server order', () => {
    const rows = [row({ id: 'far', name: 'Zé', distance_km: 9 }), row({ id: 'near', name: 'Ana', distance_km: 1 })];
    expect(rows.map(r => mapRpcRow(r)).map(r => r.id)).toEqual(['far', 'near']);
  });
  it('marks missing distance and coordinates', () => {
    const r = mapRpcRow(row({ distance_km: null, clinics: [{ id: 'c', name: 'C' }] }));
    expect(r.hasDistance).toBe(false);
    expect(r.hasCoords).toBe(false);
    expect(Number.isNaN(r.lat)).toBe(true);
  });
  it('maps availability filter keys', () => {
    expect(mapAvailability('thisWeek')).toBe('week');
    expect(mapAvailability('any')).toBe('any');
  });
});
