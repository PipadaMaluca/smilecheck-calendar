import { Home, Search, Calendar, MessageCircle, User, Users, BarChart3, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { UserRole } from '@/types/calendar';
import smileLogo from '@/assets/smilecheck-logo.png';

interface DesktopNavSidebarProps {
  isExpanded: boolean;
  activeTab: string;
  onTabChange: (tab: string) => void;
  userRole: UserRole;
}

const NAV_ITEMS: Record<UserRole, { id: string; icon: typeof Home; label: string }[]> = {
  patient: [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'search', icon: Search, label: 'Buscar' },
    { id: 'agenda', icon: Calendar, label: 'Agenda' },
    { id: 'chat', icon: MessageCircle, label: 'Chat' },
    { id: 'profile', icon: User, label: 'Perfil' },
  ],
  dentist: [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'agenda', icon: Calendar, label: 'Agenda' },
    { id: 'chat', icon: MessageCircle, label: 'Chat' },
    { id: 'stats', icon: BarChart3, label: 'Stats' },
    { id: 'profile', icon: User, label: 'Perfil' },
  ],
  clinic: [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'agenda', icon: Calendar, label: 'Agenda' },
    { id: 'team', icon: Users, label: 'Equipa' },
    { id: 'stats', icon: BarChart3, label: 'Stats' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ],
};

export function DesktopNavSidebar({
  isExpanded,
  activeTab,
  onTabChange,
  userRole,
}: DesktopNavSidebarProps) {
  const items = NAV_ITEMS[userRole];

  return (
    <aside
      className={cn(
        'h-full bg-card border-r border-border flex flex-col transition-all duration-300 z-30',
        isExpanded ? 'w-[200px]' : 'w-[60px]'
      )}
    >
      {/* Logo */}
      <div className={cn(
        'flex items-center justify-center border-b border-border',
        isExpanded ? 'p-4' : 'p-2'
      )}>
        <img 
          src={smileLogo} 
          alt="SmileCheck" 
          className={cn(
            'transition-all duration-300',
            isExpanded ? 'h-10 w-auto' : 'h-8 w-8 object-contain'
          )}
        />
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 flex flex-col gap-1 p-2">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <Button
              key={item.id}
              variant="ghost"
              onClick={() => onTabChange(item.id)}
              className={cn(
                'justify-start gap-3 h-11 transition-all duration-200',
                isExpanded ? 'px-3' : 'px-0 justify-center',
                isActive 
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {isExpanded && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
            </Button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className={cn(
        'border-t border-border p-2',
        isExpanded ? 'text-center' : ''
      )}>
        {isExpanded && (
          <p className="text-[10px] text-muted-foreground">
            SmileCheck © 2026
          </p>
        )}
      </div>
    </aside>
  );
}