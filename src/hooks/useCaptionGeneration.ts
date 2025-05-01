
import { useState, useEffect, useCallback } from 'react';
import { GeneratedCaption, CaptionResponse, generateCaptions } from '@/services/openaiService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "sonner";

interface UseCaptionGenerationProps {
  selectedNiche: string;
  selectedPlatform: string;
  selectedGoal: string;
  selectedTone: string;
  isGenerating: boolean;
  setIsGenerating: React.Dispatch<React.SetStateAction<boolean>>;
  postIdea?: string;
}

export const useCaptionGeneration = ({
  selectedNiche,
  selectedPlatform,
  selectedGoal,
  selectedTone,
  isGenerating,
  setIsGenerating,
  postIdea
}: UseCaptionGenerationProps) => {
  const [captions, setCaptions] = useState<GeneratedCaption[]>([]);
  const [selectedCaption, setSelectedCaption] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [requestsRemaining, setRequestsRemaining] = useState<number | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isFallbackMode, setIsFallbackMode] = useState(false);
  const { checkRequestAvailability } = useAuth();

  // Maximum number of automatic retries
  const MAX_RETRIES = 2;
  
  // Function to handle caption generation with retry logic
  const fetchCaptions = useCallback(async () => {
    if (!isGenerating) return;
    
    try {
      setError(null);
      setIsFallbackMode(false);
      
      // Check if user has available requests
      const availability = await checkRequestAvailability();
      
      if (!availability.canMakeRequest) {
        setIsGenerating(false);
        setError(availability.message);
        return;
      }
      
      // Generate captions using our improved service
      const captionResponse = await generateCaptions(
        selectedPlatform,
        selectedTone,
        selectedNiche,
        selectedGoal,
        postIdea
      );
      
      if (!captionResponse) {
        throw new Error("Failed to generate captions");
      }
      
      // Check if we're using fallback demo content
      if (captionResponse.error === "FALLBACK_MODE") {
        setIsFallbackMode(true);
      }
      
      setCaptions(captionResponse.captions);
      setSelectedCaption(0);
      setRequestsRemaining(captionResponse.requests_remaining);
      
      // Only show success toast if we're not in fallback mode
      if (!captionResponse.error) {
        toast.success("Captions generated successfully!");
      }
      
    } catch (err: any) {
      console.error("Error in caption generation hook:", err);
      
      // Determine if this error type is retriable
      const isRetryableError = 
        err?.code === 'unavailable' || 
        err?.code === 'internal' ||
        err?.message?.includes('CORS') ||
        err?.message?.includes('network');
      
      if (retryCount < MAX_RETRIES && isRetryableError) {
        // Increment retry count
        setRetryCount(prev => prev + 1);
        
        // Wait with exponential backoff before retrying
        const backoffDelay = Math.min(1000 * Math.pow(2, retryCount), 5000);
        toast.info(`Connection issue detected. Retrying in ${backoffDelay/1000}s...`);
        
        setTimeout(() => {
          // Try again
          setIsGenerating(true);
        }, backoffDelay);
      } else {
        // We've exhausted retries or hit a non-retriable error
        setError(err?.message || "An unexpected error occurred");
      }
    } finally {
      setIsGenerating(false);
    }
  }, [
    isGenerating, 
    selectedPlatform, 
    selectedTone, 
    selectedNiche, 
    selectedGoal, 
    postIdea, 
    retryCount,
    setIsGenerating, 
    checkRequestAvailability
  ]);

  // Call the fetch function when isGenerating changes to true
  useEffect(() => {
    if (isGenerating) {
      fetchCaptions();
    }
  }, [isGenerating, fetchCaptions]);

  // Provide a manual retry function that users can call
  const retryGeneration = () => {
    setRetryCount(0);
    setIsGenerating(true);
  };

  return {
    captions,
    setCaptions,
    selectedCaption,
    setSelectedCaption,
    error,
    setError,
    requestsRemaining,
    retryCount,
    retryGeneration,
    isFallbackMode
  };
};
