
import { getFunctions, httpsCallable, HttpsCallableResult } from "firebase/functions";
import { toast } from "sonner";
import { auth } from "@/lib/firebase";
import { shouldUseEmulator, getEnvironmentName } from "@/utils/environment";

// Define the parameters interface
export interface GenerateCaptionsParams {
  platform: string;
  goal: string;
  tone: string;
  niche: string;
  postIdea?: string;
}

// Define the caption interface
export interface GeneratedCaption {
  title: string;
  caption: string;
  cta: string;
  hashtags: string[];
}

// Define the response interface
export interface GenerateCaptionsResponse {
  captions: GeneratedCaption[];
  requests_remaining: number;
}

/**
 * Calls the Firebase Cloud Function generateCaptions
 * 
 * @param params - Object with platform, goal, tone, niche, and optional postIdea
 * @returns Promise with the function response
 */
export async function callGenerateCaptions(
  params: GenerateCaptionsParams
): Promise<GenerateCaptionsResponse> {
  // Validate required parameters
  const { platform, goal, tone, niche } = params;
  if (!platform || !goal || !tone || !niche) {
    throw new Error("Missing required parameters: platform, goal, tone, niche");
  }
  
  // Check if we should use the emulator
  const useEmulator = shouldUseEmulator();
  const environment = getEnvironmentName();
  
  console.log(`[${environment.toUpperCase()}] Calling generateCaptions with params:`, params);
  
  try {
    // Initialize the functions SDK with region
    const functions = getFunctions(undefined, 'us-central1');
    
    // If using emulator, connect to the local emulator
    if (useEmulator) {
      console.log("🔧 Using Firebase Emulator for generateCaptions");
      // Connect to the emulator - no need to use fetch directly
      // The Firebase SDK will handle this for us
    }
    
    // Create the callable function
    const generateCaptionsFunction = httpsCallable<GenerateCaptionsParams, GenerateCaptionsResponse>(
      functions, 
      'generateCaptions'
    );
    
    // Call the function
    const result: HttpsCallableResult<GenerateCaptionsResponse> = await generateCaptionsFunction(params);
    
    // Return the data
    return result.data;
    
  } catch (err: any) {
    // Enhanced error logging
    console.error(`[${environment.toUpperCase()}] Error calling generateCaptions:`, err);
    
    // Handle specific Firebase error codes
    if (err.code) {
      switch(err.code) {
        case 'unauthenticated':
        case 'permission-denied':
          toast.error("You must be logged in to generate captions.");
          break;
        case 'resource-exhausted':
          toast.error("You've reached your plan limit. Please upgrade to continue.");
          break;
        case 'unavailable':
          toast.error("Service temporarily unavailable. Please try again later.");
          break;
        case 'internal':
          toast.error("An error occurred while generating captions. Please try again.");
          break;
        default:
          toast.error(`Error: ${err.message || 'Unknown error occurred'}`);
      }
    } else {
      // Generic error fallback
      toast.error(`Error: ${err.message || 'Unknown error occurred'}`);
    }
    
    throw err;
  }
}
