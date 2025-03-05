
import React, { useState, useEffect } from 'react';
import { WizardLayout, WizardStep } from '@/components/WizardLayout';
import MediaUploader from '@/components/MediaUploader';
import { toast } from "sonner";

const CaptionGenerator: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedMedia, setSelectedMedia] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Clean up URL objects when component unmounts or when URL changes
  useEffect(() => {
    // Clean up function to revoke object URL when component unmounts or URL changes
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Define wizard steps
  const steps: WizardStep[] = [
    {
      title: "Upload Media",
      description: "Upload an image or video to generate captions",
      isCompleted: !!selectedMedia
    },
    {
      title: "Select Niche",
      description: "Choose a niche for your content",
      isCompleted: false
    },
    {
      title: "Platform",
      description: "Select social media platform",
      isCompleted: false
    },
    {
      title: "Goal",
      description: "Define your content goal",
      isCompleted: false
    },
    {
      title: "Tone",
      description: "Choose the tone for your caption",
      isCompleted: false
    },
    {
      title: "Generated Captions",
      description: "View and edit your captions",
      isCompleted: false
    }
  ];

  const handleMediaSelect = (file: File | null) => {
    if (!file) {
      setSelectedMedia(null);
      setPreviewUrl(null);
      return;
    }
    
    setSelectedMedia(file);
    
    // Clean up previous URL if it exists
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    
    // Create object URL for preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleNext = () => {
    if (currentStep === 0 && !selectedMedia) {
      toast.error("Please upload a media file to continue");
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
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <div className="py-6 px-4 bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-800 dark:to-indigo-900">
        <h1 className="text-2xl md:text-3xl font-bold text-white text-center">
          Caption Generator
        </h1>
        <p className="mt-2 text-blue-100 text-center max-w-2xl mx-auto">
          Create engaging captions for your social media posts with AI assistance
        </p>
      </div>
      
      <div className="container mx-auto flex-1 p-4 md:p-6 max-w-6xl">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
          <WizardLayout
            currentStep={currentStep}
            steps={steps}
            onNext={handleNext}
            onPrev={handlePrev}
            isNextDisabled={currentStep === 0 && !selectedMedia}
            isGenerating={isGenerating}
          >
            {currentStep === 0 && (
              <MediaUploader 
                onMediaSelect={handleMediaSelect}
                selectedMedia={selectedMedia}
                previewUrl={previewUrl}
              />
            )}
            
            {currentStep > 0 && (
              <div className="flex items-center justify-center h-full p-6">
                <div className="text-center">
                  <h3 className="text-lg font-medium">Step {currentStep + 1} Content</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    This step will be implemented in the next phase.
                  </p>
                </div>
              </div>
            )}
          </WizardLayout>
        </div>
      </div>
    </div>
  );
};

export default CaptionGenerator;
