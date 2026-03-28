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
    <nav className={cn("fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-[#121f30] text-white", scrolled && 'shadow-lg')}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-[#121f30] text-white">
        <div className="flex items-center justify-between h-20 bg-[#121f30] text-white">
          <a href="#" className="flex-shrink-0 mr-8">
            <img src={logoSrc} alt="SmileCheck" className="transition-all duration-300 h-14 sm:h-16 rounded-2xl" />
          </a>

          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} className="text-sm transition-colors text-white whitespace-nowrap">{l.label}</a>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3 ml-8">
            <LanguageSwitcher />
            <button onClick={onToggleTheme} className="p-2 rounded-lg transition-colors bg-[#121f30] border-white border" aria-label="Toggle theme">
              {isDark ? <Sun className="w-4 h-4 bg-[#121f30] border-0 border-white text-white rounded-none" /> : <Moon className="w-4 h-4" />}
            </button>
            <Button variant="outline" size="sm" className="bg-[#121f30] text-white border-white hover:bg-[#1a2d45] hover:text-white" onClick={() => navigate('/login')}>
              {t('landing.navbar.login')}
            </Button>
            <Button size="sm" onClick={() => navigate('/signup')}>
              {t('landing.navbar.signup')}
            </Button>
          </div>

          <div className="lg:hidden flex items-center gap-2">
            <LanguageSwitcher size="sm" />
            <button onClick={onToggleTheme} className="p-2 rounded-lg hover:bg-accent transition-colors">
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-lg hover:bg-accent transition-colors">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden bg-[#121f30] border-b border-[#1a2d45] animate-fade-in">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setMobileOpen(false)}
                className="block text-sm text-[hsl(215,20%,65%)] hover:text-white py-2.5 px-3 rounded-lg hover:bg-[#1a2d45] transition-colors">
                {l.label}
              </a>
            ))}
            <div className="flex gap-2 pt-3">
              <Button variant="outline" size="sm" className="flex-1 bg-[#121f30] text-white border-white hover:bg-[#1a2d45] hover:text-white" onClick={() => navigate('/login')}>
                {t('landing.navbar.login')}
              </Button>
              <Button size="sm" className="flex-1" onClick={() => navigate('/signup')}>
                {t('landing.navbar.signup')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}