
/**
 * Utility functions for environment detection
 */

/**
 * Checks if the application is running in development mode
 */
export const isDevelopment = (): boolean => {
  return import.meta.env.DEV === true || 
    window.location.hostname === 'localhost' || 
    window.location.hostname.includes('127.0.0.1');
};

/**
 * Checks if the application is running in a preview environment
 */
export const isPreview = (): boolean => {
  return window.location.hostname.includes('lovable.app') || 
    window.location.hostname.includes('lovableproject.com') ||
    window.location.hostname.includes('preview');
};

/**
 * Checks if we should use Firebase emulators based on environment variables
 */
export const shouldUseEmulator = (): boolean => {
  return isDevelopment() && import.meta.env.VITE_USE_EMULATORS === 'true';
};
