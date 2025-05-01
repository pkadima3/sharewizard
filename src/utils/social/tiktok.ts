
import { toast } from "sonner";
import { SharingOptions, ShareResult } from "./types";
import { shareViaBrowser } from "./browserSharing";
import { handleApiError } from "./apiHelpers";

export const shareToTikTok = async (options: SharingOptions): Promise<ShareResult> => {
  try {
    const { caption, mediaType, mediaUrl } = options;
    
    // First try browser sharing as TikTok is restrictive about web API integration
    try {
      const browserShareResult = await shareViaBrowser(options);
      if (browserShareResult.success) {
        return browserShareResult;
      }
    } catch (browserShareError) {
      console.warn('Browser sharing failed, falling back to TikTok web:', browserShareError);
    }
    
    // TikTok doesn't have a standard web share URL like other platforms
    // We'll need to use their SDK or API in a real implementation
    
    // As a fallback, direct users to the TikTok app or website
    toast.info('Opening TikTok. Please upload your media there.');
    window.open('https://www.tiktok.com/upload', '_blank');
    
    return { 
      success: true, 
      message: 'TikTok upload page opened' 
    };
  } catch (error) {
    const errorDetails = handleApiError(error, 'TikTok');
    
    return { 
      success: false, 
      error: errorDetails.message || 'Unknown TikTok sharing error' 
    };
  }
};
