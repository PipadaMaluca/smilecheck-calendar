import { Check, Square, PartyPopper } from 'lucide-react';
import { Glyph } from '@/components/ui/glyph';
import { UserRole } from '@/types/calendar';
import { useTranslation } from 'react-i18next';

interface SlideStartProps { isActive: boolean; userRole: UserRole; onComplete: () => void; }

export const SlideStart = ({ isActive, userRole, onComplete }: SlideStartProps) => {
  const { t } = useTranslation();
  const roleKey = userRole === 'patient' ? 'patient' : userRole === 'dentist' ? 'dentist' : 'clinic';

  const title = t(`onboarding.${roleKey}.startTitle`);
  const bonus = t(`onboarding.${roleKey}.startBonus`);
  const bonusPoints = userRole === 'clinic' ? 10 : 5;
  const steps = [
    { label: t(`onboarding.${roleKey}.startStep1`), points: userRole === 'clinic' ? '+10 pts' : userRole === 'dentist' ? '+5 pts' : '+3 pts' },
    { label: t(`onboarding.${roleKey}.startStep2`), points: '+10 pts' },
    { label: t(`onboarding.${roleKey}.startStep3`), points: userRole === 'patient' ? '+10 pts' : userRole === 'dentist' ? '+3 pts' : '+5 pts' },
  ];

  const maxPoints = 100;
  const progressPercentage = (bonusPoints / maxPoints) * 100;

  return (
    <div className="h-full flex flex-col items-center justify-center px-6">
      <div className={"mb-6"}>
        <div className="w-24 h-24 rounded-full flex items-center justify-center glow-gold" style={{ background: 'linear-gradient(135deg, hsla(45, 100%, 50%, 0.2), hsla(162, 100%, 43%, 0.1))' }}>
          <Glyph emoji="🚀" className="w-14 h-14" />
        </div>
      </div>

      <h2 className="font-gaming text-3xl md:text-4xl text-foreground mb-4">{title}</h2>

      <div className="flex items-center gap-2 mb-6 px-4 py-2 rounded-full border" style={{ backgroundColor: 'hsla(162, 100%, 43%, 0.2)', borderColor: 'hsla(162, 100%, 43%, 0.4)' }}>
        <Check className="w-5 h-5 text-gaming-green" />
        <span className="text-foreground font-medium">{bonus}</span>
      </div>

      <div className="glass-card p-5 w-full max-w-sm mb-6">
        <p className="text-muted-foreground text-sm mb-4">{t('onboarding.nextSteps')}</p>
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer press">
              <div className="flex items-center gap-3">
                <Square className="w-5 h-5 text-muted-foreground" />
                <span className="text-foreground/80">{step.label}</span>
              </div>
              <span className="text-gaming-green font-bold text-sm">{step.points}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card p-4 w-full max-w-sm mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Glyph emoji="🥫" className="w-6 h-6" />
            <span className="text-foreground font-medium">{t('onboarding.levels.can')}</span>
          </div>
          <span className="text-muted-foreground text-sm">{bonusPoints}/{maxPoints} pts</span>
        </div>
        <div className="h-3 bg-secondary/50 rounded-full overflow-hidden mb-2">
          <div className="h-full rounded-full transition-colors duration-300 glow-green"
            style={{ width: `${progressPercentage}%`, background: 'linear-gradient(to right, hsl(162, 100%, 43%), hsla(162, 100%, 43%, 0.7))' }} />
        </div>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <span>{t('onboarding.nextLevel')}</span>
          <Glyph emoji="🥉" className="w-6 h-6" />
          <span className="text-level-bronze font-medium">{t('onboarding.levels.bronze')}</span>
        </div>
      </div>

      <button onClick={onComplete} className="btn-gaming-gold flex items-center gap-3 px-10 py-4 rounded-2xl text-lg glow-gold">
        <PartyPopper className="w-6 h-6" />
        <span className="font-gaming">{t('onboarding.start')}</span>
      </button>
    </div>
  );
};