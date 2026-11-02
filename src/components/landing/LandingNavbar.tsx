import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon, Menu, LogIn, Check } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
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

  const pillInactive = 'bg-transparent text-muted-foreground hover:text-foreground';
  const pillActive = 'bg-card text-foreground shadow-sm';

  const renderToggleGroup = (size: 'sm' | 'md') => {
    const btn =
      size === 'sm'
        ? 'h-[26px] min-w-7 px-1.5 rounded-md text-2xs font-semibold transition-colors flex items-center justify-center'
        : 'h-7 min-w-8 px-2 rounded-lg text-2xs font-semibold transition-colors flex items-center justify-center';
    const containerPad = size === 'sm' ? 'px-1.5 py-0.5' : 'px-2 py-1';
    const dividerH = size === 'sm' ? 'h-3.5 mx-2' : 'h-5 mx-2.5';
    const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5';
    return (
      <div
        className={cn(
          'flex items-center rounded-xl border border-border bg-muted/60 backdrop-blur-md',
          containerPad
        )}
      >
        <div className="flex items-center gap-0.5">
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
          className={cn('w-px rounded-full bg-border', dividerH)}
          aria-hidden="true"
        />
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => { if (isDark) onToggleTheme(); }}
            className={cn(btn, !isDark ? pillActive : pillInactive)}
            aria-label={t('i18nC.lightMode')}
          >
            <Sun className={iconSize} />
          </button>
          <button
            onClick={() => { if (!isDark) onToggleTheme(); }}
            className={cn(btn, isDark ? pillActive : pillInactive)}
            aria-label={t('i18nC.darkMode')}
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
        'fixed top-0 left-0 right-0 z-50 transition-colors duration-300 backdrop-blur-xl border-b',
        isDark
          ? 'bg-background/80 border-border'
          : 'bg-card/80 border-border',
        scrolled && 'shadow-sm'
      )}
      style={{ WebkitBackdropFilter: 'blur(20px)', backdropFilter: 'blur(20px)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mobile (<768): logo + sign-up + compact menu (language, theme, login). Fits at 360px. */}
        <div className="md:hidden">
          <div className="flex items-center justify-between h-14 gap-2 min-w-0">
            <a href="#" className="flex-shrink min-w-0 flex items-center min-h-11" aria-label="SmileCheck">
              <Logo variant="icon" size={32} />
            </a>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Button size="sm" onClick={() => navigate('/signup')} className="rounded-full min-h-11 px-4 text-sm font-semibold whitespace-nowrap">
                {t('landing.navbar.signup')}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="min-h-11 min-w-11" aria-label={t('a11y.openMenu')}>
                    <Menu className="w-5 h-5" aria-hidden />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem className="min-h-11" onSelect={() => navigate('/login')}>
                    <LogIn className="w-4 h-4 mr-2" aria-hidden />{t('landing.navbar.login')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {langs.map((lang) => (
                    <DropdownMenuItem key={lang} className="min-h-11" onSelect={() => i18n.changeLanguage(lang)}>
                      <span className="w-6 text-xs font-semibold text-muted-foreground">{lang.toUpperCase()}</span>
                      {t(`i18nC.lang_${lang}`, { defaultValue: { pt: 'Português', fr: 'Français', en: 'English' }[lang] })}
                      {i18n.language?.startsWith(lang) && <Check className="w-4 h-4 ml-auto" aria-hidden />}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="min-h-11" onSelect={onToggleTheme}>
                    {isDark ? <Sun className="w-4 h-4 mr-2" aria-hidden /> : <Moon className="w-4 h-4 mr-2" aria-hidden />}
                    {isDark ? t('i18nC.lightMode') : t('i18nC.darkMode')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Tablet/Desktop (≥768): single row */}
        <div className="hidden md:block">
          <div className="relative flex items-center justify-between h-16 lg:h-20 gap-3">
            <a href="#" className="flex-shrink-0 flex items-center gap-2 relative z-10 h-full py-1">
              <span className="lg:hidden"><Logo variant="horizontal" size={160} /></span>
              <span className="hidden lg:inline-flex"><Logo variant="horizontal" size={200} /></span>
            </a>

            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              <div className="pointer-events-auto">{renderToggleGroup('md')}</div>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0 relative z-10 ml-auto">
              <button
                onClick={() => navigate('/login')}
                className={cn(
                  'text-sm font-medium transition-colors whitespace-nowrap',
                  isDark ? 'text-primary hover:text-white' : 'text-primary hover:text-primary'
                )}
              >
                {t('landing.navbar.login')}
              </button>
              <Button
                size="sm"
                onClick={() => navigate('/signup')}
                className="rounded-full bg-primary hover:bg-primary/90 text-white text-sm font-semibold px-3.5 py-1.5 h-auto shadow-[0_4px_14px_rgba(33,150,243,0.3)] hover:shadow-[0_6px_20px_rgba(33,150,243,0.4)] transition-colors whitespace-nowrap"
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
