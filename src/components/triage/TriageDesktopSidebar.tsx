import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, Calendar, Heart, MessageCircle, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TriageDesktopSidebarProps {
  activeItem: string;
}

export function TriageDesktopSidebar({ activeItem }: TriageDesktopSidebarProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { id: 'home', label: t('nav.home'), icon: Home, path: '/' },
    { id: 'agenda', label: t('nav.consultations'), icon: Calendar, path: '/triagem' },
    { id: 'saude', label: t('nav.health'), icon: Heart, path: '/saude' },
    { id: 'chat', label: t('nav.conversations'), icon: MessageCircle, path: '/chat' },
    { id: 'conta', label: t('settings.title'), icon: Settings, path: '/conta' },
  ];

  return (
    <aside className="w-[200px] bg-sidebar border-r border-sidebar-border flex flex-col h-full">
      <div className="p-4 border-b border-sidebar-border">
        <img alt="SmileCheck" className="h-8 object-contain" src="/lovable-uploads/43f646ce-8022-4a31-be0b-2471feb15914.png" />
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeItem === item.id || location.pathname === item.path;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left',
                isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground'
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="border-t border-sidebar-border p-3 text-center">
        <p className="text-[10px] text-muted-foreground">SmileCheck © 2026</p>
      </div>
    </aside>
  );
}
