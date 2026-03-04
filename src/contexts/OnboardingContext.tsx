import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
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
}

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

  const hasCompletedOnboarding = useCallback((role: UserRole) => {
    return localStorage.getItem(`smilecheck_onboarding_${role}`) === 'done';
  }, []);

  const markOnboardingComplete = useCallback((role: UserRole) => {
    localStorage.setItem(`smilecheck_onboarding_${role}`, 'done');
  }, []);

  const startCarousel = useCallback((role: UserRole) => {
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
      replayFull, replayTooltips, hasCompletedOnboarding, markOnboardingComplete,
    }}>
      {children}
    </OnboardingContext.Provider>
  );
}
