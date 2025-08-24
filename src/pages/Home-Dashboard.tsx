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
  ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

// Types
interface PageType {
  id: string;
  title: string;
  component: React.ComponentType;
}

// Dashboard content components (placeholders for now)
const DashboardHome = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Welcome to JEHub Dashboard</h1>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Stats Cards */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center">
          <BookOpen className="h-8 w-8 text-blue-600" />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Notes</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">1,234</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center">
          <Download className="h-8 w-8 text-green-600" />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Downloads</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">5,678</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center">
          <Users className="h-8 w-8 text-purple-600" />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Community</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">890</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center">
          <Coins className="h-8 w-8 text-amber-600" />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Points</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">1,500</p>
          </div>
        </div>
      </div>
    </div>
    
    <div className="mt-8">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <p className="text-gray-600 dark:text-gray-400">Activity feed will be displayed here...</p>
      </div>
    </div>
  </div>
);

const MyLibrary = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">My Library</h1>
    <p className="text-gray-600 dark:text-gray-400">Your saved notes and resources will be displayed here...</p>
  </div>
);

const NotesDownload = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Download Notes</h1>
    <p className="text-gray-600 dark:text-gray-400">Browse and download notes from our collection...</p>
  </div>
);

const NotesUpload = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Upload Notes</h1>
    <p className="text-gray-600 dark:text-gray-400">Upload your notes to share with the community...</p>
  </div>
);

const Community = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Community</h1>
    <p className="text-gray-600 dark:text-gray-400">Connect with fellow students and share knowledge...</p>
  </div>
);

// Additional page components
const Wishlist = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">My Wishlist</h1>
    <p className="text-gray-600 dark:text-gray-400">Your saved notes and favorite resources...</p>
  </div>
);

const Referral = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Refer & Earn</h1>
    <div className="bg-gradient-to-r from-green-400 to-blue-500 rounded-lg p-6 text-white mb-6">
      <h2 className="text-xl font-bold mb-2">Earn 50 Points for Each Referral!</h2>
      <p>Share JEHub with your friends and earn rewards together.</p>
    </div>
    <p className="text-gray-600 dark:text-gray-400">Referral program details and sharing tools...</p>
  </div>
);

const StudyBundles = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Study Bundles</h1>
    <div className="bg-purple-100 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-4 mb-6">
      <span className="inline-block bg-purple-500 text-white text-xs px-2 py-1 rounded-full mb-2">New</span>
      <p className="text-purple-800 dark:text-purple-200">Curated study materials for comprehensive learning.</p>
    </div>
    <p className="text-gray-600 dark:text-gray-400">Browse and purchase study bundles...</p>
  </div>
);

const Leaderboard = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Leaderboard</h1>
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <p className="text-gray-600 dark:text-gray-400">Top performers and community rankings...</p>
    </div>
  </div>
);

const NotesRequest = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Notes Request</h1>
    <p className="text-gray-600 dark:text-gray-400">Request specific notes from the community...</p>
  </div>
);

const Premium = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Premium Membership</h1>
    <div className="bg-gradient-to-r from-purple-400 to-pink-500 rounded-lg p-6 text-white mb-6">
      <h2 className="text-xl font-bold mb-2">Upgrade to Premium</h2>
      <p>Unlock exclusive features and premium content.</p>
    </div>
    <p className="text-gray-600 dark:text-gray-400">Premium features and subscription options...</p>
  </div>
);

const Groups = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Study Groups</h1>
    <p className="text-gray-600 dark:text-gray-400">Join study groups and collaborate with peers...</p>
  </div>
);

const Events = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Events</h1>
    <p className="text-gray-600 dark:text-gray-400">Upcoming events and workshops...</p>
  </div>
);

const Notifications = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Notifications</h1>
    <p className="text-gray-600 dark:text-gray-400">Your recent notifications and alerts...</p>
  </div>
);

