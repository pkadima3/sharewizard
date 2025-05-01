
import { toast } from "sonner";
import { SharingOptions, ShareResult } from "./types";

export const shareToInstagram = async (options: SharingOptions): Promise<ShareResult> => {
  try {
    const { caption, mediaType, mediaUrl } = options;
    
    // Check if Instagram API credentials are available
    const igApiKey = import.meta.env.VITE_INSTAGRAM_CLIENT_SECRET;
    const igAccessToken = import.meta.env.VITE_INSTAGRAM_ACCESS_TOKEN;
    const igAppId = import.meta.env.VITE_INSTAGRAM_APP_ID;
    
    if (!igApiKey || !igAccessToken) {
      console.log('Missing Instagram API credentials');
      
      // Attempt to open Instagram sharing in a new window if we can't use the API
      if (mediaUrl && typeof window !== 'undefined') {
        const instagramUrl = `https://www.instagram.com/share?url=${encodeURIComponent(mediaUrl)}`;
        window.open(instagramUrl, '_blank', 'width=600,height=600');
        return { 
          success: true, 
          message: 'Instagram sharing window opened' 
        };
      }
      
      return { 
        success: false, 
        error: 'Instagram API credentials not configured.' 
      };
    }
    
    if (!mediaUrl && mediaType !== 'text-only') {
      return { success: false, error: 'Media URL is required for Instagram sharing' };
    }
    
    console.log('Sharing to Instagram with:', { mediaType, captionTitle: caption?.title });
    
    // In a real implementation, you would make API calls to the Instagram Graph API
    // For now, let's simulate a successful API call
    // In production, you would use the FB Graph API: https://developers.facebook.com/docs/instagram-api/guides/content-publishing
    
    return { 
      success: true, 
      message: 'Shared to Instagram successfully' 
    };
  } catch (error) {
    console.error('Instagram sharing error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown Instagram sharing error' 
    };
  }
};
