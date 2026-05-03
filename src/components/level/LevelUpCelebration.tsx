import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { LEVELS, LEVEL_REWARDS, LEVEL_TRANSLATION_KEYS, getLevelForXP } from '@/data/pointsData';

interface LevelUpCelebrationProps {
  levelKey: string;
  onDismiss: () => void;
}

/** Full-screen celebration overlay for a one-time level-up. Respects prefers-reduced-motion. */
export function LevelUpCelebration({ levelKey, onDismiss }: LevelUpCelebrationProps) {
  const { t } = useTranslation();
  const level = LEVELS.find(l => l.key === levelKey);
  const reward = LEVEL_REWARDS[levelKey];
  const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  if (!level || !reward) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
    >
      {!reduced && <ConfettiBurst />}
      <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center space-y-4">
        <div className={reduced ? '' : 'animate-bounce-once'}>
          <span className="text-7xl block" aria-hidden>{level.icon}</span>
        </div>
        <h2 className="text-2xl font-bold text-foreground">{t('level.celebration.congrats')}</h2>
        <p className="text-base text-muted-foreground">
          {t('level.celebration.reachedLevel', { level: t(LEVEL_TRANSLATION_KEYS[level.key] || level.name) })}
        </p>
        <div className="rounded-lg bg-muted/40 p-3 text-sm text-foreground space-y-1.5 text-left">
          <p>🏅 {t('level.celebration.exclusiveBadge')}: <span className="font-semibold">{reward.badgeIcon} {reward.badgeName}</span></p>
          <p>⭐ {t('level.celebration.bonusPoints', { n: reward.bonusPoints })}</p>
          <p>🖼️ {t('level.celebration.newFrame')}</p>
        </div>
        <Button onClick={onDismiss} className="w-full">{t('common.continue')}</Button>
      </div>
    </div>
  );
}

function ConfettiBurst() {
  const [pieces] = useState(() =>
    Array.from({ length: 30 }).map((_, i) => ({
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      hue: Math.floor(Math.random() * 360),
      key: i,
    }))
  );
  useEffect(() => { /* mount only */ }, []);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map(p => (
        <span
          key={p.key}
          className="absolute top-0 w-2 h-2 rounded-sm animate-confetti-fall"
          style={{
            left: `${p.left}%`,
            background: `hsl(${p.hue}, 90%, 60%)`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}