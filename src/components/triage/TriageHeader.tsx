import { useTranslation } from 'react-i18next';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface TriageHeaderProps {
  currentStep: number;
  totalSteps: number;
}

export function TriageHeader({ currentStep, totalSteps }: TriageHeaderProps) {
  const { t } = useTranslation();
  const progressPercent = (currentStep / totalSteps) * 100;

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h1 className="text-xl font-bold text-foreground">{t('triage.title')}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t('triage.step', { current: currentStep, total: totalSteps })}
        </p>
      </div>

      <div className="space-y-2">
        <Progress value={progressPercent} className="h-2 bg-[#1E3A5F]" />
        <div className="flex items-center justify-between px-2">
          <span className="text-xs text-muted-foreground">
            {t('triage.step', { current: currentStep, total: totalSteps })}
          </span>
          <div className="flex gap-2">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div
                key={index}
                className={cn(
                  'w-2 h-2 rounded-full transition-colors',
                  index < currentStep
                    ? 'bg-primary'
                    : index === currentStep
                    ? 'bg-primary/50'
                    : 'bg-[#1E3A5F]'
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
