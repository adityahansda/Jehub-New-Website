import React, { useState } from 'react';
import Image from 'next/image';
import { Bell, User } from 'lucide-react';

const MobileHeader = ({ user, notificationCount = 0 }) => {
  const [showNotifications, setShowNotifications] = useState(false);

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
  };

  return (
    <div className="sticky top-0 z-50 bg-white shadow-md border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <div className="flex items-center">
          <Image 
            src="/images/logo.png" 
            alt="JEHUB" 
            width={32}
            height={32}
            className="h-8 w-auto"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
          />
          <span 
            className="text-xl font-bold text-blue-600 hidden"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            JEHUB
          </span>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={handleNotificationClick}
              className="relative p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 active:scale-95"
            >
              <Bell className="h-6 w-6 text-gray-600" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </button>
            
            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-3 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-800">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notificationCount > 0 ? (
                    <div className="p-3 space-y-2">
                      {Array.from({ length: Math.min(notificationCount, 5) }, (_, i) => (
                        <div key={i} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-800">New update available</p>
                            <p className="text-xs text-gray-500">2 minutes ago</p>
                          </div>
                        </div>
                      ))}
                      <button className="w-full text-center text-sm text-blue-600 hover:text-blue-800 py-2">
                        View all notifications
                      </button>
                    </div>
                  ) : (
                    <div className="p-6 text-center text-gray-500">
                      <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No new notifications</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile Avatar */}
          <div className="relative">
            <button className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 transition-colors duration-200">
              {user?.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user.name || 'Profile'}
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Click outside to close notifications */}
      {showNotifications && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowNotifications(false)}
        />
      )}
    </div>
  );
};

export default MobileHeader;
