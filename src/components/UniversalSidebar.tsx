import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  X,
  Home,
  Download,
  Upload,
  HelpCircle,
  Users,
  Calendar,
  Briefcase,
  Trophy,
  BookOpen,
  UserPlus,
  User,
  Settings,
  LogOut
} from 'lucide-react';

interface UniversalSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const UniversalSidebar: React.FC<UniversalSidebarProps> = ({ isOpen, onClose }) => {
  const router = useRouter();

  const navigationItems = [
    { path: '/', label: 'Home', icon: Home, description: 'Main dashboard and updates' },
    { path: '/notes-download', label: 'Download Notes', icon: Download, description: 'Access study materials' },
    { path: '/notes-upload', label: 'Upload Notes', icon: Upload, description: 'Share your notes' },
    { path: '/groups', label: 'College Groups', icon: Users, description: 'Join your college community' },
    { path: '/events', label: 'Events', icon: Calendar, description: 'Workshops and competitions' },
    { path: '/internships', label: 'Internships', icon: Briefcase, description: 'Find job opportunities' },
    { path: '/leaderboard', label: 'Leaderboard', icon: Trophy, description: 'Top contributors' },
    { path: '/misc/about', label: 'About JEHUB', icon: BookOpen, description: 'Learn about our platform' },
    { path: '/join-team', label: 'Join Our Team', icon: UserPlus, description: 'Work with us' },
  ];

  const bottomItems = [
    { path: '/profile', label: 'Profile', icon: User },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  const isActive = (path: string) => router.pathname === path;

  return (
    <>
      {/* Backdrop with blur effect */}
      <div 
        className={`fixed inset-0 z-40 transition-all duration-300 ${
          isOpen 
            ? 'bg-black/30 backdrop-blur-sm' 
            : 'bg-transparent pointer-events-none'
        }`}
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div 
        className={`fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">J</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">JEHUB</h2>
                  <p className="text-sm text-gray-500">Student Hub</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="h-6 w-6 text-gray-600" />
              </button>
            </div>
            
            {/* Welcome Message for New Users */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-100">
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Welcome to JEHUB! 👋</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Your one-stop platform for notes, groups, events, and career opportunities across Jharkhand colleges.
              </p>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="px-4 space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                
                return (
                  <Link key={item.path} href={item.path} onClick={onClose}>
                    <div className={`flex flex-col px-4 py-3 rounded-lg transition-all duration-200 ${
                      active 
                        ? 'bg-blue-100 text-blue-700 shadow-sm' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}>
                      <div className="flex items-center space-x-3">
                        <Icon className={`h-5 w-5 ${active ? 'text-blue-700' : 'text-gray-500'}`} />
                        <span className="font-medium">{item.label}</span>
                      </div>
                      {item.description && (
                        <p className={`text-xs mt-1 ml-8 ${active ? 'text-blue-600' : 'text-gray-500'}`}>
                          {item.description}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Bottom Items */}
          <div className="border-t border-gray-200 p-4">
            <nav className="space-y-1">
              {bottomItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                
                return (
                  <Link key={item.path} href={item.path} onClick={onClose}>
                    <div className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      active 
                        ? 'bg-blue-100 text-blue-700 shadow-sm' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}>
                      <Icon className={`h-5 w-5 ${active ? 'text-blue-700' : 'text-gray-500'}`} />
                      <span className="font-medium">{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </nav>
            
            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="text-center text-sm text-gray-500">
                <p>&copy; 2024 JEHUB</p>
                <p>All rights reserved</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UniversalSidebar;
