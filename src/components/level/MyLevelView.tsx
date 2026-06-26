import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Lock, Check } from 'lucide-react';
import { LevelIcon } from '@/components/level/LevelIcon';
import { cn } from '@/lib/utils';
import { UserRole } from '@/types/calendar';
import {
  LEVELS, LEVEL_TRANSLATION_KEYS, LEVEL_MULTIPLIERS, LEVEL_REWARDS,
  LEVEL_UNLOCKS, USER_POINTS, getLevelForXP, getXPProgress, getVisibilityBoost, MAX_XP,
} from '@/data/pointsData';

interface MyLevelViewProps {
  userRole: UserRole;
}

export function MyLevelView({ userRole }: MyLevelViewProps) {
  const { t } = useTranslation();
  const data = USER_POINTS[userRole];
  const current = getLevelForXP(data.xp);
  const progress = getXPProgress(data.xp);
  const boost = getVisibilityBoost(current.key, data.plan);
  const multiplier = LEVEL_MULTIPLIERS[current.key];

  return (
    <div className="space-y-5">
      {/* Current state */}
      <Card>
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center gap-4">
            <LevelIcon levelKey={current.key} size={48} />
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-foreground">
                {t(LEVEL_TRANSLATION_KEYS[current.key])}
              </h2>
              <p className="text-sm text-muted-foreground">
                {data.xp.toLocaleString()} / {MAX_XP.toLocaleString()} XP · ×{multiplier.toFixed(1)} {t('level.multiplier')}
              </p>
            </div>
            <Badge variant="secondary" className="shrink-0">⚡ +{boost}%</Badge>
          </div>
          <Progress value={progress.percent} className="h-3" />
        </CardContent>
      </Card>

      {/* All levels timeline */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-foreground">{t('level.allLevels')}</h3>
        {LEVELS.map(lvl => {
          const unlocked = data.xp >= lvl.minXP;
          const isCurrent = lvl.key === current.key;
          const unlocks = LEVEL_UNLOCKS[userRole][lvl.key] || [];
          const reward = LEVEL_REWARDS[lvl.key];
          return (
            <Card key={lvl.key} className={cn(isCurrent && 'border-primary')}>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-3">
                  <LevelIcon levelKey={lvl.key} size={28} className={cn(!unlocked && 'opacity-40 grayscale')} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-foreground">{t(LEVEL_TRANSLATION_KEYS[lvl.key])}</h4>
                      <span className="text-xs text-muted-foreground">{lvl.minXP.toLocaleString()} XP</span>
                      <Badge variant="outline" className="text-[11px]">×{LEVEL_MULTIPLIERS[lvl.key].toFixed(1)}</Badge>
                      {isCurrent && <Badge className="text-[11px]">{t('level.current')}</Badge>}
                    </div>
                    {reward && (
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {t('level.celebration.bonusPoints', { n: reward.bonusPoints })} · {reward.badgeName}
                      </p>
                    )}
                  </div>
                </div>
                <ul className="text-xs space-y-1 pl-1">
                  {unlocks.map(u => (
                    <li key={u.key} className="flex items-start gap-2">
                      {unlocked
                        ? <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                        : <Lock className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />}
                      <span className={cn(unlocked ? 'text-foreground' : 'text-muted-foreground')}>
                        {t(`level.unlocks.${userRole}.${u.key}`)}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}