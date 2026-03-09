import { X, User, CreditCard, Calendar, Building2, Users, Clock, Gift, HelpCircle, FileText, LogOut, ChevronDown, ChevronUp, Trophy, Award, TrendingUp, FilePlus, BarChart3, Search, Star, Bell, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { UserRole, ViewMode } from '@/types/calendar';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { mockDentists, mockClinics, mockFamilyMembers, getDentistsForClinic } from '@/data/mockData';

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
  const [agendasOpen, setAgendasOpen] = useState(false);
  const [familyOpen, setFamilyOpen] = useState(false);
  const [expandedClinics, setExpandedClinics] = useState<string[]>(['1']);

  const userName = userRole === 'patient' ?
  mockFamilyMembers[0].name :
  userRole === 'dentist' ?
  mockDentists[0].name :
  mockClinics[0].name;

  const userSubtitle = userRole === 'patient' ?
  'Paciente' :
  userRole === 'dentist' ?
  'Dentista' :
  'Clínica';

  const toggleClinicExpanded = (clinicId: string) => {
    setExpandedClinics((prev) =>
    prev.includes(clinicId) ?
    prev.filter((id) => id !== clinicId) :
    [...prev, clinicId]
    );
  };

  const MenuSection = ({ children, className }: {children: React.ReactNode;className?: string;}) =>
  <div className={cn("py-2 border-b border-border pb-0 pt-0", className)}>
      {children}
    </div>;


  const MenuItem = ({
    icon: Icon,
    label,
    onClick,
    active = false





  }: {icon: React.ElementType;label: string;onClick?: () => void;active?: boolean;}) =>
  <button
    onClick={onClick}
    className={cn("w-full px-4 py-2.5 text-sm hover:bg-muted/50 transition-colors flex items-center justify-start pl-[15px] pt-[10px] pb-[10px] pr-0 gap-[15px]",

    active && 'text-primary bg-primary/10'
    )}>

      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </button>;


  const CustomCheckbox = ({ checked, onChange, className }: {checked: boolean;onChange: () => void;className?: string;}) =>
  <button
    onClick={(e) => {e.stopPropagation();onChange();}}
    className={cn(
      'w-6 h-6 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0',
      checked ?
      'bg-primary border-primary text-primary-foreground' :
      'border-muted-foreground/50 hover:border-primary',
      className
    )}>

      {checked &&
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <polyline points="20 6 9 17 4 12" />
        </svg>
    }
    </button>;


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

        {/* User Profile - clicks open profile */}
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

        {/* Notifications */}
        <MenuItem icon={Bell} label="Notificações" onClick={() => {onClose();onNavigate?.('notificacoes');}} />

        {/* ========== PATIENT MENU ========== */}
        {userRole === 'patient' &&
        <>
            <MenuSection>
              {/* Same order as desktop sidebar, excluding bottom nav items */}
              <MenuItem icon={Heart} label="Saúde" onClick={() => {onClose();onNavigate?.('saude');}} />
              <MenuItem icon={Award} label="Conquistas" onClick={() => {onClose();onNavigate?.('conquistas');}} />
              <MenuItem icon={CreditCard} label="Gerir Plano" onClick={() => {onClose();onNavigate?.('plano');}} />
              <MenuItem icon={Gift} label="Loja de Recompensas" onClick={() => {onClose();onNavigate?.('loja');}} />
              <MenuItem icon={Search} label="Pesquisa" onClick={() => {onClose();onNavigate?.('pesquisa');}} />
              <MenuItem icon={TrendingUp} label="Pontuações" onClick={() => {onClose();onNavigate?.('pontuacoes');}} />
            </MenuSection>

            <MenuSection className="border-b-0">
              <MenuItem icon={LogOut} label="Terminar Sessão" />
            </MenuSection>
          </>
        }

        {/* ========== DENTIST MENU ========== */}
        {userRole === 'dentist' &&
        <>
            <MenuSection>

              {/* Same order as desktop sidebar, excluding bottom nav items */}
              <MenuItem icon={FilePlus} label="Prescrever Receita" onClick={() => {onClose();onPrescribe?.();}} />
              <MenuItem icon={FileText} label="Carta de Referência" onClick={() => {onClose();onNavigate?.('referencia');}} />
              <MenuItem icon={Award} label="Conquistas" onClick={() => {onClose();onNavigate?.('conquistas');}} />
              <MenuItem icon={BarChart3} label="Estatísticas" onClick={() => {onClose();onNavigate?.('estatisticas');}} />
              <MenuItem icon={CreditCard} label="Gerir Plano" onClick={() => {onClose();onNavigate?.('plano');}} />
              <MenuItem icon={Gift} label="Loja de Recompensas" onClick={() => {onClose();onNavigate?.('loja');}} />
              <MenuItem icon={Search} label="Pesquisa" onClick={() => {onClose();onNavigate?.('pesquisa');}} />
              <MenuItem icon={TrendingUp} label="Pontuações" onClick={() => {onClose();onNavigate?.('pontuacoes');}} />
            </MenuSection>

            <MenuSection className="border-b-0">
              <MenuItem icon={LogOut} label="Terminar Sessão" />
            </MenuSection>
          </>
        }

        {/* ========== CLINIC MENU ========== */}
        {userRole === 'clinic' &&
        <>
            <MenuSection>
              

              {/* Same order as desktop sidebar, excluding bottom nav items */}
              <MenuItem icon={Award} label="Conquistas" onClick={() => {onClose();onNavigate?.('conquistas');}} />
              <MenuItem icon={BarChart3} label="Estatísticas" onClick={() => {onClose();onNavigate?.('estatisticas');}} />
              <MenuItem icon={CreditCard} label="Gerir Plano" onClick={() => {onClose();onNavigate?.('plano');}} />
              <MenuItem icon={Gift} label="Loja de Recompensas" onClick={() => {onClose();onNavigate?.('loja');}} />
              <MenuItem icon={Search} label="Pesquisa" onClick={() => {onClose();onNavigate?.('pesquisa');}} />
              <MenuItem icon={TrendingUp} label="Pontuações" onClick={() => {onClose();onNavigate?.('pontuacoes');}} />
            </MenuSection>

            <MenuSection className="border-b-0">
              <MenuItem icon={LogOut} label="Terminar Sessão" />
            </MenuSection>
          </>
        }
      </SheetContent>
    </Sheet>);

}