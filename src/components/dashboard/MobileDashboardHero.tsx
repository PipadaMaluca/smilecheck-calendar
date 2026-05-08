import { useMemo } from 'react';
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
import { LevelIcon } from '@/components/level/LevelIcon';
import { UserRole, CATEGORY_COLORS, getCategoryLabel, getCategoryBadgeStyle, ConsultationCategory } from '@/types/calendar';
import { ConsultationTypePill } from '@/components/ui/ConsultationTypePill';
import { mockConsultations, mockDentists, mockPatientConsultations } from '@/data/mockData';
import { Card } from '@/components/ui/card';
import { isSameDay } from 'date-fns';
import { USER_POINTS, getLevelForXP, LEVEL_TRANSLATION_KEYS, LEVEL_MULTIPLIERS } from '@/data/pointsData';

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
      const items = [
        { id: 'saude', icon: Heart, label: t('nav.health') },
        { id: 'pontuacoes', icon: Star, label: t('nav.scores') },
        { id: 'conquistas', icon: Award, label: t('nav.achievements') },
        { id: 'loja', icon: ShoppingBag, label: t('nav.rewardsStore') },
        { id: 'convidar', icon: Gift, label: t('nav.invite') },
        { id: 'pesquisa', icon: Search, label: t('nav.search') },
      ];
      return { pillsMobile: items, pillsTablet: items };
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
        <button
          onClick={() => onNavigate(`consulta-detalhe:${next.id}`)}
          className="md:hidden w-full flex items-stretch bg-card border border-border rounded-xl overflow-hidden text-left h-[80px] hover:bg-muted/40 transition-colors"
        >
          <span
            className="w-1 flex-shrink-0"
            style={{ backgroundColor: next.catColor }}
            aria-hidden
          />
          <div className="flex-1 min-w-0 px-3 py-2 flex flex-col justify-center gap-1">
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
              <span className="px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-500 text-[10px] font-bold animate-pulse">
                AGORA
              </span>
            ) : (
              <span className="px-2 py-1 rounded-full bg-blue-500/15 text-blue-400 text-[10px] font-semibold whitespace-nowrap">
                em {next.countdownMin} min
              </span>
            )}
          </div>
        </button>
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
            className="w-full flex items-stretch bg-card border border-border rounded-2xl overflow-hidden text-left h-[60px] hover:bg-muted/40 transition-colors shadow-sm card-hover-lift"
            style={{ borderLeft: `4px solid ${next.catColor}` }}
          >
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

      {/* === Stat strip === */}
      <div className="flex items-center justify-between bg-[#F0F7FF] dark:bg-[#0D2137] rounded-lg h-9 md:h-10 px-2 md:px-3 text-[10px] md:text-[11px] font-medium">
        <button
          onClick={() => onNavigate('pontuacoes')}
          className="flex items-center gap-1 min-w-0 flex-1 justify-center px-1 md:px-2"
        >
          <LevelIcon levelKey={level.key} size={14} />
          <span className="truncate">{t(LEVEL_TRANSLATION_KEYS[level.key] || level.name)}</span>
        </button>
        <span className="w-px h-4 bg-border mx-1" />
        <button
          onClick={() => onNavigate('loja')}
          className="flex items-center gap-1 flex-1 justify-center text-amber-500 px-1 md:px-2"
        >
          <Star className="w-3.5 h-3.5 fill-current" />
          <span className="tabular-nums">{points.rewardPoints}</span>
        </button>
        <span className="w-px h-4 bg-border mx-1" />
        <button
          onClick={() => onNavigate('pontuacoes')}
          className="flex items-center gap-1 flex-1 justify-center text-orange-500 px-1 md:px-2"
        >
          <Flame className="w-3.5 h-3.5" />
          <span className="tabular-nums">{points.streak}</span>
        </button>
        <span className="w-px h-4 bg-border mx-1" />
        <button
          onClick={() => onNavigate('pontuacoes')}
          className="flex items-center gap-1 flex-1 justify-center text-foreground px-1 md:px-2"
        >
          <span className="tabular-nums">×{multiplier.toFixed(1)}</span>
        </button>
      </div>

      {/* === Action pills grid (mobile: 3x2) === */}
      <div className="grid grid-cols-3 gap-1.5 md:hidden">
        {pillsMobile.map((p) => {
          const Icon = p.icon;
          return (
            <button
              key={p.id}
              onClick={() => onPillClick(p.id)}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 h-10 rounded-[10px] px-1',
                'bg-[#EBF4FF] dark:bg-[#1E3A5F] text-foreground',
                'active:bg-[#2196F3] active:text-white transition-colors group',
              )}
            >
              <Icon className="w-4 h-4 text-[#2196F3] group-active:text-white flex-shrink-0" />
              <span className="text-[10px] font-medium leading-none whitespace-nowrap">{p.label}</span>
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
              <span className="text-[11px] font-medium leading-none whitespace-nowrap text-foreground">{p.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}