
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { MediaType } from '@/types/mediaTypes';
import { createTimeoutPromise } from './apiHelpers';

// Helper function to upload media to Firebase before sharing
export const uploadMediaForSharing = async (
  mediaUrl: string,
  mediaType: MediaType,
  filename: string
): Promise<string> => {
  try {
    // Set a timeout to prevent hanging uploads
    const timeoutMs = 15000; // 15 seconds
    
    // Fetch the media file with timeout
    const fetchPromise = fetch(mediaUrl);
    const response = await Promise.race([fetchPromise, createTimeoutPromise(timeoutMs)]);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch media for sharing: ${response.status} ${response.statusText}`);
    }
    
    const blob = await response.blob();
    
    // Upload to Firebase with timeout
    const storage = getStorage();
    const storageRef = ref(storage, `shared-media/${filename}`);
    
    const uploadPromise = uploadBytes(storageRef, blob);
    await Promise.race([uploadPromise, createTimeoutPromise(timeoutMs)]);
    
    // Get download URL with timeout
    const urlPromise = getDownloadURL(storageRef);
    return await Promise.race([urlPromise, createTimeoutPromise(timeoutMs)]);
  } catch (error) {
    console.error('Error uploading media for sharing:', error);
    
    // Provide a fallback when in development or preview environments
    if (window.location.hostname.includes('localhost') || 
        window.location.hostname.includes('preview') || 
        window.location.hostname.includes('lovable.app')) {
      console.log('Using original media URL as fallback in development/preview environment');
      return mediaUrl; // Just return the original URL in development/preview
    }
    
    throw error;
  }
};
