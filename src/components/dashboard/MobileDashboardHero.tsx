import { useMemo, type CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Calendar,
  Users,
  BarChart3,
  MessageCircle,
  Award,
  ShoppingBag,
  Search,
  Heart,
  Bell,
  Settings,
  Star,
  Flame,
  Gift,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { LevelIcon, LEVEL_ICON_MAP } from '@/components/level/LevelIcon';
import { UserRole, CATEGORY_COLORS, getCategoryLabel, getCategoryBadgeStyle, ConsultationCategory } from '@/types/calendar';
import { ConsultationTypePill } from '@/components/ui/ConsultationTypePill';
import { mockConsultations, mockDentists, mockPatientConsultations } from '@/data/mockData';
import { isSameDay } from 'date-fns';
import { USER_POINTS, getLevelForXP, LEVEL_TRANSLATION_KEYS, LEVEL_MULTIPLIERS, getXPProgress } from '@/data/pointsData';

const DEMO_DATE = new Date(2026, 0, 31);

interface MobileDashboardHeroProps {
  userRole: UserRole;
  onNavigate: (tab: string) => void;
}

/**
 * Mobile-only compact hero: next-appointment card + stat strip + scrollable action pills.
 * Hidden on tablet/desktop (md:hidden on the wrapper).
 */
export function MobileDashboardHero({ userRole, onNavigate }: MobileDashboardHeroProps) {
  const { t } = useTranslation();
  const points = USER_POINTS[userRole];
  const level = getLevelForXP(points.xp);
  const multiplier = LEVEL_MULTIPLIERS[level.key];
  const xpProgress = getXPProgress(points.xp);

  const next = useMemo(() => {
    if (userRole === 'patient') {
      const n = [...mockPatientConsultations]
        .filter((c) => c.date >= DEMO_DATE)
        .sort((a, b) => a.date.getTime() - b.date.getTime())[0];
      if (!n) return null;
      return {
        id: n.id,
        time: n.time,
        name: (n as any).dentist?.name || mockDentists[0].name,
        category: n.category,
        catLabel: n.category ? getCategoryLabel(t, n.category) : '',
        catColor: n.category ? CATEGORY_COLORS[n.category]?.hex : '#2196F3',
        countdownMin: 0,
      };
    }
    const cons = mockConsultations
      .filter((c) => isSameDay(c.date, DEMO_DATE))
      .filter((c) => userRole === 'clinic' ? true : c.dentist.id === mockDentists[0].id)
      .sort((a, b) => a.time.localeCompare(b.time))[0];
    if (!cons) return null;
    return {
      id: cons.id,
      time: cons.time,
      name: cons.patient.name,
      category: cons.category,
      catLabel: cons.category ? getCategoryLabel(t, cons.category) : cons.type,
      catColor: cons.category ? CATEGORY_COLORS[cons.category]?.hex : '#2196F3',
      countdownMin: 15,
    };
  }, [userRole, t]);

  // Action pills per role
  const { pillsMobile, pillsTablet } = useMemo(() => {
    if (userRole === 'patient') {
      const mobileItems = [
        { id: 'conquistas', icon: Award, label: t('nav.achievements') },
        { id: 'loja', icon: ShoppingBag, label: t('nav.rewardsStore') },
        { id: 'convidar', icon: Gift, label: t('nav.invite') },
        { id: 'pesquisa', icon: Search, label: t('nav.search') },
        { id: 'faturacao', icon: BarChart3, label: t('nav.billing', 'Faturação') },
        { id: 'saude', icon: Heart, label: t('nav.health') },
      ];
      const tabletItems = [
        { id: 'saude', icon: Heart, label: t('nav.health') },
        { id: 'conquistas', icon: Award, label: t('nav.achievements') },
        { id: 'loja', icon: ShoppingBag, label: t('nav.rewardsStore') },
        { id: 'convidar', icon: Gift, label: t('nav.invite') },
        { id: 'pesquisa', icon: Search, label: t('nav.search') },
        { id: 'faturacao', icon: BarChart3, label: t('nav.billing', 'Faturação') },
      ];
      return { pillsMobile: mobileItems, pillsTablet: tabletItems };
    }
    const items = [
      { id: 'equipa', icon: Users, label: t('nav.team') },
      { id: 'estatisticas', icon: BarChart3, label: t('nav.statistics') },
      { id: 'conquistas', icon: Award, label: t('nav.achievements') },
      { id: 'loja', icon: ShoppingBag, label: t('nav.rewardsStore') },
      { id: 'convidar', icon: Gift, label: t('nav.invite') },
      { id: 'pesquisa', icon: Search, label: t('nav.search') },
    ];
    return { pillsMobile: items, pillsTablet: items };
  }, [userRole, t]);

  const onPillClick = (id: string) => onNavigate(id);

  return (
    <div className="lg:hidden -mx-4 px-4 md:px-6 space-y-3">
      {/* === Hero: Next appointment (mobile only) === */}
      {next ? (
        <div className="md:hidden">
        <p className="text-[11px] text-muted-foreground mb-1.5 mt-4 px-0.5 uppercase tracking-[0.5px]">
          {t('dashboard.nextConsultation')}
        </p>
        <button
          onClick={() => onNavigate(`consulta-detalhe:${next.id}`)}
          className="proxima-consulta-card relative w-full flex items-stretch bg-card border border-border rounded-[10px] overflow-hidden text-left min-h-[80px] p-3 hover:bg-muted/40 transition-colors"
          style={{ '--consultation-type-color': next.catColor } as CSSProperties}
        >
          <span aria-hidden className="absolute left-0 top-0 bottom-0 w-1 pointer-events-none" style={{ backgroundColor: next.catColor }} />
          <div className="flex-1 min-w-0 pl-2 flex flex-col justify-center gap-1">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-[13px] font-bold text-foreground tabular-nums flex-shrink-0">
                {next.time}
              </span>
              <span className="text-[13px] text-foreground truncate min-w-0">
                · {next.name}
              </span>
            </div>
            {next.category && (
              <ConsultationTypePill category={next.category as ConsultationCategory} className="self-start" />
            )}
          </div>
          <div className="flex items-center pr-3 flex-shrink-0">
            {next.countdownMin === 0 ? (
              <span className="px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-500 text-[11px] font-bold animate-pulse">
                AGORA
              </span>
            ) : (
              <span className="px-2 py-1 rounded-full bg-blue-500/15 text-blue-400 text-[11px] font-semibold whitespace-nowrap">
                em {next.countdownMin} min
              </span>
            )}
          </div>
        </button>
        </div>
      ) : (
        <div className="md:hidden w-full h-[64px] flex items-center justify-center bg-muted/30 border border-border rounded-xl text-[13px] text-muted-foreground">
          {t('dashboard.noConsultations')}
        </div>
      )}

      {/* === Hero: Next appointment (TABLET only — merged single-row card) === */}
      {next ? (
        <div className="hidden md:block lg:hidden">
          <p className="text-[11px] text-muted-foreground mb-1.5 px-0.5">
            {t('dashboard.nextConsultation')}
          </p>
          <button
            onClick={() => onNavigate(`consulta-detalhe:${next.id}`)}
            className="proxima-consulta-card relative w-full flex items-stretch bg-card border border-border rounded-2xl overflow-hidden text-left h-[60px] hover:bg-muted/40 transition-colors shadow-sm card-hover-lift"
            style={{ '--consultation-type-color': next.catColor } as CSSProperties}
          >
            <span aria-hidden className="absolute left-0 top-0 bottom-0 w-1 pointer-events-none" style={{ backgroundColor: next.catColor }} />
            <div className="flex-1 min-w-0 px-4 flex items-center gap-3">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="text-[15px] font-bold text-foreground tabular-nums flex-shrink-0">
                  {next.time}
                </span>
                <span className="text-[15px] font-bold text-foreground truncate min-w-0">
                  · {next.name}
                </span>
              </div>
              {next.category && (
                <ConsultationTypePill
                  category={next.category as ConsultationCategory}
                  className="flex-shrink-0"
                />
              )}
              <div className="flex-shrink-0">
                {next.countdownMin === 0 ? (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-500 text-[11px] font-bold animate-pulse">
                    AGORA
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold whitespace-nowrap">
                    em {next.countdownMin} min
                  </span>
                )}
              </div>
            </div>
          </button>
        </div>
      ) : null}

      {/* === Stat cards (MOBILE only) — 3 compact cards === */}
      <div className="md:hidden grid grid-cols-3 gap-1.5">
        <button
          onClick={() => onNavigate('pontuacoes')}
          className="bg-card border border-border rounded-xl p-2 text-left flex flex-col gap-1 min-h-[60px] active:bg-muted/40 transition-colors"
        >
          <span className="text-[11px] text-muted-foreground leading-none">{t('scores.levelXp', 'Nível e XP')}</span>
          <div className="flex items-center gap-1 min-w-0">
            <LevelIcon levelKey={level.key} size={14} />
            <span className="text-[12px] font-bold text-foreground truncate">
              {t(LEVEL_TRANSLATION_KEYS[level.key] || level.name)}
            </span>
          </div>
          <div className="w-full h-1 rounded-full bg-[#E2E8F0] dark:bg-[#1E3A5F] overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-1000 ease-out',
                LEVEL_ICON_MAP[level.key]?.colorClass.replace('text-', 'bg-') || 'bg-primary'
              )}
              style={{ width: `${xpProgress.percent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground tabular-nums leading-none">
            <span>{points.xp} XP</span>
            <span>×{multiplier.toFixed(1)}</span>
          </div>
        </button>
        <button
          onClick={() => onNavigate('pontuacoes')}
          className="bg-card border border-border rounded-xl p-2 text-left flex flex-col gap-1 min-h-[60px] active:bg-muted/40 transition-colors"
        >
          <span className="text-[11px] text-muted-foreground leading-none">{t('scores.points', 'Pontos')}</span>
          <div className="flex items-center gap-1 flex-1">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 flex-shrink-0" />
            <span className="text-[12px] font-bold text-foreground tabular-nums truncate">
              {points.rewardPoints} pts
            </span>
          </div>
        </button>
        <button
          onClick={() => onNavigate('pontuacoes')}
          className="bg-card border border-border rounded-xl p-2 text-left flex flex-col gap-1 min-h-[60px] active:bg-muted/40 transition-colors"
        >
          <span className="text-[11px] text-muted-foreground leading-none">Streak</span>
          <div className="flex items-center gap-1 flex-1">
            <Flame className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
            <span className="text-[12px] font-bold text-foreground tabular-nums truncate">
              {points.streak} {t('scores.days')}
            </span>
          </div>
        </button>
      </div>

      {/* === Stat cards (TABLET only) — 3 cards === */}
      <div className="hidden md:grid lg:hidden grid-cols-3 gap-3">
        <button
          onClick={() => onNavigate('pontuacoes')}
          className="bg-card border border-border rounded-2xl shadow-sm p-3 text-left card-hover-lift hover:border-primary/40 transition-all flex flex-col justify-between min-h-[80px]"
        >
          <span className="text-[11px] text-muted-foreground">{t('scores.levelXp', 'Nível e XP')}</span>
          <div className="flex flex-col gap-1.5 min-w-0 flex-1 justify-center">
            <div className="flex items-center min-w-0">
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                <LevelIcon levelKey={level.key} size={25} />
                <span className="text-[20px] font-bold text-foreground truncate">
                  {t(LEVEL_TRANSLATION_KEYS[level.key] || level.name)}
                </span>
              </div>
              <span className="text-[13px] text-muted-foreground tabular-nums flex-shrink-0 mx-2">{points.xp} XP</span>
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
        </button>
        <button
          onClick={() => onNavigate('pontuacoes')}
          className="bg-card border border-border rounded-2xl shadow-sm p-3 text-left card-hover-lift hover:border-primary/40 transition-all flex flex-col justify-between min-h-[80px]"
        >
          <span className="text-[11px] text-muted-foreground">{t('scores.points', 'Pontos')}</span>
          <div className="flex items-center gap-1.5">
            <Star className="w-[18px] h-[18px] text-amber-500 fill-amber-500" />
            <span className="text-[16px] font-bold text-foreground tabular-nums">
              {points.rewardPoints} pts
            </span>
          </div>
          <span className="text-[11px] text-muted-foreground">{t('nav.scores')}</span>
        </button>
        <button
          onClick={() => onNavigate('pontuacoes')}
          className="bg-card border border-border rounded-2xl shadow-sm p-3 text-left card-hover-lift hover:border-primary/40 transition-all flex flex-col justify-between min-h-[80px]"
        >
          <span className="text-[11px] text-muted-foreground">Streak</span>
          <div className="flex items-center gap-1.5">
            <Flame className="w-[18px] h-[18px] text-orange-500" />
            <span className="text-[16px] font-bold text-foreground tabular-nums">
              {points.streak} {t('scores.days')}
            </span>
          </div>
          <span className="text-[11px] text-muted-foreground">{t('scores.bestStreak')}: {points.bestStreak}</span>
        </button>
      </div>

      {/* === Action pills grid (mobile: 3x2) — card-styled to match stat cards === */}
      <div className="grid grid-cols-3 gap-1.5 md:hidden">
        {pillsMobile.map((p) => {
          const Icon = p.icon;
          const shortLabel = p.id === 'loja' ? t('nav.rewards', 'Recompensas') : p.label;
          return (
            <button
              key={p.id}
              onClick={() => onPillClick(p.id)}
              className={cn(
                'flex flex-col items-center justify-center gap-1 h-12 rounded-xl px-1',
                'bg-card border border-border text-foreground',
                'active:bg-muted/40 transition-colors',
              )}
            >
              <Icon className="w-4 h-4 text-[#2196F3] flex-shrink-0" />
              <span className="text-[11px] font-medium leading-none truncate max-w-full px-1">{shortLabel}</span>
            </button>
          );
        })}
      </div>

      {/* === Action pills grid (tablet: 3x2) — card-styled === */}
      <div className="hidden md:grid lg:hidden grid-cols-3 gap-3">
        {pillsTablet.map((p) => {
          const Icon = p.icon;
          return (
            <button
              key={p.id}
              onClick={() => onPillClick(p.id)}
              className={cn(
                'flex flex-col items-center justify-center gap-1.5 h-14 rounded-2xl px-2',
                'bg-card border border-border text-foreground shadow-sm',
                'card-hover-lift hover:border-primary/40 transition-all group',
              )}
            >
              <Icon className="w-5 h-5 text-[#2196F3] flex-shrink-0" />
              <span className="text-[11px] font-medium leading-none text-foreground text-center max-w-full truncate">{p.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}