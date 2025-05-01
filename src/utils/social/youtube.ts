
import { toast } from "sonner";
import { SharingOptions, ShareResult } from "./types";
import { shareViaBrowser } from "./browserSharing";
import { handleApiError } from "./apiHelpers";

export const shareToYouTube = async (options: SharingOptions): Promise<ShareResult> => {
  try {
    const { caption, mediaType, mediaUrl } = options;
    
    if (mediaType !== 'video') {
      return { 
        success: false, 
        error: 'Only videos can be shared to YouTube' 
      };
    }
    
    // First try browser sharing as a user-friendly option
    try {
      const browserShareResult = await shareViaBrowser(options);
      if (browserShareResult.success) {
        return browserShareResult;
      }
    } catch (browserShareError) {
      console.warn('Browser sharing failed, falling back to YouTube web:', browserShareError);
    }
    
    // YouTube doesn't have a standard web share URL for uploading
    // Direct users to YouTube Studio
    toast.info('Opening YouTube Studio. Please upload your video there.');
    window.open('https://studio.youtube.com/channel/upload', '_blank');
    
    return { 
      success: true, 
      message: 'YouTube Studio opened for upload' 
    };
  } catch (error) {
    const errorDetails = handleApiError(error, 'YouTube');
    
    return { 
      success: false, 
      error: errorDetails.message || 'Unknown YouTube sharing error' 
    };
  }
};
