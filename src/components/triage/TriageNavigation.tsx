import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface TriageNavigationProps {
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  onCancel: () => void;
  canProceed?: boolean;
  isLastStep?: boolean;
}

export function TriageNavigation({
  currentStep,
  onPrevious,
  onNext,
  onCancel,
  canProceed = true,
  isLastStep = false,
}: TriageNavigationProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between gap-3 pt-4 border-t border-[#1E3A5F]">
      {currentStep === 1 ? (
        <Button
          variant="outline"
          onClick={onCancel}
          className="flex-1 border-[#1E3A5F] hover:bg-[#1E3A5F]/50"
        >
          {t('triage.cancel')}
        </Button>
      ) : (
        <Button
          variant="outline"
          onClick={onPrevious}
          className="flex-1 border-[#1E3A5F] hover:bg-[#1E3A5F]/50"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          {t('triage.previous')}
        </Button>
      )}

      <Button
        onClick={onNext}
        disabled={!canProceed}
        className="flex-1 bg-primary hover:bg-primary/90"
      >
        {isLastStep ? (
          <>
            {t('triage.finish')}
            <Check className="w-4 h-4 ml-1" />
          </>
        ) : (
          <>
            {t('triage.next')}
            <ChevronRight className="w-4 h-4 ml-1" />
          </>
        )}
      </Button>
    </div>
  );
}
