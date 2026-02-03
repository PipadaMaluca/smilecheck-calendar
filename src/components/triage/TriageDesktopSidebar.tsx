import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Calendar, Heart, MessageCircle, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import smileLogo from '@/assets/smilecheck-logo.png';
interface TriageDesktopSidebarProps {
  activeItem: string;
}
const navItems = [{
  id: 'home',
  label: 'Home',
  icon: Home,
  path: '/'
}, {
  id: 'agenda',
  label: 'Consulta',
  icon: Calendar,
  path: '/triagem'
}, {
  id: 'saude',
  label: 'Saúde',
  icon: Heart,
  path: '/saude'
}, {
  id: 'chat',
  label: 'Chat',
  icon: MessageCircle,
  path: '/chat'
}, {
  id: 'conta',
  label: 'Conta',
  icon: Settings,
  path: '/conta'
}];
export function TriageDesktopSidebar({
  activeItem
}: TriageDesktopSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  return <aside className="w-[200px] bg-[#0D2137] border-r border-[#1E3A5F] flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 border-b border-[#1E3A5F]">
        <img alt="SmileCheck" className="h-8 object-contain" src="/lovable-uploads/43f646ce-8022-4a31-be0b-2471feb15914.png" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(item => {
        const Icon = item.icon;
        const isActive = activeItem === item.id || location.pathname === item.path;
        return <button key={item.id} onClick={() => navigate(item.path)} className={cn('w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left', isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-[#1E3A5F] hover:text-foreground')}>
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">{item.label}</span>
            </button>;
      })}
      </nav>

      {/* Footer */}
      <div className="border-t border-[#1E3A5F] p-3 text-center">
        <p className="text-[10px] text-muted-foreground">SmileCheck © 2026</p>
      </div>
    </aside>;
}