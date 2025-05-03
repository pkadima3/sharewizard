
import React, { useState, useEffect } from 'react';
import CaptionGeneratorHeader from '@/components/caption-generator/CaptionGeneratorHeader';
import WizardNavigation from '@/components/caption-generator/WizardNavigation';
import { CaptionGeneratorState } from '@/components/caption-generator/WizardStepConfig';

const CaptionGenerator: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [state, setState] = useState<CaptionGeneratorState>({
    selectedMedia: null,
    previewUrl: null,
    isTextOnly: false,
    selectedNiche: '',
    selectedPlatform: '',
    selectedGoal: '',
    selectedTone: '',
    captionOverlayMode: 'below',
    postIdea: '' // Initialize post idea
  });

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      if (state.previewUrl) {
        URL.revokeObjectURL(state.previewUrl);
      }
    };
  }, [state.previewUrl]);
  
  // Update state helper function
  const updateState = (updates: Partial<CaptionGeneratorState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    if (currentStep < 6) { // Increased max step since we added a new step
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-900 via-[#1A1F2C] to-[#221F26] dark:from-gray-900 dark:via-[#1A1F2C] dark:to-[#221F26]">
      <CaptionGeneratorHeader />
      
      <div className="container mx-auto flex-1 p-4 md:p-6 max-w-7xl">
        <div className="bg-gray-800/60 backdrop-blur-md border border-gray-700/50 rounded-xl shadow-md overflow-hidden">
          <WizardNavigation
            currentStep={currentStep}
            state={state}
            setState={updateState}
            isGenerating={isGenerating}
            setIsGenerating={setIsGenerating}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        </div>
      </div>
    </div>
  );
};

export default CaptionGenerator;
