
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';

const Dashboard: React.FC = () => {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();

  // Protect route - redirect to login if not authenticated
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  if (!currentUser || !userProfile) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Welcome back, {currentUser.displayName || 'User'}!
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="stats-card dark:bg-gray-800 dark:text-white">
            <h3 className="text-lg font-medium">Recent Activity</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Your recent content creation activity</p>
            <div className="mt-4">
              <p className="text-center text-gray-500 dark:text-gray-400">No recent activity</p>
            </div>
          </div>

          <div className="stats-card dark:bg-gray-800 dark:text-white">
            <h3 className="text-lg font-medium">Engagement Metrics</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Performance of your published content</p>
            <div className="mt-4">
              <p className="text-center text-gray-500 dark:text-gray-400">No data available</p>
            </div>
          </div>

          <div className="stats-card dark:bg-gray-800 dark:text-white">
            <h3 className="text-lg font-medium">Quick Actions</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Common tasks you might want to do</p>
            <div className="mt-4 space-y-2">
              <button className="w-full p-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 transition-colors">
                Create New Post
              </button>
              <button className="w-full p-2 text-sm font-medium text-gray-700 bg-gray-100 dark:bg-gray-700 dark:text-white rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                Schedule Content
              </button>
              <button className="w-full p-2 text-sm font-medium text-gray-700 bg-gray-100 dark:bg-gray-700 dark:text-white rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                Analyze Performance
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
