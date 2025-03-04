
import React from 'react';
import { Link } from 'react-router-dom';
import { MOCK_USER_PROFILE } from '@/lib/constants';

const Navbar: React.FC = () => {
  return (
    <header className="w-full border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-600">
                EngagePerfect
              </span>
            </Link>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors duration-200">
              Home
            </Link>
            <Link to="/dashboard" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors duration-200">
              Dashboard
            </Link>
            <Link to="/profile" className="text-primary px-3 py-2 text-sm font-medium transition-colors duration-200 border-b-2 border-primary">
              Profile
            </Link>
          </nav>
          
          <div className="flex items-center space-x-4">
            <Link 
              to="/profile" 
              className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden transition-transform duration-200 hover:scale-110"
            >
              <img 
                src={MOCK_USER_PROFILE.profilePictureUrl} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
