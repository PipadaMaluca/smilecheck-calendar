import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface TriageHeaderProps {
  currentStep: number;
  totalSteps: number;
}

export function TriageHeader({ currentStep, totalSteps }: TriageHeaderProps) {
  const progressPercent = (currentStep / totalSteps) * 100;

  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="text-center">
        <h1 className="text-xl font-bold text-foreground">Triagem</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Passo {currentStep} de {totalSteps}
        </p>
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <Progress value={progressPercent} className="h-2 bg-[#1E3A5F]" />
        
        {/* Step indicators */}
        <div className="flex items-center justify-between px-2">
          <span className="text-xs text-muted-foreground">
            Passo {currentStep} de {totalSteps}
          </span>
          
          {/* Dots */}
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
