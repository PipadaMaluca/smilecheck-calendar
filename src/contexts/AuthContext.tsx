import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { UserRole } from '@/types/calendar';

const DEMO_KEY = 'sc:demo-role';

export interface AuthProfile {
  id: string;
  role: UserRole;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  language: string;
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
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

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
      .select('id, role, full_name, email, avatar_url, language')
      .eq('id', userId)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled && data) setProfile(data as AuthProfile);
      });
    return () => {
      cancelled = true;
    };
  }, [session?.user?.id]);

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
    }),
    [session, profile, demoRole, loading, enterDemo, exitDemo, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
