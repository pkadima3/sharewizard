
import { toast } from "sonner";
import { SharingOptions, ShareResult } from "./types";

/**
 * Share content using the Web Share API if available
 * Falls back to opening a new window if Web Share API is not supported
 */
export const shareViaBrowser = async (options: SharingOptions): Promise<ShareResult> => {
  const { caption, mediaUrl } = options;
  
  try {
    // Extract text content from caption object
    const title = caption?.title || 'Check this out!';
    const text = [
      caption?.caption || '',
      caption?.cta || '',
      (caption?.hashtags && Array.isArray(caption.hashtags)) 
        ? caption.hashtags.map(tag => `#${tag}`).join(' ') 
        : caption?.hashtags || ''
    ].filter(Boolean).join('\n\n');
    
    // Check if Web Share API is supported
    if (navigator.share) {
      const shareData: ShareData = {
        title,
        text
      };
      
      // Add media file if available and supported
      if (mediaUrl && navigator.canShare) {
        try {
          const response = await fetch(mediaUrl);
          const blob = await response.blob();
          const file = new File([blob], 'media.jpg', { type: blob.type });
          
          const fileShareData = {
            ...shareData,
            files: [file]
          };
          
          // Test if we can share with files
          if (navigator.canShare(fileShareData)) {
            await navigator.share(fileShareData);
            return { success: true, message: 'Shared content with media' };
          }
        } catch (fileError) {
          console.warn('File sharing not supported, falling back to text-only share', fileError);
        }
      }
      
      // If we get here, either there's no media or file sharing failed/isn't supported
      await navigator.share(shareData);
      return { success: true, message: 'Shared content' };
    }
    
    // Fallback for browsers that don't support Web Share API
    const content = `${title}\n\n${text}`;
    const encodedContent = encodeURIComponent(content);
    
    // Use mailto as a universal fallback
    window.open(`mailto:?subject=${encodeURIComponent(title)}&body=${encodedContent}`, '_blank');
    
    return { 
      success: true, 
      message: 'Opened sharing options' 
    };
  } catch (error) {
    console.error('Browser sharing error:', error);
    
    // User may have cancelled the share dialog
    if (error instanceof Error && error.name === 'AbortError') {
      return { 
        success: false, 
        error: 'Share cancelled' 
      };
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error during sharing' 
    };
  }
};
