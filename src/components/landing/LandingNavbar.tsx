import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon, Menu, X } from 'lucide-react';
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
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { label: t('landing.navbar.features'), href: '#funcionalidades' },
    { label: t('landing.navbar.plans'), href: '#planos' },
    { label: t('landing.navbar.testimonials'), href: '#testemunhos' },
    { label: t('landing.navbar.faq'), href: '#faq' },
    { label: t('landing.navbar.contact'), href: '#contacto' },
  ];

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
        <div className="flex items-center justify-between h-16 sm:h-20">
          <a href="#" className="flex-shrink-0 lg:mr-8 flex items-center gap-2">
            <Logo size={32} />
            <span className={cn('font-bold text-lg tracking-tight hidden sm:inline', isDark ? 'text-white' : 'text-[#1A202C]')}>SmileCheck</span>
          </a>

          <div className="hidden lg:flex items-center gap-8 flex-1 justify-center">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className={cn(
                  'text-sm font-medium transition-colors whitespace-nowrap',
                  isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                )}
              >
                {l.label}
              </a>
            ))}
          </div>

          {/* Mobile/tablet centered toggles */}
          <div className="lg:hidden flex-1 flex justify-center px-2">
            {ToggleGroup}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            {ToggleGroup}
            <button
              onClick={() => navigate('/login')}
              className={cn(
                'text-sm font-medium px-3 py-2 transition-colors',
                isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              )}
            >
              {t('landing.navbar.login')}
            </button>
            <Button
              size="sm"
              onClick={() => navigate('/signup')}
              className="rounded-full bg-[#2196F3] hover:bg-[#1E88E5] text-white text-sm font-medium px-5 h-10 shadow-[0_4px_14px_rgba(33,150,243,0.3)] hover:shadow-[0_6px_20px_rgba(33,150,243,0.4)] transition-all"
            >
              {t('landing.navbar.signup')}
            </Button>
          </div>

          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={cn(
                'p-3 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center',
                isDark ? 'text-slate-300 hover:bg-white/10' : 'text-slate-600 hover:bg-slate-100'
              )}
              aria-label="Menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div
          className={cn(
            'lg:hidden border-t animate-fade-in',
            isDark ? 'bg-[#0A1929] border-[#1E3A5F]' : 'bg-white border-[#E2E8F0]'
          )}
        >
          <div className="px-6 py-4 space-y-1">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'block text-base font-medium py-3 px-3 rounded-lg transition-colors min-h-[44px]',
                  isDark ? 'text-slate-300 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                )}
              >
                {l.label}
              </a>
            ))}
            <div className={cn('flex flex-col gap-2 pt-4 mt-2 border-t', isDark ? 'border-[#1E3A5F]' : 'border-[#E2E8F0]')}>
              <Button
                variant="ghost"
                className={cn('w-full h-11', isDark ? 'text-slate-200' : 'text-slate-700')}
                onClick={() => navigate('/login')}
              >
                {t('landing.navbar.login')}
              </Button>
              <Button
                className="w-full h-11 rounded-full bg-[#2196F3] hover:bg-[#1E88E5] text-white"
                onClick={() => navigate('/signup')}
              >
                {t('landing.navbar.signup')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
