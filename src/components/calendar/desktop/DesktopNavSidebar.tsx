import { Home, Calendar, Users, MessageCircle, Trophy, Award, CreditCard, Gift, Settings, Heart, FilePlus, FileText, BarChart3, Search, TrendingUp, Receipt, Gift as GiftIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/branding/Logo';
import { UserRole } from '@/types/calendar';
import { Separator } from '@/components/ui/separator';
import { useNotificationBadges } from '@/contexts/NotificationBadgeContext';
import { DemoControlsPanel } from '@/components/demo/DemoControlsPanel';

interface DesktopNavSidebarProps {
  isExpanded: boolean;
  activeTab: string;
  onTabChange: (tab: string) => void;
  userRole: UserRole;
}

const BADGE_CONFIG: Record<string, { color: string; type: 'count' | 'alert'; key: string }> = {
  conversas: { color: 'bg-blue-500', type: 'count', key: 'conversas' },
  conquistas: { color: 'bg-orange-500', type: 'alert', key: 'conquistas' },
  pontuacoes: { color: 'bg-green-500', type: 'alert', key: 'pontuacoes' },
  convidar: { color: 'bg-green-500', type: 'count', key: 'convidar' },
  faturacao: { color: 'bg-red-500', type: 'alert', key: 'faturacao' },
};

export function DesktopNavSidebar({
  isExpanded,
  activeTab,
  onTabChange,
  userRole
}: DesktopNavSidebarProps) {
  const { t } = useTranslation();
  const { badges, clearBadge } = useNotificationBadges();

  // Patient: 10 items | Dentist: 12 items | Clinic: 12 items
  const NAV_ITEMS_BY_ROLE = {
    patient: [
      { id: 'home', icon: Home, label: t('nav.home') },
      { id: 'agenda', icon: Calendar, label: t('nav.consultations') },
      { id: 'conquistas', icon: Award, label: t('nav.achievements') },
      { id: 'pontuacoes', icon: TrendingUp, label: t('nav.scores') },
      { id: 'loja', icon: Gift, label: t('nav.rewardsStore') },
      { id: 'faturacao', icon: Receipt, label: t('nav.billing') },
      { id: 'pesquisa', icon: Search, label: t('nav.search') },
      { id: 'convidar', icon: GiftIcon, label: t('nav.invite') },
      { id: 'conversas', icon: MessageCircle, label: t('nav.conversations') },
    ],
    dentist: [
      { id: 'home', icon: Home, label: t('nav.home') },
      { id: 'agenda', icon: Calendar, label: t('nav.agenda') },
      { id: 'team', icon: Users, label: t('nav.team') },
      { id: 'estatisticas', icon: BarChart3, label: t('nav.statistics') },
      { id: 'conquistas', icon: Award, label: t('nav.achievements') },
      { id: 'pontuacoes', icon: TrendingUp, label: t('nav.scores') },
      { id: 'loja', icon: Gift, label: t('nav.rewardsStore') },
      { id: 'faturacao', icon: Receipt, label: t('nav.billing') },
      { id: 'pesquisa', icon: Search, label: t('nav.search') },
      { id: 'convidar', icon: GiftIcon, label: t('nav.invite') },
      { id: 'conversas', icon: MessageCircle, label: t('nav.conversations') },
    ],
    clinic: [
      { id: 'home', icon: Home, label: t('nav.home') },
      { id: 'agenda', icon: Calendar, label: t('nav.agenda') },
      { id: 'team', icon: Users, label: t('nav.team') },
      { id: 'estatisticas', icon: BarChart3, label: t('nav.statistics') },
      { id: 'conquistas', icon: Award, label: t('nav.achievements') },
      { id: 'pontuacoes', icon: TrendingUp, label: t('nav.scores') },
      { id: 'loja', icon: Gift, label: t('nav.rewardsStore') },
      { id: 'faturacao', icon: Receipt, label: t('nav.billing') },
      { id: 'pesquisa', icon: Search, label: t('nav.search') },
      { id: 'convidar', icon: GiftIcon, label: t('nav.invite') },
      { id: 'conversas', icon: MessageCircle, label: t('nav.conversations') },
    ],
  };

  const TWO_LINE_LABELS: Record<string, [string, string]> = {
    'loja': [t('nav.rewardsStoreLine1'), t('nav.rewardsStoreLine2')],
    'estatisticas': [t('nav.statistics'), ''],
    'conquistas': [t('nav.achievements'), ''],
    'pontuacoes': [t('nav.scores'), ''],
    'faturacao': [t('nav.billing'), ''],
    'conversas': [t('nav.conversations'), ''],
  };

  const items = NAV_ITEMS_BY_ROLE[userRole];

  const onboardingIdMap: Record<string, string> = {
    'agenda': 'onboarding-nav-agenda',
    'saude': 'onboarding-nav-saude',
    'conquistas': 'onboarding-nav-conquistas',
    'loja': 'onboarding-nav-loja',
    'conversas': 'onboarding-nav-conversas',
    'team': 'onboarding-nav-team',
    'estatisticas': 'onboarding-nav-estatisticas',
    'configuracoes': 'onboarding-nav-configuracoes',
  };

  const getBadgeInfo = (itemId: string) => {
    const config = BADGE_CONFIG[itemId];
    if (!config) return null;
    const value = badges[config.key as keyof typeof badges];
    if (!value) return null;
    return { ...config, value };
  };

  const handleTabChange = (tab: string) => {
    const config = BADGE_CONFIG[tab];
    if (config) clearBadge(config.key as keyof typeof badges);
    onTabChange(tab);
  };

  const renderNavButton = (item: { id: string; icon: React.ElementType; label: string; }) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;
    const twoLine = TWO_LINE_LABELS[item.id];
    const badge = getBadgeInfo(item.id);

    return (
      <Button
        key={item.id}
        id={onboardingIdMap[item.id]}
        variant="ghost"
        onClick={() => handleTabChange(item.id)}
        className={cn(
          'flex flex-col gap-0.5 h-auto py-1.5 px-1 w-full transition-all duration-200 relative rounded-none border-l-[3px]',
          isActive
            ? 'border-l-[#2196F3] text-sidebar-foreground bg-transparent hover:bg-sidebar-accent/40'
            : 'border-l-transparent text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/40'
        )}
      >
        <div className="relative">
          <Icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'text-[#2196F3]')} />
          {badge && (
            <span className={cn(
              'absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-sidebar',
              badge.color
            )}>
              {badge.type === 'count' ? badge.value : '!'}
            </span>
          )}
        </div>
        {isExpanded && (
          <span className={cn(
            'text-[10px] font-medium text-center leading-[1.1] w-full px-0 break-words hyphens-auto',
            isActive && 'text-[#2196F3]'
          )}>
            {twoLine && twoLine[1]
              ? <>{twoLine[0]}<br />{twoLine[1]}</>
              : item.label}
          </span>
        )}
      </Button>
    );
  };

  return (
    <aside
      className={cn(
        'h-full bg-sidebar text-sidebar-foreground flex flex-col transition-all duration-300 z-40 flex-shrink-0 border-r border-sidebar-border',
        isExpanded ? 'w-[100px]' : 'w-[64px]'
      )}
    >
      {/* Logo + Pro Badge */}
      <div className="flex flex-col items-center justify-center border-b border-sidebar-border flex-shrink-0 py-3 gap-1.5 px-0">
        <Logo
          variant="icon"
          size={isExpanded ? 48 : 40}
          className="transition-all duration-300"
        />
        {userRole !== 'patient' && (
          <span className={cn(
            'font-bold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-center',
            isExpanded ? 'text-[10px] px-2.5 py-0.5' : 'text-[8px] px-1.5 py-0'
          )}>
            Pro
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 items-stretch justify-start flex flex-col py-2 px-0 gap-1 overflow-y-auto">
        {items.map((item) => renderNavButton(item))}
      </nav>

      {/* Bottom: Demo controls (Config moved to avatar dropdown) */}
      <div className="border-t border-sidebar-border flex-shrink-0 px-1 pt-3 pb-2 mt-2 flex flex-col items-stretch gap-1">
        {isExpanded && <DemoControlsPanel className="w-full" compact />}
      </div>
    </aside>
  );
}
