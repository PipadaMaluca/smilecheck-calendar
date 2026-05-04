import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { LEVELS, LEVEL_REWARDS, LEVEL_TRANSLATION_KEYS } from '@/data/pointsData';
import { LevelIcon } from '@/components/level/LevelIcon';

interface LevelUpCelebrationProps {
  levelKey: string;
  onDismiss: () => void;
}

/** Full-screen celebration overlay for a one-time level-up. Respects prefers-reduced-motion. */
export function LevelUpCelebration({ levelKey, onDismiss }: LevelUpCelebrationProps) {
  const { t } = useTranslation();
  const level = LEVELS.find(l => l.key === levelKey);
  const reward = LEVEL_REWARDS[levelKey];
  if (!level || !reward) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
    >
      <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center space-y-4">
        <div className="flex justify-center">
          <LevelIcon levelKey={level.key} size={64} />
        </div>
        <h2 className="text-2xl font-bold text-foreground">{t('level.celebration.congrats')}</h2>
        <p className="text-base text-muted-foreground">
          {t('level.celebration.reachedLevel', { level: t(LEVEL_TRANSLATION_KEYS[level.key] || level.name) })}
        </p>
        <div className="rounded-lg bg-muted/40 p-3 text-sm text-foreground space-y-1.5 text-left">
          <p>{t('level.celebration.exclusiveBadge')}: <span className="font-semibold">{reward.badgeName}</span></p>
          <p>{t('level.celebration.bonusPoints', { n: reward.bonusPoints })}</p>
          <p>{t('level.celebration.newFrame')}</p>
        </div>
        <Button onClick={onDismiss} className="w-full">{t('common.continue')}</Button>
      </div>
    </div>
  );
}