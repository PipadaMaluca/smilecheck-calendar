import { createContext, useContext, useState, useCallback, useRef, ReactNode } from 'react';
import { UserRole } from '@/types/calendar';

interface OnboardingState {
  showCarousel: boolean;
  showTooltips: boolean;
  carouselRole: UserRole;
  tooltipRole: UserRole;
  startCarousel: (role: UserRole) => void;
  startTooltips: (role: UserRole) => void;
  finishCarousel: () => void;
  finishTooltips: () => void;
  replayFull: (role: UserRole) => void;
  replayTooltips: (role: UserRole) => void;
  hasCompletedOnboarding: (role: UserRole) => boolean;
  markOnboardingComplete: (role: UserRole) => void;
  /** Demo sessions gate the tutorial per browser session + role (sessionStorage). */
  setDemoSession: (isDemo: boolean) => void;
}

const demoKey = (role: UserRole) => `sc:demo-onboarding:${role}`;
export const isDemoOnboardingSeen = (role: string) => {
  try { return sessionStorage.getItem(`sc:demo-onboarding:${role}`) === '1'; } catch { return false; }
};

const OnboardingContext = createContext<OnboardingState | null>(null);

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used within OnboardingProvider');
  return ctx;
}

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [showCarousel, setShowCarousel] = useState(false);
  const [showTooltips, setShowTooltips] = useState(false);
  const [carouselRole, setCarouselRole] = useState<UserRole>('patient');
  const [tooltipRole, setTooltipRole] = useState<UserRole>('patient');

  const demoRef = useRef(false);
  const setDemoSession = useCallback((isDemo: boolean) => { demoRef.current = isDemo; }, []);

  const hasCompletedOnboarding = useCallback((role: UserRole) => {
    if (demoRef.current) return isDemoOnboardingSeen(role);
    // Single first-run gate covers ALL roles after first completion to avoid
    // re-triggering the carousel/tooltip chain when users switch demo roles.
    if (localStorage.getItem('sc:first-run-done') === '1') return true;
    return localStorage.getItem(`smilecheck_onboarding_${role}`) === 'done';
  }, []);

  const markOnboardingComplete = useCallback((role: UserRole) => {
    if (demoRef.current) {
      try { sessionStorage.setItem(demoKey(role), '1'); } catch { /* ignore */ }
      return;
    }
    localStorage.setItem(`smilecheck_onboarding_${role}`, 'done');
    localStorage.setItem('sc:onboarding-completed', 'true');
    localStorage.setItem('sc:first-run-done', '1');
  }, []);

  const startCarousel = useCallback((role: UserRole) => {
    // Demo: count as seen as soon as it opens, so skip/reload never re-shows it this session.
    if (demoRef.current) { try { sessionStorage.setItem(demoKey(role), '1'); } catch { /* ignore */ } }
    setCarouselRole(role);
    setTooltipRole(role);
    setShowCarousel(true);
  }, []);

  const startTooltips = useCallback((role: UserRole) => {
    setTooltipRole(role);
    setShowTooltips(true);
  }, []);

  const finishCarousel = useCallback(() => {
    setShowCarousel(false);
    // After carousel, start tooltips
    setShowTooltips(true);
  }, []);

  const finishTooltips = useCallback(() => {
    setShowTooltips(false);
    markOnboardingComplete(tooltipRole);
  }, [tooltipRole, markOnboardingComplete]);

  const replayFull = useCallback((role: UserRole) => {
    setCarouselRole(role);
    setTooltipRole(role);
    setShowCarousel(true);
    setShowTooltips(false);
  }, []);

  const replayTooltips = useCallback((role: UserRole) => {
    setTooltipRole(role);
    setShowTooltips(true);
  }, []);

  return (
    <OnboardingContext.Provider value={{
      showCarousel, showTooltips, carouselRole, tooltipRole,
      startCarousel, startTooltips, finishCarousel, finishTooltips,
      replayFull, replayTooltips, hasCompletedOnboarding, markOnboardingComplete, setDemoSession,
    }}>
      {children}
    </OnboardingContext.Provider>
  );
}
