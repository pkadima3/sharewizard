
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

export interface ApiErrorDetails {
  code?: string;
  message?: string;
  isNetworkError?: boolean;
  isCorsError?: boolean;
}

export interface SocialApiConfig {
  retryCount?: number;
  maxRetries?: number;
  timeout?: number;
  corsErrorHandling?: 'fallback' | 'error';
}
