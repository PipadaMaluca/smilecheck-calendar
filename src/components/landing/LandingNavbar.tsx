import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const logoSrc = '/assets/smilecheck-logo-horizontal.png';

interface LandingNavbarProps {
  isDark: boolean;
  onToggleTheme: () => void;
}

const navLinks = [
{ label: 'Funcionalidades', href: '#funcionalidades' },
{ label: 'Planos', href: '#planos' },
{ label: 'Testemunhos', href: '#testemunhos' },
{ label: 'FAQ', href: '#faq' },
{ label: 'Contacto', href: '#contacto' }];


export function LandingNavbar({ isDark, onToggleTheme }: LandingNavbarProps) {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={cn("fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-[#121f30] bg-[#121f30]",

      scrolled ?
      'bg-background/80 backdrop-blur-xl border-b border-border shadow-sm' :
      'bg-transparent'
      )}>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <a href="#" className="flex-shrink-0">
            <img
              src={logoSrc}
              alt="SmileCheck"
              className={cn("logo-light-adapt transition-all duration-300 h-14 sm:h-16 rounded-2xl"


              )} />
            
          </a>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((l) =>
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              
                {l.label}
              </a>
            )}
          </div>

          {/* Right actions */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-lg transition-colors bg-[#121f30]"
              aria-label="Alternar tema">
              
              {isDark ? <Sun className="w-4 h-4 text-white bg-[#121f30]" /> : <Moon className="w-4 h-4" />}
            </button>
            <Button variant="outline" size="sm" onClick={() => navigate('/login')}>
              Entrar
            </Button>
            <Button size="sm" onClick={() => navigate('/signup')}>
              Criar Conta
            </Button>
          </div>

          {/* Mobile actions */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-lg hover:bg-accent transition-colors">
              
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-lg hover:bg-accent transition-colors">
              
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen &&
      <div className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border animate-fade-in">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((l) =>
          <a
            key={l.href}
            href={l.href}
            onClick={() => setMobileOpen(false)}
            className="block text-sm text-muted-foreground hover:text-foreground py-2.5 px-3 rounded-lg hover:bg-accent transition-colors">
            
                {l.label}
              </a>
          )}
            <div className="flex gap-2 pt-3">
              <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => navigate('/login')}>
              
                Entrar
              </Button>
              <Button size="sm" className="flex-1" onClick={() => navigate('/signup')}>
                Criar Conta
              </Button>
            </div>
          </div>
        </div>
      }
    </nav>);

}