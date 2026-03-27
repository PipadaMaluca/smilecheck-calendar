import { useState, useEffect } from 'react';
import { LanguageSelector } from '@/components/landing/LanguageSelector';
import { ThemeSelector } from '@/components/landing/ThemeSelector';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { FAQSection } from '@/components/landing/FAQSection';
import { LandingFooter } from '@/components/landing/LandingFooter';

export default function Landing() {
  const [langSelected, setLangSelected] = useState(
    () => localStorage.getItem('smilecheck-language') !== null
  );
  const [themeSelected, setThemeSelected] = useState(
    () => localStorage.getItem('sc-theme-set') === '1'
  );
  const [isDark, setIsDark] = useState(
    () => document.documentElement.classList.contains('dark')
  );

  useEffect(() => {
    const saved = localStorage.getItem('sc-theme');
    if (saved) {
      const dark = saved === 'dark';
      setIsDark(dark);
      document.documentElement.classList.toggle('dark', dark);
      document.documentElement.classList.toggle('light', !dark);
    }
    return () => {
      document.documentElement.classList.remove('light');
    };
  }, []);

  const applyTheme = (dark: boolean) => {
    setIsDark(dark);
    document.documentElement.classList.toggle('dark', dark);
    document.documentElement.classList.toggle('light', !dark);
    localStorage.setItem('sc-theme', dark ? 'dark' : 'light');
    localStorage.setItem('sc-theme-set', '1');
    setThemeSelected(true);
  };

  if (!langSelected) {
    return <LanguageSelector onSelect={() => setLangSelected(true)} />;
  }

  if (!themeSelected) {
    return <ThemeSelector onSelect={applyTheme} />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground scroll-smooth">
      <LandingNavbar isDark={isDark} onToggleTheme={() => applyTheme(!isDark)} />
      <main>
        <HeroSection />
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
