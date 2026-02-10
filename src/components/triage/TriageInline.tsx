import { useState } from 'react';
import { TriageHeader } from './TriageHeader';
import { TriageNavigation } from './TriageNavigation';
import { TriageSymptomsStep } from './steps/TriageSymptomsStep';
import { TriageLocationStep } from './steps/TriageLocationStep';
import { TriageDurationStep } from './steps/TriageDurationStep';
import { TriageIntensityStep } from './steps/TriageIntensityStep';
import { TriagePhotosStep } from './steps/TriagePhotosStep';
import { TriageCompletion } from './TriageCompletion';
import { TriageData, initialTriageData } from '@/types/triage';
import { ScrollArea } from '@/components/ui/scroll-area';

const TOTAL_STEPS = 5;

interface TriageInlineProps {
  onClose: () => void;
}

export function TriageInline({ onClose }: TriageInlineProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);
  const [triageData, setTriageData] = useState<TriageData>(initialTriageData);

  const updateTriageData = <K extends keyof TriageData>(key: K, value: TriageData[K]) => {
    setTriageData((prev) => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFindDentists = () => {
    console.log('Triage data:', triageData);
    onClose();
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return triageData.symptoms.length > 0;
      case 2: return triageData.selectedTeeth.length > 0 || triageData.unknownLocation;
      case 3: return triageData.duration !== '';
      case 4: return true;
      case 5: return true;
      default: return true;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <TriageSymptomsStep
            selectedSymptoms={triageData.symptoms}
            otherSymptom={triageData.otherSymptom || ''}
            onSymptomsChange={(symptoms) => updateTriageData('symptoms', symptoms)}
            onOtherSymptomChange={(text) => updateTriageData('otherSymptom', text)}
          />
        );
      case 2:
        return (
          <TriageLocationStep
            selectedTeeth={triageData.selectedTeeth}
            unknownLocation={triageData.unknownLocation}
            onTeethChange={(teeth) => updateTriageData('selectedTeeth', teeth)}
            onUnknownChange={(unknown) => updateTriageData('unknownLocation', unknown)}
          />
        );
      case 3:
        return (
          <TriageDurationStep
            selectedDuration={triageData.duration}
            onDurationChange={(duration) => updateTriageData('duration', duration)}
          />
        );
      case 4:
        return (
          <TriageIntensityStep
            painIntensity={triageData.painIntensity}
            isRoutineCheckup={triageData.isRoutineCheckup}
            onIntensityChange={(intensity) => updateTriageData('painIntensity', intensity)}
            onRoutineChange={(isRoutine) => updateTriageData('isRoutineCheckup', isRoutine)}
          />
        );
      case 5:
        return (
          <TriagePhotosStep
            photos={triageData.photos}
            onPhotosChange={(photos) => updateTriageData('photos', photos)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <ScrollArea className="flex-1">
      <div className="max-w-2xl mx-auto p-4 md:p-6 pb-28">
        {isCompleted ? (
          <TriageCompletion triageData={triageData} onFindDentists={handleFindDentists} />
        ) : (
          <div className="space-y-6">
            <TriageHeader currentStep={currentStep} totalSteps={TOTAL_STEPS} />
            <div className="bg-[#0D2137] rounded-2xl p-4 md:p-6 border border-[#1E3A5F]">
              {renderStep()}
              <TriageNavigation
                currentStep={currentStep}
                totalSteps={TOTAL_STEPS}
                onPrevious={handlePrevious}
                onNext={handleNext}
                onCancel={onClose}
                canProceed={canProceed()}
                isLastStep={currentStep === TOTAL_STEPS}
              />
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
