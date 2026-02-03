import { Home, Calendar, Heart, MessageCircle, Users, Settings, Search } from 'lucide-react';
import { UserRole } from '@/types/calendar';
import { cn } from '@/lib/utils';

interface BottomNavigationProps {
  userRole: UserRole;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

// Mobile/Tablet navigation - 5 items each, fixed at bottom
const navigationItems = {
  patient: [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'agenda', icon: Calendar, label: 'Consulta' },
    { id: 'saude', icon: Heart, label: 'Saúde' },
    { id: 'chat', icon: MessageCircle, label: 'Chat' },
    { id: 'conta', icon: Settings, label: 'Conta' },
  ],
  dentist: [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'agenda', icon: Calendar, label: 'Agenda' },
    { id: 'search', icon: Search, label: 'Buscar' },
    { id: 'chat', icon: MessageCircle, label: 'Chat' },
    { id: 'settings', icon: Settings, label: 'Config.' },
  ],
  clinic: [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'agenda', icon: Calendar, label: 'Agenda' },
    { id: 'search', icon: Search, label: 'Buscar' },
    { id: 'team', icon: Users, label: 'Equipa' },
    { id: 'settings', icon: Settings, label: 'Config.' },
  ],
};

export function BottomNavigation({ userRole, activeTab, onTabChange }: BottomNavigationProps) {
  const items = navigationItems[userRole];

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-[hsl(214_50%_10%)] border-t border-border z-50" 
      style={{ 
        boxShadow: '0 -4px 20px hsl(214 50% 5% / 0.3)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)'
      }}
    >
      <div className="flex items-center justify-around py-2">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                'flex flex-col items-center gap-1 py-2 px-4 text-muted-foreground transition-all duration-200 relative',
                isActive && 'text-primary'
              )}
            >
              <Icon className={cn('w-5 h-5 transition-transform', isActive && 'scale-110')} />
              <span className="text-[10px] font-medium">{item.label}</span>
              {isActive && (
                <span className="absolute top-0 w-8 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
