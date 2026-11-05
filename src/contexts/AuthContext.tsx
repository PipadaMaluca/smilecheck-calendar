import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { UserRole } from '@/types/calendar';
import { TERMS_VERSION } from '@/lib/support';

const DEMO_KEY = 'sc:demo-role';

export const PENDING_REFERRAL_KEY = 'smilecheck.pendingReferral';

export interface AuthProfile {
  id: string;
  role: UserRole;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  avatar_visibility?: 'public' | 'contacts' | null;
  language: string;
  plan?: 'free' | 'pro' | 'premium';
  referral_code?: string | null;
  terms_version?: string | null;
  /** Social sign-up that has not picked patient/dentist/clinic yet. */
  role_pending?: boolean;
}

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: AuthProfile | null;
  role: UserRole;
  loading: boolean;
  isAuthenticated: boolean;
  demoMode: boolean;
  demoRole: UserRole | null;
  enterDemo: (role: UserRole) => void;
  exitDemo: () => void;
  signOut: () => Promise<void>;
  /** True when a signed-in, non-demo user still has to accept the current terms. */
  needsTermsAcceptance: boolean;
  acceptTerms: () => Promise<boolean>;
  /** Updates the cached own profile after a successful server write (e.g. new avatar). */
  patchProfile: (patch: Partial<AuthProfile>) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Referral code typed at sign-up is registered server-side once the account has accepted the terms.
function registerPendingReferral() {
  const pendingCode = localStorage.getItem(PENDING_REFERRAL_KEY);
  if (!pendingCode) return;
  void supabase.rpc('register_referral', { _code: pendingCode }).then(({ error }) => {
    if (!error) localStorage.removeItem(PENDING_REFERRAL_KEY);
  });
}

function readDemoRole(): UserRole | null {
  if (typeof localStorage === 'undefined') return null;
  const stored = localStorage.getItem(DEMO_KEY);
  return stored === 'patient' || stored === 'dentist' || stored === 'clinic' ? stored : null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [demoRole, setDemoRole] = useState<UserRole | null>(() => readDemoRole());

  // Register the listener FIRST, then read the persisted session.
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      if (!next) setProfile(null);
    });

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  // Load the profile for the signed-in user (deferred, never inside the listener).
  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId) return;
    let cancelled = false;
    supabase
      .from('profiles')
      .select('id, role, full_name, email, avatar_url, avatar_visibility, language, plan, referral_code, terms_version, role_pending')
      .eq('id', userId)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled && data) {
          setProfile(data as AuthProfile);
          if (data.terms_version === TERMS_VERSION) registerPendingReferral();
        }
      });
    return () => {
      cancelled = true;
    };
  }, [session?.user?.id]);

  const acceptTerms = useCallback(async () => {
    const { error } = await supabase.rpc('accept_terms', { _version: TERMS_VERSION });
    if (error) return false;
    setProfile((p) => (p ? { ...p, terms_version: TERMS_VERSION } : p));
    registerPendingReferral();
    return true;
  }, []);

  const enterDemo = useCallback((role: UserRole) => {
    localStorage.setItem(DEMO_KEY, role);
    setDemoRole(role);
  }, []);

  const exitDemo = useCallback(() => {
    localStorage.removeItem(DEMO_KEY);
    setDemoRole(null);
  }, []);

  const signOut = useCallback(async () => {
    localStorage.removeItem(DEMO_KEY);
    setDemoRole(null);
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
  }, []);

  const patchProfile = useCallback((patch: Partial<AuthProfile>) => setProfile((p) => (p ? { ...p, ...patch } : p)), []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      session,
      profile,
      role: demoRole ?? profile?.role ?? 'patient',
      loading,
      isAuthenticated: Boolean(session),
      demoMode: demoRole !== null,
      demoRole,
      enterDemo,
      exitDemo,
      signOut,
      needsTermsAcceptance: Boolean(session && profile && demoRole === null && !profile.role_pending && profile.terms_version !== TERMS_VERSION),
      acceptTerms,
      patchProfile,
    }),
    [session, profile, demoRole, loading, enterDemo, exitDemo, signOut, acceptTerms, patchProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
