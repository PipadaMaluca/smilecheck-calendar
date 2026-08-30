import { useTranslation } from 'react-i18next';
import { Lock, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { UserRole } from '@/types/calendar';
import { LEVEL_TRANSLATION_KEYS, LEVEL_UNLOCKS, USER_POINTS, getLevelForXP, getNextLevel } from '@/data/pointsData';

/** Compact card listing what's unlocked at the user's current level + previewing next level. */
export function NextLevelBenefits({ userRole }: { userRole: UserRole }) {
  const { t } = useTranslation();
  const data = USER_POINTS[userRole];
  const current = getLevelForXP(data.xp);
  const next = getNextLevel(current);
  const currentUnlocks = LEVEL_UNLOCKS[userRole][current.key] || [];
  const nextUnlocks = next ? (LEVEL_UNLOCKS[userRole][next.key] || []) : [];

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div>
          <h4 className="text-sm font-bold text-foreground mb-2 flex items-center gap-1.5">
            <Check className="w-4 h-4 text-emerald-500" />
            {t('level.unlockedAt', { level: t(LEVEL_TRANSLATION_KEYS[current.key]) })}
          </h4>
          <ul className="text-xs text-muted-foreground space-y-1 pl-5 list-disc marker:text-emerald-500">
            {currentUnlocks.map(u => (
              <li key={u.key}>{t(`level.unlocks.${userRole}.${u.key}`)}</li>
            ))}
          </ul>
        </div>
        {next && (
          <div className="pt-2 border-t border-border">
            <h4 className="text-sm font-bold text-foreground mb-2 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-muted-foreground" />
              {t('level.unlocksAt', { level: t(LEVEL_TRANSLATION_KEYS[next.key]) })}
            </h4>
            <ul className="text-xs text-muted-foreground space-y-1 pl-5 list-disc">
              {nextUnlocks.map(u => (
                <li key={u.key}>{t(`level.unlocks.${userRole}.${u.key}`)}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}