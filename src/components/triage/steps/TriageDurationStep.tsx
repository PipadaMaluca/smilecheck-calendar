import { TRIAGE_DURATIONS } from '@/types/triage';
import { cn } from '@/lib/utils';

interface TriageDurationStepProps {
  selectedDuration: string;
  onDurationChange: (duration: string) => void;
}

export function TriageDurationStep({
  selectedDuration,
  onDurationChange,
}: TriageDurationStepProps) {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-foreground">
          Há quanto tempo sente isto?
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Selecione a opção mais adequada
        </p>
      </div>

      {/* Duration options */}
      <div className="space-y-3">
        {TRIAGE_DURATIONS.map((duration) => {
          const isSelected = selectedDuration === duration.id;
          
          return (
            <button
              key={duration.id}
              onClick={() => onDurationChange(duration.id)}
              className={cn(
                'w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left',
                isSelected
                  ? 'bg-primary/20 border-primary'
                  : 'bg-[#1E3A5F] border-[#1E3A5F] hover:border-primary/50'
              )}
            >
              {/* Radio indicator */}
              <div
                className={cn(
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                  isSelected
                    ? 'border-primary bg-primary'
                    : 'border-muted-foreground'
                )}
              >
                {isSelected && (
                  <div className="w-2 h-2 rounded-full bg-white" />
                )}
              </div>

              <span className="text-lg">{duration.icon}</span>
              <span className="text-sm font-medium text-foreground">
                {duration.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
