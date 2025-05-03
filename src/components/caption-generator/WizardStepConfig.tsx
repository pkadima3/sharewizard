
import { WizardStep } from '@/components/WizardLayout';

export interface CaptionGeneratorState {
  selectedMedia: File | null;
  previewUrl: string | null;
  isTextOnly: boolean;
  selectedNiche: string;
  selectedPlatform: string;
  selectedGoal: string;
  selectedTone: string;
  captionOverlayMode: 'overlay' | 'below';
  postIdea: string; // Added post idea field
}

export const getWizardSteps = (state: CaptionGeneratorState): WizardStep[] => {
  const {
    selectedMedia,
    isTextOnly,
    selectedNiche,
    selectedPlatform,
    selectedGoal,
    selectedTone,
    postIdea
  } = state;
  
  return [{
    title: "Upload Media",
    description: "Upload an image or video to generate captions",
    isCompleted: !!selectedMedia || isTextOnly
  }, {
    title: "Select Niche",
    description: "Choose a niche for your content",
    isCompleted: !!selectedNiche
  }, {
    title: "Platform",
    description: "Select social media platform",
    isCompleted: !!selectedPlatform
  }, {
    title: "Goal",
    description: "Define your content goal",
    isCompleted: !!selectedGoal
  }, {
    title: "Post Idea",
    description: "Describe what your post is about",
    isCompleted: !!postIdea
  }, {
    title: "Tone",
    description: "Choose the tone for your caption",
    isCompleted: !!selectedTone
  }, {
    title: "Generated Captions",
    description: "View and edit your captions",
    isCompleted: false
  }];
};

export const isNextButtonDisabled = (currentStep: number, state: CaptionGeneratorState): boolean => {
  const {
    selectedMedia,
    isTextOnly,
    selectedNiche,
    selectedPlatform, 
    selectedGoal,
    selectedTone,
    postIdea
  } = state;
  
  return (
    currentStep === 0 && !selectedMedia && !isTextOnly || 
    currentStep === 1 && !selectedNiche || 
    currentStep === 2 && !selectedPlatform || 
    currentStep === 3 && !selectedGoal ||
    currentStep === 4 && !postIdea ||
    currentStep === 5 && !selectedTone
  );
};
