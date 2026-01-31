import { Home, Calendar, Users, BarChart3, Search, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import smileIcon from '@/assets/smilecheck-icon.png';
import { UserRole } from '@/types/calendar';

interface DesktopNavSidebarProps {
  isExpanded: boolean;
  activeTab: string;
  onTabChange: (tab: string) => void;
  userRole: UserRole;
}

const NAV_ITEMS_BY_ROLE = {
  patient: [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'agenda', icon: Calendar, label: 'Agenda' },
    { id: 'search', icon: Search, label: 'Buscar' },
    { id: 'chat', icon: MessageCircle, label: 'Chat' },
  ],
  dentist: [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'agenda', icon: Calendar, label: 'Agenda' },
    { id: 'search', icon: Search, label: 'Buscar' },
    { id: 'chat', icon: MessageCircle, label: 'Chat' },
    { id: 'team', icon: Users, label: 'Equipa' },
    { id: 'stats', icon: BarChart3, label: 'Stats' },
  ],
  clinic: [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'agenda', icon: Calendar, label: 'Agenda' },
    { id: 'search', icon: Search, label: 'Buscar' },
    { id: 'team', icon: Users, label: 'Equipa' },
    { id: 'chat', icon: MessageCircle, label: 'Chat' },
    { id: 'stats', icon: BarChart3, label: 'Stats' },
  ],
};

export function DesktopNavSidebar({
  isExpanded,
  activeTab,
  onTabChange,
  userRole,
}: DesktopNavSidebarProps) {
  const navItems = NAV_ITEMS_BY_ROLE[userRole];

  return (
    <aside
      className={cn(
        'h-full bg-[#0A1929] flex flex-col transition-all duration-300 z-40 flex-shrink-0',
        isExpanded ? 'w-[80px]' : 'w-[60px]'
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-center p-3 border-b border-[#1E3A5F] flex-shrink-0">
        <img
          src={smileIcon}
          alt="SmileCheck"
          className={cn(
            'transition-all duration-300',
            isExpanded ? 'h-14 w-14' : 'h-10 w-10'
          )}
        />
      </div>

      {/* Navigation Items */}
      <nav className="flex flex-col items-center gap-1 p-2 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <Button
              key={item.id}
              variant="ghost"
              onClick={() => onTabChange(item.id)}
              className={cn(
                'flex flex-col gap-1 h-auto py-2 w-full transition-all duration-200',
                isActive
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'text-muted-foreground hover:text-foreground hover:bg-[#152238]'
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {isExpanded && (
                <span className="text-[10px] font-medium">{item.label}</span>
              )}
            </Button>
          );
        })}
      </nav>

      {/* Footer */}
      {isExpanded && (
        <div className="border-t border-[#1E3A5F] p-2 text-center flex-shrink-0">
          <p className="text-[8px] text-muted-foreground">© 2026</p>
        </div>
      )}
    </aside>
  );
}
