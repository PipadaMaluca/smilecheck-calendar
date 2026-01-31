import { Home, Search, Calendar, MessageCircle, Users, Settings } from 'lucide-react';
import { UserRole } from '@/types/calendar';
import { cn } from '@/lib/utils';

interface BottomNavigationProps {
  userRole: UserRole;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navigationItems = {
  patient: [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'agenda', icon: Calendar, label: 'Agenda' },
    { id: 'search', icon: Search, label: 'Buscar' },
    { id: 'chat', icon: MessageCircle, label: 'Chat' },
    { id: 'settings', icon: Settings, label: 'Config.' },
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
    <nav className="bottom-nav">
      <div className="flex items-center justify-around py-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                'bottom-nav-item',
                isActive && 'bottom-nav-item-active'
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
