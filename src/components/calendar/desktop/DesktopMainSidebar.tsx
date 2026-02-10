import { Home, Calendar, Heart, MessageCircle, Users, Trophy, Award, CreditCard, Gift, BarChart3, Settings } from 'lucide-react';
import { UserRole } from '@/types/calendar';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import smileIcon from '@/assets/smilecheck-icon.png';

interface DesktopMainSidebarProps {
  userRole: UserRole;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navConfig: Record<UserRole, { label: string; icon: React.ElementType; id: string }[]> = {
  patient: [
    { label: 'Início', icon: Home, id: 'inicio' },
    { label: 'Consultas', icon: Calendar, id: 'consultas' },
    { label: 'Saúde', icon: Heart, id: 'saude' },
    { label: 'Conversas', icon: MessageCircle, id: 'conversas' },
  ],
  dentist: [
    { label: 'Início', icon: Home, id: 'inicio' },
    { label: 'Agenda', icon: Calendar, id: 'agenda' },
    { label: 'Equipa', icon: Users, id: 'equipa' },
    { label: 'Conversas', icon: MessageCircle, id: 'conversas' },
  ],
  clinic: [
    { label: 'Início', icon: Home, id: 'inicio' },
    { label: 'Agenda', icon: Calendar, id: 'agenda' },
    { label: 'Equipa', icon: Users, id: 'equipa' },
    { label: 'Conversas', icon: MessageCircle, id: 'conversas' },
  ],
};

const secondaryNavConfig: Record<UserRole, { label: string; icon: React.ElementType; id: string }[]> = {
  patient: [
    { label: 'Conquistas', icon: Trophy, id: 'conquistas' },
    { label: 'Gerir Plano', icon: CreditCard, id: 'plano' },
    { label: 'Loja de Recompensas', icon: Gift, id: 'loja' },
  ],
  dentist: [
    { label: 'Classificações', icon: Trophy, id: 'classificacoes' },
    { label: 'Conquistas', icon: Award, id: 'conquistas' },
    { label: 'Gerir Plano', icon: CreditCard, id: 'plano' },
    { label: 'Loja de Recompensas', icon: Gift, id: 'loja' },
  ],
  clinic: [
    { label: 'Classificações', icon: Trophy, id: 'classificacoes' },
    { label: 'Conquistas', icon: Award, id: 'conquistas' },
    { label: 'Estatísticas', icon: BarChart3, id: 'estatisticas' },
    { label: 'Gerir Plano', icon: CreditCard, id: 'plano' },
    { label: 'Loja de Recompensas', icon: Gift, id: 'loja' },
  ],
};

function NavItem({ icon: Icon, label, isActive, onClick }: { icon: React.ElementType; label: string; isActive: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      )}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <span>{label}</span>
    </button>
  );
}

export function DesktopMainSidebar({ userRole, activeTab, onTabChange }: DesktopMainSidebarProps) {
  const primaryNav = navConfig[userRole];
  const secondaryNav = secondaryNavConfig[userRole];
  const showProBadge = userRole === 'dentist' || userRole === 'clinic';

  return (
    <aside className="w-64 flex-shrink-0 h-screen bg-card border-r border-border flex flex-col fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="px-4 py-5 flex items-center gap-2.5">
        <img src={smileIcon} alt="SmileCheck" className="h-8 w-8" />
        <span className="text-base font-bold text-foreground">SmileCheck</span>
        {showProBadge && (
          <span className="text-[10px] px-1.5 py-0 rounded font-semibold" style={{ color: 'hsl(38, 92%, 50%)', backgroundColor: 'hsl(38, 92%, 50%, 0.15)', border: '1px solid hsl(38, 92%, 50%, 0.3)' }}>
            Pro
          </span>
        )}
      </div>

      {/* Primary Navigation */}
      <nav className="px-3 flex flex-col gap-1">
        {primaryNav.map((item) => (
          <NavItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            isActive={activeTab === item.id}
            onClick={() => onTabChange(item.id)}
          />
        ))}
      </nav>

      <Separator className="mx-3 my-3" />

      {/* Secondary Navigation */}
      <nav className="px-3 flex flex-col gap-1">
        {secondaryNav.map((item) => (
          <NavItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            isActive={activeTab === item.id}
            onClick={() => onTabChange(item.id)}
          />
        ))}
      </nav>

      {/* Bottom - Settings */}
      <div className="mt-auto px-3 pb-4">
        <NavItem
          icon={Settings}
          label="Conta"
          isActive={activeTab === 'conta'}
          onClick={() => onTabChange('conta')}
        />
      </div>
    </aside>
  );
}
