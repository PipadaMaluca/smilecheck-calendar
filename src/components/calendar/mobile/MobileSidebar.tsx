import { X, User, Gift, Award, TrendingUp, BarChart3, Search, Heart, Receipt, Gift as GiftInvite } from 'lucide-react';
import { DemoControlsPanel } from '@/components/demo/DemoControlsPanel';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { UserRole, ViewMode } from '@/types/calendar';
import { cn } from '@/lib/utils';
import { mockDentists, mockClinics, mockFamilyMembers } from '@/data/mockData';
import { useTranslation } from 'react-i18next';
import { useNotificationBadges } from '@/contexts/NotificationBadgeContext';

const BADGE_CONFIG: Record<string, { color: string; type: 'count' | 'alert'; key: string }> = {
  conquistas: { color: 'bg-orange-500', type: 'alert', key: 'conquistas' },
  pontuacoes: { color: 'bg-green-500', type: 'alert', key: 'pontuacoes' },
  convidar: { color: 'bg-green-500', type: 'count', key: 'convidar' },
  faturacao: { color: 'bg-red-500', type: 'alert', key: 'faturacao' },
};

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: UserRole;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  selectedMembers?: string[];
  onMemberToggle?: (memberId: string, isCheckbox: boolean) => void;
  selectedDentists?: string[];
  onDentistToggle?: (dentistId: string | null, isCheckbox: boolean, clinicId?: string) => void;
  selectedClinics?: string[];
  onClinicToggle?: (clinicId: string, isCheckbox: boolean) => void;
  onPrescribe?: () => void;
  onProfileClick?: () => void;
  onNavigate?: (tab: string) => void;
  activeTab?: string;
}

