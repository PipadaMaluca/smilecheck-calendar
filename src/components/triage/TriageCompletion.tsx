import { useTranslation } from 'react-i18next';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TriageData } from '@/types/triage';

interface TriageCompletionProps {
  triageData: TriageData;
  onFindDentists: () => void;
}

const SYMPTOM_KEYS: Record<string, string> = {
  dor_dente: 'triage.symptoms.toothache',
  sensibilidade: 'triage.symptoms.sensitivity',
  sangramento: 'triage.symptoms.bleedingGums',
  mau_halito: 'triage.symptoms.badBreath',
  inchaco: 'triage.symptoms.swelling',
  dente_abanar: 'triage.symptoms.looseToothLabel',
  dente_partido: 'triage.symptoms.brokenTooth',
  manchas: 'triage.symptoms.stains',
  outro: 'triage.symptoms.other',
};

const DURATION_KEYS: Record<string, string> = {
  menos_24h: 'triage.duration.lessThan24h',
  '1_3_dias': 'triage.duration.1to3days',
  '4_7_dias': 'triage.duration.4to7days',
  '1_2_semanas': 'triage.duration.1to2weeks',
  '2_4_semanas': 'triage.duration.2to4weeks',
  mais_1_mes: 'triage.duration.moreThan1month',
};

export function TriageCompletion({ triageData, onFindDentists }: TriageCompletionProps) {
  const { t } = useTranslation();

  const selectedSymptomLabels = triageData.symptoms
    .map((id) => SYMPTOM_KEYS[id] ? t(SYMPTOM_KEYS[id]) : id)
    .filter(Boolean);

  const durationLabel = triageData.duration && DURATION_KEYS[triageData.duration]
    ? t(DURATION_KEYS[triageData.duration])
    : '';

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-6 px-4">
      <div className="relative">
        <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center animate-pulse">
          <CheckCircle className="w-14 h-14 text-green-500" />
        </div>
        <div className="absolute inset-0 rounded-full bg-green-500/10 animate-ping" />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-foreground">{t('triage.completed')}</h2>
        <p className="text-muted-foreground">{t('triage.findDentist')}</p>
      </div>

      <div className="w-full max-w-md bg-[#1E3A5F] rounded-xl p-4 text-left space-y-3">
        <h3 className="text-sm font-semibold text-foreground border-b border-[#0A1929] pb-2">
          {t('triage.summary')}
        </h3>

        {selectedSymptomLabels.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">{t('triage.completionLabels.symptoms')}:</p>
            <div className="flex flex-wrap gap-1">
              {selectedSymptomLabels.map((label, i) => (
                <span key={i} className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                  {label}
                </span>
              ))}
            </div>
          </div>
        )}

        {triageData.selectedTeeth.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">{t('triage.location.affectedTeeth')}:</p>
            <p className="text-sm text-foreground">{triageData.selectedTeeth.join(', ')}</p>
          </div>
        )}

        {triageData.unknownLocation && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">{t('triage.completionLabels.location')}:</p>
            <p className="text-sm text-foreground">{t('triage.location.unknownExact')}</p>
          </div>
        )}

        {durationLabel && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">{t('triage.completionLabels.duration')}:</p>
            <p className="text-sm text-foreground">{durationLabel}</p>
          </div>
        )}

        {!triageData.isRoutineCheckup && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">{t('triage.completionLabels.painIntensity')}:</p>
            <p className="text-sm text-foreground">{triageData.painIntensity}/10</p>
          </div>
        )}

        {triageData.isRoutineCheckup && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">{t('triage.completionLabels.type')}:</p>
            <p className="text-sm text-foreground">{t('triage.completionLabels.routineCheckup')}</p>
          </div>
        )}

        {triageData.photos.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">{t('triage.completionLabels.photosAttached')}:</p>
            <p className="text-sm text-foreground">{t('triage.completionLabels.photoCount', { count: triageData.photos.length })}</p>
          </div>
        )}
      </div>

      <Button
        onClick={onFindDentists}
        className="w-full max-w-md bg-primary hover:bg-primary/90 py-6 text-base font-semibold"
      >
        {t('triage.viewDentists')}
        <ArrowRight className="w-5 h-5 ml-2" />
      </Button>
    </div>
  );
}
