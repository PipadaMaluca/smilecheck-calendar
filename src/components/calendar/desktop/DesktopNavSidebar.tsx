import { Home, Calendar, Users, MessageCircle, Trophy, Award, CreditCard, Gift, Settings, Heart, FilePlus, FileText, BarChart3, Search, TrendingUp, Receipt, Gift as GiftIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import smileIcon from '@/assets/smilecheck-icon.png';
import { UserRole } from '@/types/calendar';
import { Separator } from '@/components/ui/separator';
import { LanguageSwitcher } from '@/components/landing/LanguageSwitcher';

interface DesktopNavSidebarProps {
  isExpanded: boolean;
  activeTab: string;
  onTabChange: (tab: string) => void;
  userRole: UserRole;
  onPrescribe?: () => void;
}

export function DesktopNavSidebar({
  isExpanded,
  activeTab,
  onTabChange,
  userRole,
  onPrescribe
}: DesktopNavSidebarProps) {
  const { t } = useTranslation();

  const MAIN_NAV_ITEMS_BY_ROLE = {
    patient: [
      { id: 'home', icon: Home, label: t('nav.home') },
      { id: 'agenda', icon: Calendar, label: t('nav.consultations') },
      { id: 'saude', icon: Heart, label: t('nav.health') },
      { id: 'conversas', icon: MessageCircle, label: t('nav.conversations') },
    ],
    dentist: [
      { id: 'home', icon: Home, label: t('nav.home') },
      { id: 'agenda', icon: Calendar, label: t('nav.agenda') },
      { id: 'team', icon: Users, label: t('nav.team') },
      { id: 'conversas', icon: MessageCircle, label: t('nav.conversations') },
    ],
    clinic: [
      { id: 'home', icon: Home, label: t('nav.home') },
      { id: 'agenda', icon: Calendar, label: t('nav.agenda') },
      { id: 'team', icon: Users, label: t('nav.team') },
      { id: 'conversas', icon: MessageCircle, label: t('nav.conversations') },
    ],
  };

  const TWO_LINE_LABELS: Record<string, [string, string]> = {
    'loja': [t('nav.rewardsStoreLine1'), t('nav.rewardsStoreLine2')],
    'referencia': [t('nav.referralLetterLine1'), t('nav.referralLetterLine2')],
    'prescrever': [t('nav.prescribeLine1'), t('nav.prescribeLine2')],
  };

  const SECONDARY_NAV_BY_ROLE = {
    patient: [
      { id: 'conquistas', icon: Award, label: t('nav.achievements') },
      { id: 'faturacao', icon: Receipt, label: t('nav.billing') },
      { id: 'plano', icon: CreditCard, label: t('nav.managePlan') },
      { id: 'loja', icon: Gift, label: t('nav.rewardsStore') },
      { id: 'pesquisa', icon: Search, label: t('nav.search') },
      { id: 'pontuacoes', icon: TrendingUp, label: t('nav.scores') },
    ],
    dentist: [
      { id: 'referencia', icon: FileText, label: t('nav.referralLetter') },
      { id: 'conquistas', icon: Award, label: t('nav.achievements') },
      { id: 'estatisticas', icon: BarChart3, label: t('nav.statistics') },
      { id: 'faturacao', icon: Receipt, label: t('nav.billing') },
      { id: 'plano', icon: CreditCard, label: t('nav.managePlan') },
      { id: 'loja', icon: Gift, label: t('nav.rewardsStore') },
      { id: 'pesquisa', icon: Search, label: t('nav.search') },
      { id: 'pontuacoes', icon: TrendingUp, label: t('nav.scores') },
    ],
    clinic: [
      { id: 'conquistas', icon: Award, label: t('nav.achievements') },
      { id: 'estatisticas', icon: BarChart3, label: t('nav.statistics') },
      { id: 'faturacao', icon: Receipt, label: t('nav.billing') },
      { id: 'plano', icon: CreditCard, label: t('nav.managePlan') },
      { id: 'loja', icon: Gift, label: t('nav.rewardsStore') },
      { id: 'pesquisa', icon: Search, label: t('nav.search') },
      { id: 'pontuacoes', icon: TrendingUp, label: t('nav.scores') },
    ],
  };

  const mainItems = MAIN_NAV_ITEMS_BY_ROLE[userRole];
  const secondaryItems = SECONDARY_NAV_BY_ROLE[userRole];

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

  const renderNavButton = (item: { id: string; icon: React.ElementType; label: string; }, onClick?: () => void) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;
    const twoLine = TWO_LINE_LABELS[item.id];

    return (
      <Button
        key={item.id}
        id={onboardingIdMap[item.id]}
        variant="ghost"
        onClick={onClick || (() => onTabChange(item.id))}
        className={cn(
          'flex flex-col gap-1 h-auto py-2 w-full transition-all duration-200',
          isActive
            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
            : 'text-muted-foreground hover:text-foreground hover:bg-[#152238]'
        )}
      >
        <Icon className="w-5 h-5 flex-shrink-0" />
        {isExpanded && (
          <span className="text-[10px] font-medium text-center leading-tight">
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
        isExpanded ? 'w-[80px]' : 'w-[60px]'
      )}
    >
      {/* Logo + Pro Badge */}
      <div className="flex flex-col items-center justify-center p-3 border-b border-[#1E3A5F] flex-shrink-0 py-[11px] gap-[6px] border px-px">
        <img
          src={smileIcon}
          alt="SmileCheck"
          className={cn(
            'transition-all duration-300',
            isExpanded ? 'h-14 w-14' : 'h-10 w-10'
          )}
        />
        <span className={cn(
          'font-bold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-center',
          isExpanded ? 'text-[9px] px-2.5 py-0.5' : 'text-[7px] px-1.5 py-0'
        )}>
          Pro
        </span>
      </div>

      {/* Main Navigation */}
      <nav className="p-2 flex-1 items-center justify-start flex flex-col py-[10px] border border-secondary px-[4px] gap-[5px]">
        {mainItems.map((item) => renderNavButton(item))}

        <Separator className="my-1 bg-[#1E3A5F]" />

        {userRole === 'dentist' && renderNavButton(
          { id: 'prescrever', icon: FilePlus, label: t('nav.prescribe') },
          onPrescribe
        )}

        {secondaryItems.map((item) => renderNavButton(item))}
      </nav>

      {/* Bottom: Configurações + Language */}
      <div className="border-t p-2 flex-shrink-0 px-[4px] py-[10px] rounded-none border border-secondary flex flex-col items-center gap-2">
        {renderNavButton({ id: 'configuracoes', icon: Settings, label: t('nav.settings') })}
        {isExpanded && <LanguageSwitcher size="sm" />}
      </div>
    </aside>
  );
}
