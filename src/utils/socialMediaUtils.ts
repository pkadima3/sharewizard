
// Re-export everything from the social directory for backward compatibility
export * from './social';
export * from './social/apiHelpers';
export * from './social/browserSharing';

// Handle console errors appearing in preview mode
const handleConsoleError = (originalError: Error) => {
  // Only run this in development and preview environments
  if (window.location.hostname.includes('localhost') ||
      window.location.hostname.includes('preview') || 
      window.location.hostname.includes('lovable')) {
    
    // Check if this is a CORS error
    const errorMessage = originalError?.message || '';
    if (errorMessage.toLowerCase().includes('cors')) {
      console.warn('CORS error detected in preview/development mode. This is expected when testing and will use fallbacks in production.');
    }
  }
  
  // Return the original error
  return originalError;
};

// Override the default console.error in development/preview environments
// to provide better feedback for CORS errors
const originalConsoleError = console.error;
console.error = function(...args) {
  // Call the original console.error
  originalConsoleError.apply(console, args);
  
  // Check if this is a CORS error
  if (args.length > 0 && typeof args[0] === 'string' && 
      args[0].toLowerCase().includes('cors')) {
    console.warn('⚠️ CORS warning: This error is normal in development/preview environments and will use fallback content.');
  }
};
