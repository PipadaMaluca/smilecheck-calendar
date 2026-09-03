import { useState } from 'react';
import { Glyph } from '@/components/ui/glyph';
import { CoachMark } from '@/components/onboarding/CoachMark';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserRole } from '@/types/calendar';
import { getLevelForXP, getXPProgress, LEVELS, getEarnActionsForRole, getPenaltyActionsForRole, LEVEL_TRANSLATION_KEYS, LEVEL_MULTIPLIERS, getVisibilityBoost } from '@/data/pointsData';
import { usePointsData } from '@/data/pointsSource';
import { StatsSkeleton } from '@/components/skeletons';
import { format, isSameDay, isAfter, subWeeks, startOfMonth } from 'date-fns';
import { pt } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { LevelIcon } from '@/components/level/LevelIcon';

interface PontosTabProps {
  userRole: UserRole;
  onNavigate?: (tab: string) => void;
}

const DEMO_DATE = new Date(2026, 0, 31);

export function PontosTab({ userRole, onNavigate }: PontosTabProps) {
  const data = usePointsData(userRole);
  const level = getLevelForXP(data.xp);
  const xpProgress = getXPProgress(data.xp);
  const [historyFilter, setHistoryFilter] = useState<'todos' | 'ganhos' | 'perdidos'>('todos');
  const [periodFilter, setPeriodFilter] = useState<'hoje' | 'semana' | 'mes' | 'tudo'>('tudo');
  const { t } = useTranslation();

  const earnActions = getEarnActionsForRole(userRole);
  const penaltyActions = getPenaltyActionsForRole(userRole);
  const pointsHistory = data.history;
  const multiplier = LEVEL_MULTIPLIERS[level.key];
  const boost = getVisibilityBoost(level.key, data.plan);

  const planLabel = data.plan === 'free' ? t('scores.planFreeLabel') :
    data.plan === 'pro' ? t('scores.planProLabel') :
    t('scores.planPremiumLabel');

  const filteredHistory = data.loading ? [] : pointsHistory.filter(entry => {
    if (historyFilter === 'ganhos' && entry.points <= 0) return false;
    if (historyFilter === 'perdidos' && entry.points >= 0) return false;
    if (periodFilter === 'hoje' && !isSameDay(entry.date, DEMO_DATE)) return false;
    if (periodFilter === 'semana' && !isAfter(entry.date, subWeeks(DEMO_DATE, 1))) return false;
    if (periodFilter === 'mes' && !isAfter(entry.date, startOfMonth(DEMO_DATE))) return false;
    return true;
  });

  const roleLabel = userRole === 'patient' ? t('scores.patient2x') : userRole === 'dentist' ? t('roles.dentist') : t('roles.clinic');

  if (data.loading) return <StatsSkeleton />;

  return (
    <div className="space-y-6">
      {/* Section A — Nível e Experiência */}
      <Card className="bg-card/80 border-border">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center gap-4">
            <LevelIcon levelKey={level.key} size={48} />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-foreground">{t(LEVEL_TRANSLATION_KEYS[level.key] || level.name)}</h3>
              <p className="text-2xl font-bold text-primary">{data.xp.toLocaleString()} XP</p>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="font-semibold text-primary">×{multiplier.toFixed(1)} {t('level.multiplier')}</span>
                {' · '}
                <span>
<Glyph emoji="⚡" className="inline w-3.5 h-3.5 mr-1 -mt-0.5" />{t('level.visibility')}: +{boost}%</span>
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{data.xp.toLocaleString()} XP</span>
              <span>{xpProgress.target.toLocaleString()} XP</span>
            </div>
            <Progress id="coachmark-xp-bar" value={xpProgress.percent} className="h-3" />
            {xpProgress.nextLevelKey && (
              <p className="text-xs text-muted-foreground">
                {t('scores.missingFor')} <span className="font-bold text-primary">{xpProgress.remaining.toLocaleString()} XP</span> {t('scores.for')} {t(LEVEL_TRANSLATION_KEYS[xpProgress.nextLevelKey] || xpProgress.nextLevelName || '')}
              </p>
            )}
          </div>

          {/* Level path */}
          <div className="flex items-center gap-1 overflow-x-auto pb-2">
            {LEVELS.map((l, i) => {
              const isCurrent = l.key === level.key;
              const isPast = data.xp >= l.minXP && l.key !== level.key;
              return (
                <div key={l.key} className="flex items-center">
                  <div className={cn(
                    'flex flex-col items-center gap-1 px-2 py-1.5 rounded-lg transition-all min-w-[50px]',
                    isCurrent ? `${l.bgColor} ${l.borderColor} border-2` : isPast ? 'opacity-60' : 'opacity-30'
                  )}>
                    <LevelIcon levelKey={l.key} size={20} />
                    <span className={cn('text-[11px] font-bold', isCurrent ? l.color : 'text-muted-foreground')}>{t(LEVEL_TRANSLATION_KEYS[l.key] || l.name)}</span>
                  </div>
                  {i < LEVELS.length - 1 && <div className={cn('w-3 h-0.5 mx-0.5', isPast || isCurrent ? 'bg-primary' : 'bg-muted')} />}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Section B — Pontos de Recompensa */}
      <Card className="bg-card/80 border-border">
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center gap-3">
            <Glyph emoji="⭐" className="w-8 h-8" />
            <div>
              <p className="text-2xl font-bold text-foreground">{data.rewardPoints.toLocaleString()} {t('scores.available')}</p>
              <p className="text-xs text-muted-foreground">{planLabel}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="text-xs" onClick={() => onNavigate?.('loja')}>
            {t('scores.redeemInStore')}
          </Button>
        </CardContent>
      </Card>

      {/* Section C — Como Funciona */}
      <Accordion type="single" collapsible>
        <AccordionItem value="como-funciona">
          <AccordionTrigger className="text-sm font-semibold">
            {t('scores.howItWorks')}
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-foreground mb-2">{t('scores.xpTitle')}</h4>
                <p className="text-xs text-muted-foreground">
                  {t('scores.xpExplanation')}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-foreground mb-2">{t('scores.rewardPointsTitle')}</h4>
                <p className="text-xs text-muted-foreground mb-2">
                  {t('scores.rewardExplanation')}
                </p>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p>• <span className="font-medium">{t('scores.planFree')}</span></p>
                  <p>• <span className="font-medium">{t('scores.planPro')}</span></p>
                  <p>• <span className="font-medium">{t('scores.planPremium')}</span></p>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-bold text-foreground mb-2">{t('scores.howToEarn')} — {roleLabel}</h4>
                <div className="border border-border rounded-lg overflow-x-auto">
                  <div className="grid grid-cols-[1fr_50px_50px] sm:grid-cols-[1fr_60px_60px] gap-0 bg-muted/50 px-2 sm:px-3 py-2 text-[11px] font-semibold text-muted-foreground border-b border-border min-w-[280px]">
                    <span>{t('scores.action')}</span>
                    <span className="text-center">XP</span>
                    <span className="text-center">Pts</span>
                  </div>
                  {earnActions.map((a, i) => (
                    <div key={i} className="grid grid-cols-[1fr_50px_50px] sm:grid-cols-[1fr_60px_60px] gap-0 px-2 sm:px-3 py-1.5 text-xs border-b border-border/50 last:border-0 min-w-[280px]">
                      <span className="text-foreground truncate">{a.action}</span>
                      <span className="text-center text-primary font-medium">+{a.xp}</span>
                      <span className="text-center text-primary font-medium">+{a.points}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-foreground mb-2">{t('scores.penalties')}</h4>
                <div className="border border-border rounded-lg overflow-hidden">
                  <div className="grid grid-cols-[1fr_60px_60px] gap-0 bg-muted/50 px-3 py-2 text-[11px] font-semibold text-muted-foreground border-b border-border">
                    <span>{t('scores.action')}</span>
                    <span className="text-center">XP</span>
                    <span className="text-center">{t('scores.pointsTab')}</span>
                  </div>
                  {penaltyActions.map((a, i) => (
                    <div key={i} className="grid grid-cols-[1fr_60px_60px] gap-0 px-3 py-1.5 text-xs border-b border-border/50 last:border-0">
                      <span className="text-foreground">{a.action}</span>
                      <span className="text-center text-muted-foreground">0</span>
                      <span className="text-center text-destructive font-medium">{a.points}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-muted-foreground mt-2 italic">
                  {t('scores.penaltyNote')}
                </p>
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-bold text-foreground mb-2">{t('scores.antiFraud')}</h4>
                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <p>
<Glyph emoji="📱" className="inline w-3.5 h-3.5 mr-1 -mt-0.5" />{t('scores.antiFraudPhone')}</p>
                  <p>
<Glyph emoji="📊" className="inline w-3.5 h-3.5 mr-1 -mt-0.5" />{t('scores.antiFraudLimit')}</p>
                  <p>
<Glyph emoji="⚖️" className="inline w-3.5 h-3.5 mr-1 -mt-0.5" />{t('scores.antiFraudContest')}</p>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Section D — Histórico de Pontos */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-foreground">{t('scores.pointsHistory')}</h3>
        <div className="flex flex-wrap gap-2">
          <div className="flex gap-1">
            {(['todos', 'ganhos', 'perdidos'] as const).map(f => (
              <Button
                key={f}
                variant={historyFilter === f ? 'default' : 'outline'}
                size="sm"
                className="text-[11px] h-7 px-2.5"
                onClick={() => setHistoryFilter(f)}
              >
                {f === 'todos' ? t('scores.all') : f === 'ganhos' ? t('scores.earned') : t('scores.lost')}
              </Button>
            ))}
          </div>
          <Select value={periodFilter} onValueChange={(v) => setPeriodFilter(v as any)}>
            <SelectTrigger className="w-[130px] h-7 text-[11px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="hoje">{t('scores.today')}</SelectItem>
              <SelectItem value="semana">{t('scores.thisWeek')}</SelectItem>
              <SelectItem value="mes">{t('scores.thisMonth')}</SelectItem>
              <SelectItem value="tudo">{t('scores.everything')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          {filteredHistory.map(entry => {
            const isToday = isSameDay(entry.date, DEMO_DATE);
            const dateLabel = isToday ? t('scores.today') : format(entry.date, "d MMM", { locale: pt });
            return (
              <div key={entry.id} className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-foreground">
                    <span className="text-muted-foreground">{dateLabel}, {entry.time}</span>
                    {' — '}
                    {entry.description}
                    {entry.relatedName && <span className="text-muted-foreground"> ({entry.relatedName})</span>}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {entry.xp > 0 && (
                    <span className="text-[11px] font-bold text-primary">+{entry.xp} XP</span>
                  )}
                  <span className={cn(
                    'text-[11px] font-bold',
                    entry.points > 0 ? 'text-success' : entry.points < 0 ? 'text-destructive' : 'text-muted-foreground'
                  )}>
                    {entry.points > 0 ? '+' : ''}{entry.points} pts
                  </span>
                </div>
              </div>
            );
          })}
          {filteredHistory.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-8">{t('scores.noResults')}</p>
          )}
        </div>
       </div>
      <CoachMark
        id={`scores-${userRole}`}
        targetId="coachmark-xp-bar"
        title={t('coachmarks.scoresTitle')}
        description={t('coachmarks.scoresDesc')}
      />
    </div>
  );
}
