
import { SharingOptions, ShareResult } from './types';
import { shareToInstagram } from './instagram';
import { shareToTwitter } from './twitter';
import { shareToFacebook } from './facebook';
import { shareToLinkedIn } from './linkedin';
import { shareToTikTok } from './tiktok';
import { shareToYouTube } from './youtube';
export { uploadMediaForSharing } from './storage';
export type { SharingOptions, ShareResult };

// Main sharing function that routes to the appropriate platform
export const shareToPlatform = async (
  platform: string,
  options: SharingOptions
): Promise<ShareResult> => {
  try {
    // Normalize platform name to lowercase for consistent matching
    const normalizedPlatform = platform.toLowerCase();
    
    // Route to the appropriate platform sharing function
    switch (normalizedPlatform) {
      case 'instagram':
        return await shareToInstagram(options);
      case 'twitter':
        return await shareToTwitter(options);
      case 'facebook':
        return await shareToFacebook(options);
      case 'linkedin':
        return await shareToLinkedIn(options);
      case 'tiktok':
        return await shareToTikTok(options);
      case 'youtube':
        return await shareToYouTube(options);
      default:
        return {
          success: false,
          error: `Unsupported platform: ${platform}`
        };
    }
  } catch (error) {
    console.error(`Error sharing to ${platform}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : `Unknown error sharing to ${platform}`
    };
  }
};
