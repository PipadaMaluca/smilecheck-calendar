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

  const pillBase =
    'h-7 min-w-[32px] px-2 rounded-lg text-[11px] font-semibold transition-colors flex items-center justify-center';
  const pillActive = 'bg-[#2196F3] text-white';
  const pillInactive = isDark
    ? 'bg-transparent text-[#94A3B8] hover:bg-[#1E3A5F] hover:text-white'
    : 'bg-transparent text-[#4A5568] hover:bg-[#EBF4FF] hover:text-[#1A202C]';

  const ToggleGroup = (
    <div
      className={cn(
        'flex items-center rounded-[12px] border px-2 py-1 backdrop-blur-md',
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
            className={cn(pillBase, i18n.language === lang ? pillActive : pillInactive)}
            aria-label={lang.toUpperCase()}
          >
            {lang.toUpperCase()}
          </button>
        ))}
      </div>
      <div
        className="w-[2px] h-5 mx-[10px] rounded-full"
        style={{
          background:
            'linear-gradient(180deg, transparent 0%, #2196F3 30%, #1565C0 70%, transparent 100%)',
        }}
        aria-hidden="true"
      />
      <div className="flex items-center gap-[2px]">
        <button
          onClick={() => { if (isDark) onToggleTheme(); }}
          className={cn(pillBase, !isDark ? pillActive : pillInactive)}
          aria-label="Light mode"
        >
          <Sun className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => { if (!isDark) onToggleTheme(); }}
          className={cn(pillBase, isDark ? pillActive : pillInactive)}
          aria-label="Dark mode"
        >
          <Moon className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );

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
        <div className="relative flex items-center justify-between h-16 sm:h-20 gap-3">
          {/* LEFT: Logo */}
          <a href="#" className="flex-shrink-0 flex items-center gap-2 relative z-10">
            <Logo size={32} />
            <span className={cn('font-bold text-lg tracking-tight hidden sm:inline', isDark ? 'text-white' : 'text-[#1A202C]')}>SmileCheck</span>
          </a>

          {/* CENTER: toggles, absolutely centered on the navbar */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div className="pointer-events-auto">{ToggleGroup}</div>
          </div>

          {/* RIGHT: Entrar + Criar Conta */}
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
    </nav>
  );
}
