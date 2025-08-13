import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import ThemeToggle from '../common/ThemeToggle';
import {
  LayoutDashboard,
  BookOpen,
  Upload,
  Download,
  BarChart3,
  Trophy,
  Users,
  Calendar,
  Bell,
  Settings,
  User,
  LogOut,
  Home,
  Star,
  Target,
  Activity,
  Award,
  MessageSquare,
  FileText,
  GraduationCap,
  Bookmark,
  Heart,
  Globe,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getDashboardUrl } from '../../utils/dashboardRouter';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

const sidebarItems = [
  {
    group: 'Main',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
      { href: '/dashboard/activities', label: 'Activities', icon: Activity },
    ]
  },
  {
    group: 'Academic',
    items: [
      { href: '/notes/upload', label: 'Upload Notes', icon: Upload },
      { href: '/notes-download', label: 'Browse Notes', icon: Download },
      { href: '/dashboard/my-notes', label: 'My Notes', icon: BookOpen },
      { href: '/dashboard/bookmarks', label: 'Bookmarks', icon: Bookmark },
    ]
  },
  {
    group: 'Community',
    items: [
      { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
      { href: '/groups', label: 'Study Groups', icon: Users },
      { href: '/events', label: 'Events', icon: Calendar },
      { href: '/dashboard/achievements', label: 'Achievements', icon: Award },
    ]
  },
  {
    group: 'Personal',
    items: [
      { href: '/notifications', label: 'Notifications', icon: Bell },
      { href: '/settings', label: 'Settings', icon: Settings },
    ]
  }
];

export default function DashboardSidebar({ isOpen, onClose }: SidebarProps) {
  const router = useRouter();
  const { userProfile } = useAuth();
  
  // Get the appropriate dashboard URL based on user role
  const dashboardUrl = getDashboardUrl(userProfile);
  
  // Dynamic sidebar items with role-based dashboard URL
  const dynamicSidebarItems = sidebarItems.map(group => {
    if (group.group === 'Main') {
      return {
        ...group,
        items: group.items.map(item => 
          item.href === '/dashboard' 
            ? { ...item, href: dashboardUrl }
            : item
        )
      };
    }
    return group;
  });

  const isActive = (href: string) => {
    if (href === dashboardUrl || (href === '/dashboard' && router.pathname === dashboardUrl)) {
      return router.pathname === dashboardUrl || router.pathname === '/dashboard';
    }
    return router.pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-50 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">JEHUB</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">Student Portal</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-6">
            <div className="px-6 space-y-8">
              {dynamicSidebarItems.map((group, groupIndex) => (
                <div key={groupIndex} className="space-y-3">
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {group.group}
                  </h3>
                  <div className="space-y-1">
                    {group.items.map((item, itemIndex) => {
                      const IconComponent = item.icon;
                      const active = isActive(item.href);
                      
                      return (
                        <Link
                          key={itemIndex}
                          href={item.href}
                          onClick={onClose}
                          className={`
                            flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group
                            ${active 
                              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shadow-sm' 
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'
                            }
                          `}
                        >
                          <IconComponent className={`
                            h-5 w-5 transition-colors duration-200
                            ${active 
                              ? 'text-blue-600 dark:text-blue-400' 
                              : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                            }
                          `} />
                          <span>{item.label}</span>
                          
                          {/* Active Indicator */}
                          {active && (
                            <div className="ml-auto w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-pulse" />
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </nav>

          {/* User Profile Section */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">JS</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  John Student
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  4th Year CSE
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-xs font-medium text-gray-900 dark:text-white">1250</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Points</p>
              </div>
              <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-xs font-medium text-gray-900 dark:text-white">24</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Notes</p>
              </div>
              <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-xs font-medium text-gray-900 dark:text-white">#15</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Rank</p>
              </div>
            </div>

            {/* Theme Toggle */}
            <div className="mb-4">
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme</span>
                <ThemeToggle variant="compact" />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <Link href="/" className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg transition-colors duration-200">
                <Home className="h-4 w-4" />
                <span>Back to Home</span>
              </Link>
              
              <Link href="/help" className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg transition-colors duration-200">
                <HelpCircle className="h-4 w-4" />
                <span>Help & Support</span>
              </Link>
              
              <button className="flex items-center space-x-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200 w-full">
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
