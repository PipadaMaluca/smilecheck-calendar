import { useMemo, useRef, useState, type CSSProperties } from 'react';
import { CoachMark } from '@/components/onboarding/CoachMark';
import { useSimulatedLoading } from '@/hooks/use-simulated-loading';
import { DashboardSkeleton } from '@/components/skeletons';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Star, Calendar, Video, Users, Clock, Trophy, Flame, Award, CheckCircle2, AlertTriangle, Search, Bell, BarChart3, Heart, Gift, Check, X, Ban, MessageCircle, ChevronDown } from 'lucide-react';
import { ClickableDentistName } from '@/components/search/ClickableDentistName';
import { ClickableClinicName } from '@/components/search/ClickableClinicName';
import { ClickablePatientName } from '@/components/search/ClickablePatientName';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { UserRole, CATEGORY_COLORS, CATEGORY_LABELS, STATUS_CONFIG, ConsultationStatus, ConsultationCategory, getCategoryBadgeStyle , getCategoryLabel} from '@/types/calendar';
import { ConsultationTypePill } from '@/components/ui/ConsultationTypePill';
import { ConfirmationStatus } from '@/types/scoring';
import { mockConsultations, mockDentists, mockClinics, mockFamilyMembers, mockPatientConsultations, getDentistsForClinic } from '@/data/mockData';
import { mockConfirmations } from '@/types/scoring';
import { isSameDay, format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PatientScoreHistory } from './PatientScoreHistory';
import { PendingFeedbackCard } from '@/components/feedback/PendingFeedbackCard';
import { USER_POINTS, getLevelForXP, getXPProgress, LEVEL_TRANSLATION_KEYS, LEVEL_MULTIPLIERS } from '@/data/pointsData';
import { LevelUpCelebration } from '@/components/level/LevelUpCelebration';
import { LevelIcon, LEVEL_ICON_MAP } from '@/components/level/LevelIcon';
import { SwipeableRow } from '@/components/ui/swipeable-row';
import { useToast } from '@/hooks/use-toast';
import { MobileDashboardHero } from './MobileDashboardHero';

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
                  'w-4 h-4 text-muted-foreground transition-transform duration-200',
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
{ id: 'wl-1', patientName: 'Rita Oliveira', detailKey: 'wantsToAnticipate', currentDate: '3 Fev', currentTime: '14:00', priority: 'alta' as const, isUrgent: true },
{ id: 'wl-2', patientName: 'Bruno Pereira', detailKey: 'availableMonWed', currentDate: '5 Fev', currentTime: '10:00', priority: 'normal' as const, isUrgent: false },
{ id: 'wl-3', patientName: 'Sofia Lopes', detailKey: 'anyMorning', currentDate: '7 Fev', currentTime: '16:30', priority: 'normal' as const, isUrgent: false }];


