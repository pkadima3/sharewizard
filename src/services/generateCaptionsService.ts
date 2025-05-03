
import { getFunctions, httpsCallable } from "firebase/functions";
import { toast } from "sonner";
import { shouldUseEmulator, isPreview } from "@/utils/environment";

// Define the parameters interface
export interface GenerateCaptionsParams {
  tone: string;
  platform: string;
  postIdea: string;
  niche: string;
  goal: string;
}

// Define the caption interface
export interface Caption {
  title: string;
  caption: string;
  cta: string;
  tags: string;
}

// Define the response interface
export interface GenerateCaptionsResponse {
  captions: Caption[];
  requests_remaining: number;
}

/**
 * Calls the Firebase Cloud Function to generate captions
 * 
 * @param params - Object with tone, platform, postIdea, niche, and goal
 * @returns Promise with the function response
 */
export async function generateCaptions(params: GenerateCaptionsParams): Promise<GenerateCaptionsResponse> {
  try {
    // Get the correct region based on environment
    const region = 'us-central1';
    console.log(`Calling Firebase function in region: ${region}`);
    
    // Initialize Firebase functions
    const functions = getFunctions(undefined, region);
    
    // Create the callable function
    const generateCaptionsFunction = httpsCallable<GenerateCaptionsParams, GenerateCaptionsResponse>(
      functions, 
      'generateCaptions'
    );
    
    console.log("Calling generateCaptions with params:", params);
    
    // Call the function
    const result = await generateCaptionsFunction(params);
    
    console.log("Function call successful, received data:", result.data);
    
    // Return the data
    return result.data;
  } catch (error: any) {
    console.error("Error calling generateCaptions:", error);
    
    // Handle specific error codes
    if (error.code) {
      switch(error.code) {
        case 'functions/unauthenticated':
          toast.error("You must be logged in to generate captions.");
          break;
        case 'functions/resource-exhausted':
          toast.error("You've reached your plan limit. Please upgrade to continue.");
          break;
        case 'functions/unavailable':
          toast.error("Service temporarily unavailable. Please try again later.");
          break;
        case 'functions/internal':
          toast.error("An error occurred while generating captions. Please try again.");
          break;
        default:
          toast.error(`Error: ${error.message || 'Unknown error occurred'}`);
      }
    } else {
      toast.error(`Error: ${error.message || 'Unknown error occurred'}`);
    }
    
    throw error;
  }
}
