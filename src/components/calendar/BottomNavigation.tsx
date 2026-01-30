import { Home, Search, Calendar, MessageCircle, User, BarChart3, Users, Settings } from 'lucide-react';
import { UserRole } from '@/types/calendar';
import { cn } from '@/lib/utils';
interface BottomNavigationProps {
  userRole: UserRole;
  activeTab: string;
  onTabChange: (tab: string) => void;
}
const navigationItems = {
  patient: [{
    id: 'home',
    icon: Home,
    label: 'Home'
  }, {
    id: 'search',
    icon: Search,
    label: 'Buscar'
  }, {
    id: 'agenda',
    icon: Calendar,
    label: 'Agenda'
  }, {
    id: 'chat',
    icon: MessageCircle,
    label: 'Chat'
  }, {
    id: 'profile',
    icon: User,
    label: 'Perfil'
  }],
  dentist: [{
    id: 'home',
    icon: Home,
    label: 'Home'
  }, {
    id: 'agenda',
    icon: Calendar,
    label: 'Agenda'
  }, {
    id: 'chat',
    icon: MessageCircle,
    label: 'Chat'
  }, {
    id: 'stats',
    icon: BarChart3,
    label: 'Stats'
  }, {
    id: 'profile',
    icon: User,
    label: 'Perfil'
  }],
  clinic: [{
    id: 'home',
    icon: Home,
    label: 'Home'
  }, {
    id: 'agenda',
    icon: Calendar,
    label: 'Agenda'
  }, {
    id: 'team',
    icon: Users,
    label: 'Equipa'
  }, {
    id: 'stats',
    icon: BarChart3,
    label: 'Stats'
  }, {
    id: 'settings',
    icon: Settings,
    label: 'Settings'
  }]
};
export function BottomNavigation({
  userRole,
  activeTab,
  onTabChange
}: BottomNavigationProps) {
  const items = navigationItems[userRole];
  return;
}