export function MobileSidebar({
  isOpen,
  onClose,
  userRole,
  viewMode,
  onViewModeChange,
  selectedMembers = ['all'],
  onMemberToggle,
  selectedDentists = ['all'],
  onDentistToggle,
  selectedClinics = ['1'],
  onClinicToggle,
  onPrescribe,
  onProfileClick,
  onNavigate,
  activeTab
}: MobileSidebarProps) {

  const { t } = useTranslation();
  const { badges, clearBadge } = useNotificationBadges();

  const userName = userRole === 'patient' ?
  mockFamilyMembers[0].name :
  userRole === 'dentist' ?
  mockDentists[0].name :
  mockClinics[0].name;

  const userSubtitle = userRole === 'patient' ?
  t('roles.patient') :
  userRole === 'dentist' ?
  t('roles.dentist') :
  t('roles.clinic');

  const MenuSection = ({ children, className }: {children: React.ReactNode;className?: string;}) =>
  <div className={cn("py-2 border-b border-border pb-0 pt-0", className)}>
      {children}
    </div>;

  const getBadgeInfo = (itemId: string) => {
    const config = BADGE_CONFIG[itemId];
    if (!config) return null;
    const value = badges[config.key as keyof typeof badges];
    if (!value) return null;
    return { ...config, value };
  };

  const handleNavigate = (tab: string) => {
    const config = BADGE_CONFIG[tab];
    if (config) clearBadge(config.key as keyof typeof badges);
    onClose();
    onNavigate?.(tab);
  };

  const MenuItem = ({
    icon: Icon,
    label,
    onClick,
    active = false,
    itemId
  }: {icon: React.ElementType;label: string;onClick?: () => void;active?: boolean;itemId?: string;}) => {
    const badge = itemId ? getBadgeInfo(itemId) : null;
    return (
      <button
        onClick={onClick}
        className={cn("w-full px-4 py-2.5 text-sm hover:bg-muted/50 transition-colors flex items-center justify-start pl-[15px] pt-[10px] pb-[10px] pr-4 gap-[15px]",
        active && 'text-primary bg-primary/10'
        )}>
        <div className="relative">
          <Icon className="w-4 h-4" />
        </div>
        <span className="flex-1 text-left">{label}</span>
        {badge && (
          <span className="min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center text-[11px] font-semibold tabular-nums bg-primary text-primary-foreground">
            {badge.type === 'count' ? badge.value : '!'}
          </span>
        )}
      </button>
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-[300px] p-0 bg-card overflow-y-auto">
        <SheetHeader className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </SheetHeader>

        {/* User Profile */}
        <button
          className="p-4 border-b border-border w-full text-left hover:bg-muted/50 transition-colors"
          onClick={() => {onClose();onProfileClick?.();}}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm">{userName}</p>
              <p className="text-xs text-muted-foreground">{userSubtitle}</p>
            </div>
          </div>
        </button>

        {/* ========== PATIENT MENU ========== */}
        {userRole === 'patient' &&
        <MenuSection>
            <MenuItem icon={Heart} label={t('nav.health')} onClick={() => handleNavigate('saude')} />
            <MenuItem icon={Award} label={t('nav.achievements')} itemId="conquistas" onClick={() => handleNavigate('conquistas')} />
            <MenuItem icon={TrendingUp} label={t('nav.scores')} itemId="pontuacoes" onClick={() => handleNavigate('pontuacoes')} />
            <MenuItem icon={Gift} label={t('nav.rewardsStore')} onClick={() => handleNavigate('loja')} />
            <MenuItem icon={Receipt} label={t('nav.billing')} itemId="faturacao" onClick={() => handleNavigate('faturacao')} />
            <MenuItem icon={Search} label={t('nav.search')} onClick={() => handleNavigate('pesquisa')} />
            <MenuItem icon={GiftInvite} label={t('nav.invite')} itemId="convidar" onClick={() => handleNavigate('convidar')} />
          </MenuSection>
        }

        {/* ========== DENTIST MENU ========== */}
        {userRole === 'dentist' &&
        <MenuSection>
            <MenuItem icon={BarChart3} label={t('nav.statistics')} onClick={() => handleNavigate('estatisticas')} />
            <MenuItem icon={Award} label={t('nav.achievements')} itemId="conquistas" onClick={() => handleNavigate('conquistas')} />
            <MenuItem icon={TrendingUp} label={t('nav.scores')} itemId="pontuacoes" onClick={() => handleNavigate('pontuacoes')} />
            <MenuItem icon={Gift} label={t('nav.rewardsStore')} onClick={() => handleNavigate('loja')} />
            <MenuItem icon={Receipt} label={t('nav.billing')} itemId="faturacao" onClick={() => handleNavigate('faturacao')} />
            <MenuItem icon={Search} label={t('nav.search')} onClick={() => handleNavigate('pesquisa')} />
            <MenuItem icon={GiftInvite} label={t('nav.invite')} itemId="convidar" onClick={() => handleNavigate('convidar')} />
          </MenuSection>
        }

        {/* ========== CLINIC MENU ========== */}
        {userRole === 'clinic' &&
        <MenuSection>
            <MenuItem icon={BarChart3} label={t('nav.statistics')} onClick={() => handleNavigate('estatisticas')} />
            <MenuItem icon={Award} label={t('nav.achievements')} itemId="conquistas" onClick={() => handleNavigate('conquistas')} />
            <MenuItem icon={TrendingUp} label={t('nav.scores')} itemId="pontuacoes" onClick={() => handleNavigate('pontuacoes')} />
            <MenuItem icon={Gift} label={t('nav.rewardsStore')} onClick={() => handleNavigate('loja')} />
            <MenuItem icon={Receipt} label={t('nav.billing')} itemId="faturacao" onClick={() => handleNavigate('faturacao')} />
            <MenuItem icon={Search} label={t('nav.search')} onClick={() => handleNavigate('pesquisa')} />
            <MenuItem icon={GiftInvite} label={t('nav.invite')} itemId="convidar" onClick={() => handleNavigate('convidar')} />
          </MenuSection>
        }

        {/* Demo controls panel */}
        <div className="px-3 py-3 border-t border-border mt-auto">
          <DemoControlsPanel />
        </div>
      </SheetContent>
    </Sheet>);
}
