import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

const DURATION_ITEMS = [
  { id: 'menos_24h', icon: '⏰', key: 'triage.duration.lessThan24h' },
  { id: '1_3_dias', icon: '📅', key: 'triage.duration.1to3days' },
  { id: '4_7_dias', icon: '📅', key: 'triage.duration.4to7days' },
  { id: '1_2_semanas', icon: '📅', key: 'triage.duration.1to2weeks' },
  { id: '2_4_semanas', icon: '📅', key: 'triage.duration.2to4weeks' },
  { id: 'mais_1_mes', icon: '📅', key: 'triage.duration.moreThan1month' },
];

interface TriageDurationStepProps {
  selectedDuration: string;
  onDurationChange: (duration: string) => void;
}

export function TriageDurationStep({
  selectedDuration,
  onDurationChange,
}: TriageDurationStepProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-foreground">{t('triage.duration.title')}</h2>
        <p className="text-sm text-muted-foreground mt-1">{t('triage.duration.subtitle')}</p>
      </div>

      <div className="space-y-3">
        {DURATION_ITEMS.map((duration) => {
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
              <div
                className={cn(
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                  isSelected ? 'border-primary bg-primary' : 'border-muted-foreground'
                )}
              >
                {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
              <span className="text-lg">{duration.icon}</span>
              <span className="text-sm font-medium text-foreground">{t(duration.key)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
