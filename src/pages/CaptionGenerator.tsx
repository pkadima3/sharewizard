
import React, { useState, useEffect } from 'react';
import { WizardLayout, WizardStep } from '@/components/WizardLayout';
import MediaUploader from '@/components/MediaUploader';
import NicheSelector from '@/components/NicheSelector';
import PlatformSelector from '@/components/PlatformSelector';
import GoalSelector from '@/components/GoalSelector';
import ToneSelector from '@/components/ToneSelector';
import GeneratedCaptions from '@/components/GeneratedCaptions';
import { toast } from "sonner";
import { useTheme } from '@/contexts/ThemeContext';

const CaptionGenerator: React.FC = () => {
  const { resolvedTheme } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedMedia, setSelectedMedia] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedNiche, setSelectedNiche] = useState<string>('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [selectedGoal, setSelectedGoal] = useState<string>('');
  const [selectedTone, setSelectedTone] = useState<string>('');
  const [isTextOnly, setIsTextOnly] = useState<boolean>(false);
  const [captionOverlayMode, setCaptionOverlayMode] = useState<'overlay' | 'below'>('below');

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const steps: WizardStep[] = [{
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
    title: "Tone",
    description: "Choose the tone for your caption",
    isCompleted: !!selectedTone
  }, {
    title: "Generated Captions",
    description: "View and edit your captions",
    isCompleted: false
  }];

  const handleMediaSelect = (file: File | null) => {
    if (!file) {
      setSelectedMedia(null);
      setPreviewUrl(null);
      return;
    }
    setSelectedMedia(file);
    setIsTextOnly(false);

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleTextOnlySelect = () => {
    setIsTextOnly(true);
    setSelectedMedia(null);
    setPreviewUrl(null);

    setCurrentStep(prev => prev + 1);
    toast.success("Text-only caption mode enabled");
  };

  const handleNicheChange = (niche: string) => {
    setSelectedNiche(niche);
  };

  const handlePlatformChange = (platform: string) => {
    setSelectedPlatform(platform);
  };

  const handleGoalChange = (goal: string) => {
    setSelectedGoal(goal);
  };

  const handleToneChange = (tone: string) => {
    setSelectedTone(tone);
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setCurrentStep(prev => prev + 1);
  };

  const handleCaptionOverlayModeChange = (mode: 'overlay' | 'below') => {
    setCaptionOverlayMode(mode);
  };

  const handleNext = () => {
    if (currentStep === 0 && !selectedMedia && !isTextOnly) {
      toast.error("Please upload a media file or select text-only mode to continue");
      return;
    }
    if (currentStep === 1 && !selectedNiche) {
      toast.error("Please select or enter a niche to continue");
      return;
    }
    if (currentStep === 2 && !selectedPlatform) {
      toast.error("Please select a platform to continue");
      return;
    }
    if (currentStep === 3 && !selectedGoal) {
      toast.error("Please select a content goal to continue");
      return;
    }
    if (currentStep === 4 && !selectedTone) {
      toast.error("Please select a content tone to continue");
      return;
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${resolvedTheme === 'dark' ? 'bg-gradient-to-b from-gray-900 via-[#1A1F2C] to-[#221F26]' : 'bg-gradient-to-b from-gray-50 via-gray-100 to-white'}`}>
      <div className={`px-4 py-[100px] ${resolvedTheme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
        <h1 className="text-2xl md:text-3xl font-bold text-center">
          Caption Generator
        </h1>
        <p className={`mt-2 text-center max-w-2xl mx-auto ${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          Create engaging captions for your social media posts with AI assistance
        </p>
      </div>
      
      <div className="container mx-auto flex-1 p-4 md:p-6 max-w-6xl">
        <div className={`backdrop-blur-md border rounded-xl shadow-md overflow-hidden ${
          resolvedTheme === 'dark' 
            ? 'bg-gray-800/60 border-gray-700/50' 
            : 'bg-white/80 border-gray-200/50'
        }`}>
          <WizardLayout 
            currentStep={currentStep} 
            steps={steps} 
            onNext={handleNext} 
            onPrev={handlePrev} 
            isNextDisabled={
              currentStep === 0 && !selectedMedia && !isTextOnly || 
              currentStep === 1 && !selectedNiche || 
              currentStep === 2 && !selectedPlatform || 
              currentStep === 3 && !selectedGoal || 
              currentStep === 4 && !selectedTone
            } 
            isGenerating={isGenerating} 
            hideNextButton={currentStep === 4 || currentStep === 5}
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
              <ToneSelector 
                selectedTone={selectedTone} 
                onToneChange={handleToneChange} 
                onGenerate={handleGenerate} 
                isGenerating={isGenerating} 
              />
            }
            
            {currentStep === 5 && 
              <GeneratedCaptions 
                selectedMedia={selectedMedia} 
                previewUrl={previewUrl} 
                selectedNiche={selectedNiche} 
                selectedPlatform={selectedPlatform} 
                selectedGoal={selectedGoal} 
                selectedTone={selectedTone} 
                isGenerating={isGenerating} 
                setIsGenerating={setIsGenerating} 
                isTextOnly={isTextOnly} 
                captionOverlayMode={captionOverlayMode} 
                onCaptionOverlayModeChange={handleCaptionOverlayModeChange} 
              />
            }
          </WizardLayout>
        </div>
      </div>
    </div>
  );
};

export default CaptionGenerator;
