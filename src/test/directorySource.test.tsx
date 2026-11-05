import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';

const auth = { demoMode: true, user: null as null | { id: string }, role: 'dentist', profile: null as null | { full_name: string } };
vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => auth }));

// Chainable stub: every query resolves to the rows registered for its table.
const tables: Record<string, unknown[]> = {};
vi.mock('@/integrations/supabase/client', () => {
  const q = (table: string) => {
    const result = () => Promise.resolve({ data: tables[table] ?? [], error: null });
    const chain: Record<string, unknown> = {};
    for (const m of ['select', 'eq', 'in', 'order']) chain[m] = () => chain;
    chain.then = (res: (v: unknown) => unknown, rej: (e: unknown) => unknown) => result().then(res, rej);
    return chain;
  };
  return { supabase: { from: q, auth: { getUser: async () => ({ data: { user: null } }) } } };
});

import { DirectoryProvider, useDirectory, buildDirectory } from '@/data/directorySource';
import { mockClinics, mockDentists, mockFamilyMembers } from '@/data/mockData';
import { validateWorkingHours } from '@/data/directoryWrites';

const wrapper = ({ children }: { children: ReactNode }) => <DirectoryProvider>{children}</DirectoryProvider>;

describe('useDirectory', () => {
  beforeEach(() => { for (const k of Object.keys(tables)) delete tables[k]; });

  it('returns the current mock data in demo', () => {
    Object.assign(auth, { demoMode: true, user: null, role: 'dentist' });
    const { result } = renderHook(() => useDirectory(), { wrapper });
    expect(result.current.isDemo).toBe(true);
    expect(result.current.clinics).toEqual(mockClinics);
    expect(result.current.dentists).toEqual(mockDentists);
    expect(result.current.getDentistsForClinic('2').map((d) => d.id)).toEqual(['1', '4', '5']);
    expect(result.current.dentistWorksOnDemo('2', '1')).toBe(false);
    expect(result.current.familyMembers.map((m) => m.name)).toEqual(mockFamilyMembers.map((m) => m.name));
  });

  it('returns real clinics and colleagues outside demo', async () => {
    Object.assign(auth, { demoMode: false, user: { id: 'me' }, role: 'dentist', profile: { full_name: 'Ana' } });
    tables.clinic_members = [
      { id: 'm1', clinic_id: 'c1', dentist_id: 'me', working_hours: { mon: [['09:00', '13:00']] } },
      { id: 'm2', clinic_id: 'c1', dentist_id: 'd2', working_hours: {} },
    ];
    tables.clinics = [{ id: 'c1', name: 'Clínica Real', address: 'Rua A', city: 'Lisboa', postal_code: '1000-001', timezone: 'Europe/Lisbon', country: 'PT' }];
    tables.professional_public_profiles = [{ id: 'd2', full_name: 'Bruno' }];
    const { result } = renderHook(() => useDirectory(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.isDemo).toBe(false);
    expect(result.current.clinics.map((c) => c.name)).toEqual(['Clínica Real']);
    expect(result.current.getDentistsForClinic('c1').map((d) => d.name)).toEqual(['Ana', 'Bruno']);
    expect(result.current.clinics).not.toEqual(mockClinics);
  });
});

describe('worksOn (real)', () => {
  const dir = buildDirectory({
    clinics: [], dentists: [], familyMembers: [], selfName: '', selfId: 'me',
    clinicDentists: [{ clinicId: 'c', dentistId: 'd', worksOnDemo: true, workingHours: { mon: [['09:00', '18:00']] } }],
  }, { isDemo: false });
  it('follows the saved weekdays', () => {
    expect(dir.worksOn('d', 'c', new Date(2026, 10, 2))).toBe(true); // Monday
    expect(dir.worksOn('d', 'c', new Date(2026, 10, 3))).toBe(false); // Tuesday
    expect(dir.worksOn('x', 'c', new Date(2026, 10, 2))).toBe(false);
  });
});

describe('working hours validation (mirrors the server)', () => {
  it('accepts a day with a lunch break, including Sunday', () => {
    expect(validateWorkingHours({ mon: [['09:00', '13:00'], ['14:00', '18:00']], sun: [['10:00', '12:00']] })).toBe(true);
  });
  it('refuses start after end, overlaps and bad times', () => {
    expect(validateWorkingHours({ mon: [['18:00', '09:00']] })).toBe(false);
    expect(validateWorkingHours({ mon: [['09:00', '14:00'], ['13:00', '18:00']] })).toBe(false);
    expect(validateWorkingHours({ mon: [['25:00', '26:00']] })).toBe(false);
  });
});
