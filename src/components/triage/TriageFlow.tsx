import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TriageHeader } from './TriageHeader';
import { TriageNavigation } from './TriageNavigation';
import { TriageSymptomsStep } from './steps/TriageSymptomsStep';
import { TriageLocationStep } from './steps/TriageLocationStep';
import { TriageDurationStep } from './steps/TriageDurationStep';
import { TriageIntensityStep } from './steps/TriageIntensityStep';
import { TriagePhotosStep } from './steps/TriagePhotosStep';
import { TriageCompletion } from './TriageCompletion';
import { TriageData, initialTriageData } from '@/types/triage';
import { useIsMobile } from '@/hooks/use-mobile';
import { BottomNavigation } from '@/components/calendar/BottomNavigation';
import { TriageDesktopSidebar } from './TriageDesktopSidebar';
import { useWatermarkSrc } from '@/hooks/useWatermarkSrc';

const TOTAL_STEPS = 5;

export function TriageFlow() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const smileIcon = useWatermarkSrc();
  const [currentStep, setCurrentStep] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);
  const [triageData, setTriageData] = useState<TriageData>(initialTriageData);
  const [activeTab, setActiveTab] = useState('agenda');

  const updateTriageData = <K extends keyof TriageData>(
    key: K,
    value: TriageData[K]
  ) => {
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

  const handleCancel = () => {
    navigate('/');
  };

  const handleFindDentists = () => {
    // Navigate to dentist search with triage data
    console.log('Triage data:', triageData);
    navigate('/');
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return triageData.symptoms.length > 0;
      case 2:
        return triageData.selectedTeeth.length > 0 || triageData.unknownLocation;
      case 3:
        return triageData.duration !== '';
      case 4:
        return true; // Pain intensity can be 0
      case 5:
        return true; // Photos are optional
      default:
        return true;
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

  // Desktop layout
  if (!isMobile) {
    return (
      <div className="flex h-screen bg-background overflow-hidden">
        {/* Desktop Sidebar */}
        <TriageDesktopSidebar activeItem="agenda" />

        {/* Main content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <div className="mx-auto p-4 md:p-6" style={{ width: 'min(95vw, 1100px)' }}>
              {isCompleted ? (
                <TriageCompletion
                  triageData={triageData}
                  onFindDentists={handleFindDentists}
                />
              ) : (
                <div className="space-y-6">
                  <TriageHeader currentStep={currentStep} totalSteps={TOTAL_STEPS} />
                  
                  <div className="bg-[#0D2137] rounded-2xl p-6 border border-[#1E3A5F]">
                    {renderStep()}
                    
                    <TriageNavigation
                      currentStep={currentStep}
                      totalSteps={TOTAL_STEPS}
                      onPrevious={handlePrevious}
                      onNext={handleNext}
                      onCancel={handleCancel}
                      canProceed={canProceed()}
                      isLastStep={currentStep === TOTAL_STEPS}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Mobile/Tablet layout
  return (
    <div className="min-h-screen bg-background pb-24 relative">
      {/* Background Watermark Logo */}
      <div 
        className="fixed inset-0 pointer-events-none flex items-center justify-center opacity-[0.025] z-0"
        style={{
          backgroundImage: `url(${smileIcon})`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundSize: '60%',
        }}
      />

      <div className="relative z-10">
        {isCompleted ? (
          <div className="p-4">
            <TriageCompletion
              triageData={triageData}
              onFindDentists={handleFindDentists}
            />
          </div>
        ) : (
          <div className="p-4 space-y-4">
            <TriageHeader currentStep={currentStep} totalSteps={TOTAL_STEPS} />
            
            <div className="bg-[#0D2137] rounded-2xl p-4 border border-[#1E3A5F]">
              {renderStep()}
              
              <TriageNavigation
                currentStep={currentStep}
                totalSteps={TOTAL_STEPS}
                onPrevious={handlePrevious}
                onNext={handleNext}
                onCancel={handleCancel}
                canProceed={canProceed()}
                isLastStep={currentStep === TOTAL_STEPS}
              />
            </div>
          </div>
        )}

        {/* Bottom Navigation */}
        <BottomNavigation
          userRole="patient"
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>
    </div>
  );
}
