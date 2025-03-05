
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { LogOut, Menu, X, Star } from 'lucide-react';
import { ThemeSwitcher } from './ThemeToggle';

const Navbar: React.FC = () => {
  const { currentUser, userProfile, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
      navigate('/login');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      });
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="w-full border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <img 
                src="/lovable-uploads/23327aae-0892-407a-a483-66a3aff1f9e7.png" 
                alt="AI Star" 
                className="w-8 h-8"
              />
              <span className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                EngagePerfect AI
              </span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link 
              to="/" 
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                isActive('/') 
                  ? 'text-primary bg-primary/10' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              Home
            </Link>
            <Link 
              to="/pricing" 
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                isActive('/pricing') 
                  ? 'text-primary bg-primary/10' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              Pricing
            </Link>
            <Link 
              to="/caption-generator" 
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                isActive('/caption-generator') 
                  ? 'text-primary bg-primary/10' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              Caption Generator
            </Link>
            <Link 
              to="/features" 
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                isActive('/features') 
                  ? 'text-primary bg-primary/10' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              Features
            </Link>
            <Link 
              to="/blog" 
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                isActive('/blog') 
                  ? 'text-primary bg-primary/10' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              Blog
            </Link>
          </nav>
          
          <div className="flex items-center space-x-4">
            {/* Theme Switcher */}
            <ThemeSwitcher />
            
            {/* Auth Actions */}
            {currentUser ? (
              <div className="flex items-center space-x-3">
                <Link 
                  to="/dashboard" 
                  className={`hidden sm:block px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                    isActive('/dashboard') 
                      ? 'text-primary bg-primary/10' 
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/profile" 
                  className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden transition-transform duration-200 hover:scale-110"
                >
                  {userProfile?.photoURL ? (
                    <img 
                      src={userProfile.photoURL} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary text-white">
                      {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : 'U'}
                    </div>
                  )}
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
                  title="Log out"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 sm:space-x-4">
                <Link 
                  to="/login"
                  className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
                >
                  Login
                </Link>
                <Link 
                  to="/signup"
                  className="bg-primary text-white px-3 py-2 text-sm font-medium rounded-md hover:bg-primary/90 transition-colors duration-200"
                >
                  Sign Up
                </Link>
              </div>
            )}
            
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden rounded-md p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-2 border-t border-gray-200 dark:border-gray-800">
            <nav className="flex flex-col space-y-1 px-2 pb-3 pt-2">
              <Link 
                to="/" 
                className={`px-3 py-2 text-base font-medium rounded-md transition-colors duration-200 ${
                  isActive('/') 
                    ? 'text-primary bg-primary/10' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/pricing" 
                className={`px-3 py-2 text-base font-medium rounded-md transition-colors duration-200 ${
                  isActive('/pricing') 
                    ? 'text-primary bg-primary/10' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link 
                to="/caption-generator" 
                className={`px-3 py-2 text-base font-medium rounded-md transition-colors duration-200 ${
                  isActive('/caption-generator') 
                    ? 'text-primary bg-primary/10' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Caption Generator
              </Link>
              <Link 
                to="/features" 
                className={`px-3 py-2 text-base font-medium rounded-md transition-colors duration-200 ${
                  isActive('/features') 
                    ? 'text-primary bg-primary/10' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </Link>
              <Link 
                to="/blog" 
                className={`px-3 py-2 text-base font-medium rounded-md transition-colors duration-200 ${
                  isActive('/blog') 
                    ? 'text-primary bg-primary/10' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Blog
              </Link>
              {currentUser && (
                <Link 
                  to="/dashboard" 
                  className={`px-3 py-2 text-base font-medium rounded-md transition-colors duration-200 ${
                    isActive('/dashboard') 
                      ? 'text-primary bg-primary/10' 
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
