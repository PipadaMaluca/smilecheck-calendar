import { Home, Calendar, Users, MessageCircle, Trophy, Award, CreditCard, Gift, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import smileIcon from '@/assets/smilecheck-icon.png';
import { UserRole } from '@/types/calendar';

interface DesktopMainSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  userRole: UserRole;
}

const PRIMARY_ITEMS = [
  { id: 'home', icon: Home, label: 'Início' },
  { id: 'agenda', icon: Calendar, label: 'Agenda' },
  { id: 'team', icon: Users, label: 'Equipa' },
  { id: 'chat', icon: MessageCircle, label: 'Conversas' },
];

const SECONDARY_ITEMS = [
  { id: 'rankings', icon: Trophy, label: 'Classificações' },
  { id: 'achievements', icon: Award, label: 'Conquistas' },
  { id: 'plan', icon: CreditCard, label: 'Gerir Plano' },
  { id: 'rewards', icon: Gift, label: 'Loja de Recompensas' },
];

export function DesktopMainSidebar({ activeTab, onTabChange, userRole }: DesktopMainSidebarProps) {
  const showProBadge = userRole === 'dentist' || userRole === 'clinic';

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-card border-r border-border flex flex-col z-50">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
        <img src={smileIcon} alt="SmileCheck" className="h-9 w-9" />
        <span className="text-base font-bold text-foreground">SmileCheck</span>
        {showProBadge && (
          <Badge className="bg-amber-500/20 text-amber-500 border-0 text-[10px] px-1.5 py-0">Pro</Badge>
        )}
      </div>

      {/* Primary Menu */}
      <nav className="flex flex-col gap-0.5 px-3 pt-3">
        {PRIMARY_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <Button
              key={item.id}
              variant="ghost"
              onClick={() => onTabChange(item.id)}
              className={cn(
                'justify-start gap-3 h-10 px-3 text-sm font-medium',
                isActive
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </Button>
          );
        })}
      </nav>

      <Separator className="my-4 mx-3" />

      {/* Secondary Menu */}
      <nav className="flex flex-col gap-0.5 px-3">
        {SECONDARY_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <Button
              key={item.id}
              variant="ghost"
              onClick={() => onTabChange(item.id)}
              className={cn(
                'justify-start gap-3 h-10 px-3 text-sm font-medium',
                isActive
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </Button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="mt-auto border-t border-border px-3 py-3">
        <Button
          variant="ghost"
          onClick={() => onTabChange('settings')}
          className={cn(
            'justify-start gap-3 h-10 px-3 text-sm font-medium w-full',
            activeTab === 'settings'
              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
        >
          <Settings className="w-4 h-4 flex-shrink-0" />
          Conta
        </Button>
      </div>
    </aside>
  );
}
