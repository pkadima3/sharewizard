
import { toast } from "sonner";
import { getFunctions, httpsCallable } from "firebase/functions";

export interface GeneratedCaption {
  title: string;
  caption: string;
  cta: string;
  hashtags: string[];
}

export interface CaptionResponse {
  captions: GeneratedCaption[];
  requests_remaining: number;
  error?: string;
  message?: string;
}

// Demo captions for fallback when API is unavailable
const DEMO_CAPTIONS: GeneratedCaption[] = [
  {
    title: "Professional Platform Update",
    caption: "Delivering quality content is our top priority. We're committed to staying at the forefront of industry trends and providing valuable insights to our audience.",
    cta: "Follow us for more updates like this!",
    hashtags: ["professional", "insights", "industry", "trends", "quality"]
  },
  {
    title: "Success Stories",
    caption: "Every journey matters. Today we're celebrating the remarkable achievements of one of our clients who trusted our process. Their dedication and our expertise made all the difference.",
    cta: "Want similar results? Reach out today!",
    hashtags: ["success", "achievement", "growth", "results", "inspiration"]
  },
  {
    title: "Expertise You Can Trust",
    caption: "With years of specialized experience, our team provides evidence-based solutions tailored to your unique needs. We believe in transparent communication and building relationships based on trust.",
    cta: "Book your consultation now!",
    hashtags: ["expertise", "trust", "professional", "solutions", "communication"]
  }
];

/**
 * Calls the Firebase function to generate captions with robust error handling
 * Implements region fallback, CORS workarounds, timeouts and demo content fallback
 * 
 * @param platform - Target social media platform
 * @param tone - Desired tone for the captions
 * @param niche - Industry niche or topic 
 * @param goal - Content marketing goal
 * @param postIdea - Specific post idea (optional)
 * @returns Promise with generated captions or fallback demo content
 */
export const generateCaptions = async (
  platform: string,
  tone: string,
  niche: string,
  goal: string,
  postIdea?: string
): Promise<CaptionResponse | null> => {
  try {
    console.log("Generating captions with parameters:", { platform, tone, niche, goal, postIdea });
    
    // Try multiple regions to avoid CORS issues
    const regions = ['us-central1', 'us-east1', 'europe-west1'];
    let lastError: any = null;
    
    // Prepare data for the function call
    const functionData = {
      tone,
      platform,
      niche,
      goal,
      postIdea: postIdea || niche  // Use postIdea if provided, otherwise fall back to niche
    };
    
    // Try each region until one works
    for (const region of regions) {
      try {
        console.log(`Trying Firebase function in ${region} region...`);
        const functions = getFunctions(undefined, region);
        const generateCaptionsFunction = httpsCallable<typeof functionData, CaptionResponse>(
          functions, 
          'generateCaptions',
          // Add explicit CORS settings to the callable
          { 
            timeout: 15000 // 15 second timeout
          }
        );
        
        // Set a timeout to prevent long hanging requests
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error("Request timed out")), 15000);
        });
        
        // Race between the actual API call and the timeout
        const result = await Promise.race([
          generateCaptionsFunction(functionData),
          timeoutPromise
        ]);
        
        // If we reach here, the call succeeded
        console.log(`Success with ${region} region!`, result);
        
        // Validate response data
        const data = (result as any).data as CaptionResponse;
        if (!data || !data.captions || data.captions.length === 0) {
          throw new Error("Invalid or empty response from server");
        }
        
        // Process captions to ensure consistent format
        const processedCaptions = data.captions.map(caption => {
          // Handle legacy API response format (tags as string)
          if ('tags' in caption && !Array.isArray(caption.hashtags)) {
            const tags = (caption as any).tags || '';
            return {
              ...caption,
              hashtags: tags.split(/\s+/).filter((tag: string) => tag.trim() !== '')
            };
          }
          return caption;
        });
        
        toast.success("Captions generated successfully!");
        
        return {
          captions: processedCaptions as GeneratedCaption[],
          requests_remaining: data.requests_remaining
        };
      } catch (err) {
        console.log(`Failed with ${region} region:`, err);
        lastError = err;
        // Continue to the next region
      }
    }
    
    // If we're here, all regions failed
    console.error("All Firebase function regions failed:", lastError);
    
    // Check if we hit CORS issues and provide fallback content
    if (lastError?.message?.includes("CORS") || 
        lastError?.code === "functions/unavailable" || 
        lastError?.code === "functions/internal" ||
        lastError?.message?.includes("blocked by CORS policy") ||
        lastError?.message?.includes("timed out")) {
      
      console.log("Using fallback demo captions due to API connectivity issues");
      toast.warning("Showing sample captions due to network connectivity issues. Your customized captions will be available soon.");
      
      // Return demo captions as fallback
      return {
        captions: DEMO_CAPTIONS,
        requests_remaining: 999,
        message: "Using demo captions. Network connectivity issues detected."
      };
    }
    
    // Default error handler
    throw lastError || new Error("Unknown error occurred");
    
  } catch (error: any) {
    console.error("Error generating captions:", error);
    
    // Enhanced error logging
    console.error("Error details:", {
      code: error?.code,
      message: error?.message,
      details: error?.details,
      stack: error?.stack
    });
    
    // User-facing error messages based on error type
    if (error?.code === 'unauthenticated') {
      toast.error("You must be logged in to generate captions.");
    } else if (error?.code === 'resource-exhausted') {
      toast.error("You've reached your plan limit. Please upgrade to continue.");
    } else if (error?.message?.includes("CORS")) {
      toast.warning("Network connectivity issue detected. Showing sample captions instead.");
    } else {
      toast.warning("Unable to connect to caption service. Showing sample content instead.");
    }
    
    // Return demo captions as fallback
    return {
      captions: DEMO_CAPTIONS,
      requests_remaining: 999,
      error: error?.code || "FALLBACK_MODE",
      message: "Using demo captions due to service limitations."
    };
  }
};
