
import React from 'react';
import { UserStats, SubscriptionTier } from '@/types';
import { PLAN_LIMITS, DEFAULT_REQUEST_LIMIT } from '@/lib/constants';
import { 
  BarChart3, 
  MessageSquareText, 
  Share2, 
  FileEdit,
  Twitter,
  Linkedin,
  Facebook,
  Share,
  Calendar,
  CircleDollarSign,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { calculateUsagePercentage, formatPlanName, getDaysRemainingInPlan, getSuggestedUpgrade } from '@/lib/subscriptionUtils';
import { Button } from '@/components/ui/button';
import { createSubscriptionCheckout, createFlexCheckout, openCustomerPortal } from '@/lib/stripe';
import { useToast } from '@/hooks/use-toast';

interface UsageStatsProps {
  stats: UserStats;
  subscriptionTier: SubscriptionTier;
}

const UsageStats: React.FC<UsageStatsProps> = ({ stats, subscriptionTier }) => {
  const { userProfile, subscription, currentUser } = useAuth();
  const { toast } = useToast();
  
  // Calculate usage percentages
  const aiUsagePercentage = Math.min(
    (stats.aiRequestsUsed / stats.aiRequestsLimit) * 100, 
    100
  );
  
  const planLimits = PLAN_LIMITS[subscriptionTier];
  
  // Get actual subscription data from Auth context if available
  const planType = userProfile?.plan_type || 'free';
  const requestsUsed = userProfile?.requests_used || 0;
  const requestsLimit = userProfile?.requests_limit || DEFAULT_REQUEST_LIMIT.free;
  const usagePercentage = calculateUsagePercentage(requestsUsed, requestsLimit);

  // Get trial or reset date
  const endDate = userProfile?.trial_end_date || userProfile?.reset_date || null;
  const daysRemaining = endDate ? getDaysRemainingInPlan(endDate) : 0;
  
  // Suggested upgrade message
  const upgradeMessage = getSuggestedUpgrade(planType);

  // Handle plan upgrade
  const handleUpgrade = async () => {
    if (!currentUser) {
      toast({
        title: "Error",
        description: "You must be logged in to upgrade your plan",
        variant: "destructive",
      });
      return;
    }

    try {
      let priceId = "";

      // Determine which price ID to use based on current plan
      switch (planType) {
        case 'free':
        case 'trial':
          // Start with basic plan
          priceId = "price_basic_monthly"; // Replace with your actual price ID
          break;
        case 'basic':
          // Upgrade to premium
          priceId = "price_premium_monthly"; // Replace with your actual price ID
          break;
        case 'premium':
        case 'flexy':
          // Buy flex pack
          priceId = "price_flex_pack"; // Replace with your actual price ID
          const quantity = 1;
          const url = await createFlexCheckout(currentUser.uid, priceId, quantity);
          window.location.assign(url);
          return;
      }

      const url = await createSubscriptionCheckout(currentUser.uid, priceId);
      window.location.assign(url);
    } catch (error: any) {
      console.error("Error upgrading plan:", error);
      toast({
        title: "Error",
        description: `Failed to upgrade plan: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  // Handle opening customer portal
  const handleOpenPortal = async () => {
    if (!currentUser) {
      toast({
        title: "Error",
        description: "You must be logged in to manage your subscription",
        variant: "destructive",
      });
      return;
    }

    try {
      const url = await openCustomerPortal(currentUser.uid);
      window.location.assign(url);
    } catch (error: any) {
      console.error("Error opening customer portal:", error);
      toast({
        title: "Error",
        description: `Failed to open customer portal: ${error.message}`,
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-semibold">Usage Statistics</h2>
      
      <div className="space-y-6">
        {/* Plan Information */}
        <div className="stats-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <CircleDollarSign className="w-5 h-5 text-blue-500 mr-2" />
              <h3 className="font-medium">Current Plan: {formatPlanName(planType)}</h3>
            </div>
            {endDate && (
              <div className="flex items-center text-sm">
                <Calendar className="w-4 h-4 text-gray-500 mr-1" />
                <span>{planType === 'trial' ? 'Trial ends' : 'Resets'} in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
          
          {/* Requests Progress */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Request Usage</span>
            <span className="text-sm font-medium">
              {requestsUsed}/{requestsLimit}
            </span>
          </div>
          
          <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ease-out ${
                usagePercentage > 90 ? 'bg-red-500' : usagePercentage > 75 ? 'bg-orange-500' : 'bg-gradient-to-r from-blue-400 to-blue-600'
              }`}
              style={{ width: `${usagePercentage}%` }}
            ></div>
          </div>
          
          <div className="mt-2 text-sm text-gray-500 flex justify-between">
            <div>{requestsLimit - requestsUsed} requests remaining</div>
            {usagePercentage > 75 && (
              <div className={usagePercentage > 90 ? 'text-red-500 font-medium' : 'text-orange-500'}>
                {usagePercentage > 90 ? 'Almost out of requests!' : 'Running low on requests'}
              </div>
            )}
          </div>
          
          {/* Upgrade Prompt */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
            <p className="text-sm text-gray-700 mb-3">{upgradeMessage}</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                variant="default" 
                size="sm" 
                className="w-full sm:w-auto"
                onClick={handleUpgrade}
              >
                Upgrade Plan
              </Button>
              
              {/* Only show manage subscription button for paid users */}
              {(planType === 'basic' || planType === 'premium' || planType === 'trial') && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full sm:w-auto"
                  onClick={handleOpenPortal}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Manage Subscription
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Posts Generated */}
          <div className="stats-card flex items-start">
            <div className="p-2 rounded-full bg-blue-50">
              <MessageSquareText className="w-5 h-5 text-blue-500" />
            </div>
            <div className="ml-3">
              <div className="text-sm text-gray-500">Posts Generated</div>
              <div className="text-xl font-semibold">{stats.postsGenerated}</div>
              <div className="text-xs text-gray-400">Limit: {planLimits.postsPerMonth}/month</div>
            </div>
          </div>
          
          {/* Drafts Saved */}
          <div className="stats-card flex items-start">
            <div className="p-2 rounded-full bg-purple-50">
              <FileEdit className="w-5 h-5 text-purple-500" />
            </div>
            <div className="ml-3">
              <div className="text-sm text-gray-500">Drafts Saved</div>
              <div className="text-xl font-semibold">{stats.postsDrafted}</div>
              <div className="text-xs text-gray-400">Limit: {planLimits.drafts}</div>
            </div>
          </div>
          
          {/* Posts Shared */}
          <div className="stats-card flex items-start">
            <div className="p-2 rounded-full bg-green-50">
              <Share2 className="w-5 h-5 text-green-500" />
            </div>
            <div className="ml-3">
              <div className="text-sm text-gray-500">Posts Shared</div>
              <div className="text-xl font-semibold">{stats.postsShared.total}</div>
              <div className="text-xs text-gray-400">Across all platforms</div>
            </div>
          </div>
        </div>
        
        {/* Shares by Platform */}
        <div className="stats-card">
          <h3 className="font-medium mb-4">Shares by Platform</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="w-10 h-10 mx-auto bg-blue-50 rounded-full flex items-center justify-center">
                <Twitter className="w-5 h-5 text-blue-400" />
              </div>
              <div className="mt-2 text-sm font-medium">{stats.postsShared.byPlatform.twitter}</div>
              <div className="text-xs text-gray-500">Twitter</div>
            </div>
            
            <div className="text-center">
              <div className="w-10 h-10 mx-auto bg-blue-50 rounded-full flex items-center justify-center">
                <Linkedin className="w-5 h-5 text-blue-700" />
              </div>
              <div className="mt-2 text-sm font-medium">{stats.postsShared.byPlatform.linkedin}</div>
              <div className="text-xs text-gray-500">LinkedIn</div>
            </div>
            
            <div className="text-center">
              <div className="w-10 h-10 mx-auto bg-blue-50 rounded-full flex items-center justify-center">
                <Facebook className="w-5 h-5 text-blue-600" />
              </div>
              <div className="mt-2 text-sm font-medium">{stats.postsShared.byPlatform.facebook}</div>
              <div className="text-xs text-gray-500">Facebook</div>
            </div>
            
            <div className="text-center">
              <div className="w-10 h-10 mx-auto bg-gray-50 rounded-full flex items-center justify-center">
                <Share className="w-5 h-5 text-gray-600" />
              </div>
              <div className="mt-2 text-sm font-medium">{stats.postsShared.byPlatform.other}</div>
              <div className="text-xs text-gray-500">Other Apps</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsageStats;
