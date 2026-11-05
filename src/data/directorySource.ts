import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Clinic, Dentist } from '@/types/calendar';
import {
  mockClinics, mockDentists, clinicDentists as mockClinicDentists, mockFamilyMembers,
  type ClinicDentist,
} from '@/data/mockData';

/**
 * Single source for "who is around me": the user's clinics, the dentists of each
 * clinic, their working hours and (patients) family members.
 * Demo (or signed out) → the current mock data, unchanged. Real → Lovable Cloud,
 * names only via `professional_public_profiles` (never phone/email/birth date).
 */

export type Weekday = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
export const WEEKDAYS: Weekday[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
/** {"mon":[["09:00","13:00"],["14:00","18:00"]], ...} — same shape the server validates. */
export type WorkingHours = Partial<Record<Weekday, [string, string][]>>;

export interface DirectoryClinic extends Clinic {
  city?: string | null;
  postalCode?: string | null;
  timezone?: string;
  country?: string;
}

export interface DirectoryMember extends ClinicDentist {
  memberId?: string;
  workingHours?: WorkingHours;
}

export interface DirectoryFamilyMember {
  id: string;
  name: string;
  age?: number;
  relation: string;
  dateOfBirth?: string | null;
  /** True for the account holder row ("Eu"). */
  self?: boolean;
}

export interface Directory {
  isDemo: boolean;
  loading: boolean;
  error: string | null;
  clinics: DirectoryClinic[];
  dentists: Dentist[];
  clinicDentists: DirectoryMember[];
  familyMembers: DirectoryFamilyMember[];
  /** Display name of the signed-in user (demo: first mock entity of the role). */
  selfName: string;
  /** Id of the signed-in user in this directory (demo: mock id '1' / 'fm1'). */
  selfId: string;
  getDentistsForClinic: (clinicId: string) => Dentist[];
  /** Mock-compatible: does the dentist work at this clinic on the (demo) day. */
  dentistWorksOnDemo: (clinicId: string, dentistId: string) => boolean;
  /** Does the dentist work at the clinic on `date` (no saved hours = assume yes). */
  worksOn: (dentistId: string, clinicId: string, date?: Date) => boolean;
  getWorkingHours: (dentistId: string, clinicId: string) => WorkingHours | undefined;
  refresh: () => void;
}

const DAY_KEYS: Weekday[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

export function weekdayKey(date: Date): Weekday {
  return DAY_KEYS[date.getDay()];
}

export function ageFrom(dob: string | null | undefined, now = new Date()): number | undefined {
  if (!dob) return undefined;
  const d = new Date(`${dob}T00:00:00`);
  if (Number.isNaN(d.getTime())) return undefined;
  let a = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) a -= 1;
  return a;
}

export interface DirectoryData {
  clinics: DirectoryClinic[];
  dentists: Dentist[];
  clinicDentists: DirectoryMember[];
  familyMembers: DirectoryFamilyMember[];
  selfName: string;
  selfId: string;
}

/** Builds the helper set over any data (mock or real). */
export function buildDirectory(data: DirectoryData, opts: { isDemo: boolean; loading?: boolean; error?: string | null; refresh?: () => void }): Directory {
  const { clinics, dentists, clinicDentists, familyMembers, selfName, selfId } = data;
  const getDentistsForClinic = (clinicId: string) => {
    const ids = clinicDentists.filter((cd) => cd.clinicId === clinicId).map((cd) => cd.dentistId);
    return dentists.filter((d) => ids.includes(d.id));
  };
  const getWorkingHours = (dentistId: string, clinicId: string) =>
    clinicDentists.find((cd) => cd.clinicId === clinicId && cd.dentistId === dentistId)?.workingHours;
  const worksOn = (dentistId: string, clinicId: string, date?: Date) => {
    const rec = clinicDentists.find((cd) => cd.clinicId === clinicId && cd.dentistId === dentistId);
    if (!rec) return false;
    if (opts.isDemo || !date) return opts.isDemo ? rec.worksOnDemo : true;
    const wh = rec.workingHours;
    if (!wh || Object.keys(wh).length === 0) return true;
    return (wh[weekdayKey(date)]?.length ?? 0) > 0;
  };
  const dentistWorksOnDemo = (clinicId: string, dentistId: string) =>
    opts.isDemo
      ? clinicDentists.find((cd) => cd.clinicId === clinicId && cd.dentistId === dentistId)?.worksOnDemo ?? false
      : worksOn(dentistId, clinicId, new Date());
  return {
    isDemo: opts.isDemo, loading: opts.loading ?? false, error: opts.error ?? null,
    clinics, dentists, clinicDentists, familyMembers, selfName, selfId,
    getDentistsForClinic, dentistWorksOnDemo, worksOn, getWorkingHours,
    refresh: opts.refresh ?? (() => {}),
  };
}

export function demoDirectory(role: string = 'patient'): Directory {
  const selfName = role === 'dentist' ? mockDentists[0].name : role === 'clinic' ? mockClinics[0].name : mockFamilyMembers[0].name;
  return buildDirectory({
    clinics: mockClinics,
    dentists: mockDentists,
    clinicDentists: mockClinicDentists,
    familyMembers: mockFamilyMembers.map((m, i) => ({ ...m, self: i === 0 })),
    selfName,
    selfId: role === 'patient' ? mockFamilyMembers[0].id : '1',
  }, { isDemo: true });
}

/** Fetches the real directory of the signed-in user. RLS scopes every query. */
export async function fetchDirectory(userId: string, role: string, fullName: string | null): Promise<DirectoryData> {
  const empty: DirectoryData = { clinics: [], dentists: [], clinicDentists: [], familyMembers: [], selfName: fullName ?? '', selfId: userId };

  if (role === 'patient') {
    const { data, error } = await supabase
      .from('family_members')
      .select('id, full_name, relationship, date_of_birth')
      .eq('primary_patient_id', userId)
      .order('created_at');
    if (error) throw error;
    return {
      ...empty,
      familyMembers: [
        { id: userId, name: fullName ?? '', relation: 'Eu', self: true },
        ...(data ?? []).map((f) => ({
          id: f.id, name: f.full_name, relation: f.relationship ?? '',
          dateOfBirth: f.date_of_birth, age: ageFrom(f.date_of_birth),
        })),
      ],
    };
  }

  // Clinics: owned (clinic role) or where I'm a member (dentist role).
  let clinicIds: string[] = [];
  if (role === 'clinic') {
    const { data, error } = await supabase.from('clinics').select('id').eq('owner_profile_id', userId);
    if (error) throw error;
    clinicIds = (data ?? []).map((c) => c.id);
  } else {
    const { data, error } = await supabase.from('clinic_members').select('clinic_id').eq('dentist_id', userId);
    if (error) throw error;
    clinicIds = [...new Set((data ?? []).map((m) => m.clinic_id))];
  }
  if (!clinicIds.length) return empty;

  const [{ data: clinicRows, error: cErr }, { data: memberRows, error: mErr }] = await Promise.all([
    supabase.from('clinics').select('id, name, address, city, postal_code, timezone, country').in('id', clinicIds).order('name'),
    supabase.from('clinic_members').select('id, clinic_id, dentist_id, working_hours').in('clinic_id', clinicIds),
  ]);
  if (cErr) throw cErr;
  if (mErr) throw mErr;

  const dentistIds = [...new Set((memberRows ?? []).map((m) => m.dentist_id))];
  const { data: pros } = dentistIds.length
    ? await supabase.from('professional_public_profiles').select('id, full_name').in('id', dentistIds)
    : { data: [] as { id: string | null; full_name: string | null }[] };
  const nameById = new Map((pros ?? []).filter((p) => p.id).map((p) => [p.id as string, p.full_name ?? '']));
  if (role === 'dentist' && fullName) nameById.set(userId, fullName);

  return {
    clinics: (clinicRows ?? []).map((c) => ({
      id: c.id, name: c.name,
      address: [c.address, c.postal_code, c.city].filter(Boolean).join(', '),
      city: c.city, postalCode: c.postal_code, timezone: c.timezone, country: c.country,
    })),
    dentists: dentistIds.map((id) => ({ id, name: nameById.get(id) ?? '' })),
    clinicDentists: (memberRows ?? []).map((m) => ({
      memberId: m.id, clinicId: m.clinic_id, dentistId: m.dentist_id, worksOnDemo: true,
      workingHours: (m.working_hours ?? {}) as WorkingHours,
    })),
    familyMembers: [],
    selfName: fullName ?? '',
    selfId: userId,
  };
}

const DirectoryContext = createContext<Directory | null>(null);

export function DirectoryProvider({ children }: { children: ReactNode }) {
  const { demoMode, user, role, profile } = useAuth();
  const isDemo = demoMode || !user;
  const [data, setData] = useState<DirectoryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const refresh = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    if (isDemo || !user) { setData(null); setLoading(false); setError(null); return; }
    let alive = true;
    setLoading(true);
    fetchDirectory(user.id, role, profile?.full_name ?? null)
      .then((d) => { if (alive) { setData(d); setError(null); } })
      .catch((e: unknown) => { if (alive) setError(e instanceof Error ? e.message : String(e)); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [isDemo, user, role, profile?.full_name, reloadKey]);

  const value = useMemo(() => {
    if (isDemo) return demoDirectory(role);
    return buildDirectory(
      data ?? { clinics: [], dentists: [], clinicDentists: [], familyMembers: [], selfName: profile?.full_name ?? '', selfId: user?.id ?? '' },
      { isDemo: false, loading: loading || (!data && !error), error, refresh },
    );
  }, [isDemo, role, data, loading, error, refresh, profile?.full_name, user?.id]);

  return createElement(DirectoryContext.Provider, { value }, children);
}

/** Directory of the signed-in user; outside the provider it returns the demo data. */
export function useDirectory(): Directory {
  const ctx = useContext(DirectoryContext);
  return ctx ?? demoDirectory();
}
