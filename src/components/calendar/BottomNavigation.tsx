import { Home, Calendar, MessageCircle, Bell, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { UserRole } from '@/types/calendar';
import { cn } from '@/lib/utils';
import { useNotificationBadges } from '@/contexts/NotificationBadgeContext';

const BADGE_CONFIG: Record<string, { color: string; type: 'count' | 'alert'; key: string }> = {
  conversas: { color: 'bg-blue-500', type: 'count', key: 'conversas' },
  loja: { color: '', type: 'alert', key: '' }, // no badge for loja
};

interface BottomNavigationProps {
  userRole: UserRole;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function BottomNavigation({ userRole, activeTab, onTabChange }: BottomNavigationProps) {
  const { t } = useTranslation();
  const { badges, clearBadge } = useNotificationBadges();

  const navigationItems = {
    patient: [
      { id: 'home', icon: Home, label: t('nav.home') },
      { id: 'consultas', icon: Calendar, label: t('nav.consultations') },
      { id: 'notificacoes', icon: Bell, label: t('nav.alerts') },
      { id: 'conversas', icon: MessageCircle, label: t('nav.chat') },
      { id: 'configuracoes', icon: Settings, label: t('nav.settings') },
    ],
    dentist: [
      { id: 'home', icon: Home, label: t('nav.home') },
      { id: 'agenda', icon: Calendar, label: t('nav.agenda') },
      { id: 'notificacoes', icon: Bell, label: t('nav.alerts') },
      { id: 'conversas', icon: MessageCircle, label: t('nav.chat') },
      { id: 'configuracoes', icon: Settings, label: t('nav.settings') },
    ],
    clinic: [
      { id: 'home', icon: Home, label: t('nav.home') },
      { id: 'agenda', icon: Calendar, label: t('nav.agenda') },
      { id: 'notificacoes', icon: Bell, label: t('nav.alerts') },
      { id: 'conversas', icon: MessageCircle, label: t('nav.chat') },
      { id: 'configuracoes', icon: Settings, label: t('nav.settings') },
    ],
  };

  const items = navigationItems[userRole];

  const handleTabChange = (tab: string) => {
    if (tab === 'conversas' && badges.conversas > 0) clearBadge('conversas');
    onTabChange(tab);
  };

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-[hsl(214_50%_10%)] border-t border-border z-[70]" 
      style={{ 
        boxShadow: '0 -4px 20px hsl(214 50% 5% / 0.3)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)'
      }}
    >
      <div className="flex items-center justify-around h-[68px] pt-3 overflow-visible">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const showBadge = item.id === 'conversas' && badges.conversas > 0;

          return (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={cn(
                'flex flex-col items-center justify-start gap-1 pt-2 px-3 min-w-[44px] min-h-[44px] transition-all duration-200 relative overflow-visible',
                isActive ? 'text-[#2196F3]' : 'text-[#94A3B8]'
              )}
            >
              <div className="relative overflow-visible">
                <Icon className={cn('w-5 h-5 transition-transform', isActive && 'scale-110')} />
                {showBadge && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[11px] font-bold text-white bg-blue-500 border-2 border-[hsl(214_50%_10%)] z-10">
                    {badges.conversas}
                  </span>
                )}
              </div>
              <span className="text-[11px] font-medium leading-none">{item.label}</span>
              {isActive && (
                <span className="absolute top-0 w-8 h-[3px] bg-[#2196F3] rounded-[2px]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
