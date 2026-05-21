import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const SYMPTOM_ITEMS = [
  { id: 'dor_dente', icon: '🦷', key: 'triage.symptoms.toothache' },
  { id: 'sensibilidade', icon: '🌡️', key: 'triage.symptoms.sensitivity' },
  { id: 'sangramento', icon: '🩸', key: 'triage.symptoms.bleedingGums' },
  { id: 'mau_halito', icon: '😮‍💨', key: 'triage.symptoms.badBreath' },
  { id: 'inchaco', icon: '😣', key: 'triage.symptoms.swelling' },
  { id: 'dente_abanar', icon: '🔄', key: 'triage.symptoms.looseToothLabel' },
  { id: 'dente_partido', icon: '💔', key: 'triage.symptoms.brokenTooth' },
  { id: 'manchas', icon: '🎨', key: 'triage.symptoms.stains' },
  { id: 'outro', icon: '❓', key: 'triage.symptoms.other' },
];

interface TriageSymptomsStepProps {
  selectedSymptoms: string[];
  otherSymptom: string;
  onSymptomsChange: (symptoms: string[]) => void;
  onOtherSymptomChange: (text: string) => void;
}

export function TriageSymptomsStep({
  selectedSymptoms,
  otherSymptom,
  onSymptomsChange,
  onOtherSymptomChange,
}: TriageSymptomsStepProps) {
  const { t } = useTranslation();

  const toggleSymptom = (symptomId: string) => {
    if (selectedSymptoms.includes(symptomId)) {
      onSymptomsChange(selectedSymptoms.filter((s) => s !== symptomId));
    } else {
      onSymptomsChange([...selectedSymptoms, symptomId]);
    }
  };

  const showOtherInput = selectedSymptoms.includes('outro');

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-foreground">{t('triage.symptoms.title')}</h2>
        <p className="text-sm text-muted-foreground mt-1">{t('triage.symptoms.subtitle')}</p>
      </div>

      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}
      >
        {SYMPTOM_ITEMS.map((symptom) => {
          const isSelected = selectedSymptoms.includes(symptom.id);
          return (
            <button
              key={symptom.id}
              onClick={() => toggleSymptom(symptom.id)}
              className={cn(
                'flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all min-h-[80px]',
                isSelected
                  ? 'bg-primary/20 border-primary text-foreground'
                  : 'bg-[#1E3A5F] border-[#1E3A5F] hover:border-primary/50 text-foreground'
              )}
            >
              <span className="text-2xl mb-2">{symptom.icon}</span>
              <span className="text-xs font-medium text-center leading-tight">{t(symptom.key)}</span>
            </button>
          );
        })}
      </div>

      {showOtherInput && (
        <div className="animate-slide-up">
          <Input
            placeholder={t('triage.symptoms.describePlaceholder')}
            value={otherSymptom}
            onChange={(e) => onOtherSymptomChange(e.target.value)}
            className="bg-[#1E3A5F] border-[#1E3A5F] focus:border-primary"
          />
        </div>
      )}
    </div>
  );
}
