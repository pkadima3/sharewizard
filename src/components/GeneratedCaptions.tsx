
import React, { useState, useRef, useEffect } from 'react';
import { Clipboard, Share2, Download, CheckCircle, Instagram, Twitter, Facebook, Linkedin, MessageCircle, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import html2canvas from 'html2canvas';

interface GeneratedCaptionsProps {
  mediaFile: File | null;
  previewUrl: string | null;
  selectedNiche: string;
  selectedPlatform: string;
  selectedGoal: string;
  selectedTone: string;
}

// Sample hashtag generator based on niche and platform
const generateHashtags = (niche: string, platform: string): string[] => {
  const baseHashtags = ['#AIsocial', '#engageperfect', '#contentcreator'];
  
  const nicheHashtags: Record<string, string[]> = {
    'fitness': ['#fitness', '#workout', '#healthylifestyle', '#fitnessmotivation', '#fitnessjourney'],
    'beauty': ['#beauty', '#skincare', '#makeup', '#selfcare', '#glowup'],
    'fashion': ['#fashion', '#style', '#ootd', '#fashioninspo', '#trendalert'],
    'tech': ['#tech', '#technology', '#innovation', '#digitalmarketing', '#techlife'],
    'food': ['#food', '#foodie', '#foodphotography', '#recipes', '#cookingathome'],
    'travel': ['#travel', '#wanderlust', '#travelgram', '#exploremore', '#travelphotography'],
    'business': ['#business', '#entrepreneur', '#success', '#motivation', '#leadership'],
    'personal': ['#personalgrowth', '#mindfulness', '#selfdevelopment', '#inspiration', '#growth']
  };

  // Get hashtags for the selected niche or use a default set
  const selectedNicheHashtags = nicheHashtags[niche.toLowerCase()] || 
    ['#trending', '#viral', '#content', '#socialmedia'];

  // Add platform-specific hashtags
  const platformHashtags: Record<string, string[]> = {
    'instagram': ['#instadaily', '#instagood', '#instamood'],
    'tiktok': ['#tiktokviral', '#foryoupage', '#fyp'],
    'facebook': ['#facebooklive', '#fbcommunity'],
    'twitter': ['#twittertrends', '#tweetoftheday'],
    'linkedin': ['#linkedintips', '#networking', '#professionalbranding'],
    'youtube': ['#youtuber', '#subscribe', '#youtubechannel'],
  };

  const selectedPlatformHashtags = platformHashtags[platform.toLowerCase()] || [];

  // Combine all hashtags and select a subset
  return [...baseHashtags, ...selectedNicheHashtags, ...selectedPlatformHashtags].slice(0, 10);
};

// Sample caption generator based on inputs
const generateInitialCaption = (niche: string, platform: string, goal: string, tone: string): string => {
  const captions = [
    "Unlock Your Potential! 🚀\n\nEvery journey starts with a single step. Let's make today the day you take that first towards a new, healthier you. Remember, it's not about being fast, it's about being better than you were yesterday.\n\nSignup link to our training programs and take the first step today!",
    
    "Nutrition is the foundation of fitness. It's not just about eating less, it's about eating right so you through that intense workout and recover properly afterwards. Let our nutrition transformers.\n\nDM me link to get your personalized nutrition plan!",
    
    "The body achieves what the mind believes. Fitness is not only a physical challenge but a mental one. Just like consistency, growth mindset, and a structured training routine are key to long-term success.\n\nPM me to join our mental strength workshop and unlock your potential!"
  ];
  
  return captions[Math.floor(Math.random() * captions.length)];
};

const GeneratedCaptions: React.FC<GeneratedCaptionsProps> = ({
  mediaFile,
  previewUrl,
  selectedNiche,
  selectedPlatform,
  selectedGoal,
  selectedTone
}) => {
  const [editedCaption, setEditedCaption] = useState<string>('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [shareSupported, setShareSupported] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("edit");
  const [downloadingMedia, setDownloadingMedia] = useState<boolean>(false);
  
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Check if Web Share API is supported
  useEffect(() => {
    if (navigator.share) {
      setShareSupported(true);
    }
  }, []);
  
  // Generate initial caption and hashtags
  useEffect(() => {
    const initialCaption = generateInitialCaption(
      selectedNiche, 
      selectedPlatform,
      selectedGoal,
      selectedTone
    );
    setEditedCaption(initialCaption);
    
    const generatedHashtags = generateHashtags(selectedNiche, selectedPlatform);
    setHashtags(generatedHashtags);
  }, [selectedNiche, selectedPlatform, selectedGoal, selectedTone]);
  
  // Handle copy to clipboard
  const handleCopyCaption = () => {
    const fullText = `${editedCaption}\n\n${hashtags.join(' ')}`;
    navigator.clipboard.writeText(fullText)
      .then(() => {
        setCopied(true);
        toast.success("Caption copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((error) => {
        console.error("Failed to copy caption:", error);
        toast.error("Failed to copy caption");
      });
  };
  
  // Handle share using Web Share API
  const handleShare = async () => {
    if (!navigator.share) {
      toast.error("Web Share API is not supported in your browser");
      return;
    }
    
    const fullText = `${editedCaption}\n\n${hashtags.join(' ')}`;
    
    try {
      const shareData: { title: string; text: string; files?: File[] } = {
        title: "My Caption",
        text: fullText,
      };
      
      // Add media file if available
      if (mediaFile) {
        // For videos, we might need to process it to add caption overlay
        if (mediaFile.type.startsWith('video/')) {
          // This is a simplified version - in a real app, you'd use a more robust video processing approach
          toast.info("Video sharing with caption overlay is not fully implemented in this demo");
          shareData.files = [mediaFile];
        } else {
          // For images, just share the original file
          shareData.files = [mediaFile];
        }
      }
      
      await navigator.share(shareData);
      toast.success("Shared successfully!");
    } catch (error) {
      console.error("Error sharing:", error);
      toast.error("Failed to share content");
    }
  };
  
  // Generate image with caption for platforms that don't support Web Share API
  const handleDownloadCaptionedImage = async () => {
    if (!previewContainerRef.current || !previewUrl) {
      toast.error("No preview available");
      return;
    }
    
    try {
      setDownloadingMedia(true);
      
      // Use html2canvas to capture the preview container
      const canvas = await html2canvas(previewContainerRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff"
      });
      
      // Convert canvas to data URL
      const imageUrl = canvas.toDataURL('image/png');
      
      // Create a download link
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `captioned-image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Image with caption downloaded successfully!");
    } catch (error) {
      console.error("Error generating image:", error);
      toast.error("Failed to generate captioned image");
    } finally {
      setDownloadingMedia(false);
    }
  };
  
  // Determine if the media is a video
  const isVideo = mediaFile?.type.startsWith('video/');
  
  return (
    <div className="w-full p-6">
      <h2 className="text-2xl font-semibold mb-2 text-gray-800 dark:text-white">
        Your Generated Caption
      </h2>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Edit, copy, share, or download your caption with the media
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Caption Area */}
        <div className="flex flex-col space-y-4">
          <Tabs defaultValue="edit" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="edit">Edit Caption</TabsTrigger>
              <TabsTrigger value="fuel">Fuel Your Body</TabsTrigger>
              <TabsTrigger value="mind">Mind Over Matter</TabsTrigger>
            </TabsList>
            
            <TabsContent value="edit" className="border rounded-lg p-4 min-h-[200px]">
              <Textarea
                value={editedCaption}
                onChange={(e) => setEditedCaption(e.target.value)}
                className="w-full h-[150px] p-3 border-none focus-visible:ring-0 focus-visible:ring-offset-0"
                placeholder="Edit your caption..."
              />
            </TabsContent>
            
            <TabsContent value="fuel" className="border rounded-lg p-4 min-h-[200px]">
              <p className="text-sm mb-3">
                Nutrition is the foundation of fitness. It's not just about eating less, it's about eating right so you through that intense workout and recover properly afterwards. Let our nutrition transformers.
              </p>
              <p className="text-sm mb-3">
                DM me link to get your personalized nutrition plan!
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="text-blue-500 text-xs">#nutrition</span>
                <span className="text-blue-500 text-xs">#fuelthefire</span>
                <span className="text-blue-500 text-xs">#fitnessmotivation</span>
                <span className="text-blue-500 text-xs">#healthyeating</span>
                <span className="text-blue-500 text-xs">#nutritionplan</span>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setEditedCaption("Nutrition is the foundation of fitness. It's not just about eating less, it's about eating right so you through that intense workout and recover properly afterwards. Let our nutrition transformers.\n\nDM me link to get your personalized nutrition plan!");
                  setHashtags(["#nutrition", "#fuelthefire", "#fitnessmotivation", "#healthyeating", "#nutritionplan"]);
                  setActiveTab("edit");
                  toast.success("Caption template applied!");
                }}
              >
                Use This Template
              </Button>
            </TabsContent>
            
            <TabsContent value="mind" className="border rounded-lg p-4 min-h-[200px]">
              <p className="text-sm mb-3">
                The body achieves what the mind believes. Fitness is not only a physical challenge but a mental one. Just like consistency, growth mindset, and a structured training routine are key to long-term success.
              </p>
              <p className="text-sm mb-3">
                PM me to join our mental strength workshop and unlock your potential!
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="text-blue-500 text-xs">#mindset</span>
                <span className="text-blue-500 text-xs">#growthmindset</span>
                <span className="text-blue-500 text-xs">#mentalstrength</span>
                <span className="text-blue-500 text-xs">#fitness</span>
                <span className="text-blue-500 text-xs">#unlockpotential</span>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setEditedCaption("The body achieves what the mind believes. Fitness is not only a physical challenge but a mental one. Just like consistency, growth mindset, and a structured training routine are key to long-term success.\n\nPM me to join our mental strength workshop and unlock your potential!");
                  setHashtags(["#mindset", "#growthmindset", "#mentalstrength", "#fitness", "#unlockpotential"]);
                  setActiveTab("edit");
                  toast.success("Caption template applied!");
                }}
              >
                Use This Template
              </Button>
            </TabsContent>
          </Tabs>
          
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-medium mb-2">Hashtags</h3>
            <div className="flex flex-wrap gap-2">
              {hashtags.map((tag, index) => (
                <span key={index} className="text-blue-500 hover:underline cursor-pointer">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          
          <div className="flex justify-between">
            <Button
              onClick={handleCopyCaption}
              variant="outline"
              className="flex items-center gap-2"
            >
              {copied ? <CheckCircle className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
              Copy Caption
            </Button>
            
            <div className="flex gap-2">
              {shareSupported && (
                <Button
                  onClick={handleShare}
                  variant="default"
                  className="flex items-center gap-2"
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {/* Preview Area */}
        <div className="flex flex-col space-y-4">
          <div className="border rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800">
            <div className="p-3 border-b bg-white dark:bg-gray-900">
              <h3 className="text-lg font-medium">Preview</h3>
            </div>
            
            <div 
              ref={previewContainerRef} 
              className="relative bg-white p-4 overflow-hidden"
              style={{ minHeight: '400px' }}
            >
              <div className="text-center text-lg font-semibold mb-4">
                Unlock Your Potential
              </div>
              
              <div className="mb-4 flex justify-center">
                {previewUrl && (
                  isVideo ? (
                    <video 
                      ref={videoRef}
                      src={previewUrl}
                      controls
                      className="max-h-[300px] max-w-full object-contain rounded border"
                    />
                  ) : (
                    <img 
                      src={previewUrl}
                      alt="Preview" 
                      className="max-h-[300px] max-w-full object-contain rounded border"
                    />
                  )
                )}
              </div>
              
              <div className="text-sm mb-3">
                {editedCaption.split('\n').map((line, i) => (
                  <React.Fragment key={i}>
                    {line}<br />
                  </React.Fragment>
                ))}
              </div>
              
              <div className="flex flex-wrap gap-1 text-xs text-blue-500">
                {hashtags.map((tag, index) => (
                  <span key={index}>{tag}</span>
                ))}
              </div>
              
              <div className="text-xs text-gray-500 mt-4 text-center">
                Created with EngagePerfect • https://engageperfect.com
              </div>
            </div>
          </div>
          
          <div className="border rounded-lg overflow-hidden">
            <div className="p-3 border-b bg-white dark:bg-gray-900">
              <h3 className="text-lg font-medium">Share to Social Media</h3>
            </div>
            
            <div className="p-4">
              <div className="bg-purple-500 text-white p-3 rounded-lg mb-4 text-center cursor-pointer hover:bg-purple-600 transition-colors">
                <div className="flex items-center justify-center gap-2">
                  <Share2 className="h-4 w-4" />
                  <span>Share via Browser (WhatsApp, Telegram, etc)</span>
                </div>
              </div>
              
              <div className="grid grid-cols-6 gap-3 mt-4">
                <div className="flex flex-col items-center">
                  <button className="w-12 h-12 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white">
                    <Instagram className="h-6 w-6" />
                  </button>
                  <span className="text-xs mt-1 text-center">Instagram</span>
                </div>
                
                <div className="flex flex-col items-center">
                  <button className="w-12 h-12 rounded-lg bg-blue-400 flex items-center justify-center text-white">
                    <Twitter className="h-6 w-6" />
                  </button>
                  <span className="text-xs mt-1 text-center">Twitter</span>
                </div>
                
                <div className="flex flex-col items-center">
                  <button className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                    <Facebook className="h-6 w-6" />
                  </button>
                  <span className="text-xs mt-1 text-center">Facebook</span>
                </div>
                
                <div className="flex flex-col items-center">
                  <button className="w-12 h-12 rounded-lg bg-blue-700 flex items-center justify-center text-white">
                    <Linkedin className="h-6 w-6" />
                  </button>
                  <span className="text-xs mt-1 text-center">LinkedIn</span>
                </div>
                
                <div className="flex flex-col items-center">
                  <button className="w-12 h-12 rounded-lg bg-black flex items-center justify-center text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 448 512" fill="white">
                      <path d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z"/>
                    </svg>
                  </button>
                  <span className="text-xs mt-1 text-center">TikTok</span>
                </div>
                
                <div className="flex flex-col items-center">
                  <button className="w-12 h-12 rounded-lg bg-red-600 flex items-center justify-center text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
                    </svg>
                  </button>
                  <span className="text-xs mt-1 text-center">YouTube</span>
                </div>
              </div>
              
              <p className="text-xs text-gray-500 mt-4 text-center">
                Note: Some platforms don't support the Web Share API. Click the Instagram button below to copy media with caption overlay.
              </p>
              
              <div className="mt-4 p-3 border border-blue-200 rounded-lg bg-blue-50 text-blue-800 text-sm">
                <p>Tip: To upload to Instagram or TikTok, download the image with caption overlay. Click the Download button below.</p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <canvas ref={canvasRef} className="hidden" />
            
            <div className="border rounded-lg p-3 w-full">
              <h3 className="text-lg font-medium mb-2">Caption Details</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Platform:</span>
                  <span className="font-medium">{selectedPlatform || 'All Platforms'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Niche:</span>
                  <span className="font-medium">{selectedNiche || 'General'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Goal:</span>
                  <span className="font-medium">{selectedGoal || 'Engagement'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Tone:</span>
                  <span className="font-medium">{selectedTone || 'Professional'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Word count:</span>
                  <span className="font-medium">{editedCaption.split(/\s+/).filter(Boolean).length}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleShare}
              className="w-full"
              variant="default"
              disabled={!shareSupported}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            
            <Button
              onClick={handleDownloadCaptionedImage}
              className="w-full"
              variant="outline"
              disabled={downloadingMedia || !previewUrl}
            >
              {downloadingMedia ? (
                <div className="h-4 w-4 border-t-2 border-r-2 border-current rounded-full animate-spin mr-2"></div>
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Download
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneratedCaptions;
