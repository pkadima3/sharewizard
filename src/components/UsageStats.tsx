
import React from 'react';
import { UserStats, SubscriptionTier } from '@/types';
import { PLAN_LIMITS } from '@/lib/constants';
import { 
  BarChart3, 
  MessageSquareText, 
  Share2, 
  FileEdit,
  Twitter,
  Linkedin,
  Facebook,
  Share
} from 'lucide-react';

interface UsageStatsProps {
  stats: UserStats;
  subscriptionTier: SubscriptionTier;
}

const UsageStats: React.FC<UsageStatsProps> = ({ stats, subscriptionTier }) => {
  // Calculate usage percentages
  const aiUsagePercentage = Math.min(
    (stats.aiRequestsUsed / stats.aiRequestsLimit) * 100, 
    100
  );
  
  const planLimits = PLAN_LIMITS[subscriptionTier];
  
  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-semibold">Usage Statistics</h2>
      
      <div className="space-y-6">
        {/* AI Requests Progress */}
        <div className="stats-card">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <BarChart3 className="w-5 h-5 text-blue-500 mr-2" />
              <h3 className="font-medium">AI Requests</h3>
            </div>
            <span className="text-sm font-medium">
              {stats.aiRequestsUsed}/{stats.aiRequestsLimit}
            </span>
          </div>
          
          <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${aiUsagePercentage}%` }}
            ></div>
          </div>
          
          <div className="mt-2 text-sm text-gray-500">
            {stats.aiRequestsLimit - stats.aiRequestsUsed} requests remaining
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
