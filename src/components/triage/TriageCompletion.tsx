import { CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TriageData, TRIAGE_SYMPTOMS, TRIAGE_DURATIONS } from '@/types/triage';

interface TriageCompletionProps {
  triageData: TriageData;
  onFindDentists: () => void;
}

export function TriageCompletion({ triageData, onFindDentists }: TriageCompletionProps) {
  const selectedSymptomLabels = triageData.symptoms
    .map((id) => TRIAGE_SYMPTOMS.find((s) => s.id === id))
    .filter(Boolean)
    .map((s) => s!.label);

  const durationLabel = TRIAGE_DURATIONS.find((d) => d.id === triageData.duration)?.label;

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-6 px-4">
      {/* Success icon */}
      <div className="relative">
        <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center animate-pulse">
          <CheckCircle className="w-14 h-14 text-green-500" />
        </div>
        <div className="absolute inset-0 rounded-full bg-green-500/10 animate-ping" />
      </div>

      {/* Success message */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Triagem concluída!</h2>
        <p className="text-muted-foreground">
          Agora vamos encontrar o melhor dentista para si
        </p>
      </div>

      {/* Summary */}
      <div className="w-full max-w-md bg-[#1E3A5F] rounded-xl p-4 text-left space-y-3">
        <h3 className="text-sm font-semibold text-foreground border-b border-[#0A1929] pb-2">
          Resumo da Triagem
        </h3>
        
        {selectedSymptomLabels.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">Sintomas:</p>
            <div className="flex flex-wrap gap-1">
              {selectedSymptomLabels.map((label, i) => (
                <span
                  key={i}
                  className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        )}

        {triageData.selectedTeeth.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">Dentes afetados:</p>
            <p className="text-sm text-foreground">
              {triageData.selectedTeeth.join(', ')}
            </p>
          </div>
        )}

        {triageData.unknownLocation && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">Localização:</p>
            <p className="text-sm text-foreground">Não sabe exatamente</p>
          </div>
        )}

        {durationLabel && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">Duração:</p>
            <p className="text-sm text-foreground">{durationLabel}</p>
          </div>
        )}

        {!triageData.isRoutineCheckup && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">Intensidade da dor:</p>
            <p className="text-sm text-foreground">{triageData.painIntensity}/10</p>
          </div>
        )}

        {triageData.isRoutineCheckup && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">Tipo:</p>
            <p className="text-sm text-foreground">Consulta de rotina</p>
          </div>
        )}

        {triageData.photos.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">Fotos anexadas:</p>
            <p className="text-sm text-foreground">{triageData.photos.length} foto(s)</p>
          </div>
        )}
      </div>

      {/* Action button */}
      <Button
        onClick={onFindDentists}
        className="w-full max-w-md bg-primary hover:bg-primary/90 py-6 text-base font-semibold"
      >
        Ver Dentistas Disponíveis
        <ArrowRight className="w-5 h-5 ml-2" />
      </Button>
    </div>
  );
}
