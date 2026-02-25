import { Home, Calendar, Users, MessageCircle, Trophy, Award, CreditCard, Gift, Settings, Heart, FilePlus, Star, FileText, BarChart3, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import smileIcon from '@/assets/smilecheck-icon.png';
import { UserRole } from '@/types/calendar';
import { Separator } from '@/components/ui/separator';

interface DesktopNavSidebarProps {
  isExpanded: boolean;
  activeTab: string;
  onTabChange: (tab: string) => void;
  userRole: UserRole;
  onPrescribe?: () => void;
}

const MAIN_NAV_ITEMS_BY_ROLE = {
  patient: [
  { id: 'home', icon: Home, label: 'Início' },
  { id: 'agenda', icon: Calendar, label: 'Consultas' },
  { id: 'saude', icon: Heart, label: 'Saúde' },
  { id: 'conversas', icon: MessageCircle, label: 'Conversas' }],

  dentist: [
  { id: 'home', icon: Home, label: 'Início' },
  { id: 'agenda', icon: Calendar, label: 'Agenda' },
  { id: 'team', icon: Users, label: 'Equipa' },
  { id: 'conversas', icon: MessageCircle, label: 'Conversas' }],

  clinic: [
  { id: 'home', icon: Home, label: 'Início' },
  { id: 'agenda', icon: Calendar, label: 'Agenda' },
  { id: 'team', icon: Users, label: 'Equipa' },
  { id: 'conversas', icon: MessageCircle, label: 'Conversas' }]

};

// Two-line labels for specific items
const TWO_LINE_LABELS: Record<string, [string, string]> = {
  'loja': ['Loja de', 'Recompensas'],
  'referencia': ['Carta de', 'Referência'],
  'prescrever': ['Prescrever', 'Receita'],
  'exportar': ['Exportar', 'Relatórios']
};

// Alphabetical secondary items per role
const SECONDARY_NAV_BY_ROLE = {
  patient: [
  { id: 'conquistas', icon: Award, label: 'Conquistas' },
  { id: 'plano', icon: CreditCard, label: 'Gerir Plano' },
  { id: 'loja', icon: Gift, label: 'Loja de Recompensas' }],

  dentist: [
  { id: 'referencia', icon: FileText, label: 'Carta de Referência' },
  { id: 'classificacoes', icon: Trophy, label: 'Classificações' },
  { id: 'conquistas', icon: Award, label: 'Conquistas' },
  { id: 'exportar', icon: Download, label: 'Exportar Relatórios' },
  { id: 'favoritos', icon: Star, label: 'Favoritos' },
  { id: 'plano', icon: CreditCard, label: 'Gerir Plano' },
  { id: 'loja', icon: Gift, label: 'Loja de Recompensas' }],

  clinic: [
  { id: 'classificacoes', icon: Trophy, label: 'Classificações' },
  { id: 'conquistas', icon: Award, label: 'Conquistas' },
  { id: 'estatisticas', icon: BarChart3, label: 'Estatísticas' },
  { id: 'favoritos', icon: Star, label: 'Favoritos' },
  { id: 'plano', icon: CreditCard, label: 'Gerir Plano' },
  { id: 'loja', icon: Gift, label: 'Loja de Recompensas' }]

};

export function DesktopNavSidebar({
  isExpanded,
  activeTab,
  onTabChange,
  userRole,
  onPrescribe
}: DesktopNavSidebarProps) {
  const mainItems = MAIN_NAV_ITEMS_BY_ROLE[userRole];
  const secondaryItems = SECONDARY_NAV_BY_ROLE[userRole];

  const renderNavButton = (item: {id: string;icon: React.ElementType;label: string;}, onClick?: () => void) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;
    const twoLine = TWO_LINE_LABELS[item.id];

    return (
      <Button
        key={item.id}
        variant="ghost"
        onClick={onClick || (() => onTabChange(item.id))}
        className={cn(
          'flex flex-col gap-1 h-auto py-2 w-full transition-all duration-200',
          isActive ?
          'bg-primary text-primary-foreground hover:bg-primary/90' :
          'text-muted-foreground hover:text-foreground hover:bg-[#152238]'
        )}>

        <Icon className="w-5 h-5 flex-shrink-0" />
        {isExpanded &&
        <span className="text-[10px] font-medium text-center leading-tight">
            {twoLine ? <>{twoLine[0]}<br />{twoLine[1]}</> : item.label}
          </span>
        }
      </Button>);

  };

  return (
    <aside
      className={cn(
        'h-full bg-[#0A1929] flex flex-col transition-all duration-300 z-40 flex-shrink-0',
        isExpanded ? 'w-[80px]' : 'w-[60px]'
      )}>

      {/* Logo + Pro Badge */}
      <div className="flex flex-col items-center justify-center p-3 border-b border-[#1E3A5F] flex-shrink-0 px-[15px] border gap-[5px] py-[11px]">
        <img
          src={smileIcon}
          alt="SmileCheck"
          className={cn(
            'transition-all duration-300',
            isExpanded ? 'h-14 w-14' : 'h-10 w-10'
          )} />

        <span className={cn(
          'font-bold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-center',
          isExpanded ? 'text-[9px] px-2.5 py-0.5' : 'text-[7px] px-1.5 py-0'
        )}>Pro

        </span>
      </div>

      {/* Main Navigation */}
      <nav className="gap-1 p-2 flex-1 items-center justify-start flex flex-col py-[10px] px-[4px] border">
        {mainItems.map((item) => renderNavButton(item))}

        <Separator className="my-1 bg-[#1E3A5F]" />

        {/* Dentist: Prescrever Receita after separator */}
        {userRole === 'dentist' && renderNavButton(
          { id: 'prescrever', icon: FilePlus, label: 'Prescrever Receita' },
          onPrescribe
        )}

        {/* Secondary items (alphabetical) */}
        {secondaryItems.map((item) => renderNavButton(item))}
      </nav>

      {/* Bottom: Configurações */}
      <div className="border-t border-[#1E3A5F] p-2 flex-shrink-0 px-[4px] py-[10px] rounded-none border">
        {renderNavButton({ id: 'configuracoes', icon: Settings, label: 'Configurações' })}
      </div>
    </aside>);

}