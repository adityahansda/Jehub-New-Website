import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  Home, 
  Download, 
  Trophy, 
  HelpCircle, 
  Users
} from 'lucide-react';

const MobileNavigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  const mainNavItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/notes-download', label: 'Download', icon: Download },
    { path: '/groups', label: 'Groups', icon: Users },
    { path: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    { path: '/notes-request', label: 'Request', icon: HelpCircle },
  ];

  const isActive = (path: string) => router.pathname === path;

  return (
    <>
      {/* Bottom Tab Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg md:hidden">
        <div className="flex items-center justify-around py-2">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex flex-col items-center py-2 px-3 min-w-0 flex-1 ${
                  isActive(item.path)
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                <Icon className="h-5 w-5 mb-1" />
                <span className="text-xs font-medium truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>


      {/* Add bottom padding to main content to account for bottom tab bar */}
      <style jsx global>{`
        @media (max-width: 768px) {
          main {
            padding-bottom: 70px;
          }
        }
      `}</style>
    </>
  );
};

export default MobileNavigation;
