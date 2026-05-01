import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { Logo } from '@/components/branding/Logo';

interface LandingNavbarProps {
  isDark: boolean;
  onToggleTheme: () => void;
}

export function LandingNavbar({ isDark, onToggleTheme }: LandingNavbarProps) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const langs = ['pt', 'fr', 'en'] as const;

  const pillInactive = isDark
    ? 'bg-transparent text-[#94A3B8] hover:bg-[#1E3A5F] hover:text-white'
    : 'bg-transparent text-[#4A5568] hover:bg-[#EBF4FF] hover:text-[#1A202C]';
  const pillActive = 'bg-[#2196F3] text-white';

  const renderToggleGroup = (size: 'sm' | 'md') => {
    const btn =
      size === 'sm'
        ? 'h-[26px] min-w-[28px] px-1.5 rounded-md text-[10px] font-semibold transition-colors flex items-center justify-center'
        : 'h-7 min-w-[32px] px-2 rounded-lg text-[11px] font-semibold transition-colors flex items-center justify-center';
    const containerPad = size === 'sm' ? 'px-1.5 py-[3px]' : 'px-2 py-1';
    const dividerH = size === 'sm' ? 'h-[14px] mx-2' : 'h-5 mx-[10px]';
    const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5';
    return (
      <div
        className={cn(
          'flex items-center rounded-[12px] border backdrop-blur-md',
          containerPad,
          isDark
            ? 'bg-[#0D2137]/80 border-[#1E3A5F]'
            : 'bg-[#EBF4FF]/80 border-[#D6E4F0]'
        )}
      >
        <div className="flex items-center gap-[2px]">
          {langs.map((lang) => (
            <button
              key={lang}
              onClick={() => i18n.changeLanguage(lang)}
              className={cn(btn, i18n.language === lang ? pillActive : pillInactive)}
              aria-label={lang.toUpperCase()}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>
        <div
          className={cn('w-[2px] rounded-full', dividerH)}
          style={{
            background:
              'linear-gradient(180deg, transparent 0%, #2196F3 30%, #1565C0 70%, transparent 100%)',
          }}
          aria-hidden="true"
        />
        <div className="flex items-center gap-[2px]">
          <button
            onClick={() => { if (isDark) onToggleTheme(); }}
            className={cn(btn, !isDark ? pillActive : pillInactive)}
            aria-label="Light mode"
          >
            <Sun className={iconSize} />
          </button>
          <button
            onClick={() => { if (!isDark) onToggleTheme(); }}
            className={cn(btn, isDark ? pillActive : pillInactive)}
            aria-label="Dark mode"
          >
            <Moon className={iconSize} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-xl border-b',
        isDark
          ? 'bg-[#0A1929]/80 border-[#1E3A5F]'
          : 'bg-white/80 border-[#E2E8F0]',
        scrolled && 'shadow-sm'
      )}
      style={{ WebkitBackdropFilter: 'blur(20px)', backdropFilter: 'blur(20px)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mobile (<768): 2-row layout */}
        <div className="md:hidden">
          {/* Row 1: Logo + auth buttons (48px) */}
          <div className="flex items-center justify-between h-12">
            <a href="#" className="flex-shrink-0 flex items-center">
              <Logo size={32} />
            </a>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => navigate('/login')}
                className={cn(
                  'text-[13px] font-medium transition-colors whitespace-nowrap',
                  isDark ? 'text-[#64B5F6] hover:text-white' : 'text-[#1565C0] hover:text-[#0D47A1]'
                )}
              >
                {t('landing.navbar.login')}
              </button>
              <Button
                size="sm"
                onClick={() => navigate('/signup')}
                className="rounded-full bg-[#2196F3] hover:bg-[#1E88E5] text-white text-[13px] font-semibold px-3 py-1.5 h-auto shadow-[0_4px_14px_rgba(33,150,243,0.3)] transition-all whitespace-nowrap"
              >
                {t('landing.navbar.signup')}
              </Button>
            </div>
          </div>
          {/* Row 2: Toggles centered (36px) */}
          <div className="h-9 flex items-center justify-center">
            {renderToggleGroup('sm')}
          </div>
        </div>

        {/* Tablet/Desktop (≥768): single row */}
        <div className="hidden md:block">
          <div className="relative flex items-center justify-between h-16 lg:h-20 gap-3">
            <a href="#" className="flex-shrink-0 flex items-center gap-2 relative z-10">
              <Logo size={32} />
              <span className={cn('font-bold text-lg tracking-tight', isDark ? 'text-white' : 'text-[#1A202C]')}>SmileCheck</span>
            </a>

            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              <div className="pointer-events-auto">{renderToggleGroup('md')}</div>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0 relative z-10 ml-auto">
              <button
                onClick={() => navigate('/login')}
                className={cn(
                  'text-[13px] font-medium transition-colors whitespace-nowrap',
                  isDark ? 'text-[#64B5F6] hover:text-white' : 'text-[#1565C0] hover:text-[#0D47A1]'
                )}
              >
                {t('landing.navbar.login')}
              </button>
              <Button
                size="sm"
                onClick={() => navigate('/signup')}
                className="rounded-full bg-[#2196F3] hover:bg-[#1E88E5] text-white text-[13px] font-semibold px-3.5 py-1.5 h-auto shadow-[0_4px_14px_rgba(33,150,243,0.3)] hover:shadow-[0_6px_20px_rgba(33,150,243,0.4)] transition-all whitespace-nowrap"
              >
                {t('landing.navbar.signup')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
