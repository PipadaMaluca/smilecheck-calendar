import { Calendar, Users, BarChart3, Search, Heart, UserPlus, type LucideIcon } from 'lucide-react';
import type { TFunction } from 'i18next';
import type { UserRole } from '@/types/calendar';

export interface QuickAction {
  id: string;
  label: string;
  icon: LucideIcon;
}

/**
 * ONE canonical row of four quick actions per role — identical order and labels
 * at every breakpoint. Secondary actions live in their own pages / the sidebar.
 */
export function getQuickActions(role: UserRole, t: TFunction): QuickAction[] {
  if (role === 'patient') {
    return [
      { id: 'marcar-consulta', label: t('dashboard.bookAppointment'), icon: Calendar },
      { id: 'convidar', label: t('nav.invite'), icon: UserPlus },
      { id: 'pesquisa', label: t('nav.search'), icon: Search },
      { id: 'saude', label: t('nav.health'), icon: Heart },
    ];
  }
  return [
    { id: 'agenda', label: t('dashboard.viewTodayAgenda'), icon: Calendar },
    { id: 'convidar', label: t('nav.invite'), icon: UserPlus },
    { id: 'equipa', label: t('nav.team'), icon: Users },
    { id: 'estatisticas', label: t('nav.statistics'), icon: BarChart3 },
  ];
}
