
import { MediaType } from '@/types/mediaTypes';

export interface SharingOptions {
  caption: any;
  mediaType?: MediaType;
  mediaUrl?: string | null;
}

export interface ShareResult {
  success: boolean;
  message?: string;
  error?: string;
}
