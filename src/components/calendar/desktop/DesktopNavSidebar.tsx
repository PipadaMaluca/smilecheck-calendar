import { Home, Calendar, Users, MessageCircle, Trophy, Award, CreditCard, Gift, Settings, Heart, FilePlus, FileText, BarChart3, Search, TrendingUp, Receipt, Gift as GiftIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import smileIcon from '@/assets/smilecheck-icon.png';
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
          'flex flex-col gap-1 h-auto py-2 w-full transition-all duration-200 relative sidebar-slide-bg',
          isActive
            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
            : 'text-muted-foreground hover:text-foreground hover:bg-[#152238]'
        )}
      >
        <div className="relative">
          <Icon className="w-6 h-6 flex-shrink-0" />
          {badge && (
            <span className={cn(
              'absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-[#0A1929]',
              badge.color
            )}>
              {badge.type === 'count' ? badge.value : '!'}
            </span>
          )}
        </div>
        {isExpanded && (
          <span className="text-[12px] font-medium text-center leading-tight">
            {twoLine ? <>{twoLine[0]}<br />{twoLine[1]}</> : item.label}
          </span>
        )}
      </Button>
    );
  };

  return (
    <aside
      className={cn(
        'h-full bg-[#0A1929] flex flex-col transition-all duration-300 z-40 flex-shrink-0',
        isExpanded ? 'w-[80px]' : 'w-[64px]'
      )}
    >
      {/* Logo + Pro Badge */}
      <div className="flex flex-col items-center justify-center p-3 border-b border-[#1E3A5F] flex-shrink-0 py-[11px] gap-[6px] border px-px">
        <img
          src={smileIcon}
          alt="SmileCheck"
          className={cn(
            'transition-all duration-300',
            isExpanded ? 'h-8 w-8' : 'h-7 w-7'
          )}
        />
        <span className={cn(
          'font-bold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-center',
          isExpanded ? 'text-[10px] px-2.5 py-0.5' : 'text-[8px] px-1.5 py-0'
        )}>
          Pro
        </span>
      </div>

      {/* Navigation */}
      <nav className="p-2 flex-1 items-center justify-start flex flex-col py-[12px] border border-secondary px-[6px] gap-[8px] overflow-y-auto">
        {items.map((item) => renderNavButton(item))}
      </nav>

      {/* Bottom: Configurações + Language */}
      <div className="border-t p-2 flex-shrink-0 px-[6px] py-[12px] rounded-none border border-secondary flex flex-col items-center gap-2">
        {isExpanded && <DemoControlsPanel className="w-full" compact />}
        {renderNavButton({ id: 'configuracoes', icon: Settings, label: t('nav.settings') })}
      </div>
    </aside>
  );
}
