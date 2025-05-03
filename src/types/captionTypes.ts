
/**
 * Types for caption generation and display
 */

// Type for captions displayed in the UI
export interface GeneratedCaption {
  title: string;
  caption: string;
  cta: string;
  hashtags: string[];
}

// Type for API responses from Firebase function
export interface Caption {
  title: string;
  caption: string;
  cta: string;
  tags: string;
}
