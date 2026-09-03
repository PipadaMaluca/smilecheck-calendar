import { useMemo, useRef, useState, type CSSProperties } from 'react';
import { Glyph } from '@/components/ui/glyph';
import { CoachMark } from '@/components/onboarding/CoachMark';
import { useSimulatedLoading } from '@/hooks/use-simulated-loading';
import { DashboardSkeleton } from '@/components/skeletons';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { getQuickActions } from './quickActions';
import { Star, Calendar, Users, Flame, Award, Search, BarChart3, Heart, Check, X, Ban, ChevronDown, UserPlus } from 'lucide-react';
import { ClickableDentistName } from '@/components/search/ClickableDentistName';
import { ClickablePatientName } from '@/components/search/ClickablePatientName';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { UserRole, CATEGORY_COLORS, ConsultationCategory, getCategoryLabel } from '@/types/calendar';
import { ConfirmationStatus } from '@/types/scoring';
import { mockConsultations, mockDentists, mockClinics, mockFamilyMembers, mockPatientConsultations, getDentistsForClinic } from '@/data/mockData';
import { mockConfirmations } from '@/types/scoring';
import { isSameDay, format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { PatientScoreHistory } from './PatientScoreHistory';
import { PendingFeedbackCard } from '@/components/feedback/PendingFeedbackCard';
import { getLevelForXP, getXPProgress, LEVEL_TRANSLATION_KEYS, LEVEL_MULTIPLIERS } from '@/data/pointsData';
import { usePointsData } from '@/data/pointsSource';
import { LevelUpCelebration } from '@/components/level/LevelUpCelebration';
import { LevelIcon, LEVEL_ICON_MAP } from '@/components/level/LevelIcon';
import { SwipeableRow } from '@/components/ui/swipeable-row';
import { useToast } from '@/hooks/use-toast';
import { MobileDashboardHero } from './MobileDashboardHero';
import { useWaitingList } from '@/data/waitingListSource';

interface DashboardViewProps {
  userRole: UserRole;
  onNavigate: (tab: string) => void;
  onStartTriage?: () => void;
  onViewFullHistory?: () => void;
}

function getUserName(role: UserRole): string {
  switch (role) {
    case 'dentist':return `Dr. ${mockDentists[0].name.split(' ')[1]}`;
    case 'clinic':return mockClinics[0].name;
    case 'patient':return mockFamilyMembers[0].name.split(' ')[0];
  }
}

const DEMO_DATE = new Date(2026, 0, 31);

/** Persist collapse state in sessionStorage so it survives navigation but resets per session. */
function useSessionCollapse(key: string, defaultOpen = true) {
  const storageKey = `sc:collapse:${key}`;
  const [open, setOpen] = useState<boolean>(() => {
    if (typeof sessionStorage === 'undefined') return defaultOpen;
    const v = sessionStorage.getItem(storageKey);
    return v === null ? defaultOpen : v === '1';
  });
  const toggle = (next: boolean) => {
    setOpen(next);
    try { sessionStorage.setItem(storageKey, next ? '1' : '0'); } catch { /* ignore */ }
  };
  return [open, toggle] as const;
}

function CollapsibleSection({
  title,
  badge,
  persistKey,
  defaultOpen = true,
  liveBadge,
  children,
  cardId,
}: {
  title: string;
  badge?: React.ReactNode;
  persistKey: string;
  defaultOpen?: boolean;
  liveBadge?: React.ReactNode;
  children: React.ReactNode;
  cardId?: string;
}) {
  const [open, setOpen] = useSessionCollapse(persistKey, defaultOpen);
  return (
    <Card id={cardId} className="bg-card/80 border-border flex flex-col">
      <CardContent className="p-4 flex flex-col flex-1">
        <Collapsible open={open} onOpenChange={setOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full mb-3 group">
            <div className="flex items-center gap-2">
              <ChevronDown
                className={cn(
                  'w-4 h-4 text-muted-foreground transition-transform duration-150',
                  !open && '-rotate-90'
                )}
              />
              <h3 className="t-h3 text-foreground">{title}</h3>
              {liveBadge}
            </div>
            {badge}
          </CollapsibleTrigger>
          <CollapsibleContent>{children}</CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}

// Mock waiting list data - detail values are i18n keys
const MOCK_WAITING_LIST = [
{ id: 'wl-1', patientName: 'Rita Oliveira', detailKey: 'wantsToAnticipate', currentDate: '3 Fev', currentTime: '14:00', priority: 'alta' as const, isUrgent: true, observation: 'Dor intensa no dente 26, prefiro início da manhã' },
{ id: 'wl-2', patientName: 'Bruno Pereira', detailKey: 'availableMonWed', currentDate: '5 Fev', currentTime: '10:00', priority: 'normal' as const, isUrgent: false, observation: 'Disponível segundas e quartas após 15h' },
{ id: 'wl-3', patientName: 'Sofia Lopes', detailKey: 'anyMorning', currentDate: '7 Fev', currentTime: '16:30', priority: 'normal' as const, isUrgent: false, observation: 'Qualquer manhã está bem' }];


export function DashboardView({ userRole, onNavigate, onStartTriage, onViewFullHistory }: DashboardViewProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const isLoading = useSimulatedLoading(1200, `dashboard:${userRole}`);
  const userName = getUserName(userRole);
  // Waiting-list summary: real rows for authenticated users, mock in demo mode.
  const { entries: dbWaitingEntries, isDemo: waitingIsDemo } = useWaitingList();
  const dentistWaitlist = waitingIsDemo
    ? MOCK_WAITING_LIST.map((wl) => ({ id: wl.id, patientName: wl.patientName, observation: wl.observation }))
    : dbWaitingEntries.map((e) => ({
        id: e.id,
        patientName: e.patientName,
        observation: e.observation ?? '—',
      }));

  const [activeSwipeRow, setActiveSwipeRow] = useState<string | null>(null);
  const [consultationStatuses, setConsultationStatuses] = useState<Record<string, string>>({});
  // Level-up celebration only fires when XP genuinely crosses a threshold.
  // Hidden demo trigger: tap the level badge 3× rapidly (within 1s) to preview the modal.
  const [showLevelUp, setShowLevelUp] = useState(false);
  const dismissLevelUp = () => setShowLevelUp(false);
  const levelTapsRef = useRef<number[]>([]);
  const handleLevelBadgeTap = () => {
    const now = Date.now();
    levelTapsRef.current = [...levelTapsRef.current, now].filter(t => now - t < 1000);
    if (levelTapsRef.current.length >= 3) {
      levelTapsRef.current = [];
      setShowLevelUp(true);
    }
  };

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return t('dashboard.greetingMorning');
    if (hour < 19) return t('dashboard.greetingAfternoon');
    return t('dashboard.greetingEvening');
  }, [t]);

  const todayConsultations = useMemo(() =>
  mockConsultations.filter((c) => isSameDay(c.date, DEMO_DATE)),
  []);

  // Dual points data
  const pointsData = usePointsData(userRole);
  const level = getLevelForXP(pointsData.xp);
  const xpProgress = getXPProgress(pointsData.xp);
  const multiplier = LEVEL_MULTIPLIERS[level.key];

  const stats = useMemo(() => {
    if (userRole === 'patient') {
      const nextPatientCon = [...mockPatientConsultations].
      filter((c) => c.date >= DEMO_DATE).
      sort((a, b) => a.date.getTime() - b.date.getTime())[0];
      const nextValue = nextPatientCon ? nextPatientCon.time : t('dashboard.noConsultations');
      const nextSubtitle = nextPatientCon ?
      format(nextPatientCon.date, "d 'de' MMMM", { locale: pt }) :
      t('dashboard.bookConsultation');
      const nextDentistName = nextPatientCon ? (nextPatientCon as any).dentist?.name || mockDentists[0].name : '';
      return [
      { label: t('dashboard.nextConsultation'), value: nextValue, subtitle: nextSubtitle, extraLine: nextDentistName, icon: Calendar, clickTab: 'consulta-detalhe', isHero: true, category: (nextPatientCon as any)?.category as ConsultationCategory | undefined, primaryName: nextDentistName },
      { label: t('dashboard.levelAndXp'), value: t(LEVEL_TRANSLATION_KEYS[level.key] || level.name), icon: Award, clickTab: 'pontuacoes', isLevel: true },
      { label: t('dashboard.availablePoints'), value: `${pointsData.rewardPoints} pts`, icon: Star, clickTab: 'loja', isPoints: true },
      { label: t('dashboard.streak'), value: pointsData.streak, icon: Flame, clickTab: 'pontuacoes-streak', isStreak: true }];
    }
    if (userRole === 'dentist') {
      const dentistCons = todayConsultations.filter((c) => c.dentist.id === mockDentists[0].id).sort((a, b) => a.time.localeCompare(b.time));
      const next = dentistCons[0];
      const nextCatLabel = next?.category ? getCategoryLabel(t, next.category) : next?.type || '';
      return [
      { label: t('dashboard.nextConsultation'), value: next ? next.time : '—', subtitle: next ? next.patient.name : '', extraLine: nextCatLabel, icon: Calendar, clickTab: 'consulta-detalhe', isHero: true, category: next?.category, primaryName: next?.patient.name || '' },
      { label: t('dashboard.levelAndXp'), value: t(LEVEL_TRANSLATION_KEYS[level.key] || level.name), icon: Award, clickTab: 'pontuacoes', isLevel: true },
      { label: t('dashboard.availablePoints'), value: `${pointsData.rewardPoints} pts`, icon: Star, clickTab: 'loja', isPoints: true },
      { label: t('dashboard.streak'), value: pointsData.streak, icon: Flame, clickTab: 'pontuacoes-streak', isStreak: true }];
    }
    if (userRole === 'clinic') {
      return [
      { label: t('dashboard.todayConsultations'), value: '54', subtitle: `40 ${t('dashboard.presential')} · 14 ${t('dashboard.teleconsultations')}`, icon: Calendar, clickTab: 'agenda', isHero: true, category: undefined as ConsultationCategory | undefined, primaryName: '' },
      { label: t('dashboard.levelAndXp'), value: t(LEVEL_TRANSLATION_KEYS[level.key] || level.name), icon: Award, clickTab: 'pontuacoes', isLevel: true },
      { label: t('dashboard.availablePoints'), value: `${pointsData.rewardPoints} pts`, icon: Star, clickTab: 'loja', isPoints: true },
      { label: t('dashboard.streak'), value: pointsData.streak, icon: Flame, clickTab: 'pontuacoes-streak', isStreak: true }];
    }
    return null;
  }, [userRole, todayConsultations, level, pointsData, t]);

  // Shared stats cards renderer
  const renderStatsCards = () => {
    if (!stats) return null;
    const heroStat = stats[0] as any;
    const restStats = stats.slice(1);
    const HeroIcon = heroStat.icon;
    const heroCategory: ConsultationCategory | undefined = heroStat.category;
    const heroBorderHex = heroCategory ? CATEGORY_COLORS[heroCategory].hex : '#2196F3';

    const goHero = () => {
      if (!heroStat.clickTab) return;
      if (heroStat.clickTab === 'agenda') {
        window.dispatchEvent(new CustomEvent('smilecheck:filter-dentist', { detail: 'clinic-1' }));
        onNavigate('agenda');
      } else onNavigate(heroStat.clickTab);
    };

    return (
      <div className="hidden lg:flex flex-col gap-4">
        <div
          id="coachmark-stat-cards"
          className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] gap-4 items-stretch"
        >
          {/* PRIMARY — Próxima Consulta */}
          <Card
            className={cn(
              'proxima-consulta-card relative min-w-0 rounded-2xl overflow-hidden border-border',
              'bg-gradient-to-br from-primary/[0.07] via-card to-card ring-1 ring-primary/15 shadow-sm',
              heroStat.clickTab && 'cursor-pointer card-hover-lift'
            )}
            style={{ '--consultation-type-color': heroBorderHex } as CSSProperties}
            onClick={heroStat.clickTab ? goHero : undefined}
          >
            <CardContent className="p-6 flex flex-col gap-3 min-w-0 min-h-[148px]">
              <div className="flex items-center gap-2 min-w-0">
                <HeroIcon className="w-4 h-4 flex-shrink-0 text-primary" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground truncate">
                  {heroStat.label}
                </span>
              </div>

              {userRole === 'clinic' ? (
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="text-[32px] leading-none font-semibold tabular-nums text-foreground">
                    {heroStat.value}
                  </span>
                  {heroStat.subtitle && (
                    <span className="text-sm text-muted-foreground truncate">{heroStat.subtitle}</span>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-1.5 min-w-0">
                  <span className="text-[26px] leading-tight font-semibold text-foreground truncate">
                    {heroStat.primaryName || heroStat.subtitle || '—'}
                  </span>
                  <div className="flex items-center gap-3 min-w-0 text-sm">
                    <span className="tabular-nums font-medium text-foreground">{heroStat.value}</span>
                    {heroStat.subtitle && heroStat.primaryName && (
                      <span className="text-muted-foreground truncate">{heroStat.subtitle}</span>
                    )}
                    {heroCategory && (
                      <span className="inline-flex items-center gap-1.5 text-muted-foreground min-w-0">
                        <span
                          aria-hidden
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: heroBorderHex }}
                        />
                        <span className="truncate">{getCategoryLabel(t, heroCategory)}</span>
                      </span>
                    )}
                  </div>
                </div>
              )}

              <Button
                size="sm"
                className="mt-auto self-start rounded-full px-4"
                onClick={(e) => { e.stopPropagation(); goHero(); }}
              >
                {userRole === 'clinic' ? t('dashboard.viewFullAgenda') : t('common.details')}
              </Button>
            </CardContent>
          </Card>

          {/* SECONDARY — quiet three-up metric strip */}
          <Card className="min-w-0 rounded-2xl border-border bg-card/60 backdrop-blur shadow-none">
            <CardContent className="p-0 h-full">
              <div className="grid grid-cols-3 h-full divide-x divide-border">
                {restStats.map((stat) => {
                  const Icon = stat.icon;
                  const isXPCard = stat.label === t('dashboard.levelAndXp');
                  const isStreak = 'isStreak' in stat && (stat as any).isStreak;
                  return (
                    <button
                      key={stat.label}
                      type="button"
                      id={stat.label === t('dashboard.availablePoints') ? 'onboarding-pontuacao-card' : undefined}
                      onClick={() => {
                        if (isXPCard) handleLevelBadgeTap();
                        if (stat.clickTab === 'pontuacoes-streak') onNavigate('pontuacoes');
                        else if (stat.clickTab) onNavigate(stat.clickTab);
                      }}
                      className="flex flex-col justify-center gap-2 min-w-0 px-4 py-5 text-left transition-colors hover:bg-primary/[0.04]"
                    >
                      <span className="flex items-center gap-1.5 min-w-0 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                        <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{stat.label}</span>
                      </span>
                      <span className="flex items-center gap-2 min-w-0">
                        {isXPCard && <LevelIcon levelKey={level.key} size={20} />}
                        <span className="text-lg font-semibold tabular-nums text-foreground truncate">
                          {isStreak ? `${stat.value} ${t('points.days')}` : stat.value}
                        </span>
                      </span>
                      {isXPCard ? (
                        <div className="w-full h-1 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary transition-[width] duration-300"
                            style={{ width: `${xpProgress.percent}%` }}
                          />
                        </div>
                      ) : (
                        <span className="text-[11px] text-muted-foreground tabular-nums truncate">
                          {'isPoints' in stat && (stat as any).isPoints
                            ? `${pointsData.xp.toLocaleString()} XP`
                            : '\u00A0'}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  // Status helper — quiet by default; colour is reserved for exception states only.
  const getStatusBadge = (status?: string) => {
    const labels: Record<string, string> = {
      confirmada: t('consultation.confirmed'),
      em_sala_espera: t('consultation.waitingRoom'),
      em_consulta: t('consultation.inProgress'),
      visto: t('consultation.seen'),
      falta_justificada: t('consultation.noShow'),
      falta_nao_justificada: t('consultation.noShow'),
    };
    const isException = status === 'falta_justificada' || status === 'falta_nao_justificada';
    const label = (status && labels[status]) || t('consultation.scheduled');
    if (isException) {
      return (
        <Badge variant="outline" className="text-[11px] flex-shrink-0 bg-destructive/10 text-destructive border-destructive/30">
          {label}
        </Badge>
      );
    }
    return (
      <span className="text-[11px] font-medium text-muted-foreground flex-shrink-0 whitespace-nowrap">
        {label}
      </span>
    );
  };

  // Consultation type — small colour dot + label instead of a saturated pill.
  const typeDot = (category?: ConsultationCategory, size: 'sm' | 'md' = 'md') => {
    if (!category) return null;
    const color = CATEGORY_COLORS[category]?.hex || '#2196F3';
    return (
      <span className={cn('inline-flex items-center gap-1.5 min-w-0 text-muted-foreground', size === 'sm' ? 'text-[11px]' : 'text-xs')}>
        <span aria-hidden className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
        <span className="truncate">{getCategoryLabel(t, category)}</span>
      </span>
    );
  };

  // Confirmation indicator
  const confirmIndicator = (status: ConfirmationStatus, isIrrelevant = false) => {
    if (isIrrelevant) return <span className="w-5 h-5 rounded-md bg-muted flex items-center justify-center text-[11px] text-muted-foreground font-bold">—</span>;
    if (status === 'confirmed') return <Glyph emoji="✓" className="w-5 h-5 w-5 h-5 rounded-md bg-emerald-500/20 flex items-center justify-center text-[11px] text-success font-bold" />;
    if (status === 'declined') return <Glyph emoji="✗" className="w-5 h-5 w-5 h-5 rounded-md bg-red-500/20 flex items-center justify-center text-[11px] text-red-400 font-bold" />;
    return <span className="w-5 h-5 rounded-md bg-orange-500/20 flex items-center justify-center text-[11px] text-orange-400 font-bold">●</span>;
  };

  // ONE canonical row of four quick actions per role (shared with the mobile hero).
  const runQuickAction = (role: UserRole, id: string) => {
    if (id === 'marcar-consulta') {
      if (onStartTriage) return onStartTriage();
      return onNavigate('triagem');
    }
    if (id === 'agenda' && role === 'clinic') {
      window.dispatchEvent(new CustomEvent('smilecheck:filter-dentist', { detail: 'clinic-1' }));
    }
    onNavigate(id);
  };

  const renderQuickActionsRow = (role: UserRole) => (
    <div className="hidden md:grid grid-cols-4 gap-3">
      {getQuickActions(role, t).map((action) => {
        const ActionIcon = action.icon;
        return (
          <button
            key={action.id}
            onClick={() => runQuickAction(role, action.id)}
            className="flex items-center justify-center gap-2 h-12 rounded-2xl bg-card border border-border shadow-sm card-hover-lift hover:border-primary/40 transition-colors"
          >
            <ActionIcon className="w-5 h-5 flex-shrink-0 text-primary" />
            <span className="text-sm font-medium text-foreground truncate">{action.label}</span>
          </button>
        );
      })}
    </div>
  );

  const renderRightColumn = (role: 'dentist' | 'clinic', waitingListNode?: React.ReactNode) => {
    return (
      <div className="space-y-6">
        {waitingListNode}
        <PendingFeedbackCard userRole={role} />
      </div>
    );
  };

  const renderDentistDashboard = () => {
    const dentistCons = todayConsultations.
    filter((c) => c.dentist.id === mockDentists[0].id).
    sort((a, b) => a.time.localeCompare(b.time));

    // Morning consultations (before 13:00)
    const morningCons = dentistCons.filter((c) => c.time < '13:00');

    const dentistConfirmations = mockConfirmations.filter((c) => c.dentistName === mockDentists[0].name);

    return (
      <div className="space-y-6">
        {renderStatsCards()}

        {renderQuickActionsRow('dentist')}

        {/* 2-column: LEFT (3 sub-cards) | RIGHT (quick actions + pending) */}
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6">
          {/* LEFT column: 3 sub-cards */}
          <div className="space-y-6">
          {/* Consultas de Hoje */}
          <Card id="onboarding-consultas-hoje" className="bg-card/80 border-border flex flex-col">
            <CardContent className="border-0 flex flex-col flex-1 py-2.5 px-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="t-h3 text-foreground">{t('dashboard.todayConsultations')}</h3>
                <Badge variant="outline" className="text-[11px]">{dentistCons.length} {t('dashboard.total')}</Badge>
              </div>
              <div className="space-y-0 flex-1 overflow-y-auto md:overflow-y-hidden">
              {morningCons.map((c, index) => {
                  const isLast = index === morningCons.length - 1;
                  return (
                    <SwipeableRow
                      key={c.id}
                      rowId={c.id}
                      activeRowId={activeSwipeRow}
                      onSwipeOpen={setActiveSwipeRow}
                      leftActions={[{
                        label: t('common.confirmLabel'),
                        icon: <Check className="w-5 h-5" />,
                        color: '#4CAF50',
                        onAction: () => {
                          setConsultationStatuses(prev => ({ ...prev, [c.id]: 'confirmada' }));
                          toast({ title: t('common.markedAs', { name: c.patient.name, status: t('consultation.confirmed') }), duration: 2000 });
                        }
                      }]}
                      rightActions={[
                        {
                          label: t('common.noShowLabel'),
                          icon: <X className="w-5 h-5" />,
                          color: '#F44336',
                          onAction: () => {
                            setConsultationStatuses(prev => ({ ...prev, [c.id]: 'falta_nao_justificada' }));
                            toast({ title: t('common.markedAs', { name: c.patient.name, status: t('consultation.noShow') }), duration: 2000 });
                          }
                        },
                        {
                          label: t('common.cancel'),
                          icon: <Ban className="w-5 h-5" />,
                          color: '#FF9800',
                          onAction: () => {
                            setConsultationStatuses(prev => ({ ...prev, [c.id]: 'cancelada' }));
                            toast({ title: t('common.markedAs', { name: c.patient.name, status: t('consultation.cancelled') }), duration: 2000 });
                          }
                        }
                      ]}
                    >
                    <div
                      className={cn(
                        "consultation-row cursor-pointer hover:bg-muted/30 hover:brightness-110 rounded transition-colors py-1.5",
                        !isLast && "border-b border-border",
                        isLast && "consultation-row-last"
                      )}
                      onClick={() => onNavigate(`consulta-detalhe:${c.id}`)}>
                      {/* Desktop/Tablet: 3-column grid */}
                      <div className="hidden sm:grid items-center" style={{ gridTemplateColumns: '30% 40% 30%' }}>
                        <div className="flex items-center gap-2 text-left min-w-0">
                          <span className="text-xs font-bold text-primary flex-shrink-0">{c.time}</span>
                          <span className="text-xs text-foreground truncate min-w-0" onClick={(e) => e.stopPropagation()}>
                            <ClickablePatientName name={c.patient.name} patientId={c.patient.id} className="text-xs text-foreground hover:underline cursor-pointer" />
                          </span>
                        </div>
                        <div className="flex items-center justify-center gap-1.5 min-w-0 overflow-hidden">
                          {typeDot(c.category as ConsultationCategory)}
                          {c.notes && (
                            <span className="text-[11px] text-muted-foreground truncate min-w-0 flex-shrink">
                              {c.notes}
                            </span>
                          )}
                        </div>
                        <div className="flex justify-end">
                          {getStatusBadge(consultationStatuses[c.id] || c.status)}
                        </div>
                      </div>
                      {/* Mobile: 2x3 grid — time | name + pill / observation + status */}
                      <div
                        className="sm:hidden grid items-center px-2 py-1 gap-x-2 gap-y-0.5"
                        style={{
                          gridTemplateColumns: '46px minmax(0, 1fr) auto',
                          gridTemplateRows: 'auto auto',
                        }}
                      >
                        <span
                          className="text-[14px] font-semibold tabular-nums text-foreground self-center"
                          style={{ gridColumn: 1, gridRow: '1 / 3' }}
                        >
                          {c.time}
                        </span>
                        <span
                          className="text-[14px] font-semibold text-foreground truncate min-w-0"
                          style={{ gridColumn: 2, gridRow: 1 }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ClickablePatientName
                            name={c.patient.name}
                            patientId={c.patient.id}
                            className="text-[14px] font-semibold text-foreground hover:underline cursor-pointer"
                          />
                        </span>
                        <div className="justify-self-end self-center" style={{ gridColumn: 3, gridRow: 1 }}>
                          {typeDot(c.category as ConsultationCategory, 'sm')}
                        </div>
                        <span
                          className="text-[12px] text-muted-foreground truncate min-w-0"
                          style={{ gridColumn: 2, gridRow: 2 }}
                        >
                          {c.notes || '\u00A0'}
                        </span>
                        <div className="justify-self-end self-center" style={{ gridColumn: 3, gridRow: 2 }}>
                          {getStatusBadge(consultationStatuses[c.id] || c.status)}
                        </div>
                      </div>
                    </div>
                    </SwipeableRow>
                  );

                })}
              </div>
              <button className="text-xs text-primary hover:underline w-full mt-2 py-1 text-center" onClick={() => onNavigate('agenda')}>
                {t('dashboard.viewFullAgenda')} ›
              </button>
            </CardContent>
          </Card>

          {/* Confirmações */}
          <CollapsibleSection
            cardId="onboarding-confirmacoes"
            title={t('dashboard.confirmations')}
            persistKey="dentist:confirmacoes"
            liveBadge={
              <Badge variant="outline" className="text-[11px] gap-1 border-primary/30 text-primary">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> {t('dashboard.live')}
              </Badge>
            }
          >
              <div className="flex items-center justify-end gap-3 pb-1 border-b border-border/50">
                <span className="text-[11px] font-semibold text-muted-foreground w-5 text-center">24h</span>
                <span className="text-[11px] font-semibold text-muted-foreground w-5 text-center">1h</span>
              </div>
              <div className="flex-1 overflow-y-auto md:overflow-y-hidden mt-1">
                {dentistConfirmations.map((c, idx) => {
                  const isLastConf = idx === dentistConfirmations.length - 1;
                  return (
                    <div
                      key={c.consultationId}
                      className={cn(
                        "flex items-center gap-2 rounded-md cursor-pointer hover:bg-muted/30 transition-colors py-1.5",
                        !isLastConf && "border-b border-border"
                      )}
                      onClick={() => onNavigate(`consulta-detalhe:${c.consultationId}`)}
                    >
                      <div className="flex-1 min-w-0 flex items-center gap-1.5">
                        <span className="text-xs text-foreground truncate"><ClickablePatientName name={c.patientName} className="text-xs text-foreground" /></span>
                        {c.category && <span className="flex-shrink-0">{typeDot(c.category as ConsultationCategory, 'sm')}</span>}
                      </div>
                      {confirmIndicator(c.status24h)}
                      {confirmIndicator(c.status1h, c.isNoShow === true)}
                    </div>);
                })}
              </div>
              <button
                className="w-full text-xs text-primary hover:bg-primary/5 py-2 rounded-md transition-colors font-medium mt-2"
                onClick={() => {onNavigate('estatisticas');setTimeout(() => document.querySelector<HTMLButtonElement>('[data-subtab="confirmacoes"]')?.click(), 100);}}>
                {t('dashboard.viewAll')} →
              </button>
          </CollapsibleSection>
          </div>

          {/* RIGHT column: Quick Actions + Pending Points (hidden on mobile — replaced by hero pills) */}
          <div className="hidden md:block">{renderRightColumn('dentist', (
            <CollapsibleSection
              cardId="onboarding-lista-espera"
              title={t('dashboard.waitingList')}
              persistKey="dentist:lista-espera"
              badge={<Badge variant="outline" className="text-[11px]">{dentistWaitlist.length}</Badge>}
            >
              <div className="space-y-0 flex-1">
                {dentistWaitlist.length === 0 && (
                  <p className="text-xs text-muted-foreground py-2">{t('waitingList.noPatients')}</p>
                )}
                {dentistWaitlist.map((wl) =>
                <div key={wl.id} className="flex items-center gap-1.5 border-b border-border/50 last:border-0 py-1.5">
                    <span className="text-xs font-medium text-foreground truncate"><ClickablePatientName name={wl.patientName} className="text-xs font-medium text-foreground" /></span>
                    <span className="text-[11px] text-muted-foreground truncate min-w-0" title={wl.observation}>— {wl.observation}</span>
                  </div>
                )}
              </div>

              <button
                className="w-full text-xs text-primary hover:bg-primary/5 py-2 rounded-md transition-colors font-medium mt-2"
                onClick={() => {onNavigate('estatisticas');setTimeout(() => document.querySelector<HTMLButtonElement>('[data-subtab="lista_espera"]')?.click(), 100);}}>
                {t('dashboard.viewAll')} →
              </button>
            </CollapsibleSection>
          ))}</div>
        </div>

        {/* Full width: Score history */}
        <div id="onboarding-historico">
          <PatientScoreHistory mode="history-only" userRole="dentist" onNavigateHistory={() => {}} onViewFullHistory={onViewFullHistory} />
        </div>
      </div>);

  };

  // ─── Clinic dashboard ───
  const renderClinicDashboard = () => {
    const clinicDentists = getDentistsForClinic('1');


    // Group confirmations by dentist
    const confirmationsByDentist = clinicDentists.map((d) => ({
      dentist: d,
      confirmations: mockConfirmations.filter((c) => c.dentistName === d.name)
    })).filter((g) => g.confirmations.length > 0);

    // Waitlist grouped by dentist — mock in demo, real DB rows otherwise.
    const MOCK_CLINIC_WAITLIST: Record<string, { id: string; patientName: string; observation: string }[]> = {
      'Dr. Gonçalo Pipo': [
      { id: 'cwl-1', patientName: 'Rita Oliveira', observation: 'Dor intensa no dente 26' },
      { id: 'cwl-2', patientName: 'Bruno Pereira', observation: 'Seg/Qua após 15h' },
      { id: 'cwl-3', patientName: 'André Gomes', observation: 'Qualquer manhã' }],

      'Dr. Alexandre Bernardo': [
      { id: 'cwl-4', patientName: 'Sofia Lopes', observation: 'Quer antecipar consulta' },
      { id: 'cwl-5', patientName: 'Helena Nunes', observation: 'Apenas tardes' },
      { id: 'cwl-6', patientName: 'Carlos Santos', observation: 'Qualquer dia' }],

      'Dr. Gil Santos': [
      { id: 'cwl-7', patientName: 'Teresa Martins', observation: 'Ter/Qui ideal' },
      { id: 'cwl-8', patientName: 'Paulo Dias', observation: 'Pré-cirurgia, urgente' },
      { id: 'cwl-9', patientName: 'Beatriz Nunes', observation: 'Flexível' }]

    };
    const CLINIC_WAITLIST: Record<string, { id: string; patientName: string; observation: string }[]> =
      waitingIsDemo
        ? MOCK_CLINIC_WAITLIST
        : dbWaitingEntries.reduce<Record<string, { id: string; patientName: string; observation: string }[]>>(
            (acc, e) => {
              const key = e.dentistName !== '—' ? e.dentistName : t('waitingList.mgmt.anyDentist');
              acc[key] = [...(acc[key] ?? []), { id: e.id, patientName: e.patientName, observation: e.observation ?? '—' }];
              return acc;
            },
            {}
          );
    const totalWaitlist = Object.values(CLINIC_WAITLIST).flat().length;





    return (
      <div className="space-y-4">
        {renderStatsCards()}

        {renderQuickActionsRow('clinic')}
        {/* 2-column: LEFT (3 sub-cards) | RIGHT (quick actions + pending) */}
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6">
          {/* LEFT column */}
          <div className="space-y-6">
          {/* Consultas de Hoje (all dentists) */}
          <Card id="onboarding-consultas-hoje" className="bg-card/80 border-border flex flex-col">
            <CardContent className="border-0 flex flex-col flex-1 py-2.5 px-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="t-h3 text-foreground">{t('dashboard.todayConsultations')}</h3>
                <Badge variant="outline" className="text-[11px]">54 {t('dashboard.total')}</Badge>
              </div>
              <div className="space-y-1 flex-1 overflow-y-auto md:overflow-y-hidden mt-1">
                {(() => {
                  const dentistData: {id: string;name: string;pres: number;tele: number;}[] = [
                  { id: '1', name: 'Dr. Gonçalo Pipo', pres: 13, tele: 5 },
                  { id: '2', name: 'Dr. Alexandre Bernardo', pres: 13, tele: 5 },
                  { id: '3', name: 'Dr. Gil Santos', pres: 14, tele: 4 }];
                  return dentistData.map((d, index) => {
                    const isLast = index === dentistData.length - 1;
                    return (
                    <div
                      key={d.id}
                      className={cn(
                        "consultation-row hover:border-primary/30 hover:bg-primary/5 rounded transition-colors cursor-pointer py-1.5 flex items-center gap-1.5 group whitespace-nowrap overflow-hidden",
                        !isLast && "border-b border-border"
                      )}
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent('smilecheck:filter-dentist', { detail: `1-${d.id}` }));
                        onNavigate('agenda');
                      }}>
                       <ClickableDentistName name={d.name} className="text-[11px] font-semibold flex-shrink-0 group-hover:text-primary transition-colors" />
                       <span className="text-muted-foreground text-[11px]">:</span>
                       <span className="text-[11px] font-bold text-presencial flex-shrink-0">{d.pres} {t('dashboard.pres')}</span>
                       <span className="text-[11px] text-muted-foreground">·</span>
                       <span className="text-[11px] font-bold text-teleconsulta flex-shrink-0">{d.tele} {t('dashboard.tele')}</span>
                     </div>
                    );
                  });
                })()}
              </div>
              <button className="text-xs text-primary hover:underline w-full text-left mt-2" onClick={() => onNavigate('agenda')}>
                {t('dashboard.viewFullAgenda')} ›
              </button>
            </CardContent>
          </Card>

          {/* Confirmações grouped by dentist */}
          <CollapsibleSection
            cardId="onboarding-confirmacoes"
            title={t('dashboard.confirmations')}
            persistKey="clinic:confirmacoes"
            liveBadge={
              <Badge variant="outline" className="text-[11px] gap-1 border-primary/30 text-primary">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> {t('dashboard.live')}
              </Badge>
            }
          >
              {(() => {
                let rowIndex = 0;
                const totalRows = confirmationsByDentist.reduce((sum, g) => sum + Math.min(2, g.confirmations.length), 0);
                return (
                  <div className="flex-1 overflow-y-auto md:overflow-y-hidden">
                    {confirmationsByDentist.map(({ dentist, confirmations }) => (
                      <div key={dentist.id}>
                        <p className="text-[11px] font-semibold text-muted-foreground uppercase py-0.5"><ClickableDentistName name={dentist.name} className="text-[11px] font-semibold text-muted-foreground uppercase" /></p>
                        {confirmations.slice(0, 2).map((c) => {
                          rowIndex++;
                          const isLast = rowIndex === totalRows;
                          return (
                            <div
                              key={c.consultationId}
                              className={cn(
                                "flex items-center gap-1.5 py-1.5 rounded-md cursor-pointer hover:bg-muted/30 transition-colors",
                                !isLast && "border-b border-border"
                              )}
                              onClick={() => onNavigate(`consulta-detalhe:${c.consultationId}`)}
                            >
                              <div className="flex-1 min-w-0 flex items-center gap-1">
                                <span className="text-xs text-foreground truncate"><ClickablePatientName name={c.patientName} className="text-xs text-foreground" /></span>
                                {c.category && <span className="flex-shrink-0">{typeDot(c.category as ConsultationCategory, 'sm')}</span>}
                              </div>
                              {confirmIndicator(c.status24h)}
                              {confirmIndicator(c.status1h, c.isNoShow === true)}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                );
              })()}
              <button
                className="w-full text-xs text-primary hover:bg-primary/5 py-2 rounded-md transition-colors font-medium mt-2"
                onClick={() => {onNavigate('estatisticas');setTimeout(() => document.querySelector<HTMLButtonElement>('[data-subtab="confirmacoes"]')?.click(), 100);}}>
                {t('dashboard.viewAll')} →
              </button>
          </CollapsibleSection>
          </div>

          {/* RIGHT column: Quick Actions + Pending Points (hidden on mobile — replaced by hero pills) */}
          <div className="hidden md:block">{renderRightColumn('clinic', (
            <CollapsibleSection
              cardId="onboarding-lista-espera"
              title={t('dashboard.waitingList')}
              persistKey="clinic:lista-espera"
              badge={<Badge variant="outline" className="text-[11px]">{totalWaitlist} {t('dashboard.patients')}</Badge>}
            >
              <div className="space-y-1 flex-1 overflow-y-auto md:overflow-y-hidden">
                {Object.entries(CLINIC_WAITLIST).map(([dentistName, patients]) =>
                <div key={dentistName}>
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase py-0.5"><ClickableDentistName name={dentistName} className="text-[11px] font-semibold text-muted-foreground uppercase" /></p>
                    {patients.slice(0, 2).map((wl) =>
                  <div key={wl.id} className="flex items-center gap-1.5 border-b border-border/50 last:border-0 py-1.5">
                        <span className="text-xs font-medium text-foreground truncate"><ClickablePatientName name={wl.patientName} className="text-xs font-medium text-foreground" /></span>
                        <span className="text-[11px] text-muted-foreground truncate min-w-0" title={wl.observation}>— {wl.observation}</span>
                      </div>
                  )}
                  </div>
                )}
              </div>
              <button
                className="w-full text-xs text-primary hover:bg-primary/5 py-2 rounded-md transition-colors font-medium mt-2"
                onClick={() => {onNavigate('estatisticas');setTimeout(() => document.querySelector<HTMLButtonElement>('[data-subtab="lista_espera"]')?.click(), 100);}}>
                {t('dashboard.viewAll')} →
              </button>
            </CollapsibleSection>
          ))}</div>
        </div>

        {/* Full width: Histórico de Pacientes do Dia — card style */}
        <PatientScoreHistory mode="history-only" userRole="clinic" onNavigateHistory={() => {}} onViewFullHistory={onViewFullHistory} />
      </div>);

  };

  // ─── Patient: new layout ───
  const renderPatientDashboard = () => {
    // Use the SAME source + ordering on every viewport (mobile / tablet / desktop).
    // Non-mutating copy, future-only, sorted by full date+time.
    const upcomingItems = [...mockPatientConsultations]
      .filter((c) => c.date >= DEMO_DATE)
      .sort((a, b) => {
        const d = a.date.getTime() - b.date.getTime();
        return d !== 0 ? d : a.time.localeCompare(b.time);
      })
      .slice(0, 6);



    return (
      <>
        {/* Stats Cards — use shared renderer for clickable cards */}
        {renderStatsCards()}

        {/* Canonical quick actions row — mobile pills are rendered by MobileDashboardHero */}
        {renderQuickActionsRow('patient')}

        {/* 2-column grid: Próximas Consultas | Feedback Pendente */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* LEFT: Próximas Consultas */}
          <Card id="onboarding-consultas-hoje" className="bg-card/80 backdrop-blur border-border">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="t-h3 text-foreground">{t('dashboard.upcomingConsultations')}</h3>
                <Badge variant="outline" className="text-[11px]">{upcomingItems.length} {t('dashboard.consultations')}</Badge>
              </div>
              <div className="">
                {upcomingItems.map((item, index) => {
                  const catColor = item.category ? CATEGORY_COLORS[item.category] : null;
                  const isLast = index === upcomingItems.length - 1;
                  return (
                    <div key={item.id} className={cn(
                      "consultation-row flex items-center gap-3 py-1.5",
                      !isLast && "border-b border-border"
                    )}>
                      <span className="text-xs font-mono text-muted-foreground w-10 flex-shrink-0">{item.time}</span>
                      {catColor && <div className="w-1 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: catColor.hex }} />}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          <ClickableDentistName name={item.dentist.name} className="text-sm font-medium text-foreground" />
                        </p>
                        {item.category && typeDot(item.category, 'sm')}
                      </div>
                      <Badge variant="outline" className="text-[11px] flex-shrink-0">
                        {item.status === 'confirmada' ? t('consultation.confirmed') : t('consultation.scheduled')}
                      </Badge>
                    </div>);

                })}
              </div>
            </CardContent>
          </Card>

          {/* RIGHT: Feedback Pendente */}
          <div className="space-y-6">
            {/* Feedback Pendente */}
            <PendingFeedbackCard userRole="patient" />
          </div>
        </div>

        {/* Full width: Histórico por Consulta */}
        <PatientScoreHistory mode="history-only" onNavigateHistory={() => {}} onViewFullHistory={onViewFullHistory} />
      </>);

  };

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full">
          <DashboardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden">
      <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 sm:space-y-8 w-full min-w-0 animate-fade-in">
        {/* Greeting */}
        <div className="items-center justify-between flex flex-col gap-1.5 min-w-0 max-[499px]:gap-0">
          <div>
            <h1 className="t-h1 text-foreground text-center truncate max-w-full max-[499px]:text-[18px] max-[499px]:font-bold max-[499px]:mt-0">
              {greeting}, {userName}!
            </h1>
            <p className="text-sm text-muted-foreground mt-1 capitalize text-center my-1.5 max-[499px]:text-[12px] max-[499px]:mt-0.5 max-[499px]:mb-0">
              {DEMO_DATE.toLocaleDateString('pt-PT', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </p>
          </div>
        </div>

        {/* Role-specific content */}
        <MobileDashboardHero userRole={userRole} onNavigate={onNavigate} onStartTriage={onStartTriage} />
        {userRole === 'patient' ? renderPatientDashboard() : userRole === 'dentist' ? renderDentistDashboard() : renderClinicDashboard()}

        <CoachMark
          id={`dashboard-stats-${userRole}`}
          targetId="coachmark-stat-cards"
          title={t('coachmarks.dashboardTitle')}
          description={t('coachmarks.dashboardDesc')}
          enabled={!isLoading}
        />
      </div>
      {showLevelUp && <LevelUpCelebration levelKey={level.key} onDismiss={dismissLevelUp} />}
    </div>);
}
