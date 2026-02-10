import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { TRIAGE_SYMPTOMS } from '@/types/triage';
import { cn } from '@/lib/utils';

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
        <h2 className="text-lg font-semibold text-foreground">
          Quais são os seus sintomas?
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Selecione todos os que se aplicam
        </p>
      </div>

      {/* Symptoms grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {TRIAGE_SYMPTOMS.map((symptom) => {
          const isSelected = selectedSymptoms.includes(symptom.id);
          
          return (
            <button
              key={symptom.id}
              onClick={() => toggleSymptom(symptom.id)}
              className={cn(
                'flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all min-h-[100px]',
                isSelected
                  ? 'bg-primary/20 border-primary text-foreground'
                  : 'bg-[#1E3A5F] border-[#1E3A5F] hover:border-primary/50 text-foreground'
              )}
            >
              <span className="text-2xl mb-2">{symptom.icon}</span>
              <span className="text-xs font-medium text-center leading-tight">
                {symptom.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Other symptom input */}
      {showOtherInput && (
        <div className="animate-slide-up">
          <Input
            placeholder="Descreva o seu sintoma..."
            value={otherSymptom}
            onChange={(e) => onOtherSymptomChange(e.target.value)}
            className="bg-[#1E3A5F] border-[#1E3A5F] focus:border-primary"
          />
        </div>
      )}
    </div>
  );
}
