import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  Search, 
  Menu, 
  X, 
  Sun, 
  Moon, 
  User, 
  Coins, 
  GraduationCap,
  Bell,
  BookOpen,
  Download,
  Users,
  Home,
  Upload,
  Star,
  Heart,
  Gift,
  ShoppingCart,
  Trophy,
  Send,
  CheckCircle,
  Calendar,
  Crown,
  MessageCircle,
  Rss,
  Briefcase,
  ShieldCheck,
  Brain,
  BarChart3,
  Shield,
  Settings,
  FileText,
  Scroll,
  LogOut,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  List,
  Grid,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { databases } from '../lib/appwrite';
import { pointsService } from '../services/pointsService';
import { likesService } from '../services/likesService';
import { showError, showWarning, showSuccess, showConfirmation, showInfo } from '../utils/toast';
import { toast } from 'react-toastify';
import { generateNoteSlug } from '../utils/seo';
import { checkUrlStatus } from '../lib/pdfValidation';

// Types
interface PageType {
  id: string;
  title: string;
  component: React.ComponentType;
}

// Dashboard content components - Modern NoteHub Style
const DashboardHome = ({ setCurrentPage }: { setCurrentPage?: (page: string) => void }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  
  const stats = [
    {
      icon: BookOpen,
      label: 'Total Notes',
      value: '1,234',
      change: '+12%',
      changeType: 'positive',
      color: 'blue',
      bgGradient: 'from-blue-500 to-blue-600'
    },
    {
      icon: Download,
      label: 'Downloads',
      value: '5,678',
      change: '+24%',
      changeType: 'positive',
      color: 'green',
      bgGradient: 'from-green-500 to-green-600'
    },
    {
      icon: Users,
      label: 'Community',
      value: '890',
      change: '+8%',
      changeType: 'positive',
      color: 'purple',
      bgGradient: 'from-purple-500 to-purple-600'
    },
    {
      icon: Coins,
      label: 'Your Points',
      value: '1,500',
      change: '+150',
      changeType: 'positive',
      color: 'amber',
      bgGradient: 'from-amber-500 to-amber-600'
    }
  ];

  const recentActivities = [
    {
      id: '1',
      type: 'download',
      title: 'Downloaded Computer Science Notes',
      subtitle: 'Data Structures - Chapter 5',
      time: '2 minutes ago',
      icon: Download,
      iconColor: 'text-green-500'
    },
    {
      id: '2',
      type: 'like',
      title: 'Liked a note',
      subtitle: 'Mathematics - Calculus Basics',
      time: '1 hour ago',
      icon: Heart,
      iconColor: 'text-red-500'
    },
    {
      id: '3',
      type: 'upload',
      title: 'Uploaded new notes',
      subtitle: 'Physics - Quantum Mechanics',
      time: '3 hours ago',
      icon: Upload,
      iconColor: 'text-blue-500'
    },
    {
      id: '4',
      type: 'points',
      title: 'Earned points',
      subtitle: 'Referral bonus: +50 points',
      time: '1 day ago',
      icon: Gift,
      iconColor: 'text-yellow-500'
    }
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Welcome Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-blue-600 to-purple-700 dark:from-blue-700 dark:to-purple-800 rounded-xl p-6 text-white relative overflow-hidden"
      >
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            Welcome back{user?.name ? `, ${user.name}` : ''}! 👋
          </h1>
          <p className="text-blue-100 dark:text-blue-200 text-sm sm:text-base">
            Ready to continue your learning journey? Explore notes, connect with peers, and achieve your academic goals.
          </p>
        </div>
        <div className="absolute top-0 right-0 -mt-4 -mr-4 opacity-20">
          <GraduationCap className="h-24 w-24 sm:h-32 sm:w-32" />
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-300 group"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${stat.bgGradient} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              </div>
              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                stat.changeType === 'positive' 
                  ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                  : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300'
              }`}>
                {stat.change}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: Download, label: 'Download Notes', color: 'blue', action: 'notes-download' },
            { icon: Upload, label: 'Upload Notes', color: 'green', action: 'notes-upload' },
            { icon: Users, label: 'Community', color: 'purple', action: 'community' },
            { icon: Heart, label: 'Wishlist', color: 'red', action: 'wishlist' }
          ].map((action, index) => (
            <motion.button
              key={action.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
              onClick={() => setCurrentPage?.(action.action)}
              className="p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all duration-300 group text-center"
            >
              <action.icon className="h-8 w-8 mx-auto mb-2 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
              <p className="text-sm font-medium text-gray-900 dark:text-white">{action.label}</p>
            </motion.button>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
            <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
              View all
            </button>
          </div>
          
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
                className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className={`p-2 rounded-full bg-gray-100 dark:bg-gray-700`}>
                  <activity.icon className={`h-4 w-4 ${activity.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.title}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{activity.subtitle}</p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-500 whitespace-nowrap">{activity.time}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Learning Progress */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Learning Progress</h2>
          
          <div className="space-y-4">
            {[
              { subject: 'Computer Science', progress: 75, color: 'blue' },
              { subject: 'Mathematics', progress: 60, color: 'green' },
              { subject: 'Physics', progress: 45, color: 'purple' },
              { subject: 'Electronics', progress: 30, color: 'orange' }
            ].map((item, index) => (
              <motion.div
                key={item.subject}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.8 + index * 0.1 }}
                className="space-y-2"
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{item.subject}</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{item.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.progress}%` }}
                    transition={{ duration: 1, delay: 0.9 + index * 0.1 }}
                    className={`h-2 rounded-full bg-gradient-to-r ${
                      item.color === 'blue' ? 'from-blue-500 to-blue-600' :
                      item.color === 'green' ? 'from-green-500 to-green-600' :
                      item.color === 'purple' ? 'from-purple-500 to-purple-600' :
                      'from-orange-500 to-orange-600'
                    }`}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const HomeDashboard = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  
  // Add scrollbar hiding styles to head
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .scrollbar-hide::-webkit-scrollbar {
        display: none;
      }
      .scrollbar-hide {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  // State management
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');

  // Render current page component
  const CurrentPageComponent = () => <DashboardHome setCurrentPage={setCurrentPage} />;

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        
        {/* Top Navigation Header - NoteHub Style */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 transition-colors duration-200 backdrop-blur-sm bg-white/95 dark:bg-gray-800/95">
          {/* Mobile safe area spacing */}
          <div className="h-2 sm:h-0 bg-white dark:bg-gray-800"></div>
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              
              {/* Left side - Menu button and Logo */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSidebarOpen(true);
                  }}
                  className="lg:hidden p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <Menu className="h-6 w-6" />
                </button>
                
                <Link href="/" className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <GraduationCap className="h-7 w-7 text-white" />
                  </div>
                  <span className="font-bold text-2xl text-gray-900 dark:text-white">JEHub</span>
                </Link>
              </div>

              {/* Search Bar - Desktop */}
              <div className="hidden md:block flex-1 max-w-md ml-8">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search for courses, notes, etc."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                  />
                </div>
              </div>

            {/* Right side - Theme toggle, Notifications, User */}
              <div className="flex items-center space-x-4">
                {/* Theme Toggle with enhanced styling */}
                <button
                  onClick={toggleTheme}
                  className="relative p-2 rounded-full text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 group"
                  aria-label="Toggle theme"
                >
                  <div className="relative">
                    {theme === 'dark' ? (
                      <>
                        <Sun className="h-5 w-5 transform transition-transform duration-500 group-hover:rotate-180" />
                        <div className="absolute inset-0 rounded-full bg-yellow-400/20 scale-0 group-hover:scale-110 transition-transform duration-300"></div>
                      </>
                    ) : (
                      <>
                        <Moon className="h-5 w-5 transform transition-transform duration-500 group-hover:rotate-12" />
                        <div className="absolute inset-0 rounded-full bg-blue-400/20 scale-0 group-hover:scale-110 transition-transform duration-300"></div>
                      </>
                    )}
                  </div>
                  {/* Theme indicator tooltip */}
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
                    {theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
                  </div>
                </button>

                {/* Notifications */}
                <button className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
                </button>

                {user ? (
                  <div className="flex items-center space-x-3">
                    {/* Points Display */}
                    <div className="hidden sm:flex items-center space-x-2 bg-amber-100 dark:bg-amber-900/20 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-700/50">
                      <Coins className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      <span className="text-sm font-medium text-amber-800 dark:text-amber-300">
                        1,500
                      </span>
                    </div>
                    
                    {/* User Profile */}
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                      </div>
                      <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {user.name || 'Guest user'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Sign in
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Search Bar */}
          <div className="md:hidden px-4 pb-3 pt-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search for courses, notes, etc."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
              />
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main 
          className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide" 
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen"
          >
            <CurrentPageComponent />
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default HomeDashboard;
