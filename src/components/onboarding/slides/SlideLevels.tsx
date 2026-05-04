import { useTranslation } from 'react-i18next';
import { LevelIcon } from '@/components/level/LevelIcon';

interface SlideLevelsProps { isActive: boolean; }

const levelsData = [
  { levelKey: 'lata',       nameKey: 'can',        range: '0-99 pts',     color: 'text-level-can',     bgColor: 'bg-level-can/20',     borderColor: 'border-level-can/40' },
  { levelKey: 'bronze',     nameKey: 'bronze',     range: '100-249 pts',  color: 'text-level-bronze',  bgColor: 'bg-level-bronze/20',  borderColor: 'border-level-bronze/40' },
  { levelKey: 'prata',      nameKey: 'silver',     range: '250-499 pts',  color: 'text-level-silver',  bgColor: 'bg-level-silver/20',  borderColor: 'border-level-silver/40' },
  { levelKey: 'ouro',       nameKey: 'gold',       range: '500-999 pts',  color: 'text-level-gold',    bgColor: 'bg-level-gold/20',    borderColor: 'border-level-gold/40' },
  { levelKey: 'platina',    nameKey: 'platinum',   range: '1000-1999 pts',color: 'text-white',         bgColor: 'bg-white/20',         borderColor: 'border-white/40' },
  { levelKey: 'diamante',   nameKey: 'diamond',    range: '2000-4999 pts',color: 'text-level-diamond', bgColor: 'bg-level-diamond/20', borderColor: 'border-level-diamond/40' },
  { levelKey: 'adamantino', nameKey: 'adamantine', range: '5000+ pts',    color: 'text-red-500',       bgColor: 'bg-red-500/20',       borderColor: 'border-red-500/40' },
];

export const SlideLevels = ({ isActive }: SlideLevelsProps) => {
  const { t } = useTranslation();

  return (
    <div className="h-full flex flex-col items-center justify-center px-6">
      <h2 className="font-gaming text-2xl md:text-3xl text-gaming-gold mb-6 flex items-center gap-2">
        {t('onboarding.levelsTitle')}
      </h2>
      <div className="glass-card p-4 w-full max-w-sm space-y-2">
        {levelsData.map((level, index) => (
          <div key={index} className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-300 ${level.bgColor} ${level.borderColor}`}>
            <div className="flex items-center gap-3">
              <LevelIcon levelKey={level.levelKey} size={24} />
              <span className={`font-bold ${level.color}`}>{t(`onboarding.levels.${level.nameKey}`)}</span>
            </div>
            <span className="text-muted-foreground text-sm font-medium">{level.range}</span>
          </div>
        ))}
      </div>
      <p className="mt-6 text-muted-foreground text-center max-w-xs">
        {t('onboarding.levelsBottom')} <span className="text-gaming-gold font-semibold">{t('onboarding.levelsBottomHighlight')}</span>
      </p>
    </div>
  );
};