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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { LevelIcon } from '@/components/level/LevelIcon';
import { UserRole, CATEGORY_COLORS, getCategoryLabel, getCategoryBadgeStyle } from '@/types/calendar';
import { mockConsultations, mockDentists, mockPatientConsultations } from '@/data/mockData';
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
      catLabel: cons.category ? getCategoryLabel(t, cons.category) : cons.type,
      catColor: cons.category ? CATEGORY_COLORS[cons.category]?.hex : '#2196F3',
      countdownMin: 15,
    };
  }, [userRole, t]);

  // Action pills per role
  const pills = useMemo(() => {
    if (userRole === 'patient') {
      return [
        { id: 'agenda', icon: Calendar, label: t('nav.consultations') },
        { id: 'saude', icon: Heart, label: t('nav.health') },
        { id: 'pesquisa', icon: Search, label: t('nav.search') },
        { id: 'loja', icon: ShoppingBag, label: t('nav.rewardsStore') },
        { id: 'conquistas', icon: Award, label: t('nav.achievements') },
        { id: 'pontuacoes', icon: Star, label: t('nav.scores') },
      ];
    }
    return [
      { id: 'agenda', icon: Calendar, label: t('nav.agenda') },
      { id: 'equipa', icon: Users, label: t('nav.team') },
      { id: 'estatisticas', icon: BarChart3, label: t('nav.statistics') },
      { id: 'conversas', icon: MessageCircle, label: t('nav.chat') },
      { id: 'conquistas', icon: Award, label: t('nav.achievements') },
      { id: 'loja', icon: ShoppingBag, label: t('nav.rewardsStore') },
      { id: 'configuracoes', icon: Settings, label: t('nav.settingsFull') },
    ];
  }, [userRole, t]);

  const onPillClick = (id: string) => onNavigate(id);

  return (
    <div className="md:hidden -mx-4 px-4 space-y-3">
      {/* === Hero: Next appointment === */}
      {next ? (
        <button
          onClick={() => onNavigate(`consulta-detalhe:${next.id}`)}
          className="w-full flex items-stretch bg-card border border-border rounded-xl overflow-hidden text-left h-[80px] hover:bg-muted/40 transition-colors"
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
            {next.catLabel && (
              <span
                className="self-start text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                style={getCategoryBadgeStyle(next.catColor)}
              >
                {next.catLabel}
              </span>
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
        <div className="w-full h-[64px] flex items-center justify-center bg-muted/30 border border-border rounded-xl text-[13px] text-muted-foreground">
          {t('dashboard.noConsultations')}
        </div>
      )}

      {/* === Stat strip === */}
      <div className="flex items-center justify-between bg-[#F0F7FF] dark:bg-[#0D2137] rounded-lg h-9 px-3 text-[11px] font-medium">
        <button
          onClick={() => onNavigate('pontuacoes')}
          className="flex items-center gap-1 min-w-0 flex-1 justify-center"
        >
          <LevelIcon levelKey={level.key} size={14} />
          <span className="truncate">{t(LEVEL_TRANSLATION_KEYS[level.key] || level.name)}</span>
        </button>
        <span className="w-px h-4 bg-border mx-1" />
        <button
          onClick={() => onNavigate('loja')}
          className="flex items-center gap-1 flex-1 justify-center text-amber-500"
        >
          <Star className="w-3.5 h-3.5 fill-current" />
          <span className="tabular-nums">{points.rewardPoints}</span>
        </button>
        <span className="w-px h-4 bg-border mx-1" />
        <button
          onClick={() => onNavigate('pontuacoes')}
          className="flex items-center gap-1 flex-1 justify-center text-orange-500"
        >
          <Flame className="w-3.5 h-3.5" />
          <span className="tabular-nums">{points.streak}</span>
        </button>
        <span className="w-px h-4 bg-border mx-1" />
        <button
          onClick={() => onNavigate('pontuacoes')}
          className="flex items-center gap-1 flex-1 justify-center text-foreground"
        >
          <span className="tabular-nums">×{multiplier.toFixed(1)}</span>
        </button>
      </div>

      {/* === Action pills row === */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-1">
        {pills.map((p) => {
          const Icon = p.icon;
          return (
            <button
              key={p.id}
              onClick={() => onPillClick(p.id)}
              className={cn(
                'flex items-center gap-1.5 h-9 px-3 rounded-full whitespace-nowrap flex-shrink-0',
                'bg-[#EBF4FF] dark:bg-[#1E3A5F] text-foreground text-[11px] font-medium',
                'hover:bg-[#D6E4F5] dark:hover:bg-[#2A4A6F] transition-colors',
              )}
            >
              <Icon className="w-3.5 h-3.5 text-[#2196F3]" />
              {p.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}