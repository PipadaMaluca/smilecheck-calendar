import { 
  Home, 
  Calendar, 
  Heart, 
  MessageCircle, 
  Users, 
  Settings,
  Trophy,
  Award,
  Gift,
  CreditCard
} from 'lucide-react';
import { UserRole } from '@/types/calendar';
import { cn } from '@/lib/utils';
import smileIcon from '@/assets/smilecheck-icon.png';

interface DesktopSidebarProps {
  userRole: UserRole;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function DesktopSidebar({ userRole, activeTab, onTabChange }: DesktopSidebarProps) {
  
  const mainNavItems = {
    patient: [
      { id: 'home', icon: Home, label: 'Início' },
      { id: 'consultas', icon: Calendar, label: 'Consultas' },
      { id: 'saude', icon: Heart, label: 'Saúde' },
      { id: 'conversas', icon: MessageCircle, label: 'Conversas' },
    ],
    dentist: [
      { id: 'home', icon: Home, label: 'Início' },
      { id: 'agenda', icon: Calendar, label: 'Agenda' },
      { id: 'equipa', icon: Users, label: 'Equipa' },
      { id: 'conversas', icon: MessageCircle, label: 'Conversas' },
    ],
    clinic: [
      { id: 'home', icon: Home, label: 'Início' },
      { id: 'agenda', icon: Calendar, label: 'Agenda' },
      { id: 'equipa', icon: Users, label: 'Equipa' },
      { id: 'conversas', icon: MessageCircle, label: 'Conversas' },
    ],
  };

  const secondaryNavItems = {
    patient: [
      { id: 'conquistas', icon: Trophy, label: 'Conquistas' },
      { id: 'plano', icon: CreditCard, label: 'Gerir Plano' },
      { id: 'loja', icon: Gift, label: 'Loja de Recompensas' },
    ],
    dentist: [
      { id: 'classificacoes', icon: Trophy, label: 'Classificações' },
      { id: 'conquistas', icon: Award, label: 'Conquistas' },
      { id: 'plano', icon: CreditCard, label: 'Gerir Plano' },
      { id: 'loja', icon: Gift, label: 'Loja de Recompensas' },
    ],
    clinic: [
      { id: 'classificacoes', icon: Trophy, label: 'Classificações' },
      { id: 'conquistas', icon: Award, label: 'Conquistas' },
      { id: 'estatisticas', icon: Trophy, label: 'Estatísticas' },
      { id: 'plano', icon: CreditCard, label: 'Gerir Plano' },
      { id: 'loja', icon: Gift, label: 'Loja de Recompensas' },
    ],
  };

  const MenuItem = ({ 
    item, 
    isActive 
  }: { 
    item: { id: string; icon: React.ElementType; label: string }; 
    isActive: boolean;
  }) => {
    const Icon = item.icon;
    return (
      <button
        onClick={() => onTabChange(item.id)}
        className={cn(
          'w-full flex items-center gap-3 px-4 py-2.5 text-sm rounded-lg transition-colors',
          isActive 
            ? 'bg-primary text-primary-foreground' 
            : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
        )}
      >
        <Icon className="w-5 h-5" />
        {item.label}
      </button>
    );
  };

  return (
    <aside className="w-60 h-screen bg-card border-r border-border flex flex-col sticky top-0">
      {/* Logo */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <img src={smileIcon} alt="SmileCheck" className="h-8 w-8" />
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground">SmileCheck</span>
            {userRole !== 'patient' && (
              <span className="text-[10px] font-bold bg-amber-400 text-amber-900 px-1.5 py-0.5 rounded">
                Pro
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Navegação Principal */}
      <nav className="flex-1 p-3 space-y-1">
        {mainNavItems[userRole].map((item) => (
          <MenuItem key={item.id} item={item} isActive={activeTab === item.id} />
        ))}

        {/* Separador */}
        <div className="h-px bg-border my-3" />

        {/* Navegação Secundária */}
        {secondaryNavItems[userRole].map((item) => (
          <MenuItem key={item.id} item={item} isActive={activeTab === item.id} />
        ))}
      </nav>

      {/* Conta no fundo */}
      <div className="p-3 border-t border-border">
        <MenuItem item={{ id: 'conta', icon: Settings, label: 'Conta' }} isActive={activeTab === 'conta'} />
      </div>
    </aside>
  );
}
