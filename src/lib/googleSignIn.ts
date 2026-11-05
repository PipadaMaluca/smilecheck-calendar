import { lovable } from '@/integrations/lovable/index';
import { supabase } from '@/integrations/supabase/client';
import type { UserRole } from '@/types/calendar';

export type GoogleSignInOutcome =
  | { status: 'redirected' }
  | { status: 'error' }
  | { status: 'signed_in'; role: UserRole };

/**
 * Managed Google sign-in, shared by the login screen and the "create account" screen so both
 * run exactly one flow. A verified email that already belongs to an account is linked by the
 * auth server (no duplicate); a brand-new Google account is created with role_pending, so
 * RoleChoiceGate asks for the profile once and TermsGate follows.
 */
export async function runGoogleSignIn(): Promise<GoogleSignInOutcome> {
  const result = await lovable.auth.signInWithOAuth('google', { redirect_uri: window.location.origin });
  if (result.error) return { status: 'error' };
  if (result.redirected) return { status: 'redirected' };

  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
    : { data: null };

  return { status: 'signed_in', role: (profile?.role ?? 'patient') as UserRole };
}
