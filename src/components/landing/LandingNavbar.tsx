import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LanguageSwitcher } from '@/components/landing/LanguageSwitcher';
import { useTranslation } from 'react-i18next';

const logoSrc = '/assets/smilecheck-logo-horizontal.png';

interface LandingNavbarProps {
  isDark: boolean;
  onToggleTheme: () => void;
}

export function LandingNavbar({ isDark, onToggleTheme }: LandingNavbarProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
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
          <a href="#" className="flex-shrink-0 mr-8">
            <img src={logoSrc} alt="SmileCheck" className="h-10 sm:h-12 rounded-xl" />
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

          <div className="hidden lg:flex items-center gap-3">
            <LanguageSwitcher />
            <button
              onClick={onToggleTheme}
              className={cn(
                'p-2 rounded-full transition-colors',
                isDark ? 'text-slate-300 hover:bg-white/10' : 'text-slate-600 hover:bg-slate-100'
              )}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
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
            <LanguageSwitcher size="sm" />
            <button
              onClick={onToggleTheme}
              className={cn(
                'p-2 rounded-full transition-colors',
                isDark ? 'text-slate-300 hover:bg-white/10' : 'text-slate-600 hover:bg-slate-100'
              )}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={cn(
                'p-2 rounded-full transition-colors',
                isDark ? 'text-slate-300 hover:bg-white/10' : 'text-slate-600 hover:bg-slate-100'
              )}
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
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'block text-sm font-medium py-2.5 px-3 rounded-lg transition-colors',
                  isDark ? 'text-slate-300 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                )}
              >
                {l.label}
              </a>
            ))}
            <div className="flex gap-2 pt-3">
              <Button
                variant="ghost"
                size="sm"
                className={cn('flex-1', isDark ? 'text-slate-200' : 'text-slate-700')}
                onClick={() => navigate('/login')}
              >
                {t('landing.navbar.login')}
              </Button>
              <Button
                size="sm"
                className="flex-1 rounded-full bg-[#2196F3] hover:bg-[#1E88E5] text-white"
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
