import { Home, Calendar, Heart, MessageCircle, Users, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { UserRole } from '@/types/calendar';
import { cn } from '@/lib/utils';

interface BottomNavigationProps {
  userRole: UserRole;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function BottomNavigation({ userRole, activeTab, onTabChange }: BottomNavigationProps) {
  const { t } = useTranslation();

  const navigationItems = {
    patient: [
      { id: 'home', icon: Home, label: t('nav.home') },
      { id: 'consultas', icon: Calendar, label: t('nav.consultations') },
      { id: 'saude', icon: Heart, label: t('nav.health') },
      { id: 'conversas', icon: MessageCircle, label: t('nav.conversations') },
      { id: 'configuracoes', icon: Settings, label: t('nav.settings') },
    ],
    dentist: [
      { id: 'home', icon: Home, label: t('nav.home') },
      { id: 'agenda', icon: Calendar, label: t('nav.agenda') },
      { id: 'equipa', icon: Users, label: t('nav.team') },
      { id: 'conversas', icon: MessageCircle, label: t('nav.conversations') },
      { id: 'configuracoes', icon: Settings, label: t('nav.settings') },
    ],
    clinic: [
      { id: 'home', icon: Home, label: t('nav.home') },
      { id: 'agenda', icon: Calendar, label: t('nav.agenda') },
      { id: 'equipa', icon: Users, label: t('nav.team') },
      { id: 'conversas', icon: MessageCircle, label: t('nav.conversations') },
      { id: 'configuracoes', icon: Settings, label: t('nav.settings') },
    ],
  };

  const items = navigationItems[userRole];

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-[hsl(214_50%_10%)] border-t border-border z-[70]" 
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
