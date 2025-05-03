
import { useState, useEffect, useCallback } from 'react';
import { generateCaptions, Caption, GenerateCaptionsParams, GenerateCaptionsResponse } from '@/services/generateCaptionsService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "sonner";

// Define types for captions
export interface GeneratedCaption {
  title: string;
  caption: string;
  cta: string;
  tags: string;
}

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
  postIdea = ""
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
      
      console.log("Attempting to fetch captions with params:", {
        platform: selectedPlatform,
        tone: selectedTone,
        niche: selectedNiche,
        goal: selectedGoal,
        postIdea
      });
      
      // Generate captions using our service
      const params: GenerateCaptionsParams = {
        platform: selectedPlatform,
        tone: selectedTone,
        niche: selectedNiche,
        goal: selectedGoal,
        postIdea: postIdea || ""
      };
      
      const captionResponse = await generateCaptions(params);
      
      if (!captionResponse) {
        throw new Error("Failed to generate captions");
      }
      
      // Map the response to our component's expected format
      setCaptions(captionResponse.captions.map(c => ({
        title: c.title,
        caption: c.caption,
        cta: c.cta,
        tags: c.tags
      })));
      
      setSelectedCaption(0);
      setRequestsRemaining(captionResponse.requests_remaining);
      
    } catch (err: any) {
      console.error("Error in caption generation hook:", err);
      
      // Determine if this error type is retriable
      const isRetryableError = 
        err?.code === 'functions/unavailable' || 
        err?.code === 'functions/internal' ||
        err?.message?.includes('CORS') ||
        err?.message?.includes('network') || 
        err?.message?.includes('timeout') ||
        err?.message?.includes('ERR_BLOCKED_BY_CLIENT');
      
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
        
        // Check specifically for browser extension issues
        if (err?.message?.includes('ERR_BLOCKED_BY_CLIENT') || 
            err?.message?.includes('could not be cloned')) {
          setError("Your browser or extensions may be blocking API requests. Try disabling ad blockers or using a different browser.");
        }
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
