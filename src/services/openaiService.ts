import { toast } from "sonner";
import { callGenerateCaptions, GenerateCaptionsParams } from "./generateCaptionsService";
import { shouldUseEmulator } from "@/utils/environment";

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
 * Detects if the error is likely caused by an ad blocker or browser extension
 */
const isLikelyAdBlockerError = (error: any): boolean => {
  const errorMessage = error?.message?.toLowerCase() || '';
  return (
    errorMessage.includes('err_blocked_by_client') || 
    errorMessage.includes('blocked by an extension') ||
    errorMessage.includes('could not be cloned')
  );
};

/**
 * Calls the Firebase function to generate captions with robust error handling
 * Implements region fallback, CORS workarounds, and demo content fallback
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
    
    // Prepare data for the function call
    const functionData: GenerateCaptionsParams = {
      tone,
      platform,
      niche,
      goal,
      postIdea: postIdea || niche  // Use postIdea if provided, otherwise fall back to niche
    };
    
    try {
      // Call the Cloud Function using our new service
      const result = await callGenerateCaptions(functionData);
      
      // Validate response data
      if (!result || !result.captions || result.captions.length === 0) {
        throw new Error("Invalid or empty response");
      }
      
      // Process captions - ensure hashtags are in the right format
      const processedCaptions = result.captions.map(caption => {
        // Handle legacy API response format (tags as string)
        if ('tags' in caption && typeof caption.hashtags === 'undefined') {
          const tags = (caption as any).tags || '';
          const hashtagsArray = typeof tags === 'string' 
            ? tags.split(/\s+/).filter((tag: string) => tag.trim() !== '') 
            : [];
          
          return {
            ...caption,
            hashtags: hashtagsArray
          };
        }
        // Handle case where hashtags might be a string instead of an array
        if (caption.hashtags && !Array.isArray(caption.hashtags)) {
          const hashtagsStr = String(caption.hashtags);
          return {
            ...caption,
            hashtags: hashtagsStr.split(/\s+/).filter(tag => tag.trim() !== '')
          };
        }
        return caption;
      });
      
      toast.success("Captions generated successfully!");
      
      return {
        captions: processedCaptions as GeneratedCaption[],
        requests_remaining: result.requests_remaining
      };
      
    } catch (err) {
      console.log("Error calling generateCaptions:", err);
      throw err; // Re-throw to be handled by the outer try-catch
    }
  } catch (error: any) {
    console.error("Error generating captions:", error);
    
    // Enhanced error logging
    console.error("Error details:", {
      code: error?.code,
      message: error?.message,
      details: error?.details,
      stack: error?.stack
    });
    
    // Check if this is likely an ad-blocker issue
    if (isLikelyAdBlockerError(error)) {
      toast.warning("It appears a browser extension or ad-blocker might be interfering with API requests. Try disabling extensions or using a different browser.");
      console.log("Detected possible ad-blocker interference");
      
      return {
        captions: DEMO_CAPTIONS,
        requests_remaining: 999,
        error: "POSSIBLE_ADBLOCKER_INTERFERENCE",
        message: "Using demo captions. Consider disabling ad-blockers or browser extensions."
      };
    }
    
    // Check if we hit CORS issues and provide fallback content
    if (error?.message?.includes("CORS") || 
        error?.code === "functions/unavailable" || 
        error?.code === "functions/internal" ||
        error?.message?.includes("blocked by CORS policy")) {
      
      console.log("Using fallback demo captions due to API connectivity issues");
      toast.warning("Showing sample captions due to network connectivity issues. Your customized captions will be available soon.");
      
      // Return demo captions as fallback
      return {
        captions: DEMO_CAPTIONS,
        requests_remaining: 999,
        error: "CORS_ERROR",
        message: "Using demo captions. Network connectivity issues detected."
      };
    }
    
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
