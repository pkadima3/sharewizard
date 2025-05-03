import { onRequest } from "firebase-functions/v2/https";
import { getOpenAIKey } from "./config/secrets";
import { generateCaptions } from "./services/openai";

// Export the test endpoint
export const testOpenAIKey = onRequest({
  cors: true, // Enable CORS for this test endpoint
  region: 'us-central1' // Primary region for deployment
}, async (req, res) => {
  try {
    // Add specific CORS headers for debugging
    const allowedOrigins = [
      // Lovable preview domains
      'https://preview--sharewizard.lovable.app',
      'https://lovable.dev',
      // Local development
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5174',
      // Production domains
      'https://engageperfect.com',
      'https://www.engageperfect.com',
      'https://engperfecthlc.web.app',
      'https://engperfecthlc.firebaseapp.com',
    ];
    
    const origin = req.headers.origin || '';
    
    // Check if the request origin is in our allowed list or is from lovable domains
    if (allowedOrigins.includes(origin) || 
        origin.includes('lovable.app') ||
        origin.includes('lovableproject.com') ||
        origin.includes('lovable.dev') ||
        req.headers.origin === '*') {
      
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
      // For unknown origins during development/testing, allow all
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
    
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS, POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // For preflight OPTIONS requests
    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }
    
    await getOpenAIKey();
    res.json({ message: "OpenAI API Key retrieved successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve OpenAI API key" });
  }
});

// Export the caption generator function
export { generateCaptions };