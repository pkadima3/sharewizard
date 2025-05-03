import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import axios from "axios";

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

// Type for OpenAI error response
interface OpenAIErrorResponse {
  status?: number;
  response?: {
    status: number;
    data: any;
  };
  message?: string;
}

// Define caption interface
export interface GeneratedCaption {
  title: string;
  caption: string;
  cta: string;
  tags: string;
}

// Define request parameters
interface GenerateCaptionsRequest {
  tone: string;
  platform: string;
  postIdea: string;
  niche: string;
  goal: string;
}

// Define response interface
interface GenerateCaptionsResponse {
  captions: GeneratedCaption[];
  requests_remaining: number;
}

// Helper function to parse captions
function parseCaptions(text: string): GeneratedCaption[] {
  console.log("Raw response from OpenAI:", text);
  
  const captions: GeneratedCaption[] = [];
  
  // Split the text by "Caption X:" pattern
  const captionBlocks = text.split(/Caption \d+:/);
  
  // Skip the first block if it's empty or contains only intro text
  const blocksToProcess = captionBlocks.slice(1);
  
  for (const block of blocksToProcess) {
    if (block.trim()) {
      // Extract the different parts
      const titleMatch = block.match(/\[Title\](.*?)(?=\[Caption\]|\[Call to Action\]|\[#Tags\]|$)/s);
      const captionMatch = block.match(/\[Caption\](.*?)(?=\[Call to Action\]|\[#Tags\]|$)/s);
      const ctaMatch = block.match(/\[Call to Action\](.*?)(?=\[#Tags\]|$)/s);
      const tagsMatch = block.match(/\[#Tags\](.*?)(?=$)/s);
      
      captions.push({
        title: titleMatch ? titleMatch[1].trim() : "Generated Title",
        caption: captionMatch ? captionMatch[1].trim() : "Check out this amazing content!",
        cta: ctaMatch ? ctaMatch[1].trim() : "Like and share!",
        tags: tagsMatch ? tagsMatch[1].trim() : "#content #social"
      });
    }
  }
  
  // Ensure we return exactly 3 captions (or fewer if parsing failed)
  return captions.slice(0, 3);
}

export const generateCaptions = onCall({
  // Set comprehensive CORS configuration with proper validation
  cors: [
    // Allow all origins - this is the key fix
    '*',
    
    // Also keep specific entries for clarity
    'https://preview--sharewizard.lovable.app',
    'https://lovable.dev',
    'http://localhost:5173',
    'http://localhost:5174',
    'https://engageperfect.com',
    'https://www.engageperfect.com',
    'https://engperfecthlc.web.app',
    'https://engperfecthlc.firebaseapp.com'
  ],
  maxInstances: 10,
  timeoutSeconds: 60,
  memory: '256MiB',
  region: 'us-central1' // Primary region for deployment
}, async (request) => {
  // Log the origin for debugging
  const origin = request.rawRequest?.headers?.origin || 'Unknown origin';
  console.log(`Request origin: ${origin}`);
  
  try {
    // Verify Firebase Auth
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated", 
        "You must be logged in to generate captions."
      );
    }
    
    const uid = request.auth.uid;
    const data = request.data as GenerateCaptionsRequest;
    
    // Input validation
    if (!data.tone || !data.platform || !data.postIdea || !data.niche || !data.goal) {
      throw new HttpsError(
        "invalid-argument",
        "Missing required fields. Please provide tone, platform, postIdea, niche, and goal."
      );
    }
    
    // Fetch user profile
    const userDoc = await admin.firestore().collection("users").doc(uid).get();
    
    if (!userDoc.exists) {
      throw new HttpsError(
        "not-found", 
        "User profile not found."
      );
    }
    
    const userData = userDoc.data() as {
      requests_used: number;
      requests_limit: number;
      plan_type: string;
      flexy_requests?: number;
    };
    
    // Check usage limits
    if (
      userData.requests_used >= userData.requests_limit && 
      (!userData.flexy_requests || userData.flexy_requests <= 0)
    ) {
      throw new HttpsError(
        "resource-exhausted",
        "You've reached your plan limit. Please upgrade or buy a Flex pack."
      );
    }
    
    // Get OpenAI API key from environment variable
    const openAiApiKey = process.env.OPENAI_API_KEY;
    
    if (!openAiApiKey) {
      console.error("OpenAI API key is missing");
      throw new HttpsError(
        "failed-precondition",
        "OpenAI API key is not configured. Please contact support."
      );
    }
    
    // Prepare OpenAI request
    const prompt = `You are the world's best content creator and digital, Social Media marketing and sales expert. 
    Create exactly 3 highly engaging ${data.tone} captions for ${data.platform} about '${data.postIdea}' in the ${data.niche} industry.
    
    The captions MUST follow this exact format with these exact headings:
    
    Caption 1:
    [Title] A catchy title that highlights the post's theme.
    [Caption] Write a 1-3 sentence caption in a ${data.tone} tone without hashtags.
    [Call to Action] Provide a specific call-to-action to encourage engagement.
    [#Tags] Include 3-5 relevant hashtags for the ${data.niche} industry.
    
    Caption 2:
    [Title] Another engaging title for a unique post idea.
    [Caption] Write an attention-grabbing caption.
    [Call to Action] Include a CTA to drive user interaction.
    [#Tags] Include creative relevant hashtags.
    
    Caption 3:
    [Title] Third compelling title idea
    [Caption] Provide a brief but engaging caption with appropriate.
    [Call to Action] Suggest a CTA to encourage likes, shares, or comments
    [#Tags] Include a third set of appropriate hashtags.
    
    Important requirements:
    1. Be concise and tailored to ${data.platform}'s audience and character limits.
    2. Reflect current trends or platform-specific language.
    3. If the goal is to share knowledge, start with words like 'did you know?', 'Insight:', 'Fact:', etc.
    4. Focus on the goal: ${data.goal}
    5. ALWAYS use the EXACT format with [Title], [Caption], [Call to Action], and [#Tags] sections for each caption.
    6. Do not include any explanations, just the 3 formatted captions.`;
    
    // Call OpenAI API
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are a professional social media caption generator that returns structured output."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 800
        },
        {
          headers: {
            'Authorization': `Bearer ${openAiApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const responseText = response.data.choices[0].message.content;
      
      // Parse captions
      const captions = parseCaptions(responseText);
      
      // Update user's request count
      const userRef = admin.firestore().collection("users").doc(uid);
      
      // Check if using flexy requests
      let requests_remaining: number;
      
      if (userData.plan_type === "flexy" && userData.flexy_requests && userData.flexy_requests > 0) {
        // Decrement flexy requests
        await userRef.update({
          flexy_requests: admin.firestore.FieldValue.increment(-1)
        });
        
        const updatedDoc = await userRef.get();
        const updatedData = updatedDoc.data() as { 
          flexy_requests: number; 
          requests_limit: number; 
          requests_used: number 
        };
        
        requests_remaining = (updatedData.flexy_requests || 0) + 
          (updatedData.requests_limit - updatedData.requests_used);
      } else {
        // Increment used requests
        await userRef.update({
          requests_used: admin.firestore.FieldValue.increment(1)
        });
        
        const updatedDoc = await userRef.get();
        const updatedData = updatedDoc.data() as { 
          requests_limit: number; 
          requests_used: number; 
          flexy_requests?: number 
        };
        
        requests_remaining = (updatedData.requests_limit - updatedData.requests_used) + 
          (updatedData.flexy_requests || 0);
      }
      
      // Log generation
      await admin.firestore().collection("users").doc(uid).collection("generations").add({
        input: {
          tone: data.tone,
          platform: data.platform,
          niche: data.niche,
          goal: data.goal,
          postIdea: data.postIdea
        },
        output: captions,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      // Return response
      return {
        captions,
        requests_remaining
      };
      
    } catch (error: any) {
      console.error("OpenAI API Error:", error);
      throw new HttpsError(
        "internal",
        "Failed to generate captions from AI. Please try again."
      );
    }
  } catch (error: any) {
    console.error("Function error:", error);
    
    if (error instanceof HttpsError) {
      throw error;
    }
    
    throw new HttpsError(
      "internal",
      error.message || "An unexpected error occurred"
    );
  }
});