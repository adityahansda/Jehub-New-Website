import React from 'react';
import Link from 'next/link';
import { Search, User, Bell } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../../contexts/AuthContext';

export default function TopNavbar() {
  const { user, userProfile } = useAuth();
  return (
    <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3 flex items-center justify-between z-20 h-16">
      {/* Left side - can be used for breadcrumbs or page title */}
      <div className="flex-1"></div>
      
      {/* Right side - Search, Theme Toggle, Notifications, Profile */}
      <div className="flex items-center space-x-4">
        {/* Search */}
        <div className="relative">
          <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200">
            <Search className="h-5 w-5" />
          </button>
        </div>
        
        {/* Notifications */}
        <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200 relative">
          <Bell className="h-5 w-5" />
          {/* Notification dot */}
          <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>
        </button>
        
        {/* Theme Toggle */}
        <ThemeToggle variant="compact" />
        
        {/* Profile */}
        <div className="flex items-center space-x-3">
          {userProfile?.profileImageUrl ? (
            <img 
              src={userProfile.profileImageUrl} 
              alt="Profile" 
              className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-600"
            />
          ) : (
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-medium">
                {(userProfile?.name || user?.name || 'U').charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div className="hidden md:block">
            <p className="text-sm font-medium text-gray-900 dark:text-white leading-tight">
              {userProfile?.name || user?.name || 'User'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight">
              {userProfile?.branch ? `${userProfile.semester || ''} ${userProfile.branch}`.trim() : 'Student'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
