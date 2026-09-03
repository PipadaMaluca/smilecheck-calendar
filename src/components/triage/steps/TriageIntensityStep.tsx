import { useTranslation } from 'react-i18next';
import { Glyph } from '@/components/ui/glyph';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface TriageIntensityStepProps {
  painIntensity: number;
  isRoutineCheckup: boolean;
  onIntensityChange: (intensity: number) => void;
  onRoutineChange: (isRoutine: boolean) => void;
}

const PAIN_EMOJIS = ['😊', '🙂', '😐', '😕', '😣', '😖', '😩', '😫', '😵', '🤯', '💀'];

const getIntensityColor = (value: number) => {
  if (value <= 3) return 'text-green-500';
  if (value <= 6) return 'text-yellow-500';
  return 'text-red-500';
};

export function TriageIntensityStep({
  painIntensity,
  isRoutineCheckup,
  onIntensityChange,
  onRoutineChange,
}: TriageIntensityStepProps) {
  const { t } = useTranslation();

  const handleRoutineToggle = (checked: boolean) => {
    onRoutineChange(checked);
    if (checked) onIntensityChange(0);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-foreground">{t('triage.intensity.title')}</h2>
        <p className="text-sm text-muted-foreground mt-1">{t('triage.intensity.scale')}</p>
      </div>

      <div className={cn('space-y-6', isRoutineCheckup && 'opacity-40 pointer-events-none')}>
        <div className="text-center">
          <span className="text-6xl">{PAIN_EMOJIS[painIntensity]}</span>
          <p className={cn('text-3xl font-bold mt-2', getIntensityColor(painIntensity))}>
            {painIntensity}
          </p>
        </div>

        <div className="px-4">
          <Slider
            value={[painIntensity]}
            onValueChange={([value]) => onIntensityChange(value)}
            max={10}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between mt-2">
            {Array.from({ length: 11 }).map((_, i) => (
              <span
                key={i}
                className={cn(
                  'text-xs w-5 text-center',
                  i === painIntensity ? 'text-foreground font-bold' : 'text-muted-foreground'
                )}
              >
                {i}
              </span>
            ))}
          </div>
        </div>

        <div className="relative h-4 rounded-full overflow-hidden bg-gradient-to-r from-green-500 via-yellow-500 to-red-500">
          <div
            className="absolute top-0 left-0 h-full bg-[#0A1929]/80 transition-all"
            style={{ left: `${painIntensity * 10}%`, right: 0 }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg border-2 border-primary transition-all"
            style={{ left: `calc(${painIntensity * 10}% - 8px)` }}
          />
        </div>

        <div className="flex justify-between px-2">
          <Glyph emoji="😊" className="w-7 h-7" />
          <Glyph emoji="😐" className="w-7 h-7" />
          <Glyph emoji="😣" className="w-7 h-7" />
          <Glyph emoji="😫" className="w-7 h-7" />
        </div>
      </div>

      <div
        className="flex items-center gap-3 p-4 bg-[#1E3A5F] rounded-xl cursor-pointer"
        onClick={() => handleRoutineToggle(!isRoutineCheckup)}
      >
        <Checkbox
          checked={isRoutineCheckup}
          onCheckedChange={handleRoutineToggle}
          className="border-muted-foreground data-[state=checked]:bg-primary data-[state=checked]:border-primary"
        />
        <span className="text-sm text-foreground">{t('triage.intensity.routineCheckup')}</span>
      </div>
    </div>
  );
}
