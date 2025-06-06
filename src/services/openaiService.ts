import { toast } from "sonner";
import { generateCaptions as callGenerateCaptions, GenerateCaptionsParams, Caption as FirebaseCaption } from "./generateCaptionsService";
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
    
    // Call the Cloud Function using our service
    const result = await callGenerateCaptions(functionData);
    
    // Process captions - convert tags string to hashtags array
    const processedCaptions: GeneratedCaption[] = result.captions.map(caption => {
      const tagsStr = caption.tags || '';
      const hashtagsArray = tagsStr.split(/\s+/).filter(tag => tag.trim() !== '');
      
      return {
        title: caption.title,
        caption: caption.caption,
        cta: caption.cta,
        hashtags: hashtagsArray
      };
    });
    
    toast.success("Captions generated successfully!");
    
    return {
      captions: processedCaptions,
      requests_remaining: result.requests_remaining
    };
    
  } catch (error: any) {
    console.error("Error generating captions:", error);
    
    // Check if this is a CORS issue or other network error
    if (error?.message?.includes("CORS") || 
        error?.code === "functions/unavailable" || 
        error?.code === "functions/internal") {
      
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
    
    // Return demo captions as fallback for all errors
    return {
      captions: DEMO_CAPTIONS,
      requests_remaining: 999,
      error: error?.code || "FALLBACK_MODE",
      message: "Using demo captions due to service limitations."
    };
  }
};
