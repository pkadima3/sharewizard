
import { getFunctions, httpsCallable, HttpsCallableResult } from "firebase/functions";
import { toast } from "sonner";
import { auth } from "@/lib/firebase";
import { GeneratedCaption } from "./openaiService";

// Define the parameters interface
export interface GenerateCaptionsParams {
  platform: string;
  goal: string;
  tone: string;
  niche: string;
  postIdea?: string;
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
 * @param useEmulator - Whether to use the local emulator (default: false)
 * @returns Promise with the function response
 */
export async function callGenerateCaptions(
  params: GenerateCaptionsParams,
  useEmulator = false
): Promise<GenerateCaptionsResponse> {
  // Validate required parameters
  const { platform, goal, tone, niche } = params;
  if (!platform || !goal || !tone || !niche) {
    throw new Error("Missing required parameters: platform, goal, tone, niche");
  }

  // Get the current Firebase Auth token for emulator requests
  const getAuthToken = async (): Promise<string | undefined> => {
    if (!auth.currentUser) return undefined;
    try {
      return await auth.currentUser.getIdToken();
    } catch (error) {
      console.error("Error getting auth token:", error);
      return undefined;
    }
  };

  const emulatorURL = 'http://localhost:5001/engperfect-hlc/us-central1/generateCaptions';

  if (useEmulator) {
    try {
      console.log("[Emulator] Calling generateCaptions with params:", params);
      
      // Get auth token for emulator request
      const token = await getAuthToken();
      
      const headers: HeadersInit = { 
        'Content-Type': 'application/json' 
      };
      
      // Add authorization header if we have a token
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(emulatorURL, {
        method: 'POST',
        headers,
        body: JSON.stringify(params),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          `Error ${response.status}: ${errorData?.message || response.statusText}`
        );
      }
      
      const data = await response.json();
      return data as GenerateCaptionsResponse;
      
    } catch (err) {
      console.error('[Emulator] Error calling generateCaptions:', err);
      toast.error("Error calling emulator: " + (err instanceof Error ? err.message : String(err)));
      throw err;
    }
  } else {
    try {
      console.log("[Production] Calling generateCaptions with params:", params);
      
      // Initialize the functions SDK with region
      const functions = getFunctions(undefined, 'us-central1');
      
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
      console.error('[Production] Error calling generateCaptions:', err);
      
      // Format error message for toast
      const errorMessage = err.message || 'Unknown error occurred';
      toast.error(`Error: ${errorMessage}`);
      
      throw err;
    }
  }
}