export function DashboardView({ userRole, onNavigate, onStartTriage, onViewFullHistory }: DashboardViewProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const isLoading = useSimulatedLoading(1200, `dashboard:${userRole}`);
  const userName = getUserName(userRole);
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
  const pointsData = USER_POINTS[userRole];
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
      { label: t('dashboard.availablePoints'), value: `⭐ ${pointsData.rewardPoints} pts`, icon: Star, clickTab: 'loja' },
      { label: t('dashboard.streak'), value: pointsData.streak, icon: Flame, clickTab: 'pontuacoes-streak', isStreak: true }];
    }
    if (userRole === 'dentist') {
      const dentistCons = todayConsultations.filter((c) => c.dentist.id === mockDentists[0].id).sort((a, b) => a.time.localeCompare(b.time));
      const next = dentistCons[0];
      const nextCatLabel = next?.category ? getCategoryLabel(t, next.category) : next?.type || '';
      return [
      { label: t('dashboard.nextConsultation'), value: next ? next.time : '—', subtitle: next ? next.patient.name : '', extraLine: nextCatLabel, icon: Calendar, clickTab: 'consulta-detalhe', isHero: true, category: next?.category, primaryName: next?.patient.name || '' },
      { label: t('dashboard.levelAndXp'), value: t(LEVEL_TRANSLATION_KEYS[level.key] || level.name), icon: Award, clickTab: 'pontuacoes', isLevel: true },
      { label: t('dashboard.availablePoints'), value: `⭐ ${pointsData.rewardPoints} pts`, icon: Star, clickTab: 'loja' },
      { label: t('dashboard.streak'), value: pointsData.streak, icon: Flame, clickTab: 'pontuacoes-streak', isStreak: true }];
    }
    if (userRole === 'clinic') {
      return [
      { label: t('dashboard.todayConsultations'), value: '54', subtitle: `40 ${t('dashboard.presential')} · 14 ${t('dashboard.teleconsultations')}`, icon: Calendar, clickTab: 'agenda', isHero: true, category: undefined as ConsultationCategory | undefined, primaryName: '' },
      { label: t('dashboard.levelAndXp'), value: t(LEVEL_TRANSLATION_KEYS[level.key] || level.name), icon: Award, clickTab: 'pontuacoes', isLevel: true },
      { label: t('dashboard.availablePoints'), value: `⭐ ${pointsData.rewardPoints} pts`, icon: Star, clickTab: 'loja' },
      { label: t('dashboard.streak'), value: pointsData.streak, icon: Flame, clickTab: 'pontuacoes-streak', isStreak: true }];
    }
    return null;
  }, [userRole, todayConsultations, level, pointsData, t]);

  const quickActions = useMemo(() => {
    switch (userRole) {
      case 'dentist':
        return [
        { label: t('dashboard.viewTodayAgenda'), icon: Calendar, action: () => onNavigate('agenda') },
        { label: t('dashboard.searchLabel'), icon: Search, action: () => onNavigate('pesquisa') },
        { label: t('dashboard.viewAllNotifications'), icon: Bell, action: () => onNavigate('notificacoes') }];

      case 'clinic':
        return [
        { label: t('dashboard.viewFullAgenda'), icon: Calendar, action: () => {
            window.dispatchEvent(new CustomEvent('smilecheck:filter-dentist', { detail: 'clinic-1' }));
            onNavigate('agenda');
          } },
        { label: t('dashboard.manageTeam'), icon: Users, action: () => onNavigate('equipa') },
        { label: t('dashboard.viewStats'), icon: BarChart3, action: () => onNavigate('estatisticas') }];

      case 'patient':
        return [
        { label: t('dashboard.bookAppointment'), icon: Calendar, action: () => onStartTriage?.() },
        { label: t('dashboard.viewRewards'), icon: Trophy, action: () => onNavigate('loja') },
        { label: t('dashboard.myHealth'), icon: Star, action: () => onNavigate('saude') }];

    }
  }, [userRole, onNavigate, onStartTriage, t]);

  // Shared stats cards renderer
  const renderStatsCards = () => {
    if (!stats) return null;
    const heroStat = stats[0] as any;
    const restStats = stats.slice(1);
    const HeroIcon = heroStat.icon;
    const heroCategory: ConsultationCategory | undefined = heroStat.category;
    const heroBorderHex = heroCategory ? CATEGORY_COLORS[heroCategory].hex : '#2196F3';
    const heroPillStyle = heroCategory ? getCategoryBadgeStyle(CATEGORY_COLORS[heroCategory].hex) : undefined;
    const heroPillLabel = heroCategory ? getCategoryLabel(t, heroCategory) : (heroStat.extraLine || '');

    return (
      <div className="hidden lg:flex flex-col gap-3 sm:gap-4">
        {/* Tablet: hero full-width row + 3 equal below. Desktop: 40%+20%×3 single row */}
        <div id="coachmark-stat-cards" className="grid grid-cols-3 lg:grid-cols-[45fr_25fr_15fr_15fr] gap-3 sm:gap-4">
          {/* Hero Card 1 */}
          <Card
            className={cn(
              "proxima-consulta-card relative bg-card/80 backdrop-blur border border-border min-w-0 col-span-3 lg:col-span-1 card-hover-lift rounded-2xl overflow-hidden",
              heroStat.clickTab && "cursor-pointer hover:shadow-[0_0_12px_hsl(var(--primary)/0.5)] hover:bg-primary/10 transition-all"
            )}
            style={{ '--consultation-type-color': heroBorderHex } as CSSProperties}
            onClick={heroStat.clickTab ? () => {
              if (heroStat.clickTab === 'consulta-detalhe') onNavigate('consulta-detalhe');
              else if (heroStat.clickTab === 'agenda') {
                window.dispatchEvent(new CustomEvent('smilecheck:filter-dentist', { detail: 'clinic-1' }));
                onNavigate('agenda');
              } else onNavigate(heroStat.clickTab!);
            } : undefined}
          >
            {/* Dynamic colored left stripe (4px) — overlay to bypass any border overrides */}
            <span
              aria-hidden
              className="absolute left-0 top-0 bottom-0 w-1 pointer-events-none"
              style={{ backgroundColor: heroBorderHex }}
            />
            <CardContent className="p-6 border-0 px-4 py-3.5 flex flex-col gap-1.5 min-w-0 min-h-[84px] justify-center text-left">
              <div className="flex items-center gap-1.5 text-muted-foreground min-w-0 text-center text-base">
                <HeroIcon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: heroBorderHex }} />
                <span className="font-medium truncate text-base">{heroStat.label}</span>
              </div>
              {userRole === 'clinic' ? (
                <div className="flex items-center gap-2 min-w-0 text-center">
                  <span className="font-bold text-foreground text-lg">{heroStat.value}</span>
                  {heroStat.subtitle && (
                    <span className="text-muted-foreground truncate text-sm">
                      {String(heroStat.subtitle).split('·').map((part, i) => {
                        const trimmed = part.trim();
                        const isPresencial = trimmed.includes(t('dashboard.presential'));
                        const isTeleconsulta = trimmed.includes(t('dashboard.teleconsultations'));
                        return (
                          <span key={i}>
                            {i > 0 && <span className="text-muted-foreground"> · </span>}
                            <span className={isPresencial ? 'text-presencial font-medium' : isTeleconsulta ? 'text-teleconsulta font-medium' : ''}>
                              {trimmed}
                            </span>
                          </span>
                        );
                      })}
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 min-w-0 text-center">
                  <span className="font-bold text-foreground flex-shrink-0 text-lg">{heroStat.value}</span>
                  <span className="text-muted-foreground flex-shrink-0 text-lg">·</span>
                  <span className="font-medium text-foreground truncate min-w-0 text-lg">
                    {heroStat.primaryName || heroStat.subtitle || ''}
                  </span>
                  {heroCategory && (
                    <ConsultationTypePill
                      category={heroCategory}
                      className="ml-auto flex-shrink-0 max-w-[40%]"
                    />
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cards 2-4 — compact horizontal on mobile, vertical on tablet+ */}
          {restStats.map((stat) => {
            const Icon = stat.icon;
            const isClickable = !!stat.clickTab;
            const isXPCard = stat.label === t('dashboard.levelAndXp');
            return (
              <Card
                key={stat.label}
                id={stat.label === t('dashboard.availablePoints') ? 'onboarding-pontuacao-card' : undefined}
                className={cn(
                  "bg-card/80 backdrop-blur border-border min-w-0 card-hover-lift rounded-2xl",
                  isClickable && "cursor-pointer hover:shadow-[0_0_8px_hsl(var(--primary)/0.4)] hover:bg-primary/10 transition-all"
                )}
                onClick={isClickable ? () => {
                  if (stat.clickTab === 'pontuacoes-streak') onNavigate('pontuacoes');
                  else onNavigate(stat.clickTab!);
                } : undefined}
              >
                <CardContent className="p-6 border-0 px-4 py-3.5 flex flex-col gap-1.5 min-w-0 min-h-[84px] justify-center text-left">
                  <span className="font-medium text-muted-foreground truncate flex items-center gap-1.5 text-center text-base">
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                    {stat.label}
                  </span>
                  {isXPCard ? (
                    <div className="flex flex-col gap-2 min-w-0 w-full" onClick={(e) => { e.stopPropagation(); handleLevelBadgeTap(); }}>
                      <div className="flex items-center min-w-0">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <LevelIcon levelKey={level.key} size={25} />
                          <span className="font-bold text-foreground truncate text-[20px]">{stat.value}</span>
                        </div>
                        <span className="text-[13px] text-muted-foreground tabular-nums flex-shrink-0 mx-2">{pointsData.xp.toLocaleString()} XP</span>
                        <span className="text-[13px] text-muted-foreground tabular-nums flex-shrink-0">×{multiplier.toFixed(1)}</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-[#E2E8F0] dark:bg-[#1E3A5F] overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-1000 ease-out",
                            LEVEL_ICON_MAP[level.key]?.colorClass.replace('text-', 'bg-') || 'bg-primary'
                          )}
                          style={{ width: `${xpProgress.percent}%` }}
                        />
                      </div>
                    </div>
                  ) : 'isStreak' in stat && (stat as any).isStreak ? (
                    <span className="font-bold text-foreground inline-flex items-center gap-1.5 text-lg">
                      <span>🔥</span> {stat.value} {t('points.days')}
                    </span>
                  ) : (
                    <span className="font-bold text-foreground truncate text-lg">{stat.value}</span>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  // Status badge helper
  const getStatusBadge = (status?: string) => {
    const configs: Record<string, {label: string;className: string;}> = {
      confirmada: { label: t('consultation.confirmed'), className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
      em_sala_espera: { label: t('consultation.waitingRoom'), className: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
      em_consulta: { label: t('consultation.inProgress'), className: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
      visto: { label: t('consultation.seen'), className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
      falta_justificada: { label: t('consultation.noShow'), className: 'bg-orange-500/15 text-orange-400 border-orange-500/30' },
      falta_nao_justificada: { label: t('consultation.noShow'), className: 'bg-red-500/15 text-red-400 border-red-500/30' }
    };
    const cfg = status ? configs[status] : null;
    return (
      <Badge variant="outline" className={`text-[10px] flex-shrink-0 ${cfg?.className || 'bg-blue-500/15 text-blue-400 border-blue-500/30'}`}>
        {cfg?.label || t('consultation.scheduled')}
      </Badge>);

  };

  // Abbreviate name: "Maria Silva" → "Maria S."
  const abbreviateName = (name: string) => {
    const parts = name.split(' ');
    if (parts.length <= 1) return name;
    return `${parts[0]} ${parts[parts.length - 1][0]}.`;
  };

  // Confirmation indicator
  const confirmIndicator = (status: ConfirmationStatus, isIrrelevant = false) => {
    if (isIrrelevant) return <span className="w-5 h-5 rounded-md bg-muted flex items-center justify-center text-[10px] text-muted-foreground font-bold">—</span>;
    if (status === 'confirmed') return <span className="w-5 h-5 rounded-md bg-emerald-500/20 flex items-center justify-center text-[10px] text-emerald-400 font-bold">✓</span>;
    if (status === 'declined') return <span className="w-5 h-5 rounded-md bg-red-500/20 flex items-center justify-center text-[10px] text-red-400 font-bold">✗</span>;
    return <span className="w-5 h-5 rounded-md bg-orange-500/20 flex items-center justify-center text-[10px] text-orange-400 font-bold">●</span>;
  };

  const dentistQuickActionCards = [
    { label: t('dashboard.viewTodayAgenda'), icon: Calendar, color: 'bg-blue-500/15 text-blue-400', action: () => onNavigate('agenda') },
    { label: t('dashboard.manageTeam'), icon: Users, color: 'bg-teal-500/15 text-teal-400', action: () => onNavigate('equipa') },
    { label: t('dashboard.viewStats'), icon: BarChart3, color: 'bg-purple-500/15 text-purple-400', action: () => onNavigate('estatisticas') },
  ];

  const clinicQuickActionCards = [
    { label: t('dashboard.viewTodayAgenda'), icon: Calendar, color: 'bg-blue-500/15 text-blue-400', action: () => { window.dispatchEvent(new CustomEvent('smilecheck:filter-dentist', { detail: 'clinic-1' })); onNavigate('agenda'); } },
    { label: t('dashboard.manageTeam'), icon: Users, color: 'bg-teal-500/15 text-teal-400', action: () => onNavigate('equipa') },
    { label: t('dashboard.viewStats'), icon: BarChart3, color: 'bg-purple-500/15 text-purple-400', action: () => onNavigate('estatisticas') },
  ];

  const renderQuickActionsCard = (actions: typeof dentistQuickActionCards) => (
    <Card className="bg-card/80 backdrop-blur border-border rounded-2xl">
      <CardContent className="p-4 space-y-3">
        <h3 className="t-h3 text-foreground">{t('dashboard.quickActions')}</h3>
        <div className="flex flex-col gap-2">
          {actions.map((action) => {
            const ActionIcon = action.icon;
            return (
              <button
                key={action.label}
                onClick={action.action}
                className="flex items-center gap-3 px-4 h-12 w-full rounded-2xl bg-card border border-border shadow-sm card-hover-lift hover:border-primary/40 transition-all text-left">
                <ActionIcon className="w-5 h-5 flex-shrink-0" style={{ color: '#2196F3' }} />
                <span className="text-sm font-medium text-foreground">{action.label}</span>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );

  const renderRightColumn = (role: 'dentist' | 'clinic', waitingListNode?: React.ReactNode) => {
    const actions = role === 'clinic' ? clinicQuickActionCards : dentistQuickActionCards;
    return (
      <div className="space-y-6">
        {renderQuickActionsCard(actions)}
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

        {/* 2-column: LEFT (3 sub-cards) | RIGHT (quick actions + pending) */}
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6">
          {/* LEFT column: 3 sub-cards */}
          <div className="space-y-6">
          {/* Consultas de Hoje */}
          <Card id="onboarding-consultas-hoje" className="bg-card/80 border-border flex flex-col">
            <CardContent className="border-0 flex flex-col flex-1 py-2.5 px-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="t-h3 text-foreground">{t('dashboard.todayConsultations')}</h3>
                <Badge variant="outline" className="text-[10px]">{dentistCons.length} {t('dashboard.total')}</Badge>
              </div>
              <div className="space-y-0 flex-1 overflow-y-auto md:overflow-y-hidden">
              {morningCons.map((c, index) => {
                  const catColor = c.category ? CATEGORY_COLORS[c.category] : null;
                  const catLabel = c.category ? getCategoryLabel(t, c.category) : c.type;
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
                      className={cn("consultation-row cursor-pointer hover:bg-muted/30 hover:brightness-110 rounded transition-all", isLast && "consultation-row-last")}
                      onClick={() => onNavigate(`consulta-detalhe:${c.id}`)}>
                      {/* Desktop/Tablet: 3-column grid */}
                      <div className="hidden sm:grid items-center py-2" style={{ gridTemplateColumns: '30% 40% 30%' }}>
                        <div className="flex items-center gap-2 text-left min-w-0">
                          <span className="text-xs font-bold text-primary flex-shrink-0">{c.time}</span>
                          <span className="text-xs text-foreground truncate min-w-0" onClick={(e) => e.stopPropagation()}>
                            <ClickablePatientName name={c.patient.name} patientId={c.patient.id} className="text-xs text-foreground hover:underline cursor-pointer" />
                          </span>
                        </div>
                        <div className="flex items-center justify-center gap-1.5 truncate">
                          <ConsultationTypePill category={c.category as ConsultationCategory} />
                          <span className="text-[10px] text-muted-foreground">— {c.duration}{t('agenda.minutes')}</span>
                        </div>
                        <div className="flex justify-end">
                          {getStatusBadge(consultationStatuses[c.id] || c.status)}
                        </div>
                      </div>
                      {/* Mobile: 3-column row */}
                      <div className="sm:hidden flex items-center h-12 px-1 gap-2">
                        <div className="w-[50px] flex-shrink-0">
                          <span className="text-[12px] font-bold tabular-nums" style={{ color: catColor?.hex || '#2196F3' }}>{c.time}</span>
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-center" style={{ lineHeight: 1.3 }}>
                          <span className="text-[13px] font-medium text-foreground truncate" onClick={(e) => e.stopPropagation()}>
                            <ClickablePatientName name={c.patient.name} patientId={c.patient.id} className="text-[13px] font-medium text-foreground hover:underline cursor-pointer" />
                          </span>
                          <div className="flex items-center gap-1 min-w-0">
                            <ConsultationTypePill category={c.category as ConsultationCategory} className="flex-shrink-0" />
                            <span className="text-[10px] text-muted-foreground hidden min-[375px]:inline">{c.duration}{t('agenda.minutes')}</span>
                          </div>
                        </div>
                        <div className="w-[100px] flex-shrink-0 flex justify-end">
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
              <Badge variant="outline" className="text-[10px] gap-1 border-primary/30 text-primary">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> {t('dashboard.live')}
              </Badge>
            }
          >
              <div className="flex items-center justify-end gap-3 pb-1 border-b border-border/50">
                <span className="text-[10px] font-semibold text-muted-foreground w-5 text-center">24h</span>
                <span className="text-[10px] font-semibold text-muted-foreground w-5 text-center">1h</span>
              </div>
              <div className="space-y-1.5 flex-1 overflow-y-auto md:overflow-y-hidden mt-1">
                {dentistConfirmations.map((c) => {
                  const catColor = c.category ? CATEGORY_COLORS[c.category as ConsultationCategory] : null;
                  const catLabel = c.category ? getCategoryLabel(t, c.category as ConsultationCategory) : '';
                  return (
                    <div
                      key={c.consultationId}
                      className="flex items-center gap-2 rounded-md cursor-pointer hover:bg-muted/30 transition-colors py-1.5"
                      onClick={() => onNavigate(`consulta-detalhe:${c.consultationId}`)}
                    >
                      <div className="flex-1 min-w-0 flex items-center gap-1.5">
                        <span className="text-xs text-foreground truncate"><ClickablePatientName name={c.patientName} className="text-xs text-foreground" /></span>
                        {c.category && <ConsultationTypePill category={c.category as ConsultationCategory} className="flex-shrink-0" />}
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
              badge={<Badge variant="outline" className="text-[10px]">{MOCK_WAITING_LIST.length}</Badge>}
            >
              <div className="space-y-0 flex-1">
                {MOCK_WAITING_LIST.map((wl) =>
                <div key={wl.id} className="flex items-center gap-1.5 border-b border-border/50 last:border-0 py-1.5">
                    <span className="text-xs font-medium text-foreground truncate"><ClickablePatientName name={wl.patientName} className="text-xs font-medium text-foreground" /></span>
                    <span className="text-[10px] text-muted-foreground flex-shrink-0">— {t(`waitingList.details.${wl.detailKey}`)}</span>
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
    const presCount = todayConsultations.filter((c) => c.type === 'presencial').length;
    const teleCount = todayConsultations.filter((c) => c.type === 'teleconsulta').length;


    // Group confirmations by dentist
    const confirmationsByDentist = clinicDentists.map((d) => ({
      dentist: d,
      confirmations: mockConfirmations.filter((c) => c.dentistName === d.name)
    })).filter((g) => g.confirmations.length > 0);

    // Mock waitlist grouped by dentist
    const CLINIC_WAITLIST: Record<string, typeof MOCK_WAITING_LIST> = {
      'Dr. Gonçalo Pipo': [
      { id: 'cwl-1', patientName: 'Rita Oliveira', detailKey: 'wantsToAnticipate', currentDate: '3 Fev', currentTime: '14:00', priority: 'alta' as const, isUrgent: true },
      { id: 'cwl-2', patientName: 'Bruno Pereira', detailKey: 'availableMonWed', currentDate: '5 Fev', currentTime: '10:00', priority: 'normal' as const, isUrgent: false },
      { id: 'cwl-3', patientName: 'André Gomes', detailKey: 'anyMorning', currentDate: '6 Fev', currentTime: '09:00', priority: 'normal' as const, isUrgent: false }],

      'Dr. Alexandre Bernardo': [
      { id: 'cwl-4', patientName: 'Sofia Lopes', detailKey: 'wantsToAnticipate', currentDate: '4 Fev', currentTime: '11:00', priority: 'alta' as const, isUrgent: true },
      { id: 'cwl-5', patientName: 'Helena Nunes', detailKey: 'availableAfternoons', currentDate: '7 Fev', currentTime: '15:00', priority: 'normal' as const, isUrgent: false },
      { id: 'cwl-6', patientName: 'Carlos Santos', detailKey: 'anyDay', currentDate: '8 Fev', currentTime: '10:00', priority: 'normal' as const, isUrgent: false }],

      'Dr. Gil Santos': [
      { id: 'cwl-7', patientName: 'Teresa Martins', detailKey: 'availableTueThu', currentDate: '5 Fev', currentTime: '14:30', priority: 'normal' as const, isUrgent: false },
      { id: 'cwl-8', patientName: 'Paulo Dias', detailKey: 'wantsToAnticipate', currentDate: '6 Fev', currentTime: '16:00', priority: 'alta' as const, isUrgent: true },
      { id: 'cwl-9', patientName: 'Beatriz Nunes', detailKey: 'anyTime', currentDate: '9 Fev', currentTime: '09:00', priority: 'normal' as const, isUrgent: false }]

    };
    const totalWaitlist = Object.values(CLINIC_WAITLIST).flat().length;




    return (
      <div className="space-y-4">
        {renderStatsCards()}
        {/* 2-column: LEFT (3 sub-cards) | RIGHT (quick actions + pending) */}
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6">
          {/* LEFT column */}
          <div className="space-y-6">
          {/* Consultas de Hoje (all dentists) */}
          <Card id="onboarding-consultas-hoje" className="bg-card/80 border-border flex flex-col">
            <CardContent className="border-0 flex flex-col flex-1 py-2.5 px-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="t-h3 text-foreground">{t('dashboard.todayConsultations')}</h3>
                <Badge variant="outline" className="text-[10px]">54 {t('dashboard.total')}</Badge>
              </div>
              <div className="space-y-1 flex-1 overflow-y-auto md:overflow-y-hidden mt-1">
                {(() => {
                  const dentistData: {id: string;name: string;pres: number;tele: number;}[] = [
                  { id: '1', name: 'Dr. Gonçalo Pipo', pres: 13, tele: 5 },
                  { id: '2', name: 'Dr. Alexandre Bernardo', pres: 13, tele: 5 },
                  { id: '3', name: 'Dr. Gil Santos', pres: 14, tele: 4 }];
                  return dentistData.map((d) =>
                  <div
                    key={d.id}
                    className="consultation-row border border-border/50 hover:border-primary/30 hover:bg-primary/5 rounded transition-all cursor-pointer p-2 my-1.5 flex items-center gap-1.5 group whitespace-nowrap overflow-hidden"
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent('smilecheck:filter-dentist', { detail: `1-${d.id}` }));
                      onNavigate('agenda');
                    }}>
                       <ClickableDentistName name={d.name} className="text-[11px] font-semibold flex-shrink-0 group-hover:text-primary transition-colors" />
                       <span className="text-muted-foreground text-[11px]">:</span>
                       <span className="text-[11px] font-bold text-presencial flex-shrink-0">{d.pres} {t('dashboard.pres')}</span>
                       <span className="text-[10px] text-muted-foreground">·</span>
                       <span className="text-[11px] font-bold text-teleconsulta flex-shrink-0">{d.tele} {t('dashboard.tele')}</span>
                     </div>
                  );
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
              <Badge variant="outline" className="text-[10px] gap-1 border-primary/30 text-primary">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> {t('dashboard.live')}
              </Badge>
            }
          >
              <div className="space-y-1 flex-1 overflow-y-auto md:overflow-y-hidden">
                {confirmationsByDentist.map(({ dentist, confirmations }) =>
                <div key={dentist.id}>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase py-0.5"><ClickableDentistName name={dentist.name} className="text-[10px] font-semibold text-muted-foreground uppercase" /></p>
                    {confirmations.slice(0, 2).map((c) => {
                    const catColor = c.category ? CATEGORY_COLORS[c.category as ConsultationCategory] : null;
                    const catLabel = c.category ? getCategoryLabel(t, c.category as ConsultationCategory) : '';
                    return (
                      <div
                        key={c.consultationId}
                        className="flex items-center gap-1.5 py-0.5 rounded-md cursor-pointer hover:bg-muted/30 transition-colors"
                        onClick={() => onNavigate(`consulta-detalhe:${c.consultationId}`)}
                      >
                          <div className="flex-1 min-w-0 flex items-center gap-1">
                            <span className="text-xs text-foreground truncate"><ClickablePatientName name={c.patientName} className="text-xs text-foreground" /></span>
                            {c.category && <ConsultationTypePill category={c.category as ConsultationCategory} className="flex-shrink-0" />}
                          </div>
                          {confirmIndicator(c.status24h)}
                          {confirmIndicator(c.status1h, c.isNoShow === true)}
                        </div>);
                  })}
                  </div>
                )}
              </div>
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
              badge={<Badge variant="outline" className="text-[10px]">{totalWaitlist} {t('dashboard.patients')}</Badge>}
            >
              <div className="space-y-1 flex-1 overflow-y-auto md:overflow-y-hidden">
                {Object.entries(CLINIC_WAITLIST).map(([dentistName, patients]) =>
                <div key={dentistName}>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase py-0.5"><ClickableDentistName name={dentistName} className="text-[10px] font-semibold text-muted-foreground uppercase" /></p>
                    {patients.slice(0, 2).map((wl) =>
                  <div key={wl.id} className="flex items-center gap-1.5 border-b border-border/50 last:border-0 py-1.5">
                        <span className="text-xs font-medium text-foreground truncate"><ClickablePatientName name={wl.patientName} className="text-xs font-medium text-foreground" /></span>
                        <span className="text-[10px] text-muted-foreground flex-shrink-0">— {t(`waitingList.details.${wl.detailKey}`)}</span>
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
    const upcomingItems = mockPatientConsultations.
    sort((a, b) => a.time.localeCompare(b.time)).
    slice(0, 6);

    const patientActions = [
    { label: t('dashboard.bookAppointment'), icon: Calendar, color: 'bg-blue-500/15 text-blue-400', action: () => onStartTriage?.() },
    { label: t('dashboard.viewRewards'), icon: Gift, color: 'bg-emerald-500/15 text-emerald-400', action: () => onNavigate('loja') },
    { label: t('dashboard.myHealth'), icon: Heart, color: 'bg-purple-500/15 text-purple-400', action: () => onNavigate('saude') }];


    return (
      <>
        {/* Stats Cards — use shared renderer for clickable cards */}
        {renderStatsCards()}

        {/* 2-column grid: Próximas Consultas | Ações Rápidas + Feedback Pendente */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* LEFT: Próximas Consultas */}
          <Card id="onboarding-consultas-hoje" className="bg-card/80 backdrop-blur border-border">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="t-h3 text-foreground">{t('dashboard.upcomingConsultations')}</h3>
                <Badge variant="outline" className="text-[10px]">{upcomingItems.length} {t('dashboard.consultations')}</Badge>
              </div>
              <div className="space-y-2">
                {upcomingItems.map((item) => {
                  const catColor = item.category ? CATEGORY_COLORS[item.category] : null;
                  const catLabel = item.category ? getCategoryLabel(t, item.category) : '';
                  return (
                    <div key={item.id} className="consultation-row flex items-center gap-3 py-2">
                      <span className="text-xs font-mono text-muted-foreground w-10 flex-shrink-0">{item.time}</span>
                      {catColor && <div className="w-1 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: catColor.hex }} />}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          <ClickableDentistName name={item.dentist.name} className="text-sm font-medium text-foreground" />
                        </p>
                        {item.category && <ConsultationTypePill category={item.category} />}
                      </div>
                      <Badge variant="outline" className="text-[10px] flex-shrink-0">
                        {item.status === 'confirmada' ? t('consultation.confirmed') : t('consultation.scheduled')}
                      </Badge>
                    </div>);

                })}
              </div>
            </CardContent>
          </Card>

          {/* RIGHT: Ações Rápidas + Feedback Pendente */}
          <div className="space-y-6">
            {/* Ações Rápidas (hidden on mobile — replaced by hero pills) */}
            <Card className="hidden md:block bg-card/80 backdrop-blur border-border">
              <CardContent className="p-4 space-y-3">
                <h3 className="t-h3 text-foreground">{t('dashboard.quickActions')}</h3>
                <div className="flex flex-col gap-2">
                  {patientActions.map((action) => {
                    const ActionIcon = action.icon;
                    return (
                      <button
                        key={action.label}
                        onClick={action.action}
                        className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/30 transition-colors text-left">
                        
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${action.color}`}>
                          <ActionIcon className="w-4.5 h-4.5" />
                        </div>
                        <span className="text-sm font-medium text-foreground">{action.label}</span>
                      </button>);

                  })}
                </div>
              </CardContent>
            </Card>

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
        <div className="items-center justify-between flex flex-col gap-1.5 min-w-0">
          <div>
            <h1 className="t-h1 text-foreground text-center truncate max-w-full">
              {greeting}, {userName}!
            </h1>
            <p className="text-sm text-muted-foreground mt-1 capitalize text-center my-1.5">
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
        <MobileDashboardHero userRole={userRole} onNavigate={onNavigate} />
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
