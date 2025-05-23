
import React from 'react';
import { Post } from '@/types';
import { formatDate } from '@/lib/constants';
import { Twitter, Linkedin, Facebook, Share, ExternalLink } from 'lucide-react';

interface RecentPostsProps {
  posts: Post[];
}

const RecentPosts: React.FC<RecentPostsProps> = ({ posts }) => {
  if (posts.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in">
        <h2 className="text-2xl font-semibold dark:text-white">Recent Posts</h2>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-subtle p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">No posts shared yet</p>
        </div>
      </div>
    );
  }
  
  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'twitter':
        return <Twitter className="w-4 h-4 text-blue-400" />;
      case 'linkedin':
        return <Linkedin className="w-4 h-4 text-blue-700" />;
      case 'facebook':
        return <Facebook className="w-4 h-4 text-blue-600" />;
      default:
        return <Share className="w-4 h-4 text-gray-600 dark:text-gray-400" />;
    }
  };
  
  const calculateTotalShares = (post: Post) => {
    const { twitter, linkedin, facebook, other } = post.shareCounts;
    return twitter + linkedin + facebook + other;
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold dark:text-white">Recent Posts</h2>
        <button className="text-sm text-primary hover:underline flex items-center">
          View All <ExternalLink className="ml-1 w-3 h-3" />
        </button>
      </div>
      
      <div className="space-y-4">
        {posts.map((post) => (
          <div 
            key={post.id} 
            className="stats-card hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-2">
              {getPlatformIcon(post.platform)}
              <span className="text-sm font-medium dark:text-white">{post.platform}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">• {formatDate(post.createdAt)}</span>
            </div>
            
            <div className="mt-3">
              <p className="text-gray-800 dark:text-gray-200 line-clamp-3">{post.content}</p>
            </div>
            
            {post.imageUrl && (
              <div className="mt-3 rounded-lg overflow-hidden h-40 bg-gray-100 dark:bg-gray-700">
                <img 
                  src={post.imageUrl} 
                  alt="Post image" 
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            )}
            
            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="flex items-center">
                  <Twitter className="w-4 h-4 text-blue-400 mr-1" />
                  <span className="text-xs font-medium dark:text-gray-300">{post.shareCounts.twitter}</span>
                </div>
                
                <div className="flex items-center">
                  <Linkedin className="w-4 h-4 text-blue-700 mr-1" />
                  <span className="text-xs font-medium dark:text-gray-300">{post.shareCounts.linkedin}</span>
                </div>
                
                <div className="flex items-center">
                  <Facebook className="w-4 h-4 text-blue-600 mr-1" />
                  <span className="text-xs font-medium dark:text-gray-300">{post.shareCounts.facebook}</span>
                </div>
                
                <div className="flex items-center">
                  <Share className="w-4 h-4 text-gray-600 dark:text-gray-400 mr-1" />
                  <span className="text-xs font-medium dark:text-gray-300">{post.shareCounts.other}</span>
                </div>
              </div>
              
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {calculateTotalShares(post)} total shares
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentPosts;
