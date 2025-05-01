
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { MediaType } from '@/types/mediaTypes';

// Helper function to upload media to Firebase before sharing
export const uploadMediaForSharing = async (
  mediaUrl: string,
  mediaType: MediaType,
  filename: string
): Promise<string> => {
  try {
    // Fetch the media file
    const response = await fetch(mediaUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch media for sharing');
    }
    
    const blob = await response.blob();
    
    // Upload to Firebase
    const storage = getStorage();
    const storageRef = ref(storage, `shared-media/${filename}`);
    
    await uploadBytes(storageRef, blob);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error('Error uploading media for sharing:', error);
    throw error;
  }
};