const AIChat = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">AI Chat Assistant</h1>
    <div className="bg-blue-100 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-6">
      <p className="text-blue-800 dark:text-blue-200">Ask me anything about your studies!</p>
    </div>
    <p className="text-gray-600 dark:text-gray-400">AI-powered study assistant...</p>
  </div>
);

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
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    learning: true,
    tools: false,
    premium: false,
    community: false,
    ai: false,
    admin: false,
    account: false
  });

  // Available pages - comprehensive mapping for all sidebar items
  const pages: Record<string, PageType> = {
    // Main Dashboard
    dashboard: { id: 'dashboard', title: 'Dashboard', component: DashboardHome },
    home: { id: 'home', title: 'Dashboard', component: DashboardHome },
    
    // Learning Section
    courses: { id: 'courses', title: 'My Courses', component: MyLibrary },
    'notes-download': { id: 'notes-download', title: 'Download Notes', component: NotesDownload },
    'notes-upload': { id: 'notes-upload', title: 'Upload Notes', component: NotesUpload },
    'notes-category': { id: 'notes-category', title: 'Notes Category', component: NotesDownload },
    wishlist: { id: 'wishlist', title: 'My Wishlist', component: Wishlist },
    referral: { id: 'referral', title: 'Refer & Earn', component: Referral },
    'study-bundles': { id: 'study-bundles', title: 'Study Bundles', component: StudyBundles },
    
    // Study Tools Section
    leaderboard: { id: 'leaderboard', title: 'Leaderboard', component: Leaderboard },
    'notes-request': { id: 'notes-request', title: 'Notes Request', component: NotesRequest },
    'notes-status-check': { id: 'notes-status-check', title: 'Notes Status Check', component: NotesRequest },
    'exam-updates': { id: 'exam-updates', title: 'Exam Updates', component: Events },
    'counselling-updates': { id: 'counselling-updates', title: 'Counselling Updates', component: Events },
    notifications: { id: 'notifications', title: 'Notifications', component: Notifications },
    
    // Premium Section
    premium: { id: 'premium', title: 'Premium Membership', component: Premium },
    
    // Community Section
    community: { id: 'community', title: 'Community', component: Community },
    groups: { id: 'groups', title: 'Study Groups', component: Groups },
    events: { id: 'events', title: 'Events', component: Events },
    blog: { id: 'blog', title: 'Blog', component: Events },
    team: { id: 'team', title: 'Team', component: Community },
    'join-team': { id: 'join-team', title: 'Join Team', component: Community },
    internships: { id: 'internships', title: 'Internships', component: Community },
    'community-rules': { id: 'community-rules', title: 'Community Rules', component: Community },
    
    // AI Assistant Section
    'ai-chat': { id: 'ai-chat', title: 'AI Chat Assistant', component: AIChat },
    
    // Admin Control Section
    'admin-analytics': { id: 'admin-analytics', title: 'Analytics Dashboard', component: DashboardHome },
    'admin-users': { id: 'admin-users', title: 'User Management', component: Community },
    'admin-moderation': { id: 'admin-moderation', title: 'Content Moderation', component: Community },
    'ai-knowledge-base': { id: 'ai-knowledge-base', title: 'AI Knowledge Base', component: AIChat },
    'ai-settings': { id: 'ai-settings', title: 'AI Settings', component: AIChat },
    'ai-training-data': { id: 'ai-training-data', title: 'AI Training Data', component: AIChat },
    'admin-system-health': { id: 'admin-system-health', title: 'System Health', component: DashboardHome },
    'admin-server': { id: 'admin-server', title: 'Server Management', component: DashboardHome },
    'admin-database': { id: 'admin-database', title: 'Database Admin', component: DashboardHome },
    'admin-notifications': { id: 'admin-notifications', title: 'Notification Center', component: Notifications },
    'admin-email': { id: 'admin-email', title: 'Email Management', component: Community },
    'admin-security': { id: 'admin-security', title: 'Security Settings', component: DashboardHome },
    'admin-settings': { id: 'admin-settings', title: 'System Settings', component: DashboardHome },
    'admin-audit-logs': { id: 'admin-audit-logs', title: 'Audit Logs', component: DashboardHome },
    'admin-errors': { id: 'admin-errors', title: 'Error Monitoring', component: DashboardHome },
    'admin-api': { id: 'admin-api', title: 'API Management', component: DashboardHome },
    'admin-bundle-management': { id: 'admin-bundle-management', title: 'Bundle Management', component: StudyBundles },
    
    // Legacy mappings for compatibility
    library: { id: 'library', title: 'My Library', component: MyLibrary },
  };

  // Handle screen size changes
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Close sidebar on mobile when clicking outside
  useEffect(() => {
    if (sidebarOpen && isMobile) {
      const handleClickOutside = () => setSidebarOpen(false);
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [sidebarOpen, isMobile]);

  // Toggle section function
  const toggleSection = (sectionKey: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Custom sidebar menu structure
  const sidebarSections = [
    {
      title: 'Dashboard',
      icon: Home,
      isCollapsible: false,
      items: [
        { icon: Home, label: 'Dashboard', pageId: 'dashboard', isActive: currentPage === 'dashboard' }
      ]
    },
    {
      title: 'LEARNING',
      icon: BookOpen,
      isCollapsible: true,
      items: [
        { icon: BookOpen, label: 'My Courses', pageId: 'courses', isActive: currentPage === 'courses' },
        { icon: Download, label: 'Notes Download', pageId: 'notes-download', isActive: currentPage === 'notes-download' },
        { icon: Upload, label: 'Upload Notes', pageId: 'notes-upload', isActive: currentPage === 'notes-upload' },
        { icon: Heart, label: 'Wishlist', pageId: 'wishlist', isActive: currentPage === 'wishlist' },
        { icon: Gift, label: 'Refer & Earn', pageId: 'referral', badge: '+50pts', badgeColor: 'green', isActive: currentPage === 'referral' },
        { icon: ShoppingCart, label: 'Study Bundles', pageId: 'study-bundles', badge: 'New', badgeColor: 'purple', isActive: currentPage === 'study-bundles' }
      ]
    },
    {
      title: 'STUDY TOOLS',
      icon: Trophy,
      isCollapsible: true,
      items: [
        { icon: Trophy, label: 'Leaderboard', pageId: 'leaderboard', isActive: currentPage === 'leaderboard' },
        { icon: Send, label: 'Notes Request', pageId: 'notes-request', isActive: currentPage === 'notes-request' },
        { icon: CheckCircle, label: 'Notes Status Check', pageId: 'notes-status-check', isActive: currentPage === 'notes-status-check' },
        { icon: Calendar, label: 'Exam Updates', pageId: 'exam-updates', isActive: currentPage === 'exam-updates' },
        { icon: BookOpen, label: 'Counselling Updates', pageId: 'counselling-updates', isActive: currentPage === 'counselling-updates' },
        { icon: Bell, label: 'Notifications', pageId: 'notifications', isActive: currentPage === 'notifications' }
      ]
    },
    {
      title: 'PREMIUM',
      icon: Crown,
      isCollapsible: true,
      items: [
        { icon: Crown, label: 'Become Premium User', pageId: 'premium', badge: 'Upgrade', badgeColor: 'purple', isActive: currentPage === 'premium' }
      ]
    },
    {
      title: 'COMMUNITY',
      icon: Users,
      isCollapsible: true,
      items: [
        { icon: Users, label: 'Groups', pageId: 'groups', isActive: currentPage === 'groups' },
        { icon: MessageCircle, label: 'Events', pageId: 'events', isActive: currentPage === 'events' },
        { icon: Rss, label: 'Blog', pageId: 'blog', isActive: currentPage === 'blog' },
        { icon: Users, label: 'Team', pageId: 'team', isActive: currentPage === 'team' },
        { icon: Briefcase, label: 'Join Team', pageId: 'join-team', badge: 'Hiring', badgeColor: 'green', isActive: currentPage === 'join-team' },
        { icon: Briefcase, label: 'Internships', pageId: 'internships', isActive: currentPage === 'internships' },
        { icon: ShieldCheck, label: 'Community Rules', pageId: 'community-rules', isActive: currentPage === 'community-rules' }
      ]
    },
    {
      title: 'AI ASSISTANT',
      icon: Brain,
      isCollapsible: true,
      items: [
        { icon: MessageCircle, label: 'AI Chat Assistant', pageId: 'ai-chat', isActive: currentPage === 'ai-chat' }
      ]
    },
    {
      title: 'ADMIN CONTROL',
      icon: Shield,
      isCollapsible: true,
      items: [
        { icon: BarChart3, label: 'Analytics Dashboard', pageId: 'admin-analytics', badge: 'Admin', badgeColor: 'red', isActive: currentPage === 'admin-analytics' },
        { icon: Users, label: 'User Management', pageId: 'admin-users', isActive: currentPage === 'admin-users' },
        { icon: Shield, label: 'Content Moderation', pageId: 'admin-moderation', isActive: currentPage === 'admin-moderation' }
      ]
    },
    {
      title: 'ACCOUNT',
      icon: User,
      isCollapsible: true,
      items: [
        { icon: User, label: 'Profile', pageId: 'profile', isActive: currentPage === 'profile' },
        { icon: Settings, label: 'Settings', pageId: 'settings', isActive: currentPage === 'settings' },
        { icon: FileText, label: 'About', pageId: 'about', isActive: currentPage === 'about' },
        { icon: Scroll, label: 'Terms of Service', pageId: 'terms', isActive: currentPage === 'terms' }
      ]
    }
  ];

  // Render badge function
  const renderBadge = (badge: string, color: string = 'blue') => {
    const colorClasses = {
      blue: 'bg-blue-500/20 text-blue-600 dark:text-blue-300 border-blue-400/30',
      green: 'bg-green-500/20 text-green-600 dark:text-green-300 border-green-400/30',
      orange: 'bg-orange-500/20 text-orange-600 dark:text-orange-300 border-orange-400/30',
      red: 'bg-red-500/20 text-red-600 dark:text-red-300 border-red-400/30',
      purple: 'bg-purple-500/20 text-purple-600 dark:text-purple-300 border-purple-400/30'
    };

    return (
      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium transition-all duration-200 ${
        colorClasses[color as keyof typeof colorClasses] || colorClasses.blue
      }`}>
        {badge}
      </span>
    );
  };

  // Render sidebar item function
  const renderSidebarItem = (item: any) => {
    const isActive = item.isActive;
    
    return (
      <button
        key={item.label}
        onClick={() => {
          setCurrentPage(item.pageId);
          if (isMobile) setSidebarOpen(false);
        }}
        className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group ${
          isActive
            ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
            : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
      >
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${
            isActive
              ? 'bg-white/20 text-white'
              : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200'
          }`}>
            <item.icon className="h-4 w-4" />
          </div>
          <span className="whitespace-nowrap overflow-hidden text-ellipsis">{item.label}</span>
        </div>
        
        <div className="flex items-center space-x-2 flex-shrink-0">
          {item.count && (
            <span className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ${
              isActive
                ? 'bg-white/20 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}>
              {item.count}
            </span>
          )}
          {item.badge && renderBadge(item.badge, item.badgeColor)}
        </div>
      </button>
    );
  };

  // Render current page component
  const CurrentPageComponent = pages[currentPage]?.component || DashboardHome;

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        
        {/* Top Navigation Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 transition-colors duration-200">
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
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <GraduationCap className="h-6 w-6 text-white" />
                  </div>
                  <span className="font-bold text-xl text-gray-900 dark:text-white">JEHub</span>
                </Link>
              </div>

              {/* Center - Search Bar (Desktop) */}
              <div className="hidden md:flex flex-1 max-w-md mx-8">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search dashboard..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
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
          <div className="md:hidden px-4 pb-3 pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search dashboard..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
              />
            </div>
          </div>
        </header>

        <div className="flex">
          {/* Mobile Sidebar Overlay */}
          {sidebarOpen && (
            <div 
              className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" 
              onClick={() => setSidebarOpen(false)}
            />
          )}
          
          {/* Custom Inline Sidebar */}
          <div className={`
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
            lg:translate-x-0 fixed lg:sticky top-0 lg:top-16 left-0 z-50 lg:z-30 
            w-64 lg:w-auto lg:min-w-64 lg:max-w-80 h-screen lg:h-[calc(100vh-4rem)] 
            bg-white dark:bg-gray-800 backdrop-blur-xl 
            border-r border-gray-200 dark:border-gray-700 
            transition-all duration-300 ease-in-out 
            overflow-y-auto overflow-x-hidden scrollbar-hide
            shadow-2xl lg:shadow-lg flex flex-col
          `}>
            {/* Mobile Header */}
            <div className="lg:hidden flex items-center justify-between p-4">
              <span className="font-semibold text-gray-900 dark:text-white">Menu</span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>


            {/* Navigation */}
            <nav 
              className="flex-1 px-4 py-4 space-y-1 overflow-y-auto scrollbar-hide" 
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {sidebarSections.map((section, sectionIndex) => (
                <div key={section.title} className="mb-4">
                  {/* Section Header */}
                  {section.isCollapsible ? (
                    <button
                      onClick={() => toggleSection(section.title.toLowerCase().replace(/\s/g, ''))}
                      className="flex items-center justify-between w-full px-3 py-2.5 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-1 rounded-md bg-gray-200 dark:bg-gray-700 group-hover:bg-gray-300 dark:group-hover:bg-gray-600 transition-all duration-200">
                          <section.icon className="h-3.5 w-3.5" />
                        </div>
                        <span className="font-bold whitespace-nowrap">{section.title}</span>
                        {/* Active section indicator */}
                        {section.items.some((item: any) => item.isActive) && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        )}
                      </div>
                      <div className="transition-transform duration-200">
                        {expandedSections[section.title.toLowerCase().replace(/\s/g, '')] ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </div>
                    </button>
                  ) : (
                    <div className="px-3 py-2.5 flex items-center space-x-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <div className="p-1 rounded-md bg-gray-200 dark:bg-gray-700">
                        <section.icon className="h-3.5 w-3.5" />
                      </div>
                      <span className="whitespace-nowrap">{section.title}</span>
                      {/* Active section indicator */}
                      {section.items.some((item: any) => item.isActive) && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      )}
                    </div>
                  )}

                  {/* Section Items */}
                  {(!section.isCollapsible || expandedSections[section.title.toLowerCase().replace(/\s/g, '')]) && (
                    <div className="mt-2 space-y-1">
                      {section.items.map((item: any) => renderSidebarItem(item))}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Bottom Actions */}
            <div className="mt-auto">
              {user && (
                <div className="p-4 space-y-2">
                  {/* Logout */}
                  <button 
                    onClick={handleLogout}
                    className="flex items-center space-x-3 w-full px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="whitespace-nowrap">Logout</span>
                  </button>
                </div>
              )}
            </div>

            {/* User Info */}
            <div>
              {user && (
                <div className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white font-semibold text-sm">
                        {user.name?.charAt(0).toUpperCase() || 'J'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {user.name || 'Jharkhand Engineer\'s Hub'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        @{user.email?.split('@')[0] || 'jehub'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

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
    </div>
  );
};

export default HomeDashboard;
