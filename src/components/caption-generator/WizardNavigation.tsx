
import React from 'react';
import { WizardLayout } from '@/components/WizardLayout';
import { CaptionGeneratorState, getWizardSteps, isNextButtonDisabled } from './WizardStepConfig';
import MediaUploader from '@/components/MediaUploader';
import NicheSelector from '@/components/NicheSelector';
import PlatformSelector from '@/components/PlatformSelector';
import GoalSelector from '@/components/GoalSelector';
import ToneSelector from '@/components/ToneSelector';
import PostIdeaInput from '@/components/PostIdeaInput';
import GeneratedCaptions from '@/components/GeneratedCaptions';
import { toast } from "sonner";

interface WizardNavigationProps {
  currentStep: number;
  state: CaptionGeneratorState;
  setState: (updates: Partial<CaptionGeneratorState>) => void;
  isGenerating: boolean;
  setIsGenerating: React.Dispatch<React.SetStateAction<boolean>>;
  onNext: () => void;
  onPrev: () => void;
}

const WizardNavigation: React.FC<WizardNavigationProps> = ({
  currentStep,
  state,
  setState,
  isGenerating,
  setIsGenerating,
  onNext,
  onPrev
}) => {
  const wizardSteps = getWizardSteps(state);
  const {
    selectedMedia,
    previewUrl,
    isTextOnly,
    selectedNiche,
    selectedPlatform,
    selectedGoal,
    selectedTone,
    captionOverlayMode,
    postIdea
  } = state;
  
  const handleMediaSelect = (file: File | null) => {
    if (!file) {
      setState({
        selectedMedia: null,
        previewUrl: null
      });
      return;
    }
    setState({
      selectedMedia: file,
      isTextOnly: false
    });

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const objectUrl = URL.createObjectURL(file);
    setState({ previewUrl: objectUrl });
  };

  const handleTextOnlySelect = () => {
    setState({
      isTextOnly: true,
      selectedMedia: null,
      previewUrl: null
    });
    onNext();
    toast.success("Text-only caption mode enabled");
  };

  const handleNicheChange = (niche: string) => {
    setState({ selectedNiche: niche });
  };

  const handlePlatformChange = (platform: string) => {
    setState({ selectedPlatform: platform });
  };

  const handleGoalChange = (goal: string) => {
    setState({ selectedGoal: goal });
  };

  const handlePostIdeaChange = (idea: string) => {
    setState({ postIdea: idea });
  };

  const handleToneChange = (tone: string) => {
    setState({ selectedTone: tone });
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    onNext();
  };

  const handleCaptionOverlayModeChange = (mode: 'overlay' | 'below') => {
    setState({ captionOverlayMode: mode });
  };
  
  return (
    <WizardLayout 
      currentStep={currentStep} 
      steps={wizardSteps} 
      onNext={onNext} 
      onPrev={onPrev} 
      isNextDisabled={isNextButtonDisabled(currentStep, state)} 
      isGenerating={isGenerating} 
      hideNextButton={currentStep === 5 || currentStep === 6}
    >
      {currentStep === 0 && 
        <MediaUploader 
          onMediaSelect={handleMediaSelect} 
          selectedMedia={selectedMedia} 
          previewUrl={previewUrl} 
          onTextOnlySelect={handleTextOnlySelect} 
        />
      }
      
      {currentStep === 1 && 
        <NicheSelector 
          selectedNiche={selectedNiche} 
          onNicheChange={handleNicheChange} 
        />
      }
      
      {currentStep === 2 && 
        <PlatformSelector 
          selectedPlatform={selectedPlatform} 
          onPlatformChange={handlePlatformChange} 
        />
      }
      
      {currentStep === 3 && 
        <GoalSelector 
          selectedGoal={selectedGoal} 
          onGoalChange={handleGoalChange} 
        />
      }

      {currentStep === 4 && 
        <PostIdeaInput 
          postIdea={postIdea} 
          onPostIdeaChange={handlePostIdeaChange} 
        />
      }
      
      {currentStep === 5 && 
        <ToneSelector 
          selectedTone={selectedTone} 
          onToneChange={handleToneChange} 
          onGenerate={handleGenerate} 
          isGenerating={isGenerating} 
        />
      }
      
      {currentStep === 6 && 
        <GeneratedCaptions 
          selectedMedia={selectedMedia} 
          previewUrl={previewUrl} 
          selectedNiche={selectedNiche} 
          selectedPlatform={selectedPlatform} 
          selectedGoal={selectedGoal} 
          selectedTone={selectedTone} 
          postIdea={postIdea} 
          isGenerating={isGenerating} 
          setIsGenerating={setIsGenerating} 
          isTextOnly={isTextOnly} 
          captionOverlayMode={captionOverlayMode} 
          onCaptionOverlayModeChange={handleCaptionOverlayModeChange} 
        />
      }
    </WizardLayout>
  );
};

export default WizardNavigation;
