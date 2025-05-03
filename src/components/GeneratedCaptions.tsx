
import React from 'react';
import { useCaptionGeneration } from '@/hooks/useCaptionGeneration';
import CaptionRegenerationHeader from './captions/CaptionRegenerationHeader';
import CaptionContent from './captions/CaptionContent';
import ErrorDisplay from './captions/ErrorDisplay';
import GenerationLoading from './captions/GenerationLoading';
import EmptyState from './captions/EmptyState';

interface GeneratedCaptionsProps {
  selectedMedia: File | null;
  previewUrl: string | null;
  selectedNiche: string;
  selectedPlatform: string;
  selectedGoal: string;
  selectedTone: string;
  isGenerating: boolean;
  setIsGenerating: React.Dispatch<React.SetStateAction<boolean>>;
  isTextOnly?: boolean;
  captionOverlayMode?: 'overlay' | 'below';
  onCaptionOverlayModeChange?: (mode: 'overlay' | 'below') => void;
  postIdea: string; // Changed from optional to required
}

const GeneratedCaptions: React.FC<GeneratedCaptionsProps> = ({
  selectedMedia,
  previewUrl,
  selectedNiche,
  selectedPlatform,
  selectedGoal,
  selectedTone,
  isGenerating,
  setIsGenerating,
  isTextOnly = false,
  captionOverlayMode = 'below',
  onCaptionOverlayModeChange,
  postIdea
}) => {
  // Use our custom hook for caption generation
  const {
    captions,
    setCaptions,
    selectedCaption,
    setSelectedCaption,
    error,
    requestsRemaining
  } = useCaptionGeneration({
    selectedNiche,
    selectedPlatform,
    selectedGoal,
    selectedTone,
    isGenerating,
    setIsGenerating,
    postIdea
  });

  const handleRegenerateClick = () => {
    setCaptions([]);
    setIsGenerating(true);
  };

  // Handle error state
  if (error) {
    return <ErrorDisplay error={error} onTryAgainClick={handleRegenerateClick} />;
  }

  // Handle loading state
  if (isGenerating) {
    return (
      <GenerationLoading 
        selectedMedia={selectedMedia}
        previewUrl={previewUrl}
        isTextOnly={isTextOnly}
        selectedPlatform={selectedPlatform}
        selectedTone={selectedTone}
        selectedNiche={selectedNiche}
      />
    );
  }

  // Handle empty state
  if (captions.length === 0 && !isGenerating) {
    return <EmptyState onGenerateClick={handleRegenerateClick} />;
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      <CaptionRegenerationHeader 
        requestsRemaining={requestsRemaining}
        onRegenerateClick={handleRegenerateClick}
      />
      
      <CaptionContent
        selectedMedia={selectedMedia}
        previewUrl={previewUrl}
        captions={captions}
        selectedCaption={selectedCaption}
        setSelectedCaption={setSelectedCaption}
        setCaptions={setCaptions}
        isTextOnly={isTextOnly}
        captionOverlayMode={captionOverlayMode}
        onCaptionOverlayModeChange={onCaptionOverlayModeChange}
        selectedPlatform={selectedPlatform}
      />
    </div>
  );
};

export default GeneratedCaptions;
