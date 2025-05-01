
import { SharingOptions, ShareResult } from "./types";

export const shareToTwitter = async (options: SharingOptions): Promise<ShareResult> => {
  try {
    const { caption, mediaType, mediaUrl } = options;
    
    // Check if Twitter API credentials are available
    const twitterApiKey = import.meta.env.VITE_TWITTER_API_KEY;
    const twitterAccessToken = import.meta.env.VITE_TWITTER_ACCESS_TOKEN;
    
    // For Twitter, we can fall back to the Twitter Web Intent URL
    const text = `${caption.title}\n\n${caption.caption}\n${caption.hashtags.map(tag => `#${tag}`).join(' ')}`;
    const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    
    if (mediaUrl) {
      twitterShareUrl + `&url=${encodeURIComponent(mediaUrl)}`;
    }
    
    // Open Twitter share dialog
    window.open(twitterShareUrl, '_blank', 'width=600,height=600');
    
    return { 
      success: true, 
      message: 'Twitter sharing window opened' 
    };
  } catch (error) {
    console.error('Twitter sharing error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown Twitter sharing error' 
    };
  }
};
