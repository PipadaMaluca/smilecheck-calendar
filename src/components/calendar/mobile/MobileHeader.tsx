import { useTranslation } from 'react-i18next';
import { Menu, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ViewMode, UserRole } from '@/types/calendar';
import { cn } from '@/lib/utils';
import { DemoModeBadge } from '@/components/demo/DemoModeBadge';
import { Logo } from '@/components/branding/Logo';

/** Screen titles for the mobile header, keyed by nav tab id. */
const TAB_TITLE_KEYS: Record<string, string> = {
  agenda: 'nav.agenda', consultas: 'nav.consultations', team: 'nav.team', estatisticas: 'nav.statistics',
  conquistas: 'nav.achievements', pontuacoes: 'nav.scores', loja: 'nav.rewardsStore', faturacao: 'nav.billing',
  pesquisa: 'nav.search', conversas: 'nav.conversations', convidar: 'nav.invite', definicoes: 'nav.settings',
  settings: 'nav.settings', historico: 'nav.fullHistory', saude: 'nav.health', notificacoes: 'nav.notifications',
};

interface MobileHeaderProps {
  onMenuClick: () => void;
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
  userRole?: UserRole;
  showNewConsultation?: boolean;
  onNewConsultation?: () => void;
  /** Current nav tab — shows its title (or the logo on Home) when nothing else fills the header. */
  activeTab?: string;
}

export function MobileHeader({
  onMenuClick,
  viewMode = 'day',
  onViewModeChange,
  userRole = 'dentist',
  showNewConsultation,
  onNewConsultation,
  activeTab
}: MobileHeaderProps) {
  const { t } = useTranslation();
  const modes: {
    id: ViewMode;
    label: string;
  }[] = userRole === 'patient' ? [{
    id: 'day',
    label: t('agenda.day')
  }, {
    id: 'list',
    label: t('agenda.list')
  }] : [{
    id: 'day',
    label: t('agenda.day')
  }, {
    id: 'three-day',
    label: t('agenda.threeDays')
  }, {
    id: 'list',
    label: t('agenda.list')
  }];

  return <div className="sticky top-0 z-40 pt-[env(safe-area-inset-top)] bg-background/95 backdrop-blur-sm border-b border-border w-full border-slate-700 border-0 py-1">
      <div className="relative w-full max-w-full px-5 pl-0 pr-0 gap-0 flex-row flex items-center justify-center my-0.5 mx-1.5 py-2.5">
        {/* Menu button - absolute left */}
        <Button aria-label={t('a11y.openMenu')} variant="ghost" size="icon" onClick={onMenuClick} className="absolute left-2 text-muted-foreground hover:text-foreground hover:bg-transparent flex-shrink-0 border-0 shadow-none h-11 w-11 max-[499px]:[&_svg]:size-6">
          <Menu className="w-5 h-5" />
        </Button>
        
        {/* View Mode Selector - centered (not for patient) */}
        {onViewModeChange && <div className="flex items-center justify-center gap-1 w-full">
            {modes.map((mode) => <button key={mode.id} onClick={() => onViewModeChange(mode.id)} className={cn('px-3 py-1.5 text-xs font-medium rounded-md transition-colors', viewMode === mode.id ? 'bg-primary-solid text-primary-foreground hover:bg-primary-solid/90' : 'bg-secondary/30 text-muted-foreground hover:bg-secondary/50')}>
                {mode.label}
              </button>)}
          </div>}

        {/* New Consultation button - centered (patient agenda) */}
        {showNewConsultation && onNewConsultation && !onViewModeChange &&
      <div className="flex items-center justify-center w-full">
            <Button size="sm" onClick={onNewConsultation} className="gap-1.5">
              <Plus className="w-4 h-4" />
              {t('agenda.newAppointment')}
            </Button>
          </div>
      }

        {/* Screen context: logo on Home, otherwise the current screen title */}
        {!onViewModeChange && !(showNewConsultation && onNewConsultation) && (
          <div className="flex items-center justify-center w-full min-h-11 px-16">
            {!activeTab || activeTab === 'home' ? (
              <Logo variant="icon" size={36} />
            ) : (
              <h1 className="text-base font-semibold text-foreground truncate">
                {t(TAB_TITLE_KEYS[activeTab] ?? `nav.${activeTab}`, { defaultValue: '' })}
              </h1>
            )}
          </div>
        )}

        {/* New Consultation button - right side (dentist/clinic agenda with view mode) */}
        {showNewConsultation && onNewConsultation && onViewModeChange &&
          <Button aria-label={t('a11y.add')} variant="ghost" size="icon" onClick={onNewConsultation} className="absolute right-4 text-primary hover:text-primary/80 flex-shrink-0">
            <Plus className="w-5 h-5" />
          </Button>
        }

        {/* Demo indicator: part of the header so it never covers page content */}
        <DemoModeBadge
          inline
          className={cn('absolute', showNewConsultation && onNewConsultation && onViewModeChange ? 'right-16' : 'right-4')}
        />
      </div>
    </div>;
}