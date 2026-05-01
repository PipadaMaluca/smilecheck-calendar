import { useState, useEffect } from 'react';
import { LanguageSelector } from '@/components/landing/LanguageSelector';
import { ThemeSelector } from '@/components/landing/ThemeSelector';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { SectionNav } from '@/components/landing/SectionNav';
import { HeroSection } from '@/components/landing/HeroSection';
import { TrustBar } from '@/components/landing/TrustBar';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { FAQSection } from '@/components/landing/FAQSection';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { applyTheme, getInitialTheme, useTheme } from '@/hooks/useTheme';

export default function Landing() {
  const [langSelected, setLangSelected] = useState(
    () => localStorage.getItem('smilecheck-language') !== null
  );
  const [themeSelected, setThemeSelected] = useState(
    () => localStorage.getItem('sc-theme-set') === '1' || localStorage.getItem('sc:theme') !== null
  );
  const [theme, setTheme] = useTheme();
  const isDark = theme === 'dark';

  // Ensure boot theme applied on mount
  useEffect(() => {
    applyTheme(getInitialTheme());
    document.body.classList.add('on-landing');
    return () => {
      document.body.classList.remove('on-landing');
    };
  }, []);

  const handleApplyTheme = (dark: boolean) => {
    setTheme(dark ? 'dark' : 'light');
    localStorage.setItem('sc-theme-set', '1');
    setThemeSelected(true);
  };

  if (!langSelected) {
    return <LanguageSelector onSelect={() => setLangSelected(true)} />;
  }

  if (!themeSelected) {
    return <ThemeSelector onSelect={handleApplyTheme} />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground scroll-smooth">
      <LandingNavbar isDark={isDark} onToggleTheme={() => handleApplyTheme(!isDark)} />
      <SectionNav isDark={isDark} />
      <main>
        <HeroSection />
        <TrustBar />
        <FeaturesSection />
        <HowItWorksSection />
        <PricingSection />
        <TestimonialsSection />
        <FAQSection />
      </main>
      <LandingFooter />
    </div>
  );
}
