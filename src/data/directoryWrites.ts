import { supabase } from '@/integrations/supabase/client';
import { WEEKDAYS, type WorkingHours } from '@/data/directorySource';

/** Real-account writes for the directory. Demo never reaches this module. */

async function uid(): Promise<string> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error('not_signed_in');
  return data.user.id;
}

// ===== Family (RLS: only the account holder) =====
export interface FamilyInput { name: string; relation: string; dateOfBirth: string | null }

export async function addFamilyMember(input: FamilyInput): Promise<void> {
  const me = await uid();
  const { error } = await supabase.from('family_members').insert({
    primary_patient_id: me, full_name: input.name.trim(), relationship: input.relation || null,
    date_of_birth: input.dateOfBirth || null,
  });
  if (error) throw error;
}

export async function updateFamilyMember(id: string, input: FamilyInput): Promise<void> {
  const { error } = await supabase.from('family_members').update({
    full_name: input.name.trim(), relationship: input.relation || null, date_of_birth: input.dateOfBirth || null,
  }).eq('id', id);
  if (error) throw error;
}

export async function removeFamilyMember(id: string): Promise<void> {
  const { error } = await supabase.from('family_members').delete().eq('id', id);
  if (error) throw error;
}

// ===== Working hours (server validates format, owner/dentist only) =====
const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;

/** Same rules as the server trigger: HH:MM, start < end, no overlap, ≤2 intervals per day. */
export function validateWorkingHours(wh: WorkingHours): boolean {
  for (const [k, ivs] of Object.entries(wh)) {
    if (!WEEKDAYS.includes(k as never) || !Array.isArray(ivs) || ivs.length > 2) return false;
    let prevEnd = '';
    for (const iv of ivs) {
      if (!Array.isArray(iv) || iv.length !== 2 || !HHMM.test(iv[0]) || !HHMM.test(iv[1])) return false;
      if (iv[0] >= iv[1] || (prevEnd && iv[0] < prevEnd)) return false;
      prevEnd = iv[1];
    }
  }
  return true;
}

export async function saveWorkingHours(memberId: string, wh: WorkingHours): Promise<void> {
  const { error } = await supabase.from('clinic_members').update({ working_hours: wh as never }).eq('id', memberId);
  if (error) throw error;
}

// ===== Team / invites =====
export interface ClinicInvite {
  id: string; clinicId: string; clinicName?: string; email: string; status: string; createdAt: string;
}

export async function fetchClinicInvites(clinicIds: string[]): Promise<ClinicInvite[]> {
  if (!clinicIds.length) return [];
  const { data, error } = await supabase.from('clinic_invites')
    .select('id, clinic_id, email, status, created_at').in('clinic_id', clinicIds).eq('status', 'pendente')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => ({ id: r.id, clinicId: r.clinic_id, email: r.email, status: r.status, createdAt: r.created_at }));
}

/** Invites addressed to the signed-in user's email (RLS matches the session email). */
export async function fetchMyInvites(): Promise<ClinicInvite[]> {
  const { data: u } = await supabase.auth.getUser();
  const email = u.user?.email?.toLowerCase();
  if (!email) return [];
  const { data, error } = await supabase.from('clinic_invites')
    .select('id, clinic_id, email, status, created_at, clinics(name)').eq('status', 'pendente').eq('email', email);
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id, clinicId: r.clinic_id, email: r.email, status: r.status, createdAt: r.created_at,
    clinicName: (r as { clinics?: { name?: string } | null }).clinics?.name,
  }));
}

/**
 * Creates a pending invite. Email delivery is not connected yet: the dentist sees the
 * invite in the app when signing in. `sendInviteEmail` is the hook for a future email step.
 */
export async function inviteDentist(clinicId: string, email: string): Promise<string> {
  const { data, error } = await supabase.rpc('invite_dentist', { _clinic_id: clinicId, _email: email });
  if (error) throw error;
  await sendInviteEmail(data as string);
  return data as string;
}

/** Placeholder: no email service is connected. Keep as a no-op until one is configured. */
export async function sendInviteEmail(_inviteId: string): Promise<void> {
  return;
}

export async function respondInvite(inviteId: string, accept: boolean): Promise<void> {
  const { error } = await supabase.rpc('respond_clinic_invite', { _invite_id: inviteId, _accept: accept });
  if (error) throw error;
}

export async function cancelInvite(inviteId: string): Promise<void> {
  const { error } = await supabase.rpc('cancel_clinic_invite', { _invite_id: inviteId });
  if (error) throw error;
}

/** Removes the clinic membership only; appointments are never deleted. */
export async function removeClinicMember(memberId: string): Promise<void> {
  const { error } = await supabase.from('clinic_members').delete().eq('id', memberId);
  if (error) throw error;
}

export function inviteErrorKey(e: unknown): string {
  const msg = e instanceof Error ? e.message : String((e as { message?: string })?.message ?? e);
  for (const k of ['invalid_email', 'already_member', 'already_invited', 'last_clinic', 'not_dentist']) if (msg.includes(k)) return `team.errors.${k}`;
  return 'team.errors.generic';
}
