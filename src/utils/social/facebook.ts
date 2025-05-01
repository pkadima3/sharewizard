
import { SharingOptions, ShareResult } from "./types";

export const shareToFacebook = async (options: SharingOptions): Promise<ShareResult> => {
  try {
    const { caption, mediaType, mediaUrl } = options;
    
    // Check if Facebook API credentials are available
    const fbApiKey = import.meta.env.VITE_FACEBOOK_API_KEY;
    const fbAccessToken = import.meta.env.VITE_FACEBOOK_ACCESS_TOKEN;
    
    // For Facebook, we can fall back to the Facebook Sharer URL
    let facebookShareUrl = 'https://www.facebook.com/sharer/sharer.php?';
    
    if (mediaUrl) {
      facebookShareUrl += `u=${encodeURIComponent(mediaUrl)}`;
    } else {
      // If no media URL, share the caption text
      const text = `${caption.title}\n\n${caption.caption}`;
      facebookShareUrl += `quote=${encodeURIComponent(text)}`;
    }
    
    // Open Facebook share dialog
    window.open(facebookShareUrl, '_blank', 'width=600,height=600');
    
    console.log('Shared to Facebook via web dialog');
    
    return { 
      success: true, 
      message: 'Facebook sharing window opened' 
    };
  } catch (error) {
    console.error('Facebook sharing error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown Facebook sharing error' 
    };
  }
};
