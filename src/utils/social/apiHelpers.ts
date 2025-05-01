
import { toast } from "sonner";
import { ApiErrorDetails } from "./types";

/**
 * Check if an error is likely caused by CORS restrictions
 */
export const isCorsError = (error: any): boolean => {
  const errorMessage = error?.message?.toLowerCase() || '';
  const errorCode = error?.code?.toLowerCase() || '';
  
  return (
    errorMessage.includes('cors') ||
    errorMessage.includes('access-control-allow-origin') ||
    errorMessage.includes('blocked by cors policy')
  );
};

/**
 * Check if an error is likely caused by ad blockers or browser extensions
 */
export const isAdBlockerError = (error: any): boolean => {
  const errorMessage = error?.message?.toLowerCase() || '';
  
  return (
    errorMessage.includes('err_blocked_by_client') || 
    errorMessage.includes('blocked by an extension') ||
    errorMessage.includes('could not be cloned')
  );
};

/**
 * Check if an error is likely a network connectivity issue
 */
export const isNetworkError = (error: any): boolean => {
  const errorMessage = error?.message?.toLowerCase() || '';
  const errorCode = error?.code?.toLowerCase() || '';
  
  return (
    errorMessage.includes('network') ||
    errorMessage.includes('failed to fetch') ||
    errorMessage.includes('timeout') ||
    errorMessage.includes('offline') ||
    errorCode.includes('unavailable') ||
    errorCode.includes('network')
  );
};

/**
 * Analyze an error and extract relevant details
 */
export const analyzeApiError = (error: any): ApiErrorDetails => {
  const details: ApiErrorDetails = {
    message: error?.message || 'Unknown error occurred'
  };
  
  // Try to extract Firebase error code if available
  if (error?.code) {
    details.code = error.code;
  }
  
  // Check for specific error types
  details.isCorsError = isCorsError(error);
  details.isNetworkError = isNetworkError(error);
  
  return details;
};

/**
 * Handle API errors with appropriate user feedback
 */
export const handleApiError = (error: any, serviceName: string): ApiErrorDetails => {
  const details = analyzeApiError(error);
  console.error(`${serviceName} API Error:`, error);
  
  if (details.isCorsError) {
    toast.error(`CORS policy blocked access to ${serviceName}. Using fallback mode.`);
  } else if (details.isNetworkError) {
    toast.error(`Network error when connecting to ${serviceName}. Check your connection.`);
  } else if (isAdBlockerError(error)) {
    toast.error(`Browser extension may be blocking ${serviceName} connection. Try disabling ad blockers.`);
  } else {
    toast.error(`Error connecting to ${serviceName}: ${details.message}`);
  }
  
  return details;
};

/**
 * Creates a timeout promise that rejects after a specified time
 */
export const createTimeoutPromise = (ms: number): Promise<never> => {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`Request timed out after ${ms}ms`)), ms);
  });
};
